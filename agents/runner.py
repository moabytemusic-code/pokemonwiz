"""
Campaign Runner — the main loop that coordinates all agents.
Loads active campaigns, assigns agents, runs monitors, triggers buys.
"""

import asyncio
import time
from datetime import datetime, timezone

from core.config import Config
from core.db import get_supabase
from core.audit import log as audit_log
from core.heartbeat import heartbeat

from monitors.tcgplayer import TCGPlayerMonitor
from monitors.ebay import EbayMonitor
from monitors.pokemoncenter import PokemonCenterMonitor
from buyers.buyer import BuyAgent


# Map outlet names to monitor instances
MONITORS = {
    "tcgplayer": TCGPlayerMonitor(),
    "ebay": EbayMonitor(),
    "pokemoncenter": PokemonCenterMonitor(),
}


def get_active_campaigns():
    """Fetch all active campaigns from Supabase."""
    supabase = get_supabase()
    resp = supabase.table("campaigns").select("*").eq("status", "active").execute()
    return resp.data or []


def get_campaign_agents(campaign_id: int):
    """Fetch agents assigned to a campaign."""
    supabase = get_supabase()
    resp = supabase.table("campaign_agents").select("agent_id").eq("campaign_id", campaign_id).execute()
    return [r["agent_id"] for r in (resp.data or [])]


def get_agent(agent_id: int):
    """Fetch agent details."""
    supabase = get_supabase()
    resp = supabase.table("agents").select("*").eq("id", agent_id).single().execute()
    return resp.data


async def process_campaign(campaign: dict):
    """Run a single campaign: for each agent, scan outlets, check prices, attempt buys."""
    cid = campaign["id"]
    card_name = campaign["card_name"]
    set_name = campaign.get("set_name")
    max_price = float(campaign["max_price"]) if campaign.get("max_price") else None
    target_qty = campaign.get("target_quantity") or 10
    fulfilled = campaign.get("fulfilled") or 0
    sources = (campaign.get("sources") or "tcgplayer,ebay,pokemoncenter").split(",")

    print(f"🎯 Processing campaign #{cid}: '{campaign.get('name')}' target={card_name} max=${max_price}")

    if fulfilled >= target_qty:
        print(f"✅ Campaign #{cid} already completed ({fulfilled}/{target_qty})")
        supabase = get_supabase()
        supabase.table("campaigns").update({"status": "completed"}).eq("id", cid).execute()
        audit_log(None, cid, "campaign_completed", f"Campaign '{campaign['name']}' completed ({fulfilled}/{target_qty})")
        return

    agent_ids = get_campaign_agents(cid)
    print(f"👥 Found {len(agent_ids)} agents assigned to campaign #{cid}")
    if not agent_ids:
        return

    audit_log(None, cid, "campaign_tick", f"Processing campaign '{campaign['name']}' — {len(agent_ids)} agents")

    for agent_id in agent_ids:
        agent = get_agent(agent_id)
        agent_name = agent.get("name", f"#{agent_id}") if agent else f"#{agent_id}"
        if not agent:
            print(f"  ⏭️ Agent #{agent_id}: not found")
            continue
        if agent.get("status") in ("paused", "error", "banned"):
            print(f"  ⏭️ {agent_name}: status={agent['status']}")
            audit_log(agent_id, cid, "agent_skipped", f"Agent {agent_name} status={agent['status']}")
            continue

        balance = float(agent.get("fund_balance") or 0)
        if balance <= 0:
            print(f"  ⏭️ {agent_name}: $0 balance — skipping")
            audit_log(agent_id, cid, "agent_skipped", f"Agent {agent_name} has $0 balance")
            continue

        print(f"  🔍 {agent_name}: searching ${balance:.2f} balance")

        # Check 2-per-account limit
        supabase = get_supabase()
        limit_resp = supabase.table("agent_card_limits").select("reached_limit").eq("agent_id", agent_id).eq("card_name", card_name).execute()
        if limit_resp.data and limit_resp.data[0].get("reached_limit"):
            continue

        heartbeat(agent_id, "running")

        # Search each configured source
        for source in sources:
            source = source.strip()
            monitor = MONITORS.get(source)
            if not monitor:
                continue

            print(f"    🌐 Searching {source} for {card_name}...")
            audit_log(agent_id, cid, "scrape_start", f"Searching {source} for {card_name}")

            try:
                listings = await monitor.search_card(card_name, set_name, max_price)
                print(f"    {'✅' if listings else '❌'} {source}: {len(listings)} listings found")
            except Exception as e:
                print(f"    ❌ {source} scrape failed: {e}")
                audit_log(agent_id, cid, "scrape_error", f"{source} scrape failed: {e}", level="error")
                continue

            if not listings:
                audit_log(agent_id, cid, "scrape_empty", f"No listings on {source} for {card_name}")
                continue

            audit_log(agent_id, cid, "scrape_complete", f"Found {len(listings)} listings on {source}")

            for listing in listings:
                # Check agent still has funds
                agent_check = get_agent(agent_id)
                if not agent_check or float(agent_check.get("fund_balance") or 0) < listing.price:
                    break

                # Check 2-per-account again
                limit_check = supabase.table("agent_card_limits").select("reached_limit").eq("agent_id", agent_id).eq("card_name", card_name).execute()
                if limit_check.data and limit_check.data[0].get("reached_limit"):
                    break

                # Deduplicate — check if we've already seen this listing
                dedup = supabase.table("outlet_listings").select("id").eq("listing_id", listing.listing_id).execute()
                if dedup.data:
                    continue

                # Store listing in outlet_listings
                supabase.table("outlet_listings").insert({
                    "card_name": listing.card_name,
                    "set_name": listing.set_name,
                    "outlet": listing.outlet,
                    "outlet_listing_url": listing.listing_url,
                    "price": listing.price,
                    "seller": listing.seller,
                    "condition": listing.condition,
                    "in_stock": listing.in_stock,
                    "listing_id": listing.listing_id,
                }).execute()

                # Try to buy
                buyer = BuyAgent(agent_id)
                success = await buyer.attempt_purchase(
                    campaign_id=cid,
                    card_name=listing.card_name,
                    price=listing.price,
                    outlet=listing.outlet,
                    listing_url=listing.listing_url,
                )

                if success:
                    # Re-check campaign status after purchase
                    camp_check = supabase.table("campaigns").select("fulfilled, target_quantity").eq("id", cid).execute()
                    if camp_check.data:
                        cc = camp_check.data[0]
                        if (cc["fulfilled"] or 0) >= (cc["target_quantity"] or 10):
                            supabase.table("campaigns").update({"status": "completed"}).eq("id", cid).execute()
                            audit_log(None, cid, "campaign_completed",
                                      f"Campaign '{campaign['name']}' completed!")
                            return  # Done with this campaign

                    # Wait between purchases to avoid rate limits
                    await asyncio.sleep(5)

        # Idle heartbeat
        heartbeat(agent_id, "idle")


async def main_loop():
    """Main agent loop — polls for active campaigns every N seconds."""
    Config.validate()
    print("✅ Config validated")
    
    supabase = get_supabase()
    print("✅ Supabase connected")
    
    audit_log(None, None, "agent_startup", "Pokemon Wiz Agent Runtime started")
    print("🚀 Agent Runtime started — polling for campaigns...")

    while True:
        try:
            campaigns = get_active_campaigns()
            print(f"📋 Poll: found {len(campaigns)} active campaigns")
            audit_log(None, None, "poll", f"Found {len(campaigns)} active campaigns")

            if campaigns:
                # Process campaigns sequentially to avoid overloading
                for campaign in campaigns:
                    await process_campaign(campaign)

        except Exception as e:
            print(f"❌ Main loop error: {e}")
            audit_log(None, None, "agent_error", f"Main loop error: {e}", level="error")

        print(f"💤 Sleeping for {Config.POLL_INTERVAL}s...")
        await asyncio.sleep(Config.POLL_INTERVAL)


if __name__ == "__main__":
    print("🚀 Pokemon Wiz Agent Runtime starting...")
    print(f"📡 Supabase URL: {Config.SUPABASE_URL[:30]}...")
    print(f"⏱  Poll interval: {Config.POLL_INTERVAL}s")
    asyncio.run(main_loop())

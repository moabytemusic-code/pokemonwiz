"""
Buy Agent — logs into outlet accounts and executes card purchases via Playwright.
For the PoC, this logs the purchase intent to Supabase (real purchases come later).
"""

from core.db import get_supabase
from core.audit import log
from core.heartbeat import heartbeat


class BuyAgent:
    """Executes purchases on behalf of an agent account."""

    def __init__(self, agent_id: int):
        self.agent_id = agent_id
        self.supabase = get_supabase()

    async def attempt_purchase(
        self,
        campaign_id: int,
        card_name: str,
        price: float,
        outlet: str,
        listing_url: str,
    ) -> bool:
        """
        Attempt to purchase a card.
        
        Steps:
        1. Check agent has sufficient funds
        2. Deduct balance (reserve)
        3. Log purchase attempt
        4. Record in inventory
        5. Update campaign fulfilled count
        6. Update agent card limit counter
        """
        log(self.agent_id, campaign_id, "purchase_initiated",
            f"Attempting purchase: {card_name} @ ${price:.2f} on {outlet}",
            metadata={"price": price, "outlet": outlet, "url": listing_url})

        # 1. Check agent balance
        agent_resp = self.supabase.table("agents").select("fund_balance").eq("id", self.agent_id).execute()
        if not agent_resp.data:
            log(self.agent_id, campaign_id, "purchase_fail", f"Agent {self.agent_id} not found", level="error")
            return False

        balance = float(agent_resp.data[0]["fund_balance"])
        if balance < price:
            log(self.agent_id, campaign_id, "purchase_fail",
                f"Insufficient funds: ${balance:.2f} < ${price:.2f}", level="warn")
            return False

        # 2-6. For PoC: record directly in Supabase
        try:
            # Record in inventory
            inv_resp = self.supabase.table("inventory").insert({
                "card_name": card_name,
                "set_name": None,
                "purchase_price": price,
                "acquired_by": self.agent_id,
                "campaign_id": campaign_id,
                "source_outlet": outlet,
                "status": "inventory",
            }).execute()

            if not inv_resp.data:
                raise Exception("Failed to insert inventory record")

            inv_id = inv_resp.data[0]["id"]

            # Deduct agent balance
            new_balance = balance - price
            self.supabase.table("agents").update({
                "fund_balance": new_balance,
                "cards_bought": self.supabase.rpc("increment", {"x": 1}),  # handled below
                "total_spent": self.supabase.rpc("increment", {"x": price}),
            }).eq("id", self.agent_id).execute()

            # Update cards_bought and total_spent directly
            self.supabase.table("agents").update({
                "fund_balance": new_balance,
            }).eq("id", self.agent_id).execute()

            # Increment via raw query workaround
            agent = self.supabase.table("agents").select("cards_bought, total_spent").eq("id", self.agent_id).execute()
            current = agent.data[0]
            self.supabase.table("agents").update({
                "cards_bought": (current["cards_bought"] or 0) + 1,
                "total_spent": (float(current["total_spent"] or 0) + price),
            }).eq("id", self.agent_id).execute()

            # Update campaign fulfilled count
            camp = self.supabase.table("campaigns").select("fulfilled, total_spent").eq("id", campaign_id).execute()
            if camp.data:
                c = camp.data[0]
                self.supabase.table("campaigns").update({
                    "fulfilled": (c["fulfilled"] or 0) + 1,
                    "total_spent": (float(c["total_spent"] or 0) + price),
                }).eq("id", campaign_id).execute()

            # Log transaction
            self.supabase.table("transactions").insert({
                "type": "agent_purchase",
                "amount": price,
                "source": outlet,
                "from_entity": str(self.agent_id),
                "campaign_id": campaign_id,
                "description": f"Agent #{self.agent_id} bought {card_name} @ ${price:.2f}",
            }).execute()

            # Update 2-per-account limit
            limit_resp = self.supabase.table("agent_card_limits").select("purchased_count, id").eq("agent_id", self.agent_id).eq("card_name", card_name).execute()
            if limit_resp.data:
                lr = limit_resp.data[0]
                new_count = (lr["purchased_count"] or 0) + 1
                self.supabase.table("agent_card_limits").update({
                    "purchased_count": new_count,
                    "reached_limit": new_count >= 2,
                }).eq("id", lr["id"]).execute()
            else:
                self.supabase.table("agent_card_limits").insert({
                    "agent_id": self.agent_id,
                    "card_name": card_name,
                    "purchased_count": 1,
                    "reached_limit": False,
                }).execute()

            log(self.agent_id, campaign_id, "purchase_success",
                f"Bought {card_name} @ ${price:.2f}", metadata={"inventory_id": inv_id})
            return True

        except Exception as e:
            log(self.agent_id, campaign_id, "purchase_fail",
                f"Error during purchase: {e}", level="error", metadata={"error": str(e)})
            return False

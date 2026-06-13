"""
eBay monitor — searches eBay for Pokemon card listings.
"""

import re
import httpx
from bs4 import BeautifulSoup
from monitors.base import BaseMonitor, CardListing


class EbayMonitor(BaseMonitor):
    """Searches eBay for Pokemon card listings."""

    @property
    def outlet_name(self) -> str:
        return "ebay"

    async def search_card(
        self, card_name: str, set_name: str | None = None, max_price: float | None = None
    ) -> list[CardListing]:
        results: list[CardListing] = []
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                          "AppleWebKit/537.36 (KHTML, like Gecko) "
                          "Chrome/125.0.0.0 Safari/537.36",
        }

        query = f"{card_name} pokemon"
        if set_name:
            query += f" {set_name}"
        query = query.replace(" ", "+")

        url = f"https://www.ebay.com/sch/i.html?_nkw={query}&_sop=15"  # sort by price+shipping

        try:
            async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
                resp = await client.get(url, headers=headers)
                if resp.status_code != 200:
                    return results

                soup = BeautifulSoup(resp.text, "lxml")

                for item in soup.select("li.s-item"):
                    try:
                        title_el = item.select_one("div.s-item__title span")
                        price_el = item.select_one("span.s-item__price")
                        link_el = item.select_one("a.s-item__link")

                        if not title_el or not price_el:
                            continue

                        found_name = title_el.get_text(strip=True)
                        price_text = re.sub(r"[^\d.]", "", price_el.get_text(strip=True).split("to")[0])
                        href = link_el.get("href", "") if link_el else ""

                        try:
                            price = float(price_text)
                        except ValueError:
                            continue

                        if max_price and price > max_price:
                            continue

                        # eBay item ID from URL
                        item_id = "unknown"
                        id_match = re.search(r"itm/(\d+)", href)
                        if id_match:
                            item_id = id_match.group(1)

                        results.append(CardListing(
                            card_name=found_name,
                            set_name=set_name,
                            outlet="ebay",
                            price=price,
                            listing_url=href,
                            listing_id=item_id,
                        ))
                    except Exception:
                        continue
        except Exception:
            pass

        return results

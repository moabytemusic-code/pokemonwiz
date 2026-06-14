"""
Amazon monitor — searches Amazon for Pokemon card listings.
Note: Amazon aggressively blocks scrapers. This uses their public search page.
"""

import re
import httpx
from bs4 import BeautifulSoup
from monitors.base import BaseMonitor, CardListing


class AmazonMonitor(BaseMonitor):
    """Searches Amazon for Pokemon card listings."""

    @property
    def outlet_name(self) -> str:
        return "amazon"

    async def search_card(
        self, card_name: str, set_name: str | None = None, max_price: float | None = None
    ) -> list[CardListing]:
        results: list[CardListing] = []
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                          "AppleWebKit/537.36 (KHTML, like Gecko) "
                          "Chrome/125.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept": "text/html,application/xhtml+xml",
        }

        query = f"{card_name} pokemon card"
        if set_name:
            query += f" {set_name}"
        query = query.replace(" ", "+")

        url = f"https://www.amazon.com/s?k={query}&s=price-asc-rank"

        try:
            async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
                resp = await client.get(url, headers=headers)
                if resp.status_code != 200:
                    return results

                soup = BeautifulSoup(resp.text, "lxml")

                for item in soup.select("div[data-component-type='s-search-result']"):
                    try:
                        title_el = item.select_one("h2 a span")
                        price_el = item.select_one("span.a-price span.a-offscreen")
                        link_el = item.select_one("h2 a")

                        if not title_el:
                            continue

                        found_name = title_el.get_text(strip=True)
                        href = link_el.get("href", "") if link_el else ""

                        price = 0.0
                        if price_el:
                            price_text = price_el.get_text(strip=True).replace("$", "").replace(",", "")
                            try:
                                price = float(price_text)
                            except ValueError:
                                price = 0.0

                        if max_price and price > max_price:
                            continue

                        # Amazon ASIN from URL
                        asin = "unknown"
                        asin_match = re.search(r"/dp/([A-Z0-9]{10})", href)
                        if asin_match:
                            asin = asin_match.group(1)

                        full_url = f"https://www.amazon.com{href}" if href.startswith("/") else href

                        results.append(CardListing(
                            card_name=found_name,
                            set_name=set_name,
                            outlet="amazon",
                            price=price,
                            listing_url=full_url,
                            listing_id=asin,
                        ))
                    except Exception:
                        continue
        except Exception:
            pass

        return results

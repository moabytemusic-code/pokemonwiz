"""
TCGPlayer monitor — searches TCGPlayer for card listings.
Uses httpx for HTTP + BeautifulSoup for parsing.
"""

import re
import httpx
from bs4 import BeautifulSoup
from monitors.base import BaseMonitor, CardListing


class TCGPlayerMonitor(BaseMonitor):
    """Searches TCGPlayer marketplace for Pokemon cards."""

    @property
    def outlet_name(self) -> str:
        return "tcgplayer"

    async def search_card(
        self, card_name: str, set_name: str | None = None, max_price: float | None = None
    ) -> list[CardListing]:
        results: list[CardListing] = []
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                          "AppleWebKit/537.36 (KHTML, like Gecko) "
                          "Chrome/125.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml",
        }

        # Build search URL
        query = card_name.replace(" ", "+")
        url = f"https://www.tcgplayer.com/search/pokemon/product?q={query}&view=grid"

        if set_name:
            set_slug = set_name.lower().replace(" ", "-")
            url += f"&setName={set_slug}"

        try:
            async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
                resp = await client.get(url, headers=headers)
                if resp.status_code != 200:
                    return results

                soup = BeautifulSoup(resp.text, "lxml")

                # TCGPlayer product cards
                for item in soup.select("div[class*='search-result']"):
                    try:
                        name_el = item.select_one("a[class*='product-card__title']")
                        price_el = item.select_one("span[class*='price']")
                        link_el = item.select_one("a[class*='product-card']")

                        if not name_el or not price_el:
                            continue

                        found_name = name_el.get_text(strip=True)
                        price_text = price_el.get_text(strip=True).replace("$", "").replace(",", "")
                        href = link_el.get("href", "") if link_el else ""

                        try:
                            price = float(price_text)
                        except ValueError:
                            continue

                        if max_price and price > max_price:
                            continue

                        # Extract listing ID from URL
                        listing_id = href.split("/")[-1] if href else found_name

                        results.append(CardListing(
                            card_name=found_name,
                            set_name=set_name,
                            outlet="tcgplayer",
                            price=price,
                            listing_url=f"https://www.tcgplayer.com{href}" if href else url,
                            listing_id=listing_id,
                        ))
                    except Exception:
                        continue

        except Exception as e:
            # Log but don't crash
            pass

        return results

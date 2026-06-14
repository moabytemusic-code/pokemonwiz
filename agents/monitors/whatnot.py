"""
WhatNot monitor — searches WhatNot for Pokemon card listings.
WhatNot is a live auction platform popular for Pokemon cards.
"""

import re
import httpx
from bs4 import BeautifulSoup
from monitors.base import BaseMonitor, CardListing


class WhatNotMonitor(BaseMonitor):
    """Searches WhatNot marketplace for Pokemon cards."""

    @property
    def outlet_name(self) -> str:
        return "whatnot"

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

        query = f"{card_name} pokemon"
        if set_name:
            query += f" {set_name}"
        query = query.replace(" ", "+")

        url = f"https://www.whatnot.com/search?q={query}"

        try:
            async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
                resp = await client.get(url, headers=headers)
                if resp.status_code != 200:
                    return results

                soup = BeautifulSoup(resp.text, "lxml")

                # WhatNot uses a grid of listing cards
                for item in soup.select("a[class*='ListingCard'], a[href*='/listing/']"):
                    try:
                        text = item.get_text(strip=True)
                        href = item.get("href", "")

                        if not text or not href:
                            continue

                        # Extract price from text
                        price_match = re.search(r'\$(\d+\.?\d*)', text)
                        price = float(price_match.group(1)) if price_match else 0.0

                        if max_price and price > max_price:
                            continue

                        # Extract listing ID from URL
                        listing_id = href.split("/")[-1].split("?")[0] if href else "unknown"

                        full_url = f"https://www.whatnot.com{href}" if href.startswith("/") else href

                        # Use the first part of the text as card name
                        name_parts = text.split("$")[0].strip()[:80]

                        results.append(CardListing(
                            card_name=name_parts or card_name,
                            set_name=set_name,
                            outlet="whatnot",
                            price=price,
                            listing_url=full_url,
                            listing_id=listing_id,
                        ))
                    except Exception:
                        continue
        except Exception:
            pass

        return results

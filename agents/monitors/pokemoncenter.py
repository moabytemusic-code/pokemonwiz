"""
Pokemon Center monitor — checks official Pokemon Center for product availability.
"""

import httpx
from bs4 import BeautifulSoup
from monitors.base import BaseMonitor, CardListing


class PokemonCenterMonitor(BaseMonitor):
    """Checks Pokemon Center for card product pages."""

    @property
    def outlet_name(self) -> str:
        return "pokemoncenter"

    async def search_card(
        self, card_name: str, set_name: str | None = None, max_price: float | None = None
    ) -> list[CardListing]:
        results: list[CardListing] = []
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                          "AppleWebKit/537.36 (KHTML, like Gecko) "
                          "Chrome/125.0.0.0 Safari/537.36",
        }

        query = card_name.replace(" ", "+")
        if set_name:
            query += f"+{set_name.replace(' ', '+')}"

        url = f"https://www.pokemoncenter.com/search?q={query}"

        try:
            async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
                resp = await client.get(url, headers=headers)
                if resp.status_code != 200:
                    return results

                soup = BeautifulSoup(resp.text, "lxml")

                for item in soup.select("div[class*='product']"):
                    try:
                        name_el = item.select_one("a[class*='name'], h3 a")
                        price_el = item.select_one("span[class*='price'], span[class*='sales']")
                        link_el = item.select_one("a[class*='product']")

                        if not name_el:
                            continue

                        found_name = name_el.get_text(strip=True)
                        price = 0.0
                        if price_el:
                            price_text = price_el.get_text(strip=True).replace("$", "").replace(",", "")
                            try:
                                price = float(price_text)
                            except ValueError:
                                price = 0.0

                        if max_price and price > max_price:
                            continue

                        href = link_el.get("href", "") if link_el else ""
                        listing_id = href.split("/")[-1] if href else found_name

                        results.append(CardListing(
                            card_name=found_name,
                            set_name=set_name,
                            outlet="pokemoncenter",
                            price=price,
                            listing_url=f"https://www.pokemoncenter.com{href}" if href.startswith("/") else href,
                            listing_id=listing_id,
                        ))
                    except Exception:
                        continue
        except Exception:
            pass

        return results

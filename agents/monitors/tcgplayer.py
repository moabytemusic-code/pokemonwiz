"""
TCGPlayer monitor — uses the TCGPlayer public search API for reliable results.
"""

import httpx
from monitors.base import BaseMonitor, CardListing


class TCGPlayerMonitor(BaseMonitor):
    """Searches TCGPlayer marketplace via their public API."""

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
            "Accept": "application/json",
        }

        # TCGPlayer search API endpoint
        params = {
            "q": card_name,
            "productLineName": "pokemon",
            "limit": 30,
            "sort": "price+asc",
            "condition": "Near+Mint,Mint",
        }
        if set_name:
            params["setName"] = set_name

        url = "https://mp-search-api.tcgplayer.com/v1/search/request"

        try:
            async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
                payload = {
                    "searchTerm": card_name,
                    "filters": [],
                    "sort": "PRICE_LOW_TO_HIGH",
                    "resultsStartingIndex": 0,
                    "resultsPerPage": 50,
                }
                resp = await client.post(
                    "https://mp-search-api.tcgplayer.com/v1/search/request?q=" + card_name.replace(" ", "+"),
                    json=payload,
                    headers=headers,
                )
                if resp.status_code != 200:
                    return results

                data = resp.json()
                results_list = data.get("results", [])

                for item in results_list:
                    try:
                        product = item.get("product", {})
                        market_price = product.get("marketPrice") or product.get("lowestPrice") or 0
                        product_name = product.get("productName", card_name)
                        url_key = product.get("urlName", "")
                        product_id = str(product.get("productId", ""))

                        price = float(market_price)
                        if max_price and price > max_price:
                            continue

                        results.append(CardListing(
                            card_name=product_name,
                            set_name=set_name or product.get("setName"),
                            outlet="tcgplayer",
                            price=price,
                            listing_url=f"https://www.tcgplayer.com/product/{product_id}",
                            listing_id=product_id,
                        ))
                    except Exception:
                        continue

        except Exception:
            pass

        return results

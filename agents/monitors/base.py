"""
Abstract base class for outlet monitors.
Each outlet (TCGPlayer, Pokemon Center, eBay) implements its own scraper.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class CardListing:
    """A detected listing from any outlet."""
    card_name: str
    set_name: str | None
    outlet: str
    price: float
    listing_url: str
    listing_id: str
    condition: str | None = None
    seller: str | None = None
    in_stock: bool = True


class BaseMonitor(ABC):
    """Each outlet gets its own subclass."""

    @property
    @abstractmethod
    def outlet_name(self) -> str:
        """e.g. 'tcgplayer', 'pokemoncenter', 'ebay'"""
        ...

    @abstractmethod
    async def search_card(self, card_name: str, set_name: str | None = None, max_price: float | None = None) -> list[CardListing]:
        """
        Search the outlet for the given card.
        Returns all matching listings found.
        """
        ...

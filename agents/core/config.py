"""
Pokemon Wiz — Agent Configuration
Loads settings from environment variables (Supabase stores the rest).
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SUPABASE_URL: str = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
    SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")

    # How often to poll for new campaigns / assignments (seconds)
    POLL_INTERVAL: int = int(os.getenv("AGENT_POLL_INTERVAL", "300"))

    # How long to wait between individual outlet scrapes (seconds)
    SCRAPE_DELAY: float = float(os.getenv("AGENT_SCRAPE_DELAY", "3.0"))

    # Maximum concurrent browsers for Playwright
    MAX_BROWSERS: int = int(os.getenv("AGENT_MAX_BROWSERS", "3"))

    @classmethod
    def validate(cls):
        missing = []
        if not cls.SUPABASE_URL:
            missing.append("NEXT_PUBLIC_SUPABASE_URL")
        if not cls.SUPABASE_SERVICE_KEY:
            missing.append("SUPABASE_SERVICE_KEY")
        if missing:
            raise RuntimeError(f"Missing required env vars: {', '.join(missing)}")

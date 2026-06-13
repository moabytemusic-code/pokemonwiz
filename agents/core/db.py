"""
Supabase client singleton for the agent runtime.
"""

from supabase import create_client, Client
from core.config import Config


_client: Client | None = None


def get_supabase() -> Client:
    global _client
    if _client is None:
        Config.validate()
        _client = create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_KEY)
    return _client

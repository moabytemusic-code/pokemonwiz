"""
Heartbeat — agents report their status to Supabase every N seconds.
"""

from datetime import datetime, timezone
from core.db import get_supabase


def heartbeat(agent_id: int, status: str = "running"):
    """Update agent's last_active timestamp and status."""
    try:
        supabase = get_supabase()
        now = datetime.now(timezone.utc).isoformat()
        supabase.table("agents").update({
            "last_active": now,
            "status": status,
        }).eq("id", agent_id).execute()
    except Exception as e:
        print(f"[HEARTBEAT FAILED] agent={agent_id} {e}")

"""
Audit logging — every agent action is recorded in Supabase.
"""

from datetime import datetime, timezone
from core.db import get_supabase


def log(
    agent_id: int | None,
    campaign_id: int | None,
    event_type: str,
    message: str,
    level: str = "info",
    metadata: dict | None = None,
):
    """Write an audit log entry to Supabase."""
    try:
        supabase = get_supabase()
        supabase.table("audit_logs").insert({
            "agent_id": agent_id,
            "campaign_id": campaign_id,
            "event_type": event_type,
            "level": level,
            "message": message,
            "metadata": metadata or {},
            "created_at": datetime.now(timezone.utc).isoformat(),
        }).execute()
    except Exception as e:
        # Don't let logging failure break the agent
        print(f"[AUDIT FAILED] {e}")

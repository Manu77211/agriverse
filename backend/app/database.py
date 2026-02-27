"""
Krishi Sakhi — Database Connection Module.

Provides Supabase client instances for interacting with the database.
Two clients:
    1. anon_client  — Uses anon key, respects RLS policies (for user-facing queries)
    2. admin_client — Uses service_role key, bypasses RLS (for backend services)
"""

from functools import lru_cache

from supabase import create_client, Client

from app.config import get_settings


@lru_cache()
def get_supabase_client() -> Client:
    """
    Returns a Supabase client using the ANON key.
    This client respects Row Level Security policies.
    Use for user-authenticated requests (pass JWT in headers).
    """
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_anon_key:
        raise ValueError(
            "SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env. "
            "Get them from: https://supabase.com/dashboard/project/settings/api"
        )
    return create_client(settings.supabase_url, settings.supabase_anon_key)


@lru_cache()
def get_supabase_admin() -> Client:
    """
    Returns a Supabase client using the SERVICE_ROLE key.
    This client BYPASSES Row Level Security — use only in backend services.
    NEVER expose this client to frontend or user requests.
    
    Used for:
        - Inserting sensor data (Pi authenticated via device_secret, not user JWT)
        - Inserting derived metrics (computed by backend)
        - Inserting market prices (scraped by backend)
        - Admin operations
    """
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise ValueError(
            "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env. "
            "Get the service role key from: Supabase Dashboard → Settings → API → service_role key"
        )
    return create_client(settings.supabase_url, settings.supabase_service_role_key)

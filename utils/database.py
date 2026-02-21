"""
Zentrales Datenbankmodul für Pulse of Learning.

Supabase (PostgreSQL) als Cloud-Datenbank.
"""

import streamlit as st
from supabase import create_client, Client

_client: Client = None


def get_db() -> Client:
    """Gibt den Supabase-Client zurück."""
    global _client
    if _client is None:
        _client = create_client(
            st.secrets["SUPABASE_URL"],
            st.secrets["SUPABASE_KEY"]
        )
    return _client

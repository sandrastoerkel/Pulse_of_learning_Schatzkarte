"""
Zentrales Datenbankmodul für Pulse of Learning.

Supabase (PostgreSQL) als Cloud-Datenbank.
"""

import streamlit as st
from supabase import create_client, Client


@st.cache_resource
def get_db() -> Client:
    """Gibt den Supabase-Client zurück (gecacht über alle Sessions).

    Supabase nutzt HTTP/REST — keine persistenten DB-Verbindungen
    die "stale" werden können. @st.cache_resource ist hier sicher
    und überlebt WebSocket-Reconnects (wichtig für Multipage-Apps).
    """
    return create_client(
        st.secrets["SUPABASE_URL"],
        st.secrets["SUPABASE_KEY"]
    )

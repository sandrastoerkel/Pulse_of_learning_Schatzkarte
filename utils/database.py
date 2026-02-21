"""
Zentrales Datenbankmodul für Pulse of Learning.

Supabase (PostgreSQL) als Cloud-Datenbank.
"""

import streamlit as st
from supabase import create_client, Client


def get_db() -> Client:
    """Gibt den Supabase-Client zurück.

    Erstellt pro Script-Run einen neuen Client um
    stale HTTP-Verbindungen auf Streamlit Cloud zu vermeiden.
    """
    if "supabase_client" not in st.session_state:
        st.session_state.supabase_client = create_client(
            st.secrets["SUPABASE_URL"],
            st.secrets["SUPABASE_KEY"]
        )
    return st.session_state.supabase_client

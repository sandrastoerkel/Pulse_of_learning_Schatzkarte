"""
Zentrales Datenbankmodul für Pulse of Learning.

- Mit Turso-Credentials (Streamlit Secrets) → Cloud-DB (persistent)
- Ohne Credentials (lokal) → lokale SQLite-Datei (Fallback)
"""

import sqlite3
from pathlib import Path


def _get_local_db_path() -> Path:
    """Gibt den Pfad zur lokalen SQLite-Datenbank zurück (Fallback)."""
    if Path("/tmp").exists() and Path("/tmp").is_dir():
        db_dir = Path("/tmp")
    else:
        db_dir = Path(__file__).parent.parent / "data"
        db_dir.mkdir(exist_ok=True)
    return db_dir / "hattie_gamification.db"


def get_connection():
    """
    Gibt eine Datenbankverbindung zurück.

    - Mit TURSO_DATABASE_URL und TURSO_AUTH_TOKEN in Streamlit Secrets → Turso Cloud-DB
    - Ohne Credentials → lokale SQLite-Datei

    row_factory ist auf sqlite3.Row gesetzt (Dict-artiger Zugriff auf Spalten).
    """
    try:
        import streamlit as st
        turso_url = st.secrets.get("TURSO_DATABASE_URL", "")
        turso_token = st.secrets.get("TURSO_AUTH_TOKEN", "")

        if turso_url and turso_token:
            import libsql_experimental as libsql
            conn = libsql.connect(database=turso_url, auth_token=turso_token)
            conn.row_factory = sqlite3.Row
            return conn
    except (ImportError, FileNotFoundError, KeyError, AttributeError):
        pass

    # Fallback: lokale SQLite-Datei
    conn = sqlite3.connect(str(_get_local_db_path()))
    conn.row_factory = sqlite3.Row
    return conn

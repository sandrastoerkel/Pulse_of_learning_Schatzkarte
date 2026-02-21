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
    # Versuche Turso Cloud-DB
    try:
        import streamlit as st
        try:
            turso_url = st.secrets["TURSO_DATABASE_URL"]
            turso_token = st.secrets["TURSO_AUTH_TOKEN"]
        except (KeyError, FileNotFoundError):
            turso_url = ""
            turso_token = ""

        if turso_url and turso_token:
            import libsql_experimental as libsql
            print(f"[database.py] Connecting to Turso: {turso_url[:50]}...")
            conn = libsql.connect(turso_url, auth_token=turso_token)
            print("[database.py] Turso connection established!")
            return conn
    except Exception as e:
        print(f"[database.py] Turso connection FAILED: {type(e).__name__}: {e}")

    # Fallback: lokale SQLite-Datei
    db_path = _get_local_db_path()
    print(f"[database.py] Using local SQLite: {db_path}")
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    return conn

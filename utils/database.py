"""
Zentrales Datenbankmodul für Pulse of Learning.

- Mit Turso-Credentials (Streamlit Secrets) → Cloud-DB (persistent)
- Ohne Credentials (lokal) → lokale SQLite-Datei (Fallback)
"""

import sqlite3
from pathlib import Path


class DictRow:
    """
    Row-Klasse die sowohl Dict-Zugriff (row['col']) als auch
    numerischen Index (row[0]) unterstützt — wie sqlite3.Row,
    aber kompatibel mit libsql_experimental.
    """
    __slots__ = ('_fields', '_values', '_dict')

    def __init__(self, cursor, row):
        self._fields = [column[0] for column in cursor.description]
        self._values = tuple(row)
        self._dict = dict(zip(self._fields, self._values))

    def __getitem__(self, key):
        if isinstance(key, (int, slice)):
            return self._values[key]
        return self._dict[key]

    def __contains__(self, key):
        return key in self._dict

    def __iter__(self):
        return iter(self._values)

    def __len__(self):
        return len(self._values)

    def __repr__(self):
        return f"DictRow({self._dict})"

    def keys(self):
        return self._fields

    def values(self):
        return self._values

    def items(self):
        return self._dict.items()

    def get(self, key, default=None):
        return self._dict.get(key, default)


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

    row_factory gibt DictRow zurück (Dict-Zugriff + Index-Zugriff).
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
            conn = libsql.connect(turso_url, auth_token=turso_token)
            conn.row_factory = DictRow
            return conn
    except Exception as e:
        print(f"[database.py] Turso connection FAILED: {type(e).__name__}: {e}")

    # Fallback: lokale SQLite-Datei
    db_path = _get_local_db_path()
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = DictRow
    return conn

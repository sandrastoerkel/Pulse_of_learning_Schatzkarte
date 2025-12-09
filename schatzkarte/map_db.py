# -*- coding: utf-8 -*-
"""Datenbank fuer Schatzkarte."""
import sqlite3
from datetime import datetime
from pathlib import Path

def get_db_path() -> Path:
    """Gibt den Pfad zur SQLite-Datenbank zurueck."""
    # Fuer Streamlit Cloud: tmp-Verzeichnis, sonst lokaler Ordner
    if Path("/tmp").exists() and Path("/tmp").is_dir():
        db_dir = Path("/tmp")
    else:
        db_dir = Path(__file__).parent.parent / "data"
        db_dir.mkdir(exist_ok=True)
    return db_dir / "hattie_gamification.db"

def get_connection():
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    return conn

def init_map_tables():
    """Erstellt die Schatzkarten-Tabellen."""
    conn = get_connection()
    c = conn.cursor()

    # Lerngruppen
    c.execute("""
        CREATE TABLE IF NOT EXISTS learning_groups (
            group_id TEXT PRIMARY KEY,
            group_name TEXT NOT NULL,
            start_date DATE NOT NULL,
            is_active BOOLEAN DEFAULT TRUE
        )
    """)

    # Gruppen-Mitglieder
    c.execute("""
        CREATE TABLE IF NOT EXISTS group_members (
            group_id TEXT,
            user_id TEXT,
            PRIMARY KEY (group_id, user_id)
        )
    """)

    # Gesammelte Schaetze
    c.execute("""
        CREATE TABLE IF NOT EXISTS user_treasures (
            user_id TEXT,
            island_id TEXT,
            treasure_id TEXT,
            collected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            xp_earned INTEGER DEFAULT 0,
            PRIMARY KEY (user_id, island_id, treasure_id)
        )
    """)

    conn.commit()
    conn.close()
    print("Tabellen erstellt!")

if __name__ == "__main__":
    init_map_tables()

"""
Test-Script: Supabase-Verbindung prüfen
========================================
Testet: Verbindung, Schreiben, Lesen, Löschen
"""

import sys

# Supabase-Credentials laden (aus .streamlit/secrets.toml)
import re

secrets = {}
with open(".streamlit/secrets.toml", "r") as f:
    for line in f:
        m = re.match(r'^(\w+)\s*=\s*"(.+)"', line.strip())
        if m:
            secrets[m.group(1)] = m.group(2)

SUPABASE_URL = secrets["SUPABASE_URL"]
SUPABASE_KEY = secrets["SUPABASE_KEY"]

TEST_USER_ID = "__test_supabase_connection__"

errors = []

# ─────────────────────────────────────────
# 1. Verbindung herstellen
# ─────────────────────────────────────────
print("1. Verbindung zu Supabase herstellen...")
try:
    from supabase import create_client
    db = create_client(SUPABASE_URL, SUPABASE_KEY)
    print(f"   ✅ Client erstellt für {SUPABASE_URL}")
except Exception as e:
    print(f"   ❌ Fehler: {e}")
    errors.append(f"Verbindung: {e}")
    print(f"\n{'='*50}")
    print(f"ERGEBNIS: ❌ FEHLER — Verbindung fehlgeschlagen")
    sys.exit(1)

# ─────────────────────────────────────────
# 2. Test-User schreiben
# ─────────────────────────────────────────
print("2. Test-User in users-Tabelle schreiben...")
try:
    # Erst aufräumen (falls vom letzten Test übrig)
    db.table("users").delete().eq("user_id", TEST_USER_ID).execute()

    from datetime import datetime
    now = datetime.now().isoformat()
    result = db.table("users").insert({
        "user_id": TEST_USER_ID,
        "username": "test_user",
        "name": "test_user",
        "display_name": "Supabase Test",
        "created_at": now,
        "last_login": now,
        "xp_total": 42,
        "level": 1,
        "current_streak": 0,
        "longest_streak": 0
    }).execute()

    if result.data:
        print(f"   ✅ User geschrieben: {result.data[0]['user_id']}")
    else:
        print(f"   ❌ Insert gab keine Daten zurück")
        errors.append("Insert: keine Daten zurück")
except Exception as e:
    print(f"   ❌ Fehler: {e}")
    errors.append(f"Insert: {e}")

# ─────────────────────────────────────────
# 3. Test-User auslesen
# ─────────────────────────────────────────
print("3. Test-User wieder auslesen...")
try:
    result = db.table("users").select("*").eq("user_id", TEST_USER_ID).execute()

    if result.data:
        user = result.data[0]
        print(f"   ✅ User gelesen:")
        print(f"      user_id:      {user['user_id']}")
        print(f"      display_name: {user['display_name']}")
        print(f"      xp_total:     {user['xp_total']}")
        print(f"      level:        {user['level']}")

        # Prüfe Werte
        assert user["xp_total"] == 42, f"xp_total erwartet 42, bekommen {user['xp_total']}"
        assert user["display_name"] == "Supabase Test", f"display_name falsch"
        print(f"   ✅ Werte korrekt")
    else:
        print(f"   ❌ User nicht gefunden")
        errors.append("Select: User nicht gefunden")
except Exception as e:
    print(f"   ❌ Fehler: {e}")
    errors.append(f"Select: {e}")

# ─────────────────────────────────────────
# 4. Test-User löschen
# ─────────────────────────────────────────
print("4. Test-User löschen...")
try:
    result = db.table("users").delete().eq("user_id", TEST_USER_ID).execute()

    # Prüfen ob wirklich weg
    check = db.table("users").select("user_id").eq("user_id", TEST_USER_ID).execute()
    if not check.data:
        print(f"   ✅ User gelöscht und verifiziert")
    else:
        print(f"   ❌ User existiert noch nach Delete")
        errors.append("Delete: User existiert noch")
except Exception as e:
    print(f"   ❌ Fehler: {e}")
    errors.append(f"Delete: {e}")

# ─────────────────────────────────────────
# 5. Ergebnis
# ─────────────────────────────────────────
print(f"\n{'='*50}")
if errors:
    print(f"ERGEBNIS: ❌ {len(errors)} FEHLER")
    for e in errors:
        print(f"  - {e}")
    sys.exit(1)
else:
    print("ERGEBNIS: ✅ ALLES OK — Supabase funktioniert!")
    print("  Verbindung ✅ | Schreiben ✅ | Lesen ✅ | Löschen ✅")
    sys.exit(0)

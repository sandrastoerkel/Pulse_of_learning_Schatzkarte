"""
👤 Benutzer-System für Gamification
===================================

Einfaches Benutzer-System für die Ressourcen-Seite.
Ermöglicht persistente Speicherung aller Gamification-Daten pro Schüler.

Verwendung:
    from utils.user_system import render_user_login, get_current_user, is_logged_in

    # Am Anfang der Seite:
    render_user_login()

    # Prüfen ob eingeloggt:
    if is_logged_in():
        user = get_current_user()
"""

import streamlit as st
from datetime import datetime
from typing import Dict, Optional, Any, List
import hashlib
import hmac
import time
import base64
import json
import random
import streamlit.components.v1 as components

from utils.database import get_db

# ============================================
# COOKIE-BASIERTER AUTO-LOGIN
# ============================================

COOKIE_NAME = "pol_auth"
COOKIE_MAX_AGE_DAYS = 30


def _get_cookie_secret() -> str:
    """Liest das Cookie-Secret aus st.secrets."""
    try:
        return st.secrets["cookie_secret"]
    except (KeyError, FileNotFoundError):
        # Fallback für lokale Entwicklung ohne secrets.toml
        return "dev-fallback-secret-nicht-fuer-produktion"


def _create_login_token(user_id: str) -> str:
    """Erstellt ein HMAC-signiertes Token: base64(user_id:timestamp:signature)."""
    timestamp = str(int(time.time()))
    payload = f"{user_id}:{timestamp}"
    signature = hmac.new(
        _get_cookie_secret().encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    token = f"{payload}:{signature}"
    return base64.urlsafe_b64encode(token.encode()).decode()


def _verify_login_token(token: str) -> Optional[str]:
    """Verifiziert ein Token. Gibt user_id zurück oder None bei Fehler/Ablauf."""
    try:
        decoded = base64.urlsafe_b64decode(token.encode()).decode()
        parts = decoded.split(":")
        if len(parts) != 3:
            return None

        user_id, timestamp_str, signature = parts

        # HMAC prüfen
        payload = f"{user_id}:{timestamp_str}"
        expected = hmac.new(
            _get_cookie_secret().encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()
        if not hmac.compare_digest(signature, expected):
            return None

        # Ablauf prüfen
        token_time = int(timestamp_str)
        max_age_seconds = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60
        if time.time() - token_time > max_age_seconds:
            return None

        return user_id
    except Exception:
        return None


def _set_cookie_js(name: str, value: str, days: int):
    """Setzt ein Cookie via unsichtbares JavaScript-Snippet."""
    max_age = days * 24 * 60 * 60
    js = f"""
    <script>
    document.cookie = "{name}={value}; path=/; max-age={max_age}; SameSite=Lax";
    </script>
    """
    components.html(js, height=0)


def _delete_cookie_js(name: str):
    """Löscht ein Cookie via JavaScript."""
    js = f"""
    <script>
    document.cookie = "{name}=; path=/; max-age=0; SameSite=Lax";
    </script>
    """
    components.html(js, height=0)


def try_auto_login() -> bool:
    """Versucht Auto-Login via Cookie. Gibt True zurück wenn eingeloggt."""
    if is_logged_in():
        return True

    # Nach Logout: Cookie loeschen und NICHT auto-einloggen
    if st.session_state.get("_just_logged_out"):
        del st.session_state["_just_logged_out"]
        _delete_cookie_js(COOKIE_NAME)
        # Persistentes Flag: Cookie wurde logisch geloescht,
        # aber der Browser hat es evtl. noch (JS-Loesung ist async).
        # Verhindert Relogin-Loop bis Cookie tatsaechlich weg ist.
        st.session_state._cookie_invalidated = True
        return False

    # Cookie wurde logisch geloescht — nicht erneut auto-einloggen
    # bis der Browser das Cookie tatsaechlich entfernt hat
    if st.session_state.get("_cookie_invalidated"):
        try:
            cookie_still_exists = bool(st.context.cookies.get(COOKIE_NAME))
        except Exception:
            cookie_still_exists = False
        if not cookie_still_exists:
            # Cookie ist endlich weg — Flag aufheben
            del st.session_state["_cookie_invalidated"]
        return False

    try:
        cookie_value = st.context.cookies.get(COOKIE_NAME)
    except Exception:
        return False

    if not cookie_value:
        return False

    user_id = _verify_login_token(cookie_value)
    if not user_id:
        return False

    try:
        user = get_user_by_id(user_id)
    except Exception:
        # DB-Verbindung fehlgeschlagen - Cookie ignorieren, kein Crash
        return False
    if not user:
        # User existiert nicht mehr in DB — Cookie loeschen
        _delete_cookie_js(COOKIE_NAME)
        st.session_state._cookie_invalidated = True
        return False

    # Session State wiederherstellen
    st.session_state.current_user_id = user["user_id"]
    st.session_state.current_user_name = user["display_name"]
    st.session_state.current_user_age_group = user.get("age_group", "grundschule").lower()

    # Rolle cachen (verhindert DB-Roundtrip in render_age_switcher_overlay)
    user_role = user.get("role", "student").lower()
    st.session_state._cached_user_role = user_role
    st.session_state._cached_user_role_id = user["user_id"]

    # Admin/Coach-Status wiederherstellen
    if user_role in ["coach", "admin", "paedagoge", "pädagoge"]:
        st.session_state.show_admin_user_list = True

    return True

# ============================================
# AVATAR KONFIGURATION (DiceBear)
# ============================================

# Avatar-Stile je nach Altersstufe
AVATAR_STYLES_BY_AGE = {
    "grundschule": {
        "styles": ["thumbs", "fun-emoji", "bottts-neutral", "icons"],
        "label": "🎒 Grundschule",
        "description": "Süße & bunte Avatare"
    },
    "unterstufe": {
        "styles": ["adventurer", "adventurer-neutral", "big-smile", "avataaars"],
        "label": "📚 Unterstufe",
        "description": "Coole Cartoon-Charaktere"
    },
    "mittelstufe": {
        "styles": ["avataaars", "lorelei", "micah", "personas"],
        "label": "🎯 Mittelstufe",
        "description": "Stylische Figuren"
    },
    "oberstufe": {
        "styles": ["notionists", "notionists-neutral", "shapes", "initials"],
        "label": "🎓 Oberstufe",
        "description": "Modern & minimalistisch"
    }
}

# Freischaltbare Avatar-Optionen
AVATAR_UNLOCKABLES = {
    "backgrounds": {
        "none": {"name": "Kein Hintergrund", "unlock_level": 1},
        "b6e3f4": {"name": "Hellblau", "unlock_level": 1},
        "c0aede": {"name": "Lila", "unlock_level": 2},
        "ffd5dc": {"name": "Rosa", "unlock_level": 2},
        "ffdfbf": {"name": "Orange", "unlock_level": 3},
        "d1f4d1": {"name": "Grün", "unlock_level": 3},
        "ffd700": {"name": "Gold ⭐", "unlock_level": 5},
        "gradient": {"name": "Regenbogen 🌈", "unlock_level": 7},
    },
    "accessories": {
        "none": {"name": "Keine", "unlock_level": 1},
        "glasses": {"name": "Brille 👓", "unlock_level": 2},
        "sunglasses": {"name": "Sonnenbrille 😎", "unlock_level": 3},
        "hat": {"name": "Hut 🎩", "unlock_level": 4},
        "crown": {"name": "Krone 👑", "unlock_level": 6},
    }
}

def get_avatar_url(user: Dict) -> str:
    """Generiert die DiceBear Avatar-URL für einen User."""
    avatar_settings = user.get('avatar_settings', {})
    if isinstance(avatar_settings, str):
        try:
            avatar_settings = json.loads(avatar_settings)
        except:
            avatar_settings = {}

    style = avatar_settings.get('style', 'adventurer')
    seed = user.get('display_name', 'default')
    background = avatar_settings.get('background', 'b6e3f4')

    # DiceBear URL bauen
    if background == "none":
        bg_param = ""
    elif background == "gradient":
        bg_param = "&backgroundColor=b6e3f4,c0aede,ffd5dc"
    else:
        bg_param = f"&backgroundColor={background}"

    return f"https://api.dicebear.com/7.x/{style}/svg?seed={seed}{bg_param}&radius=50"

def get_unlocked_options(user: Dict, category: str) -> List[str]:
    """Gibt die freigeschalteten Optionen für eine Kategorie zurück."""
    level = user.get('level', 1)
    unlocked = []

    for key, info in AVATAR_UNLOCKABLES.get(category, {}).items():
        if level >= info.get('unlock_level', 1):
            unlocked.append(key)

    return unlocked

# ============================================
# DATABASE
# ============================================

def hash_password(password: str) -> str:
    """Erzeugt einen SHA-256 Hash des Passworts."""
    return hashlib.sha256(password.encode()).hexdigest()

def is_name_taken(name: str) -> bool:
    """Prüft ob ein Benutzername (lowercase) bereits in der DB existiert."""
    clean_name = name.strip().lower()
    user_id = hashlib.md5(clean_name.encode()).hexdigest()[:16]
    result = get_db().table("users").select("user_id").eq("user_id", user_id).execute()
    return len(result.data) > 0

def verify_password(user_id: str, password: str) -> bool:
    """Vergleicht ein Passwort mit dem gespeicherten Hash in der DB."""
    result = get_db().table("users").select("password_hash").eq("user_id", user_id).execute()
    if not result.data or not result.data[0].get("password_hash"):
        return False
    return result.data[0]["password_hash"] == hash_password(password)

def get_user_id_for_name(name: str) -> Optional[str]:
    """Gibt die user_id für einen Namen zurück (oder None)."""
    clean_name = name.strip().lower()
    return hashlib.md5(clean_name.encode()).hexdigest()[:16]

def get_or_create_user_by_name(display_name: str, age_group: str = None, avatar_style: str = None, password: str = None) -> Dict[str, Any]:
    """Holt oder erstellt einen User basierend auf dem Display-Namen."""
    db = get_db()
    clean_name = display_name.strip().lower()
    user_id = hashlib.md5(clean_name.encode()).hexdigest()[:16]

    result = db.table("users").select("*").eq("user_id", user_id).execute()
    now = datetime.now().isoformat()

    if not result.data:
        age = age_group or "unterstufe"
        if avatar_style:
            style = avatar_style
        else:
            style = AVATAR_STYLES_BY_AGE.get(age, {}).get('styles', ['adventurer'])[0]

        avatar_settings = json.dumps({"style": style, "background": "b6e3f4"})
        pw_hash = hash_password(password) if password else None

        insert_result = db.table("users").insert({
            "user_id": user_id,
            "name": clean_name,
            "username": clean_name,
            "display_name": display_name.strip(),
            "created_at": now,
            "last_login": now,
            "xp_total": 0,
            "level": 1,
            "age_group": age,
            "avatar_settings": avatar_settings,
            "password_hash": pw_hash
        }).execute()
        return insert_result.data[0]
    else:
        update_data = {"last_login": now, "display_name": display_name.strip()}
        if age_group:
            update_data["age_group"] = age_group

        update_result = db.table("users").update(update_data).eq("user_id", user_id).execute()
        return update_result.data[0]

def update_user_avatar(user_id: str, avatar_settings: Dict) -> bool:
    """Aktualisiert die Avatar-Einstellungen eines Users."""
    try:
        get_db().table("users").update({"avatar_settings": json.dumps(avatar_settings)}).eq("user_id", user_id).execute()
        # ✅ Cache invalidieren nach Write
        get_user_by_id.clear()
        return True
    except Exception as e:
        print(f"Error updating avatar: {e}")
        return False

def update_user_age_group(user_id: str, age_group: str) -> bool:
    """Aktualisiert die Altersstufe eines Users."""
    try:
        get_db().table("users").update({"age_group": age_group}).eq("user_id", user_id).execute()
        # ✅ Cache invalidieren nach Write
        get_user_by_id.clear()
        return True
    except Exception as e:
        print(f"Error updating age group: {e}")
        return False

@st.cache_data(ttl=60)
def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Holt einen User anhand der ID.

    OPTIMIERUNG: Gecacht mit TTL=60s. Wird 2-3x pro Render aufgerufen.
    Spart ~2-3 REST-Calls pro Render.
    """
    result = get_db().table("users").select("*").eq("user_id", user_id).execute()
    return result.data[0] if result.data else None

def get_all_users() -> list:
    """Holt alle registrierten Benutzer."""
    result = get_db().table("users") \
        .select("user_id, display_name, xp_total, level, last_login") \
        .not_.is_("display_name", "null") \
        .order("last_login", desc=True) \
        .execute()
    return result.data


def delete_user(user_id: str) -> bool:
    """Loescht einen User und alle zugehoerigen Daten."""
    db = get_db()
    print(f"[delete_user] Start: {user_id}")

    # Zeilen loeschen wo User referenziert ist
    for table, column in [
        ("group_members", "user_id"),
        ("group_messages", "sender_id"),
        ("meeting_participants", "user_id"),
        ("challenges", "user_id"),
        ("user_badges", "user_id"),
        ("polarstern_goals", "user_id"),
    ]:
        try:
            db.table(table).delete().eq(column, user_id).execute()
            print(f"[delete_user]   DELETE {table}.{column}: OK")
        except Exception as e:
            print(f"[delete_user]   DELETE {table}.{column}: {e}")

    # FK-Spalten nullen statt loeschen (Referenz-Daten bleiben erhalten)
    for table, column in [
        ("group_messages", "recipient_id"),
        ("group_messages", "deleted_by"),
        ("group_invitations", "used_by"),
    ]:
        try:
            db.table(table).update({column: None}).eq(column, user_id).execute()
            print(f"[delete_user]   NULL {table}.{column}: OK")
        except Exception as e:
            print(f"[delete_user]   NULL {table}.{column}: {e}")

    # User selbst loeschen
    try:
        db.table("users").delete().eq("user_id", user_id).execute()
        print(f"[delete_user]   DELETE users: OK")
        return True
    except Exception as e:
        print(f"[delete_user]   DELETE users: FEHLER -> {e}")
        return False

# ============================================
# SESSION STATE MANAGEMENT
# ============================================

def is_logged_in() -> bool:
    """Prüft ob ein Benutzer eingeloggt ist."""
    return "current_user_id" in st.session_state and st.session_state.current_user_id is not None

def get_current_user() -> Optional[Dict[str, Any]]:
    """Gibt den aktuell eingeloggten Benutzer zurück."""
    if not is_logged_in():
        return None
    return get_user_by_id(st.session_state.current_user_id)

def get_current_user_id() -> Optional[str]:
    """Gibt die ID des aktuell eingeloggten Benutzers zurück."""
    if not is_logged_in():
        return None
    return st.session_state.current_user_id

def login_user(display_name: str, age_group: str = None, avatar_style: str = None, password: str = None) -> Dict[str, Any]:
    """Loggt einen Benutzer ein (erstellt ihn falls nötig)."""
    user = get_or_create_user_by_name(display_name, age_group, avatar_style, password=password)
    st.session_state.current_user_id = user['user_id']
    st.session_state.current_user_name = user['display_name']
    st.session_state.current_user_age_group = user.get('age_group', 'grundschule').lower()

    # Rolle cachen (verhindert DB-Roundtrip in render_age_switcher_overlay)
    user_role = user.get('role', 'student').lower()
    st.session_state._cached_user_role = user_role
    st.session_state._cached_user_role_id = user['user_id']

    # Admin/Coach-Status für Quick-Login-Liste merken
    if user_role in ['coach', 'admin', 'paedagoge', 'pädagoge']:
        st.session_state.show_admin_user_list = True

    # Cookie NICHT sofort setzen (components.html() im Button-Callback
    # verursacht Login-Loop auf Schatzkarte). Stattdessen als pending markieren —
    # wird beim naechsten normalen Render in render_user_login() gesetzt.
    token = _create_login_token(user['user_id'])
    st.session_state._pending_login_cookie = token

    # ✅ Cache invalidieren nach Login (User-Daten haben sich geaendert: last_login)
    get_user_by_id.clear()

    # Registrierungs-State aufräumen (verhindert Login-Loop auf Schatzkarte)
    for key in ["registration_step", "registration_name", "registration_age", "registration_password",
                "_cookie_invalidated", "_nav_to_schatzkarte"]:
        if key in st.session_state:
            del st.session_state[key]

    return user

def logout_user():
    """Loggt den aktuellen Benutzer aus."""
    # Auto-Login Cookie löschen
    _delete_cookie_js(COOKIE_NAME)

    # Flag setzen damit try_auto_login() den Cookie beim naechsten Render loescht
    # (components.html wird bei st.rerun/switch_page nicht ausgefuehrt)
    st.session_state._just_logged_out = True

    # Admin-Status NICHT löschen, damit Quick-Login-Liste sichtbar bleibt
    keys_to_delete = ["current_user_id", "current_user_name", "current_user_age_group",
                      "registration_step", "registration_name", "registration_age",
                      "registration_password", "_cached_user_role", "_cached_user_role_id"]
    for key in keys_to_delete:
        if key in st.session_state:
            del st.session_state[key]

# ============================================
# UI COMPONENTS
# ============================================

def render_user_login(show_stats: bool = True, show_info_bar: bool = True):
    """
    Rendert die Benutzer-Login-Komponente.

    Args:
        show_stats: Wenn True, zeigt XP und Level an
        show_info_bar: Wenn True, zeigt die User-Info-Bar an (kann separat mit render_user_info_bar gezeigt werden)
    """
    # Preview-Modus hat Vorrang
    if is_preview_mode():
        render_preview_banner()
        return

    # Pending Cookie setzen (von login_user() aufgeschoben)
    if st.session_state.get("_pending_login_cookie"):
        _set_cookie_js(COOKIE_NAME, st.session_state._pending_login_cookie, COOKIE_MAX_AGE_DAYS)
        del st.session_state["_pending_login_cookie"]

    # Auto-Login via Cookie versuchen
    try_auto_login()

    if is_logged_in():
        user = get_current_user()
        if user:
            # Erzwungener Passwortwechsel (Temp-Passwort vom Coach)
            if check_must_change_password(user["user_id"]):
                render_force_password_change(user["user_id"])
                st.stop()
                return

            if show_info_bar:
                render_logged_in_view(user, show_stats)
        else:
            # User nicht gefunden (DB-Timeout, User geloescht, etc.)
            # WICHTIG: Nicht logout_user() aufrufen — dessen _delete_cookie_js()
            # erzeugt einen components.html()-Iframe der Rerun-Loops ausloesen kann.
            # Stattdessen Session leise bereinigen und Cookie als ungueltig markieren.
            for key in ["current_user_id", "current_user_name", "current_user_age_group"]:
                st.session_state.pop(key, None)
            st.session_state._cookie_invalidated = True
            render_login_form()
    else:
        render_login_form()


def render_user_info_bar():
    """Rendert NUR die User-Info-Bar (Name, Level, XP) - für flexible Platzierung."""
    # Im Preview-Modus: Preview-Banner wird separat gerendert
    if is_preview_mode():
        return

    if is_logged_in():
        user = get_current_user()
        if user:
            render_logged_in_view(user, show_stats=True)

def render_login_form():
    """Rendert das Login-Formular mit zwei Tabs: Neu anmelden und Einloggen."""

    # Initialisiere Registration-State
    if "registration_step" not in st.session_state:
        st.session_state.registration_step = 1

    # Header
    st.markdown("""
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; padding: 20px; border-radius: 15px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0;">👋 Willkommen bei den Lern-Ressourcen!</h3>
        <p style="margin: 0; opacity: 0.9;">
            Melde dich an, um deine Fortschritte zu speichern!
        </p>
    </div>
    """, unsafe_allow_html=True)

    # Preview-Modus Button
    st.markdown("---")
    col_preview1, col_preview2, col_preview3 = st.columns([1, 2, 1])
    with col_preview2:
        if st.button("👁️ App nur ansehen (Preview-Modus)", use_container_width=True, type="secondary"):
            start_preview_mode("unterstufe")
            st.rerun()
        st.caption("Teste alle Funktionen ohne Anmeldung (Unterstufe).")
    st.markdown("---")

    # === Zwei Tabs: Neu anmelden / Einloggen ===
    tab_register, tab_login = st.tabs(["📝 Neu anmelden", "🔑 Einloggen"])

    # ==========================================
    # TAB 1: Neu anmelden (Registrierung)
    # ==========================================
    with tab_register:
        # === SCHRITT 1: Name + Passwort ===
        if st.session_state.registration_step == 1:
            col1, col2 = st.columns([2, 1])

            with col1:
                st.markdown("### Schritt 1: Name & Passwort wählen")

                name_input = st.text_input(
                    "Dein Name:",
                    placeholder="z.B. Max, Lisa, ...",
                    help="Gib deinen Vornamen ein (mindestens 2 Buchstaben).",
                    key="name_input_step1"
                )

                pw_input = st.text_input(
                    "Passwort:",
                    type="password",
                    placeholder="Mindestens 4 Zeichen",
                    help="Wähle ein Passwort, das du dir merken kannst.",
                    key="pw_input_step1"
                )

                pw_confirm = st.text_input(
                    "Passwort bestätigen:",
                    type="password",
                    placeholder="Passwort nochmal eingeben",
                    key="pw_confirm_step1"
                )

                if st.button("➡️ Weiter", use_container_width=True, type="primary", key="register_next"):
                    name = name_input.strip() if name_input else ""
                    if len(name) < 2:
                        st.error("Bitte gib mindestens 2 Buchstaben ein.")
                    elif is_name_taken(name):
                        st.error(f"Der Name **{name}** ist bereits vergeben. Bitte wähle einen anderen Namen oder logge dich im Tab 'Einloggen' ein.")
                    elif not pw_input or len(pw_input) < 4:
                        st.error("Das Passwort muss mindestens 4 Zeichen lang sein.")
                    elif pw_input != pw_confirm:
                        st.error("Die Passwörter stimmen nicht überein.")
                    else:
                        st.session_state.registration_name = name
                        st.session_state.registration_password = pw_input
                        st.session_state.registration_step = 2
                        st.rerun()

            with col2:
                pass

        # === SCHRITT 2: Altersstufe wählen ===
        elif st.session_state.registration_step == 2:
            st.markdown(f"### Schritt 2: Hallo {st.session_state.registration_name}! In welcher Stufe bist du?")

            col1, col2, col3, col4 = st.columns(4)

            age_buttons = [
                ("grundschule", "🎒", "Grundschule", "Klasse 1-4", col1),
                ("unterstufe", "📚", "Unterstufe", "Klasse 5-7", col2),
                ("mittelstufe", "🎯", "Mittelstufe", "Klasse 8-10", col3),
                ("oberstufe", "🎓", "Oberstufe", "Klasse 11-13", col4),
            ]

            # TEMPORAER: Nur Unterstufe aktiv, Rest deaktiviert
            TEMP_DISABLED_AGE_GROUPS = {"grundschule", "mittelstufe", "oberstufe"}

            for age_key, icon, label, desc, col in age_buttons:
                is_disabled = age_key in TEMP_DISABLED_AGE_GROUPS
                with col:
                    opacity = "0.4" if is_disabled else "1"
                    st.markdown(f"""
                    <div style="text-align: center; padding: 10px; background: #f8f9fa;
                                border-radius: 10px; margin-bottom: 10px; opacity: {opacity};">
                        <div style="font-size: 2em;">{icon}</div>
                        <div style="font-weight: bold;">{label}</div>
                        <div style="font-size: 0.8em; color: #666;">{desc}</div>
                        {f'<div style="font-size: 0.7em; color: #e74c3c; margin-top: 4px;">Bald verfügbar</div>' if is_disabled else ''}
                    </div>
                    """, unsafe_allow_html=True)

                    if is_disabled:
                        st.button(f"Wählen", key=f"age_{age_key}", use_container_width=True, disabled=True)
                    elif st.button(f"Wählen", key=f"age_{age_key}", use_container_width=True):
                        name = st.session_state.registration_name
                        pw = st.session_state.get("registration_password")
                        user = login_user(name, age_key, password=pw)
                        st.balloons()
                        st.success(f"🎉 Willkommen, {name}!")
                        st.rerun()

            st.markdown("")
            if st.button("⬅️ Zurück", key="back_to_step1"):
                st.session_state.registration_step = 1
                st.rerun()

    # ==========================================
    # TAB 2: Einloggen (Rückkehr)
    # ==========================================
    with tab_login:
        st.markdown("### Willkommen zurück!")
        st.markdown("Gib deinen Namen und dein Passwort ein.")

        login_name = st.text_input(
            "Dein Name:",
            placeholder="z.B. Max, Lisa, ...",
            key="login_name_input"
        )

        login_pw = st.text_input(
            "Passwort:",
            type="password",
            placeholder="Dein Passwort",
            key="login_pw_input"
        )

        if st.button("🔑 Einloggen", use_container_width=True, type="primary", key="login_submit"):
            name = login_name.strip() if login_name else ""
            if len(name) < 2:
                st.error("Bitte gib deinen Namen ein.")
            elif not login_pw:
                st.error("Bitte gib dein Passwort ein.")
            else:
                user_id = get_user_id_for_name(name)
                if not is_name_taken(name):
                    st.error(f"Der Name **{name}** ist nicht registriert. Bitte melde dich zuerst im Tab 'Neu anmelden' an.")
                elif not verify_password(user_id, login_pw):
                    st.error("Falsches Passwort. Bitte versuche es erneut.")
                    st.caption("Falls du dein Passwort vergessen hast, kann dein Coach dir ein neues geben.")
                else:
                    user = login_user(name)
                    st.success(f"🎉 Willkommen zurück, {user['display_name']}!")
                    st.rerun()

def render_logged_in_view(user: Dict, show_stats: bool = True):
    """Rendert die Ansicht für eingeloggte Benutzer - kompakt ohne Avatar."""

    display_name = user.get('display_name', 'Lernender')
    level = user.get('level', 1)
    xp = user.get('xp_total', 0)
    streak = user.get('current_streak', 0)

    # Level-Emoji statt Avatar
    level_emojis = {1: "🌱", 2: "🔍", 3: "📚", 4: "📈", 5: "🚀", 6: "🏆", 7: "⭐", 8: "👑"}
    level_emoji = level_emojis.get(level, "🌱")

    # Kompakte Inline-Anzeige
    col1, col2, col3, col4, col5 = st.columns([3, 1, 1, 1, 0.5])

    with col1:
        st.markdown(f"**{level_emoji} {display_name}** · Level {level}")
    with col2:
        st.markdown(f"⭐ **{xp:,}** XP")
    with col3:
        st.markdown(f"🔥 **{streak}** Streak")
    with col4:
        pass  # Platzhalter
    with col5:
        if st.button("🚪", help="Abmelden", key="logout_btn"):
            logout_user()
            st.rerun()

    st.divider()

def render_user_stats_card(user: Dict):
    """Rendert eine detaillierte Statistik-Karte."""

    display_name = user.get('display_name', 'Lernender')
    level = user.get('level', 1)
    xp = user.get('xp_total', 0)
    streak = user.get('current_streak', 0)
    longest_streak = user.get('longest_streak', 0)

    # XP bis zum nächsten Level
    level_xp = {1: 0, 2: 100, 3: 250, 4: 500, 5: 1000, 6: 2000, 7: 5000, 8: 10000}
    current_level_xp = level_xp.get(level, 0)
    next_level_xp = level_xp.get(min(level + 1, 8), 10000)

    if level < 8:
        progress = (xp - current_level_xp) / max(1, (next_level_xp - current_level_xp))
        xp_needed = next_level_xp - xp
    else:
        progress = 1.0
        xp_needed = 0

    progress = min(1.0, max(0.0, progress))

    st.markdown(f"""
    <div style="background: #f8f9fa; border: 1px solid #dee2e6; padding: 20px; border-radius: 12px;">
        <h4 style="margin: 0 0 15px 0;">📊 Deine Statistiken</h4>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div style="background: white; padding: 12px; border-radius: 8px; text-align: center;">
                <div style="font-size: 0.8em; color: #666;">Gesamt-XP</div>
                <div style="font-size: 1.5em; font-weight: bold; color: #667eea;">{xp:,}</div>
            </div>
            <div style="background: white; padding: 12px; border-radius: 8px; text-align: center;">
                <div style="font-size: 0.8em; color: #666;">Level</div>
                <div style="font-size: 1.5em; font-weight: bold; color: #764ba2;">{level}</div>
            </div>
            <div style="background: white; padding: 12px; border-radius: 8px; text-align: center;">
                <div style="font-size: 0.8em; color: #666;">Aktueller Streak</div>
                <div style="font-size: 1.5em; font-weight: bold; color: #ff6b6b;">🔥 {streak}</div>
            </div>
            <div style="background: white; padding: 12px; border-radius: 8px; text-align: center;">
                <div style="font-size: 0.8em; color: #666;">Bester Streak</div>
                <div style="font-size: 1.5em; font-weight: bold; color: #feca57;">🏆 {longest_streak}</div>
            </div>
        </div>

        <div style="margin-top: 15px;">
            <div style="font-size: 0.85em; color: #666; margin-bottom: 5px;">
                Fortschritt zu Level {min(level + 1, 8)} {f'({xp_needed:,} XP fehlen)' if xp_needed > 0 else '(Max erreicht!)'}
            </div>
            <div style="background: #e0e0e0; border-radius: 6px; height: 10px;">
                <div style="background: linear-gradient(90deg, #667eea, #764ba2);
                            width: {progress * 100}%; height: 100%; border-radius: 6px;"></div>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)


# ============================================
# ALTERSSTUFEN-WEICHE
# ============================================

# Diese Altersstufen sehen die Schatzkarte (gamifiziert)
# RPG-Elemente funktionieren auch bei aelteren Schuelern gut!
# Paedagogen/Coaches koennen sie auch sehen (zum Testen/Demonstrieren)
SCHATZKARTE_ALTERSSTUFEN = ["grundschule", "unterstufe", "mittelstufe", "oberstufe", "paedagoge", "coach"]

def zeige_schatzkarte() -> bool:
    """
    Prüft ob der aktuelle User die Schatzkarte sehen darf.

    Grundschule und Unterstufe: Schatzkarte (gamifiziert)
    Mittelstufe, Oberstufe, Pädagogen: Klassische Ressourcen-Seite
    """
    age_group = st.session_state.get("current_user_age_group", "grundschule")
    return age_group.lower() in SCHATZKARTE_ALTERSSTUFEN


# ============================================
# PREVIEW-MODUS
# ============================================

PREVIEW_USER_NAME = "Preview"

def is_preview_mode() -> bool:
    """Prüft ob der Preview-Modus aktiv ist."""
    return st.session_state.get("preview_mode", False)


def start_preview_mode(age_group: str = "unterstufe"):
    """Startet den Preview-Modus mit einem temporären User."""
    # Nutze die existierende Funktion um den Preview-User zu erstellen/aktualisieren
    user = get_or_create_user_by_name(PREVIEW_USER_NAME, age_group=age_group)

    # Altersstufe aktualisieren falls nötig
    if user.get("age_group") != age_group:
        update_user_age_group(user["user_id"], age_group)

    # Session State setzen
    st.session_state.preview_mode = True
    st.session_state.current_user_id = user["user_id"]
    st.session_state.current_user_name = PREVIEW_USER_NAME
    st.session_state.current_user_age_group = age_group


def end_preview_mode():
    """Beendet den Preview-Modus."""
    st.session_state.preview_mode = False
    st.session_state.current_user_id = None
    st.session_state.current_user_name = None
    st.session_state.current_user_age_group = None


def reset_preview_data():
    """Setzt alle Preview-User Daten zurück."""
    user_id = st.session_state.get("current_user_id")
    if not user_id:
        return

    db = get_db()
    db.table("users").update({"xp_total": 0, "current_streak": 0, "longest_streak": 0}).eq("user_id", user_id).execute()
    db.table("challenges").delete().eq("user_id", user_id).execute()
    db.table("user_badges").delete().eq("user_id", user_id).execute()


def change_preview_age_group(age_group: str):
    """Ändert die Altersstufe im Preview-Modus."""
    if is_preview_mode():
        user_id = st.session_state.get("current_user_id")
        if user_id:
            update_user_age_group(user_id, age_group)
        st.session_state.current_user_age_group = age_group


def render_preview_banner():
    """Legacy-Funktion - ruft jetzt render_age_switcher_overlay() auf."""
    render_age_switcher_overlay()


def render_age_switcher_overlay():
    """
    Rendert den Altersstufen-Wechsler als schwebendes Overlay.
    Nur sichtbar für: Preview-Modus, Pädagogen, Coaches, Admins.
    Schüler sehen dieses Menü NICHT.
    """
    # Prüfen ob User berechtigt ist
    is_preview = is_preview_mode()
    user_id = st.session_state.get("current_user_id")

    # Rolle prüfen (nur wenn nicht Preview und User eingeloggt)
    user_role = None
    if user_id and not is_preview:
        user_role = get_user_role(user_id)

    # Berechtigte Rollen
    allowed_roles = [ROLE_COACH, ROLE_ADMIN, 'paedagoge', 'pädagoge']

    # Schüler sehen nichts
    if not is_preview and user_role not in allowed_roles:
        return

    current_age = st.session_state.get("current_user_age_group", "grundschule")

    # Mapping für Anzeige
    age_labels = {
        "grundschule": "🎒 GS",
        "unterstufe": "📚 US",
        "mittelstufe": "🎯 MS",
        "oberstufe": "🎓 OS",
        "paedagogen": "👩‍🏫 Päd",
    }
    current_short = age_labels.get(current_age, "📚 US")

    # CSS für kompakte Selectbox (verschiebt sich wenn Sidebar offen)
    st.markdown("""
    <style>
        /* Altersstufen-Selectbox kompakt stylen */
        [data-testid="stSelectbox"] {
            position: fixed !important;
            top: 70px !important;
            left: 70px !important;
            z-index: 99999 !important;
            width: 200px !important;
            transition: left 0.3s ease !important;
        }

        /* Wenn Sidebar offen ist: nach rechts verschieben */
        [data-testid="stSidebar"][aria-expanded="true"] ~ section [data-testid="stSelectbox"],
        body:has([data-testid="stSidebar"][aria-expanded="true"]) [data-testid="stSelectbox"] {
            left: 320px !important;
        }

        [data-testid="stSelectbox"] > div > div {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            border: none !important;
            border-radius: 20px !important;
            padding: 2px 10px !important;
            box-shadow: 0 3px 12px rgba(102, 126, 234, 0.4) !important;
        }

        [data-testid="stSelectbox"] > div > div:hover {
            box-shadow: 0 5px 20px rgba(102, 126, 234, 0.5) !important;
        }

        /* Text weiß */
        [data-testid="stSelectbox"] span {
            color: white !important;
            font-size: 0.9em !important;
        }

        /* Pfeil weiß */
        [data-testid="stSelectbox"] svg {
            color: white !important;
        }
    </style>
    """, unsafe_allow_html=True)

    # Altersstufen-Optionen
    # TEMPORAER: Nur Unterstufe aktiv, Rest deaktiviert
    age_options = {
        "unterstufe": "📚 Unterstufe",
        # "grundschule": "🎒 Grundschule",       # TEMPORAER deaktiviert
        # "mittelstufe": "🎯 Mittelstufe",       # TEMPORAER deaktiviert
        # "oberstufe": "🎓 Oberstufe",           # TEMPORAER deaktiviert
        # "paedagogen": "👩‍🏫 Pädagogen",         # TEMPORAER deaktiviert
    }

    # Selectbox für Altersstufe (schließt automatisch nach Auswahl)
    age_keys = list(age_options.keys())
    current_index = age_keys.index(current_age) if current_age in age_keys else 0

    selected_age = st.selectbox(
        "Auswahl Altersstufe",
        options=age_keys,
        format_func=lambda x: age_options[x],
        index=current_index,
        key="age_switcher_select",
        label_visibility="collapsed"
    )

    # Bei Änderung: Altersstufe wechseln
    if selected_age != current_age:
        change_preview_age_group(selected_age)
        st.rerun()

    # Reset und Beenden nur im Preview-Modus (in Sidebar)
    if is_preview:
        with st.sidebar:
            st.divider()
            st.markdown("**Preview-Optionen:**")
            if st.button("🗑️ Daten zurücksetzen", key="preview_reset", use_container_width=True):
                reset_preview_data()
                st.rerun()
            if st.button("🚪 Preview beenden", key="preview_end", use_container_width=True):
                end_preview_mode()
                st.rerun()


# ============================================
# ROLLEN-SYSTEM
# ============================================

# Rollen-Konstanten
ROLE_STUDENT = 'student'
ROLE_COACH = 'coach'
ROLE_ADMIN = 'admin'


def get_user_role(user_id: str) -> str:
    """Gibt die Rolle eines Users zurueck (mit Session-Cache).

    WICHTIG: Gecacht in session_state um DB-Roundtrips bei jedem Render zu vermeiden.
    Ohne Cache fuehrt ein DB-Timeout dazu, dass ROLE_STUDENT zurueckgegeben wird —
    das aendert den Widget-Tree (Selectbox verschwindet) und zerstoert das React-Iframe.
    """
    # Schneller Pfad: Rolle aus Session-State
    cached_role = st.session_state.get("_cached_user_role")
    cached_for = st.session_state.get("_cached_user_role_id")
    if cached_role and cached_for == user_id:
        return cached_role

    try:
        result = get_db().table("users").select("role").eq("user_id", user_id).execute()
        if result.data and result.data[0].get("role"):
            role = result.data[0]["role"]
        else:
            role = ROLE_STUDENT
    except Exception:
        # DB-Fehler: Falls gecachte Rolle vorhanden, diese verwenden
        if cached_role and cached_for == user_id:
            return cached_role
        return ROLE_STUDENT

    # In Session-State cachen
    st.session_state._cached_user_role = role
    st.session_state._cached_user_role_id = user_id
    return role


def set_user_role(user_id: str, role: str) -> bool:
    """Setzt die Rolle eines Users."""
    if role not in [ROLE_STUDENT, ROLE_COACH, ROLE_ADMIN]:
        return False
    try:
        get_db().table("users").update({"role": role}).eq("user_id", user_id).execute()
        # Cache invalidieren
        st.session_state.pop("_cached_user_role", None)
        st.session_state.pop("_cached_user_role_id", None)
        return True
    except Exception as e:
        print(f"Error setting role: {e}")
        return False


def is_coach(user_id: str = None) -> bool:
    """Prueft ob der User (oder aktuelle User) Coach ist."""
    if user_id is None:
        user_id = st.session_state.get("current_user_id")
    if not user_id:
        return False

    role = get_user_role(user_id)
    return role in [ROLE_COACH, ROLE_ADMIN]


def is_admin(user_id: str = None) -> bool:
    """Prueft ob der User Admin ist."""
    if user_id is None:
        user_id = st.session_state.get("current_user_id")
    if not user_id:
        return False

    return get_user_role(user_id) == ROLE_ADMIN


def get_all_coaches() -> list:
    """Gibt alle Coaches zurueck."""
    result = get_db().table("users") \
        .select("user_id, display_name, last_login") \
        .in_("role", ["coach", "admin"]) \
        .order("display_name") \
        .execute()
    return result.data


def get_all_students_list() -> list:
    """Gibt alle Schueler zurueck (role = student oder NULL)."""
    result = get_db().table("users") \
        .select("user_id, display_name, age_group, level, xp_total, last_login") \
        .or_("role.is.null,role.eq.student") \
        .order("display_name") \
        .execute()
    return result.data


# ============================================
# PASSWORT-RESET (Coach → Schueler)
# ============================================

TEMP_PASSWORD_WORDS = [
    "Stern", "Mond", "Tiger", "Rakete", "Drache",
    "Wolke", "Blitz", "Fuchs", "Adler", "Panda",
    "Sonne", "Feuer", "Ozean", "Ritter", "Pirat",
    "Kompass", "Anker", "Schatz", "Diamant", "Kristall",
    "Falke", "Loewe", "Kobra", "Delfin", "Phoenix",
    "Donner", "Sturm", "Flamme", "Komet", "Planet",
]


def generate_temp_password() -> str:
    """Generiert ein kinderfreundliches temporaeres Passwort (z.B. 'Stern4527')."""
    word = random.choice(TEMP_PASSWORD_WORDS)
    digits = random.randint(1000, 9999)
    return f"{word}{digits}"


def reset_student_password(coach_id: str, student_id: str) -> Optional[str]:
    """
    Setzt das Passwort eines Schuelers zurueck.
    Prueft ob der Schueler in einer Gruppe des Coaches ist.
    Gibt das Klartext-Passwort einmalig zurueck (oder None bei Fehler).
    """
    from utils.lerngruppen_db import get_coach_groups, get_group_members

    # Autorisierung: Schueler muss in einer Gruppe des Coaches sein
    groups = get_coach_groups(coach_id)
    authorized = False
    for group in groups:
        members = get_group_members(group['group_id'])
        if any(m['user_id'] == student_id for m in members):
            authorized = True
            break

    if not authorized:
        return None

    temp_pw = generate_temp_password()
    pw_hash = hash_password(temp_pw)

    update_data = {
        "password_hash": pw_hash,
        "must_change_password": True,
        "temp_password_created_at": datetime.now().isoformat(),
        "password_reset_by": coach_id,
        "temp_password_plain": temp_pw,
    }
    try:
        get_db().table("users").update(update_data).eq("user_id", student_id).execute()
        return temp_pw
    except Exception:
        # Fallback ohne temp_password_plain (Spalte existiert noch nicht)
        update_data.pop("temp_password_plain", None)
        try:
            get_db().table("users").update(update_data).eq("user_id", student_id).execute()
            return temp_pw
        except Exception as e:
            print(f"Error resetting password: {e}")
            return None


def create_student_by_coach(coach_id: str, display_name: str, age_group: str, group_id: str = None) -> Optional[Dict]:
    """
    Erstellt einen neuen Schueler-Account (durch Coach) mit Temp-Passwort.
    Optional direkte Gruppenzuweisung.
    Gibt {"user": user, "temp_password": str, "added_to_group": bool} zurueck oder None bei Fehler.
    """
    from utils.lerngruppen_db import add_member

    if is_name_taken(display_name):
        return None

    temp_pw = generate_temp_password()
    user = get_or_create_user_by_name(display_name, age_group, password=temp_pw)

    if not user:
        return None

    # must_change_password setzen
    update_data = {
        "must_change_password": True,
        "temp_password_created_at": datetime.now().isoformat(),
        "password_reset_by": coach_id,
        "temp_password_plain": temp_pw,
    }
    try:
        get_db().table("users").update(update_data).eq("user_id", user["user_id"]).execute()
    except Exception:
        # Fallback ohne temp_password_plain (Spalte existiert noch nicht)
        update_data.pop("temp_password_plain", None)
        try:
            get_db().table("users").update(update_data).eq("user_id", user["user_id"]).execute()
        except Exception as e:
            print(f"Error setting must_change_password: {e}")

    added_to_group = False
    if group_id:
        try:
            add_member(group_id, user["user_id"])
            added_to_group = True
        except Exception as e:
            print(f"Error adding student to group: {e}")

    return {"user": user, "temp_password": temp_pw, "added_to_group": added_to_group}


def check_must_change_password(user_id: str) -> bool:
    """Prueft ob der User sein Passwort aendern muss. Setzt Flag nach 48h zurueck."""
    try:
        result = get_db().table("users") \
            .select("must_change_password, temp_password_created_at") \
            .eq("user_id", user_id).execute()
    except Exception:
        # Spalten existieren noch nicht (Migration nicht ausgefuehrt)
        return False

    if not result.data:
        return False

    user = result.data[0]
    if not user.get("must_change_password"):
        return False

    # 48h-Ablauf pruefen
    created_at = user.get("temp_password_created_at")
    if created_at:
        try:
            created = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
            now = datetime.now(created.tzinfo) if created.tzinfo else datetime.now()
            if (now - created).total_seconds() > 48 * 3600:
                # Abgelaufen — Flag zuruecksetzen
                expire_data = {
                    "must_change_password": False,
                    "temp_password_created_at": None,
                    "password_reset_by": None,
                    "temp_password_plain": None,
                }
                try:
                    get_db().table("users").update(expire_data).eq("user_id", user_id).execute()
                except Exception:
                    expire_data.pop("temp_password_plain", None)
                    get_db().table("users").update(expire_data).eq("user_id", user_id).execute()
                return False
        except (ValueError, TypeError):
            pass

    return True


def change_password(user_id: str, new_password: str) -> bool:
    """Setzt ein neues Passwort und cleart das must_change_password Flag."""
    update_data = {
        "password_hash": hash_password(new_password),
        "must_change_password": False,
        "temp_password_created_at": None,
        "password_reset_by": None,
        "temp_password_plain": None,
    }
    try:
        get_db().table("users").update(update_data).eq("user_id", user_id).execute()
        # ✅ Cache invalidieren nach Write
        get_user_by_id.clear()
        return True
    except Exception:
        # Fallback ohne temp_password_plain
        update_data.pop("temp_password_plain", None)
        try:
            get_db().table("users").update(update_data).eq("user_id", user_id).execute()
            get_user_by_id.clear()
            return True
        except Exception as e:
            print(f"Error changing password: {e}")
            return False


def render_force_password_change(user_id: str):
    """Rendert das erzwungene Passwortwechsel-Formular."""
    st.markdown("""
    <div style="background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
                color: #333; padding: 25px; border-radius: 15px; margin: 20px 0;
                text-align: center; border: 3px solid #f59e0b;">
        <div style="font-size: 2.5em; margin-bottom: 10px;">🔑</div>
        <h2 style="margin: 0 0 10px 0; color: #92400e;">Neues Passwort wählen</h2>
        <p style="margin: 0; font-size: 1.1em;">
            Dein Coach hat dir ein neues Passwort gegeben.<br>
            Bitte wähle jetzt dein eigenes Passwort!
        </p>
    </div>
    """, unsafe_allow_html=True)

    new_pw = st.text_input(
        "Neues Passwort:",
        type="password",
        placeholder="Mindestens 6 Zeichen",
        key="force_pw_new"
    )
    confirm_pw = st.text_input(
        "Passwort bestätigen:",
        type="password",
        placeholder="Passwort nochmal eingeben",
        key="force_pw_confirm"
    )

    if st.button("✅ Passwort speichern", type="primary", use_container_width=True, key="force_pw_submit"):
        if not new_pw or len(new_pw) < 6:
            st.error("Das Passwort muss mindestens 6 Zeichen lang sein.")
        elif new_pw != confirm_pw:
            st.error("Die Passwörter stimmen nicht überein.")
        else:
            if change_password(user_id, new_pw):
                st.balloons()
                st.success("🎉 Passwort erfolgreich geändert! Du kannst jetzt weiterlernen.")
                st.rerun()
            else:
                st.error("Fehler beim Speichern. Bitte versuche es erneut.")


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
import json

from utils.database import get_db

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
        return True
    except Exception as e:
        print(f"Error updating avatar: {e}")
        return False

def update_user_age_group(user_id: str, age_group: str) -> bool:
    """Aktualisiert die Altersstufe eines Users."""
    try:
        get_db().table("users").update({"age_group": age_group}).eq("user_id", user_id).execute()
        return True
    except Exception as e:
        print(f"Error updating age group: {e}")
        return False

def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Holt einen User anhand der ID."""
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
    st.session_state.current_user_age_group = user.get('age_group', 'grundschule')

    # Admin/Coach-Status für Quick-Login-Liste merken
    user_role = user.get('role', 'student')
    if user_role in ['coach', 'admin', 'paedagoge', 'pädagoge']:
        st.session_state.show_admin_user_list = True

    return user

def logout_user():
    """Loggt den aktuellen Benutzer aus."""
    # Admin-Status NICHT löschen, damit Quick-Login-Liste sichtbar bleibt
    keys_to_delete = ["current_user_id", "current_user_name", "current_user_age_group",
                      "registration_step", "registration_name", "registration_age",
                      "registration_password"]
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

    if is_logged_in():
        user = get_current_user()
        if user:
            if show_info_bar:
                render_logged_in_view(user, show_stats)
        else:
            # User nicht gefunden, ausloggen
            logout_user()
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
        st.caption("Teste alle Funktionen ohne Anmeldung. Altersstufe jederzeit wechselbar.")
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
                # Quick-Login Liste nur für Admins/Coaches sichtbar
                show_user_list = st.session_state.get("show_admin_user_list", False)

                if show_user_list:
                    existing_users = get_all_users()
                    if existing_users:
                        st.markdown("**🔄 Zurückkehrende Schüler:**")
                        for user in existing_users[:5]:
                            display = user.get('display_name', 'Unbekannt')
                            level = user.get('level', 1)

                            if st.button(f"👤 {display} (Lvl {level})", key=f"quick_login_{user['user_id']}",
                                       use_container_width=True):
                                login_user(display)
                                st.rerun()

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

            for age_key, icon, label, desc, col in age_buttons:
                with col:
                    st.markdown(f"""
                    <div style="text-align: center; padding: 10px; background: #f8f9fa;
                                border-radius: 10px; margin-bottom: 10px;">
                        <div style="font-size: 2em;">{icon}</div>
                        <div style="font-weight: bold;">{label}</div>
                        <div style="font-size: 0.8em; color: #666;">{desc}</div>
                    </div>
                    """, unsafe_allow_html=True)

                    if st.button(f"Wählen", key=f"age_{age_key}", use_container_width=True):
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
SCHATZKARTE_ALTERSSTUFEN = ["grundschule", "unterstufe", "mittelstufe", "paedagoge", "coach"]

def zeige_schatzkarte() -> bool:
    """
    Prüft ob der aktuelle User die Schatzkarte sehen darf.

    Grundschule und Unterstufe: Schatzkarte (gamifiziert)
    Mittelstufe, Oberstufe, Pädagogen: Klassische Ressourcen-Seite
    """
    age_group = st.session_state.get("current_user_age_group", "grundschule")
    return age_group in SCHATZKARTE_ALTERSSTUFEN


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
    age_options = {
        "grundschule": "🎒 Grundschule",
        "unterstufe": "📚 Unterstufe",
        "mittelstufe": "🎯 Mittelstufe",
        "oberstufe": "🎓 Oberstufe",
        "paedagogen": "👩‍🏫 Pädagogen",
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
    """Gibt die Rolle eines Users zurueck."""
    result = get_db().table("users").select("role").eq("user_id", user_id).execute()
    if result.data and result.data[0].get("role"):
        return result.data[0]["role"]
    return ROLE_STUDENT


def set_user_role(user_id: str, role: str) -> bool:
    """Setzt die Rolle eines Users."""
    if role not in [ROLE_STUDENT, ROLE_COACH, ROLE_ADMIN]:
        return False
    try:
        get_db().table("users").update({"role": role}).eq("user_id", user_id).execute()
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


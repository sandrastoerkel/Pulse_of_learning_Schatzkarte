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
import sqlite3
from datetime import datetime
from typing import Dict, Optional, Any, List
from pathlib import Path
import hashlib
import json

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

def get_db_path() -> Path:
    """Gibt den Pfad zur SQLite-Datenbank zurück."""
    if Path("/tmp").exists() and Path("/tmp").is_dir():
        db_dir = Path("/tmp")
    else:
        db_dir = Path(__file__).parent.parent / "data"
        db_dir.mkdir(exist_ok=True)
    return db_dir / "hattie_gamification.db"

def init_user_tables():
    """Initialisiert die Benutzer-Tabellen."""
    conn = sqlite3.connect(get_db_path())
    c = conn.cursor()

    # Erweiterte Users-Tabelle (falls noch nicht vorhanden, erweitern)
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            username TEXT DEFAULT 'Lernender',
            display_name TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP,
            xp_total INTEGER DEFAULT 0,
            level INTEGER DEFAULT 1,
            current_streak INTEGER DEFAULT 0,
            longest_streak INTEGER DEFAULT 0,
            last_activity_date DATE,
            settings TEXT DEFAULT '{}',
            age_group TEXT DEFAULT 'unterstufe',
            avatar_settings TEXT DEFAULT '{}'
        )
    ''')

    # Prüfe ob Spalten existieren, wenn nicht hinzufügen
    c.execute("PRAGMA table_info(users)")
    columns = [col[1] for col in c.fetchall()]

    if 'display_name' not in columns:
        c.execute('ALTER TABLE users ADD COLUMN display_name TEXT')

    if 'last_login' not in columns:
        c.execute('ALTER TABLE users ADD COLUMN last_login TIMESTAMP')

    if 'age_group' not in columns:
        c.execute("ALTER TABLE users ADD COLUMN age_group TEXT DEFAULT 'unterstufe'")

    if 'avatar_settings' not in columns:
        c.execute("ALTER TABLE users ADD COLUMN avatar_settings TEXT DEFAULT '{}'")

    conn.commit()
    conn.close()

def get_or_create_user_by_name(display_name: str, age_group: str = None, avatar_style: str = None) -> Dict[str, Any]:
    """Holt oder erstellt einen User basierend auf dem Display-Namen."""
    init_user_tables()
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    # Generiere user_id aus dem Namen (lowercase, keine Sonderzeichen)
    clean_name = display_name.strip().lower()
    user_id = hashlib.md5(clean_name.encode()).hexdigest()[:16]

    # Prüfe ob User existiert
    c.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
    user = c.fetchone()

    now = datetime.now().isoformat()

    if not user:
        # Neuer User - mit Altersstufe und Avatar
        age = age_group or "unterstufe"

        # Default Avatar-Style basierend auf Altersstufe
        if avatar_style:
            style = avatar_style
        else:
            style = AVATAR_STYLES_BY_AGE.get(age, {}).get('styles', ['adventurer'])[0]

        avatar_settings = json.dumps({"style": style, "background": "b6e3f4"})

        c.execute('''
            INSERT INTO users (user_id, username, display_name, created_at, last_login,
                             xp_total, level, age_group, avatar_settings)
            VALUES (?, ?, ?, ?, ?, 0, 1, ?, ?)
        ''', (user_id, clean_name, display_name.strip(), now, now, age, avatar_settings))
        conn.commit()
        c.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
        user = c.fetchone()
    else:
        # Update last_login (und ggf. age_group wenn angegeben)
        if age_group:
            c.execute("UPDATE users SET last_login = ?, display_name = ?, age_group = ? WHERE user_id = ?",
                      (now, display_name.strip(), age_group, user_id))
        else:
            c.execute("UPDATE users SET last_login = ?, display_name = ? WHERE user_id = ?",
                      (now, display_name.strip(), user_id))
        conn.commit()
        c.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
        user = c.fetchone()

    result = dict(user)
    conn.close()
    return result

def update_user_avatar(user_id: str, avatar_settings: Dict) -> bool:
    """Aktualisiert die Avatar-Einstellungen eines Users."""
    conn = sqlite3.connect(get_db_path())
    c = conn.cursor()

    try:
        c.execute("UPDATE users SET avatar_settings = ? WHERE user_id = ?",
                  (json.dumps(avatar_settings), user_id))
        conn.commit()
        success = True
    except Exception as e:
        print(f"Error updating avatar: {e}")
        success = False

    conn.close()
    return success

def update_user_age_group(user_id: str, age_group: str) -> bool:
    """Aktualisiert die Altersstufe eines Users."""
    conn = sqlite3.connect(get_db_path())
    c = conn.cursor()

    try:
        c.execute("UPDATE users SET age_group = ? WHERE user_id = ?",
                  (age_group, user_id))
        conn.commit()
        success = True
    except Exception as e:
        print(f"Error updating age group: {e}")
        success = False

    conn.close()
    return success

def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Holt einen User anhand der ID."""
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    c.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
    user = c.fetchone()

    conn.close()
    return dict(user) if user else None

def get_all_users() -> list:
    """Holt alle registrierten Benutzer."""
    init_user_tables()
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    c.execute('''
        SELECT user_id, display_name, xp_total, level, last_login
        FROM users
        WHERE display_name IS NOT NULL
        ORDER BY last_login DESC
    ''')

    users = [dict(row) for row in c.fetchall()]
    conn.close()
    return users

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

def login_user(display_name: str, age_group: str = None, avatar_style: str = None) -> Dict[str, Any]:
    """Loggt einen Benutzer ein (erstellt ihn falls nötig)."""
    user = get_or_create_user_by_name(display_name, age_group, avatar_style)
    st.session_state.current_user_id = user['user_id']
    st.session_state.current_user_name = user['display_name']
    st.session_state.current_user_age_group = user.get('age_group', 'unterstufe')
    return user

def logout_user():
    """Loggt den aktuellen Benutzer aus."""
    keys_to_delete = ["current_user_id", "current_user_name", "current_user_age_group",
                      "registration_step", "registration_name", "registration_age"]
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
    init_user_tables()

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
    """Rendert das mehrstufige Login-Formular mit Altersstufe und Avatar-Auswahl."""

    # Initialisiere Registration-State
    if "registration_step" not in st.session_state:
        st.session_state.registration_step = 1

    existing_users = get_all_users()

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

    # === SCHRITT 1: Name eingeben ===
    if st.session_state.registration_step == 1:
        col1, col2 = st.columns([2, 1])

        with col1:
            st.markdown("### Schritt 1: Wie heißt du?")

            name_input = st.text_input(
                "Dein Name:",
                placeholder="z.B. Max, Lisa, ...",
                help="Gib deinen Vornamen ein.",
                key="name_input_step1"
            )

            if st.button("➡️ Weiter", use_container_width=True, type="primary"):
                if name_input and len(name_input.strip()) >= 2:
                    st.session_state.registration_name = name_input.strip()
                    st.session_state.registration_step = 2
                    st.rerun()
                else:
                    st.error("Bitte gib mindestens 2 Buchstaben ein.")

        with col2:
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
                    # Direkt einloggen ohne Avatar-Auswahl
                    name = st.session_state.registration_name
                    user = login_user(name, age_key)
                    st.balloons()
                    st.success(f"🎉 Willkommen, {name}!")
                    st.rerun()

        st.markdown("")
        if st.button("⬅️ Zurück", key="back_to_step1"):
            st.session_state.registration_step = 1
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

    conn = sqlite3.connect(get_db_path())
    c = conn.cursor()

    # User-Daten zurücksetzen (nur Spalten die existieren)
    try:
        c.execute("UPDATE users SET xp_total = 0, current_streak = 0, longest_streak = 0 WHERE user_id = ?", (user_id,))
    except sqlite3.OperationalError:
        pass  # Spalten existieren möglicherweise nicht

    # Challenges löschen
    try:
        c.execute("DELETE FROM challenges WHERE user_id = ?", (user_id,))
    except sqlite3.OperationalError:
        pass

    # Badges löschen
    try:
        c.execute("DELETE FROM user_badges WHERE user_id = ?", (user_id,))
    except sqlite3.OperationalError:
        pass

    conn.commit()
    conn.close()


def change_preview_age_group(age_group: str):
    """Ändert die Altersstufe im Preview-Modus."""
    if is_preview_mode():
        user_id = st.session_state.get("current_user_id")
        if user_id:
            update_user_age_group(user_id, age_group)
        st.session_state.current_user_age_group = age_group


def render_preview_banner():
    """Rendert den Preview-Banner mit Altersstufen-Wechsler."""
    if not is_preview_mode():
        return

    current_age = st.session_state.get("current_user_age_group", "unterstufe")

    st.markdown("""
    <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white; padding: 10px 20px; border-radius: 10px; margin-bottom: 15px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <strong>👁️ PREVIEW-MODUS</strong>
                <span style="opacity: 0.9; margin-left: 10px;">Teste alle Funktionen ohne echten Account</span>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    # Altersstufen-Wechsler
    st.markdown("**Altersstufe wechseln:**")
    cols = st.columns([1, 1, 1, 1, 1, 1])

    age_options = [
        ("grundschule", "🎒 Grundschule"),
        ("unterstufe", "📚 Unterstufe"),
        ("mittelstufe", "🎯 Mittelstufe"),
        ("oberstufe", "🎓 Oberstufe"),
    ]

    for idx, (age_key, age_label) in enumerate(age_options):
        with cols[idx]:
            is_selected = current_age == age_key
            btn_type = "primary" if is_selected else "secondary"
            if st.button(age_label, key=f"preview_age_{age_key}", use_container_width=True, type=btn_type):
                change_preview_age_group(age_key)
                st.rerun()

    # Reset und Beenden Buttons
    with cols[4]:
        if st.button("🗑️ Reset", key="preview_reset", use_container_width=True):
            reset_preview_data()
            st.rerun()

    with cols[5]:
        if st.button("🚪 Beenden", key="preview_end", use_container_width=True):
            end_preview_mode()
            st.rerun()

    st.divider()


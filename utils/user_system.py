"""
👤 Benutzer-System für Gamification
===================================

Einfaches Benutzer-System für die Ressourcen-Seite.
Ermöglicht persistente Speicherung aller Gamification-Daten pro Schüler.
Inkl. Altersstufen-Auswahl und Avatar-System (DiceBear).

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

def render_user_login(show_stats: bool = True):
    """
    Rendert die Benutzer-Login-Komponente.

    Args:
        show_stats: Wenn True, zeigt XP und Level an
    """
    init_user_tables()

    if is_logged_in():
        user = get_current_user()
        if user:
            render_logged_in_view(user, show_stats)
        else:
            # User nicht gefunden, ausloggen
            logout_user()
            render_login_form()
    else:
        render_login_form()

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
            Erstelle deinen Account und gestalte deinen Avatar!
        </p>
    </div>
    """, unsafe_allow_html=True)

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
                    st.session_state.registration_age = age_key
                    st.session_state.registration_step = 3
                    st.rerun()

        st.markdown("")
        if st.button("⬅️ Zurück", key="back_to_step1"):
            st.session_state.registration_step = 1
            st.rerun()

    # === SCHRITT 3: Avatar wählen ===
    elif st.session_state.registration_step == 3:
        name = st.session_state.registration_name
        age = st.session_state.registration_age
        age_info = AVATAR_STYLES_BY_AGE.get(age, AVATAR_STYLES_BY_AGE["unterstufe"])

        st.markdown(f"### Schritt 3: Wähle deinen Avatar!")
        st.markdown(f"*{age_info['description']} für {age_info['label']}*")

        styles = age_info['styles']
        cols = st.columns(len(styles))

        for i, style in enumerate(styles):
            with cols[i]:
                # Avatar-Vorschau
                preview_url = f"https://api.dicebear.com/7.x/{style}/svg?seed={name}&backgroundColor=b6e3f4&radius=50"
                st.markdown(f"""
                <div style="text-align: center; padding: 15px; background: #f8f9fa;
                            border-radius: 15px; margin-bottom: 10px;">
                    <img src="{preview_url}" style="width: 100px; height: 100px; border-radius: 50%;">
                </div>
                """, unsafe_allow_html=True)

                if st.button("Wählen", key=f"avatar_{style}", use_container_width=True, type="primary"):
                    # User erstellen und einloggen
                    user = login_user(name, age, style)
                    st.balloons()
                    st.success(f"🎉 Willkommen, {name}! Dein Avatar ist bereit!")
                    st.rerun()

        st.markdown("")
        if st.button("⬅️ Zurück zur Stufen-Auswahl", key="back_to_step2"):
            st.session_state.registration_step = 2
            st.rerun()

def render_logged_in_view(user: Dict, show_stats: bool = True):
    """Rendert die Ansicht für eingeloggte Benutzer mit Avatar."""

    display_name = user.get('display_name', 'Lernender')
    level = user.get('level', 1)
    xp = user.get('xp_total', 0)
    streak = user.get('current_streak', 0)
    age_group = user.get('age_group', 'unterstufe')

    # Avatar URL generieren
    avatar_url = get_avatar_url(user)

    # Level-Info
    level_names = {1: "Anfänger", 2: "Entdecker", 3: "Lernender", 4: "Aufsteiger",
                   5: "Übertreffer", 6: "Meister", 7: "Experte", 8: "Champion"}
    level_name = level_names.get(level, "Anfänger")

    # Altersstufen-Label
    age_label = AVATAR_STYLES_BY_AGE.get(age_group, {}).get('label', '📚 Schüler')

    # Kompakte Header-Leiste mit Avatar
    st.markdown(f"""
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; padding: 12px 20px; border-radius: 12px; margin-bottom: 20px;
                display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <div style="display: flex; align-items: center; gap: 15px;">
            <img src="{avatar_url}" style="width: 60px; height: 60px; border-radius: 50%;
                      border: 3px solid rgba(255,255,255,0.5); background: white;">
            <div>
                <div style="font-size: 1.1em; font-weight: bold;">Hallo, {display_name}!</div>
                <div style="font-size: 0.85em; opacity: 0.9;">Level {level} · {level_name}</div>
                <div style="font-size: 0.75em; opacity: 0.7;">{age_label}</div>
            </div>
        </div>
        <div style="display: flex; gap: 15px; align-items: center;">
            <div style="text-align: center; background: rgba(255,255,255,0.2); padding: 8px 15px; border-radius: 8px;">
                <div style="font-size: 1.3em; font-weight: bold;">{xp:,}</div>
                <div style="font-size: 0.75em; opacity: 0.9;">XP</div>
            </div>
            <div style="text-align: center; background: rgba(255,255,255,0.2); padding: 8px 15px; border-radius: 8px;">
                <div style="font-size: 1.3em; font-weight: bold;">🔥 {streak}</div>
                <div style="font-size: 0.75em; opacity: 0.9;">Streak</div>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    # Buttons: Avatar bearbeiten & Ausloggen
    col1, col2, col3 = st.columns([5, 1, 1])
    with col2:
        if st.button("🎨", help="Avatar anpassen", key="edit_avatar_btn"):
            st.session_state.show_avatar_editor = True
            st.rerun()
    with col3:
        if st.button("🚪", help="Abmelden / Benutzer wechseln", key="logout_btn"):
            logout_user()
            st.rerun()

    # Avatar-Editor Popup
    if st.session_state.get("show_avatar_editor", False):
        render_avatar_editor(user)

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
# AVATAR EDITOR
# ============================================

def render_avatar_editor(user: Dict):
    """Rendert den Avatar-Editor zum Anpassen des Avatars."""

    with st.expander("🎨 Avatar anpassen", expanded=True):
        display_name = user.get('display_name', 'default')
        level = user.get('level', 1)
        age_group = user.get('age_group', 'unterstufe')

        # Aktuelle Avatar-Einstellungen laden
        avatar_settings = user.get('avatar_settings', {})
        if isinstance(avatar_settings, str):
            try:
                avatar_settings = json.loads(avatar_settings)
            except:
                avatar_settings = {}

        current_style = avatar_settings.get('style', 'adventurer')
        current_bg = avatar_settings.get('background', 'b6e3f4')

        col_preview, col_options = st.columns([1, 2])

        with col_preview:
            st.markdown("**Vorschau:**")
            # Aktuelle Vorschau
            preview_style = st.session_state.get('preview_style', current_style)
            preview_bg = st.session_state.get('preview_bg', current_bg)

            if preview_bg == "none":
                bg_param = ""
            elif preview_bg == "gradient":
                bg_param = "&backgroundColor=b6e3f4,c0aede,ffd5dc"
            else:
                bg_param = f"&backgroundColor={preview_bg}"

            preview_url = f"https://api.dicebear.com/7.x/{preview_style}/svg?seed={display_name}{bg_param}&radius=50"

            st.markdown(f"""
            <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 15px;">
                <img src="{preview_url}" style="width: 120px; height: 120px; border-radius: 50%;
                          border: 4px solid #667eea;">
                <div style="margin-top: 10px; font-weight: bold;">{display_name}</div>
            </div>
            """, unsafe_allow_html=True)

        with col_options:
            # Avatar-Stil wählen
            st.markdown("**Avatar-Stil:**")
            age_info = AVATAR_STYLES_BY_AGE.get(age_group, AVATAR_STYLES_BY_AGE["unterstufe"])
            available_styles = age_info['styles']

            style_cols = st.columns(len(available_styles))
            for i, style in enumerate(available_styles):
                with style_cols[i]:
                    mini_url = f"https://api.dicebear.com/7.x/{style}/svg?seed={display_name}&size=50"
                    is_selected = (preview_style == style)
                    border = "3px solid #667eea" if is_selected else "1px solid #ddd"

                    st.markdown(f"""
                    <div style="text-align: center; cursor: pointer;">
                        <img src="{mini_url}" style="width: 50px; height: 50px; border-radius: 50%; border: {border};">
                    </div>
                    """, unsafe_allow_html=True)

                    if st.button("○" if not is_selected else "●", key=f"style_{style}", use_container_width=True):
                        st.session_state.preview_style = style
                        st.rerun()

            # Hintergrundfarbe wählen
            st.markdown("")
            st.markdown("**Hintergrundfarbe:**")

            unlocked_bgs = get_unlocked_options(user, "backgrounds")
            bg_cols = st.columns(4)

            for i, (bg_key, bg_info) in enumerate(AVATAR_UNLOCKABLES["backgrounds"].items()):
                col_idx = i % 4
                is_unlocked = bg_key in unlocked_bgs
                is_selected = (preview_bg == bg_key)

                with bg_cols[col_idx]:
                    if bg_key == "none":
                        color_display = "transparent"
                        style = "background: white; border: 2px dashed #ccc;"
                    elif bg_key == "gradient":
                        style = "background: linear-gradient(135deg, #b6e3f4, #c0aede, #ffd5dc);"
                    else:
                        style = f"background: #{bg_key};"

                    if not is_unlocked:
                        style += " opacity: 0.3;"

                    border_style = "3px solid #667eea" if is_selected else "1px solid #ddd"

                    st.markdown(f"""
                    <div style="text-align: center; margin-bottom: 5px;">
                        <div style="width: 30px; height: 30px; border-radius: 50%; {style}
                                    border: {border_style}; margin: 0 auto;"></div>
                        <div style="font-size: 0.7em; color: {'#666' if is_unlocked else '#ccc'};">
                            {bg_info['name'] if is_unlocked else f"🔒 Lvl {bg_info['unlock_level']}"}
                        </div>
                    </div>
                    """, unsafe_allow_html=True)

                    if is_unlocked:
                        if st.button("○" if not is_selected else "●", key=f"bg_{bg_key}", use_container_width=True):
                            st.session_state.preview_bg = bg_key
                            st.rerun()

        # Speichern & Schließen Buttons
        st.markdown("---")
        col_save, col_cancel = st.columns(2)

        with col_save:
            if st.button("💾 Speichern", use_container_width=True, type="primary"):
                new_settings = {
                    "style": st.session_state.get('preview_style', current_style),
                    "background": st.session_state.get('preview_bg', current_bg)
                }
                update_user_avatar(user['user_id'], new_settings)

                # Session State aufräumen
                st.session_state.show_avatar_editor = False
                if 'preview_style' in st.session_state:
                    del st.session_state.preview_style
                if 'preview_bg' in st.session_state:
                    del st.session_state.preview_bg

                st.success("Avatar gespeichert! ✨")
                st.rerun()

        with col_cancel:
            if st.button("❌ Abbrechen", use_container_width=True):
                st.session_state.show_avatar_editor = False
                if 'preview_style' in st.session_state:
                    del st.session_state.preview_style
                if 'preview_bg' in st.session_state:
                    del st.session_state.preview_bg
                st.rerun()

# -*- coding: utf-8 -*-
"""
RPG Schatzkarte - React Custom Component Version
Die interaktive Lern-Weltkarte im RPG-Stil!
"""
import streamlit as st
from schatzkarte.map_data import ISLANDS
from schatzkarte.map_db import (
    get_collected_treasures,
    get_island_progress,
    get_all_island_progress,
    complete_island_action,
    save_treasure_collected
)
from schatzkarte.map_progress import get_unlocked_islands
from schatzkarte.map_ships import check_and_render_modals, get_ships_css, render_polarstern_ship_html, get_polarstern_data
from utils.gamification_db import get_user_stats, calculate_level
from utils.user_system import (
    is_logged_in,
    get_current_user,
    is_preview_mode,
    render_preview_banner,
    render_user_login,
    zeige_schatzkarte,
    end_preview_mode,
    logout_user,
    is_admin,
    is_coach
)
from utils.page_config import get_page_path
from utils.lerngruppen_db import (
    get_user_group,
    get_meeting_access,
    record_meeting_join,
    record_meeting_leave,
    generate_jaas_jwt
)

# React-Komponente importieren
try:
    from components.rpg_schatzkarte import rpg_schatzkarte
    HAS_REACT_COMPONENT = True
except ImportError:
    HAS_REACT_COMPONENT = False

# ===============================================================
# PAGE CONFIG
# ===============================================================

st.set_page_config(
    page_title="Schatzkarte",
    page_icon="🗺",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# ===============================================================
# USER-AUTHENTIFIZIERUNG
# ===============================================================

# Preview-Modus hat Vorrang (braucht keinen echten Login)
if is_preview_mode():
    user_id = st.session_state.get("current_user_id", "preview_user")
else:
    # Login-Formular anzeigen (wie bei Ressourcen)
    render_user_login(show_info_bar=False)

    # Nur fortfahren wenn eingeloggt
    if not is_logged_in():
        st.stop()

    # Eingeloggter User
    try:
        user = get_current_user()
    except Exception:
        user = None
    if user is None:
        st.error("Fehler beim Laden der Benutzerdaten. Bitte Seite neu laden.")
        st.stop()
    user_id = user["user_id"]

# ===============================================================
# SIDEBAR-NAVIGATION
# ===============================================================

with st.sidebar:
    st.page_link("pages/1_🗺️_Schatzkarte.py", label="🗺️ Schatzkarte", icon="🗺️")
    st.page_link("pages/9_🎒_Meine_Lernreise.py", label="🎒 Meine Lernreise", icon="🎒")

# Button zu Meine Lernreise
if st.button("🎒 Meine Lernreise", type="primary"):
    st.switch_page("pages/9_🎒_Meine_Lernreise.py")

# ===============================================================
# ALTERSSTUFEN-WEICHE
# ===============================================================

# Schatzkarte nur fuer Grundschule und Unterstufe
if not zeige_schatzkarte():
    st.markdown("""
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; padding: 30px; border-radius: 15px; text-align: center; margin: 20px 0;">
        <div style="font-size: 3em; margin-bottom: 15px;">🗺️</div>
        <h2 style="margin: 0 0 10px 0;">Die Schatzkarte ist fuer juengere Schueler gedacht</h2>
        <p style="margin: 0; opacity: 0.9;">
            Fuer Mittelstufe, Oberstufe und Paedagogen haben wir die klassische Ressourcen-Uebersicht.
        </p>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("")
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        st.page_link(
            get_page_path("ressourcen"),
            label="📚 Zu den Ressourcen",
            use_container_width=True
        )
    st.stop()

# ===============================================================
# DATEN LADEN
# ===============================================================

def load_user_data():
    """Laedt alle User-Daten fuer die React-Komponente."""
    stats = get_user_stats(user_id)

    # XP und Level berechnen
    total_xp = stats.get('xp_total', 0)
    current_streak = stats.get('current_streak', 0)
    level_info = calculate_level(total_xp)

    # Gesammelte Schaetze
    collected_treasures = get_collected_treasures(user_id)

    # Fortschritt fuer ALLE Inseln in einer Query laden
    all_progress = get_all_island_progress(user_id)
    user_progress = {}
    for island_id in ISLANDS.keys():
        progress = all_progress.get(island_id)
        if progress:
            user_progress[island_id] = {
                "video_watched": progress.get("video_watched", False),
                "explanation_read": progress.get("explanation_read", False),
                "quiz_passed": progress.get("quiz_passed", False),
                "challenge_completed": progress.get("challenge_completed", False),
                "treasures_collected": [t[1] for t in collected_treasures if t[0] == island_id]
            }

    return {
        "xp": total_xp,
        "streak": current_streak,
        "level": level_info if isinstance(level_info, int) else level_info.get("level", 1),
        "progress": user_progress,
        "collected_treasures": collected_treasures
    }

def convert_islands_for_react():
    """Konvertiert die Insel-Daten ins React-Format."""
    react_islands = []

    for island_id, island in ISLANDS.items():
        week = island.get("week")
        if week is None:
            week = 99  # Flexible Inseln ans Ende

        react_island = {
            "id": island_id,
            "name": island.get("name", island_id),
            "icon": island.get("icon", "🏝️"),
            "color": island.get("color", "#3b82f6"),
            "week": week,
            "treasures": [
                {
                    "name": t.get("name", "Schatz"),
                    "icon": t.get("name", "💎")[:2] if t.get("name") else "💎",
                    "xp": t.get("xp", 50)
                }
                for t in island.get("treasures", [])
            ],
            # Neue Felder fuer Tutorial-Insel
            "type": island.get("type"),
            "tutorial_steps": island.get("tutorial_steps"),
            "has_quiz": island.get("has_quiz", True),
            "has_challenge": island.get("has_challenge", True),
        }
        react_islands.append(react_island)

    # Nach Woche sortieren
    react_islands.sort(key=lambda x: x["week"])
    return react_islands

def create_hero_data(user_data):
    """Erstellt die Hero-Daten fuer React."""
    level = user_data.get("level", 1)
    xp = user_data.get("xp", 0)

    # XP fuer naechstes Level berechnen (vereinfacht)
    xp_for_current = sum([100 * (1.5 ** i) for i in range(level - 1)]) if level > 1 else 0
    xp_for_next = int(100 * (1.5 ** (level - 1)))
    xp_in_level = int(xp - xp_for_current)

    # User-Name aus Session holen
    user = get_current_user()
    user_name = "Lern-Held"
    if user:
        user_name = user.get("name", user.get("username", "Lern-Held"))

    return {
        "name": user_name,
        "avatar": "warrior",  # TODO: Avatar-Auswahl implementieren
        "level": level,
        "xp": max(0, xp_in_level),
        "xp_to_next_level": xp_for_next,
        "gold": user_data.get("xp", 0) // 10,  # Gold = XP / 10
        "items": [],  # TODO: Items-System implementieren
        "titles": []  # TODO: Titel-System implementieren
    }

def load_meeting_data(uid):
    """Laedt Meeting-Daten fuer das Floating Jitsi Widget.
    Sucht als Mitglied UND als Coach nach aktiven Meetings."""
    try:
        from utils.database import get_db

        # Alle relevanten Gruppen-IDs sammeln
        group_ids = []

        # Als Mitglied
        group = get_user_group(uid)
        if group:
            group_ids.append(group["group_id"])

        # Als Coach (alle aktiven Gruppen)
        if is_coach():
            db = get_db()
            coach_groups = db.table("learning_groups") \
                .select("group_id") \
                .eq("coach_id", uid) \
                .eq("is_active", 1) \
                .execute()
            for cg in coach_groups.data:
                if cg["group_id"] not in group_ids:
                    group_ids.append(cg["group_id"])

        if not group_ids:
            return None

        # Beste Meeting-Daten finden (erste Gruppe mit aktivem Meeting)
        best_access = None
        best_group_id = None
        for gid in group_ids:
            access = get_meeting_access(gid, uid, "coach" if is_coach() else "kind")
            if access and access.get("canJoin"):
                best_access = access
                best_group_id = gid
                break
            # Falls kein aktives, nimm das naechste geplante
            if access and access.get("meeting") and not best_access:
                best_access = access
                best_group_id = gid

        if not best_access or not best_access.get("meeting"):
            return None

        user_role = "coach" if is_coach() else "kind"
        access = best_access

        # User-Name fuer Jitsi
        u = get_current_user()
        display_name = "Lern-Held"
        if u:
            display_name = u.get("name", u.get("username", "Lern-Held"))

        meeting = access["meeting"]
        room_name = access.get("roomName")

        # JaaS JWT generieren
        jaas_jwt = None
        jaas_app_id = ""
        try:
            jaas_cfg = st.secrets.get("jaas", {})
            jaas_app_id = jaas_cfg.get("app_id", "")
            if jaas_app_id and room_name:
                jaas_jwt = generate_jaas_jwt(
                    user_name=display_name,
                    user_id=uid,
                    is_moderator=(user_role == "coach"),
                    room=room_name
                )
        except Exception as e:
            print(f"JaaS JWT generation failed: {e}")

        return {
            "canJoin": access.get("canJoin", False),
            "roomName": room_name,
            "config": access.get("config", {}),
            "interfaceConfig": access.get("interfaceConfig", {}),
            "displayName": display_name,
            "meetingId": meeting.get("id"),
            "meetingTitle": meeting.get("title", "Schatzkarten-Treffen"),
            "timeStatus": access.get("timeStatus", {}),
            "userRole": user_role,
            "jwt": jaas_jwt,
            "appId": jaas_app_id
        }
    except Exception as e:
        print(f"Error loading meeting data: {e}")
        return None


# ===============================================================
# HAUPTBEREICH
# ===============================================================

# Altersstufen-Wechsler Overlay (nur fuer berechtigte Rollen sichtbar)
# Die Funktion prueft intern: Preview, Coach, Admin, Paedagoge
render_preview_banner()

# Pruefen ob React-Komponente verfuegbar ist
if not HAS_REACT_COMPONENT:
    st.error("""
    ⚠️ Die React-Komponente konnte nicht geladen werden.

    Bitte sicherstellen, dass:
    1. Die Komponente gebaut wurde: `cd components/rpg_schatzkarte/frontend && npm run build`
    2. Der Build-Ordner existiert: `components/rpg_schatzkarte/frontend/build/`
    """)
    st.stop()

# Daten laden
user_data = load_user_data()
islands = convert_islands_for_react()
hero_data = create_hero_data(user_data)
unlocked_islands = get_unlocked_islands(user_id)

# Demo-Modus: Nur erste 5 Inseln freischalten (für öffentliche Demo)
if is_preview_mode() or user_id == "preview_user":
    # Erste 5 Inseln: start, festung, werkzeuge, bruecken, faeden
    DEMO_ISLANDS = ["start", "festung", "werkzeuge", "bruecken", "faeden"]
    unlocked_islands = [i for i in unlocked_islands if i in DEMO_ISLANDS]
    # Falls weniger freigeschaltet, alle Demo-Inseln freischalten
    if len(unlocked_islands) < len(DEMO_ISLANDS):
        unlocked_islands = DEMO_ISLANDS

# Aktuelle Insel bestimmen: Erste Insel mit unvollstaendigem Fortschritt
current_island = None
if unlocked_islands:
    progress = user_data.get("progress", {})
    for island_id in unlocked_islands:
        p = progress.get(island_id, {})
        # Pruefe ob alle 4 Quests abgeschlossen sind
        all_done = (
            p.get("video_watched", False) and
            p.get("explanation_read", False) and
            p.get("quiz_passed", False) and
            p.get("challenge_completed", False)
        )
        if not all_done:
            current_island = island_id
            break
    # Fallback: Wenn alle fertig, keine Markierung
    # (oder man koennte die letzte zeigen)

# ===============================================================
# REACT SCHATZKARTE RENDERN
# ===============================================================

# CSS fuer Vollbild-Schatzkarte
st.markdown("""
<style>
    /* Streamlit-Container maximieren */
    .stMainBlockContainer {
        padding-top: 0.5rem !important;
        padding-left: 0.5rem !important;
        padding-right: 0.5rem !important;
        padding-bottom: 0 !important;
        max-width: 100% !important;
    }

    /* Header-Bereich minimieren */
    header[data-testid="stHeader"] {
        height: 2.5rem !important;
    }

    /* iframe auf volle Bildschirmhoehe */
    iframe[title="components.rpg_schatzkarte.rpg_schatzkarte"] {
        min-height: calc(100vh - 60px) !important;
        height: calc(100vh - 60px) !important;
        border: none !important;
    }

    /* Popover fuer Altersstufen-Wechsler positionieren */
    [data-testid="stPopover"] {
        position: fixed !important;
        top: 70px !important;
        left: 70px !important;
        z-index: 99998 !important;
    }

    /* Verstecke Streamlit-Footer */
    footer {
        display: none !important;
    }

    /* Block-Container ohne Gaps */
    .block-container {
        padding: 0 !important;
        max-width: 100% !important;
    }

    /* Element-Container ohne extra Spacing */
    .element-container {
        margin: 0 !important;
    }

    """  + """

</style>

""", unsafe_allow_html=True)

# Altersstufe aus Session-State holen
age_group = st.session_state.get("current_user_age_group", "grundschule")

# ===============================================================
# POLARSTERN & MODALS (vor React-Komponente prüfen)
# ===============================================================

# Prüfen ob ein Modal offen ist - wenn ja, nur Modal zeigen
if check_and_render_modals(user_id, age_group):
    st.stop()  # Nur Modal zeigen, Rest nicht rendern

# CSS für pulsierenden Polarstern-Button
st.markdown(get_ships_css(), unsafe_allow_html=True)

# Pulsierender Polarstern-Button oben rechts (als Floating-Element)
polarstern_data = get_polarstern_data(user_id)
active_goals = polarstern_data.get('active', 0)
badge_html = f'<span style="background:#FFD700;color:#1a237e;border-radius:10px;padding:2px 8px;font-size:0.75em;margin-left:5px;">{active_goals}</span>' if active_goals > 0 else ''

st.markdown(f"""
<style>
.polarstern-floating-btn {{
    position: fixed;
    top: 80px;
    right: 20px;
    z-index: 99999;
    background: linear-gradient(135deg, #1a237e 0%, #0d1b3e 100%);
    border: 2px solid #FFD700;
    border-radius: 50px;
    padding: 12px 20px;
    color: white;
    font-weight: bold;
    cursor: pointer;
    animation: polarstern-glow 2s ease-in-out infinite, float 3s ease-in-out infinite;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
}}
.polarstern-floating-btn:hover {{
    transform: scale(1.05);
}}
.polarstern-star {{
    font-size: 1.5em;
    animation: star-twinkle 2s ease-in-out infinite;
}}
</style>
""", unsafe_allow_html=True)

# React-Komponente aufrufen (Hoehe wird per CSS auf 100vh gesetzt)
# Der Polarstern ist jetzt direkt auf der Karte (in der React-Komponente)
# Auto-Open Island: Wird gesetzt wenn User z.B. vom Base Camp zum Polarstern ging und zurückkehrt
auto_open_island = st.session_state.get("auto_open_island")
auto_open_phase = st.session_state.get("auto_open_phase")

# Admin-Status sicher ermitteln
try:
    admin_status = is_admin()
except Exception:
    admin_status = False

try:
    preview_mode = is_preview_mode()
    logged_in = is_logged_in()
except Exception:
    preview_mode = False
    logged_in = False

# Meeting-Daten laden (fuer Floating Jitsi Widget)
meeting_data = None
if not is_preview_mode():
    meeting_data = load_meeting_data(user_id)

result = rpg_schatzkarte(
    islands=islands,
    user_progress=user_data.get("progress", {}),
    hero_data=hero_data,
    unlocked_islands=unlocked_islands,
    current_island=current_island,
    age_group=age_group,
    is_admin=bool(admin_status),  # Admin-TestPanel nur für Admins
    is_preview_mode=bool(preview_mode),  # Für Header-Buttons
    is_logged_in=bool(logged_in and not preview_mode),  # Eingeloggt aber nicht Preview
    auto_open_island=auto_open_island,  # Automatisch eine Insel öffnen (z.B. nach Polarstern)
    auto_open_phase=auto_open_phase,  # Phase für die Insel (z.B. 'ready' für Base Camp)
    meeting_data=meeting_data,  # Floating Jitsi Widget
    height=900,  # Basis-Hoehe, wird per CSS auf calc(100vh - 60px) ueberschrieben
    key="rpg_schatzkarte"
)

# ===============================================================
# AKTIONEN VERARBEITEN (mit Duplikat-Schutz)
# ===============================================================

if result:
    action = result.get("action")
    island_id = result.get("islandId")

    # Polarstern-Klick SOFORT verarbeiten (kein Duplikat-Schutz nötig)
    if action == "polarstern_clicked":
        st.session_state.show_polarstern_modal = True
        # Merken woher der User kam (z.B. Base Camp), um dorthin zurückzukehren
        source_island = result.get("sourceIsland")
        if source_island:
            st.session_state.polarstern_source_island = source_island
        st.rerun()

    # Header-Button: Login anzeigen
    if action == "show_login":
        # Preview-Modus beenden und zur Login-Seite
        end_preview_mode()
        st.rerun()

    # Header-Button: Logout
    if action == "logout":
        logout_user()
        st.rerun()

    # Header-Button: Zurück zur Landing Page
    if action == "go_to_landing":
        # Preview beenden falls aktiv
        if is_preview_mode():
            end_preview_mode()
        st.switch_page("Home.py")

    # Meeting Join/Leave Tracking
    if action == "meeting_join":
        mid = result.get("meetingId")
        if mid and meeting_data:
            record_meeting_join(mid, user_id, meeting_data.get("displayName", ""), meeting_data.get("userRole", "kind"))

    if action == "meeting_leave":
        mid = result.get("meetingId")
        if mid:
            record_meeting_leave(mid, user_id)

    # Auto-Open wurde verarbeitet - Session State zurücksetzen
    if action == "auto_open_handled":
        st.session_state.auto_open_island = None
        # Kein rerun nötig, React hat die Insel bereits geöffnet

    # Duplikat-Schutz: gleiche Aktion nicht doppelt verarbeiten
    action_key = f"{action}_{island_id}_{result.get('questType', '')}_{result.get('treasureId', '')}"
    last_action = st.session_state.get("last_schatzkarte_action", "")

    if action_key != last_action:
        st.session_state["last_schatzkarte_action"] = action_key

        if action == "quest_completed":
            quest_type = result.get("questType")

            # Fortschritt speichern
            progress_key = {
                "wisdom": "video_watched",
                "scroll": "explanation_read",
                "battle": "quiz_passed",
                "challenge": "challenge_completed"
            }.get(quest_type)

            if progress_key and island_id:
                # complete_island_action vergibt automatisch XP
                earned = complete_island_action(user_id, island_id, progress_key)
                if earned > 0:
                    st.toast(f"✅ Quest abgeschlossen! +{earned} XP", icon="⭐")

        elif action == "treasure_collected":
            treasure_id = result.get("treasureId")
            xp_earned = result.get("xpEarned", 0)

            if island_id and treasure_id:
                # save_treasure_collected vergibt automatisch XP
                was_new = save_treasure_collected(user_id, island_id, treasure_id, xp_earned)
                if was_new:
                    st.balloons()
                    st.toast(f"💎 Schatz gesammelt! +{xp_earned} XP", icon="🎉")

# ===============================================================
# SIDEBAR (optional - fuer Entwickler)
# ===============================================================

with st.sidebar:
    if is_preview_mode():
        with st.expander("🔧 Entwickler-Optionen", expanded=False):
            st.write(f"**User ID:** {user_id}")
            st.write(f"**Level:** {hero_data['level']}")
            st.write(f"**XP:** {user_data['xp']}")
            st.write(f"**Freigeschaltet:** {len(unlocked_islands)} Inseln")

            col1, col2 = st.columns(2)
            with col1:
                if st.button("🔄 Neu laden"):
                    st.rerun()
            with col2:
                if st.button("🗑️ Reset", type="secondary"):
                    # Fortschritt aus Datenbank loeschen
                    from utils.database import get_db
                    _db = get_db()
                    _db.table("island_progress").delete().eq("user_id", user_id).execute()
                    _db.table("user_treasures").delete().eq("user_id", user_id).execute()
                    # Session-State zuruecksetzen
                    st.session_state["last_schatzkarte_action"] = ""
                    st.toast("🗑️ Fortschritt zurückgesetzt!", icon="✅")
                    st.rerun()

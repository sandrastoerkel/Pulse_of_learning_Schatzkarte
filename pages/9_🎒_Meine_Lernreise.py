# -*- coding: utf-8 -*-
"""
🎒 Meine Lernreise - Kind-Interface
=====================================
Startseite fuer Kinder in einer Lerngruppe.

Features:
- Einladungslink annehmen
- Gruppen-Info: Name, Startdatum, aktuelle Woche
- Treffen-Zeiten mit naechstem Termin
- Buttons: Schatzkarte, Video-Treffen (ausgegraut wenn kein Meeting)
- Ablauf-Ueberblick (12 Wochen)
"""

import streamlit as st
from datetime import datetime

try:
    from utils.user_system import (
        is_logged_in, get_current_user, get_current_user_id,
        render_user_login, try_auto_login
    )
    from utils.lerngruppen_db import (
        get_group, get_user_group,
        get_invitation, use_invitation,
        get_next_meeting, get_group_meetings,
        get_group_week, get_meeting_access,
        send_welcome_email,
    )
except ImportError as e:
    st.error(f"Import-Fehler: {e}")
    st.stop()


# ============================================
# KONFIGURATION
# ============================================

st.set_page_config(
    page_title="🎒 Meine Lernreise",
    page_icon="🎒",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ============================================
# SIDEBAR-NAVIGATION
# ============================================

with st.sidebar:
    st.page_link("pages/1_🗺️_Schatzkarte.py", label="🗺️ Schatzkarte", icon="🗺️")
    st.page_link("pages/9_🎒_Meine_Lernreise.py", label="🎒 Meine Lernreise", icon="🎒")


DAYS_OF_WEEK = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"]

# Feste Wochen-Struktur der 12-woechigen Lernreise
WOCHEN_ABLAUF = [
    (1, "Festung der Staerke", "Entdecke deine Staerken und Superkraefte"),
    (2, "Insel der 7 Werkzeuge", "Lerne 7 Lernstrategien kennen"),
    (3, "Insel der Bruecken", "Baue Bruecken zwischen Themen"),
    (4, "Insel der Faeden", "Verbinde alles miteinander"),
    (5, "Flexible Insel", "Euer Coach waehlt eine passende Insel"),
    (6, "Flexible Insel", "Euer Coach waehlt eine passende Insel"),
    (7, "Flexible Insel", "Euer Coach waehlt eine passende Insel"),
    (8, "Flexible Insel", "Euer Coach waehlt eine passende Insel"),
    (9, "Flexible Insel", "Euer Coach waehlt eine passende Insel"),
    (10, "Flexible Insel", "Euer Coach waehlt eine passende Insel"),
    (11, "Flexible Insel", "Euer Coach waehlt eine passende Insel"),
    (12, "Abschluss-Feier", "Feiert eure Lernreise!"),
]


# ============================================
# EINLADUNGS-HANDLING
# ============================================

def handle_invitation_from_url():
    """Verarbeitet ?invite=TOKEN aus der URL."""
    if st.session_state.get("welcome_group_id"):
        _render_welcome_page(st.session_state["welcome_group_id"])
        return True

    query_params = st.query_params
    invite_token = query_params.get("invite")

    if not invite_token:
        return False

    st.markdown("## Einladung zur Lerngruppe")

    invitation = get_invitation(invite_token)
    if not invitation:
        st.error("Ungueltiger oder abgelaufener Einladungslink.")
        return True

    st.markdown(f"""
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; padding: 20px; border-radius: 15px; text-align: center;">
        <h2>Du wurdest eingeladen!</h2>
        <h3>Gruppe: {invitation['group_name']}</h3>
    </div>
    """, unsafe_allow_html=True)

    if not is_logged_in():
        st.warning("Bitte melde dich zuerst an, um der Gruppe beizutreten.")
        render_user_login()
        return True

    user_id = get_current_user_id()

    if st.button("Gruppe beitreten", type="primary", use_container_width=True):
        result = use_invitation(invite_token, user_id)
        if result['success']:
            _send_welcome_after_join(invitation)
            st.session_state["welcome_group_id"] = result["group_id"]
            st.query_params.clear()
            st.rerun()
        else:
            st.error(result['message'])

    return True


def _send_welcome_after_join(invitation: dict):
    """Sendet Willkommens-Email nach erfolgreichem Beitritt."""
    email = invitation.get("email")
    if not email:
        return

    group_id = invitation["group_id"]
    group_name = invitation.get("group_name", "Lerngruppe")

    user = get_current_user()
    child_name = user.get("display_name", "Lerner")

    group = get_group(group_id)
    start_date = _format_start_date(group)
    meeting_info = _build_meeting_info_text(group_id)

    app_url = st.secrets.get("APP_URL", "https://learnerspulse.streamlit.app")
    schatzkarte_url = f"{app_url}/Schatzkarte"

    send_welcome_email(email, child_name, group_name, start_date, meeting_info, schatzkarte_url)


def _render_welcome_page(group_id: str):
    """Zeigt die Willkommens-Seite nach erfolgreichem Gruppenbeitritt."""
    group = get_group(group_id)
    if not group:
        st.session_state.pop("welcome_group_id", None)
        return

    user = get_current_user()
    child_name = user.get("display_name", "Lerner") if user else "Lerner"

    st.markdown(f"""
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; padding: 25px; border-radius: 15px; text-align: center;
                margin-bottom: 20px;">
        <h1 style="margin: 0;">Willkommen, {child_name}!</h1>
        <h3 style="margin: 10px 0 0 0; opacity: 0.9;">Lerngruppe: {group['name']}</h3>
    </div>
    """, unsafe_allow_html=True)

    st.balloons()
    _render_group_info(group)
    _render_ablauf_ueberblick(0)

    st.markdown("")
    col_a, col_b = st.columns(2)
    with col_a:
        if st.button("Zur Schatzkarte", type="primary", use_container_width=True):
            st.session_state.pop("welcome_group_id", None)
            st.switch_page("pages/1_🗺️_Schatzkarte.py")
    with col_b:
        if st.button("Alles klar!", use_container_width=True):
            st.session_state.pop("welcome_group_id", None)
            st.rerun()


# ============================================
# HAUPT-SEITE (Kind ist bereits in Gruppe)
# ============================================

def main():
    try_auto_login()

    if not is_logged_in():
        st.warning("Bitte melde dich an.")
        render_user_login()
        return

    user = get_current_user()
    user_id = get_current_user_id()

    group = get_user_group(user_id)
    if not group:
        st.info("Du bist noch keiner Lerngruppe beigetreten.")
        st.caption("Hast du einen Einladungslink? Klicke ihn einfach an!")
        return

    group_id = group["group_id"]
    current_week = get_group_week(group_id)

    # Header
    child_name = user.get("display_name", "Lerner") if user else "Lerner"
    st.markdown(f"""
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; padding: 20px; border-radius: 15px; text-align: center;
                margin-bottom: 20px;">
        <h2 style="margin: 0;">Hallo, {child_name}!</h2>
        <h3 style="margin: 8px 0 0 0; opacity: 0.9;">{group['name']}</h3>
        <p style="margin: 8px 0 0 0; opacity: 0.8;">Woche {current_week} von 12</p>
    </div>
    """, unsafe_allow_html=True)

    # Fortschrittsbalken
    st.progress(min(current_week / 12, 1.0), text=f"Woche {current_week} von 12")

    # Infos + Treffen
    _render_group_info(group)

    # Naechstes Treffen Countdown
    st.markdown("")
    _render_next_meeting_countdown(group_id)

    # Buttons: Schatzkarte + Video-Treffen
    st.markdown("")
    st.markdown("---")
    _render_action_buttons(group_id, user_id)

    # Ablauf-Ueberblick
    st.markdown("")
    _render_ablauf_ueberblick(current_week)


# ============================================
# WIEDERVERWENDBARE KOMPONENTEN
# ============================================

def _format_start_date(group: dict) -> str:
    """Formatiert das Startdatum als dd.mm.yyyy oder None."""
    if not group or not group.get("start_date"):
        return None
    try:
        dt = datetime.strptime(group["start_date"], "%Y-%m-%d")
        return dt.strftime("%d.%m.%Y")
    except ValueError:
        return group["start_date"]


def _build_meeting_info_text(group_id: str) -> str:
    """Baut Meeting-Info-Text fuer Email."""
    meetings = get_group_meetings(group_id)
    if not meetings:
        return ""
    seen = set()
    lines = []
    for m in meetings:
        key = (m["day_of_week"], m["time_of_day"])
        if key not in seen:
            seen.add(key)
            day_name = DAYS_OF_WEEK[m["day_of_week"]]
            lines.append(f"{day_name} um {m['time_of_day']} Uhr ({m['duration_minutes']} Min.)")
    return " + ".join(lines)


def _build_meeting_html(group_id: str) -> str:
    """Baut Meeting-Info als HTML fuer die Anzeige."""
    meetings = get_group_meetings(group_id)
    if not meetings:
        return "Wird noch vom Coach geplant"
    seen = set()
    lines = []
    for m in meetings:
        key = (m["day_of_week"], m["time_of_day"])
        if key not in seen:
            seen.add(key)
            day_name = DAYS_OF_WEEK[m["day_of_week"]]
            lines.append(f"<strong>{day_name}</strong> um <strong>{m['time_of_day']} Uhr</strong> ({m['duration_minutes']} Min.)")
    return "<br>".join(lines)


def _render_group_info(group: dict):
    """Zeigt Startdatum, Treffen, Anleitung."""
    group_id = group["group_id"]
    start_date_str = _format_start_date(group) or "Wird noch bekannt gegeben"
    meeting_html = _build_meeting_html(group_id)

    col1, col2 = st.columns(2)

    with col1:
        st.markdown(f"""
        <div style="background: #f0f9ff; border: 2px solid #38bdf8; border-radius: 12px;
                    padding: 20px; height: 100%;">
            <h4 style="color: #0369a1; margin: 0 0 10px 0;">Deine Lernreise</h4>
            <p><strong>Start:</strong> {start_date_str}</p>
            <p><strong>Dauer:</strong> 12 Wochen</p>
        </div>
        """, unsafe_allow_html=True)

    with col2:
        st.markdown(f"""
        <div style="background: #f0fdf4; border: 2px solid #4ade80; border-radius: 12px;
                    padding: 20px; height: 100%;">
            <h4 style="color: #166534; margin: 0 0 10px 0;">Eure Treffen</h4>
            <p>{meeting_html}</p>
        </div>
        """, unsafe_allow_html=True)

    # Anleitung
    st.markdown("")
    st.markdown("""
    <div style="background: #fefce8; border: 2px solid #facc15; border-radius: 12px;
                padding: 20px; margin-top: 10px;">
        <h4 style="color: #854d0e; margin: 0 0 10px 0;">So funktioniert's</h4>
        <p><strong>1.</strong> Oeffne die <strong>Schatzkarte</strong> — dort lernst du mit Inseln und Abenteuern</p>
        <p><strong>2.</strong> Beim Treffen oeffnest du den <strong>Video-Chat</strong> — dort triffst du deinen Coach und die anderen Kinder</p>
        <p style="margin-top: 12px; padding: 10px; background: white; border-radius: 8px;">
            <strong>Tipp:</strong> Oeffne beides in eigenen Browser-Tabs, damit du die Schatzkarte
            UND den Video-Chat gleichzeitig nutzen kannst!
        </p>
    </div>
    """, unsafe_allow_html=True)


def _render_next_meeting_countdown(group_id: str):
    """Zeigt Countdown zum naechsten Treffen."""
    next_meeting = get_next_meeting(group_id)
    if not next_meeting:
        return

    day_name = DAYS_OF_WEEK[next_meeting["day_of_week"]]
    time_str = next_meeting["time_of_day"]

    try:
        start = datetime.fromisoformat(next_meeting["scheduled_start"])
        if start.tzinfo:
            now = datetime.now(start.tzinfo)
        else:
            now = datetime.now()
        delta = start - now
        days = delta.days
        if days < 0:
            countdown = "Jetzt!"
            color = "#16a34a"
        elif days == 0:
            countdown = "Heute!"
            color = "#16a34a"
        elif days == 1:
            countdown = "Morgen!"
            color = "#2563eb"
        else:
            countdown = f"In {days} Tagen"
            color = "#7c3aed"
    except Exception:
        countdown = ""
        color = "#7c3aed"

    st.markdown(f"""
    <div style="background: linear-gradient(135deg, {color}15, {color}25);
                border: 2px solid {color}; border-radius: 12px;
                padding: 20px; text-align: center;">
        <h4 style="color: {color}; margin: 0;">Naechstes Treffen</h4>
        <p style="font-size: 1.3em; font-weight: bold; margin: 8px 0;">
            {day_name}, {time_str} Uhr
        </p>
        {"<p style='font-size: 1.1em; color: " + color + "; margin: 0;'>" + countdown + "</p>" if countdown else ""}
    </div>
    """, unsafe_allow_html=True)


def _build_jitsi_url(room_name: str) -> str:
    """Baut die Jitsi-URL mit kindgerechter Config via URL-Fragment."""
    config = (
        "#config.startWithAudioMuted=true"
        "&config.startWithVideoMuted=false"
        "&config.prejoinPageEnabled=true"
        "&config.disableDeepLinking=true"
        "&config.defaultLanguage=%22de%22"
        "&interfaceConfig.SHOW_JITSI_WATERMARK=false"
        "&interfaceConfig.SHOW_BRAND_WATERMARK=false"
        "&interfaceConfig.SHOW_POWERED_BY=false"
        "&interfaceConfig.MOBILE_APP_PROMO=false"
        "&interfaceConfig.TOOLBAR_ALWAYS_VISIBLE=true"
    )
    return f"https://meet.jit.si/{room_name}{config}"


def _render_action_buttons(group_id: str, user_id: str):
    """Schatzkarte-Button (immer aktiv) + Video-Treffen-Button (neuer Tab / ausgegraut)."""
    access = get_meeting_access(group_id, user_id, 'kind')
    meeting_active = access.get("canJoin", False)
    room_name = access.get("roomName")

    col_a, col_b = st.columns(2)

    with col_a:
        if st.button("Zur Schatzkarte", type="primary", use_container_width=True):
            st.switch_page("pages/1_🗺️_Schatzkarte.py")

    with col_b:
        if meeting_active and room_name:
            jitsi_url = _build_jitsi_url(room_name)
            # Goldener Button als Link — oeffnet Jitsi in neuem Tab
            st.markdown(f"""
            <a href="{jitsi_url}" target="_blank" rel="noopener noreferrer"
               style="display: block; text-align: center; padding: 14px 20px;
                      background: linear-gradient(135deg, #FFD700, #FFA500);
                      color: #1a1a2e; font-size: 18px; font-weight: bold;
                      border-radius: 12px; text-decoration: none;
                      box-shadow: 0 4px 15px rgba(255, 165, 0, 0.4);
                      transition: transform 0.2s, box-shadow 0.2s;">
                Video-Treffen beitreten
            </a>
            <p style="text-align: center; font-size: 0.85em; color: #6b7280; margin-top: 8px;">
                Oeffnet sich in einem neuen Tab.<br>
                Du kannst zwischen den Tabs hin- und herwechseln!
            </p>
            <style>
            @keyframes glow {{
                0%, 100% {{ box-shadow: 0 4px 15px rgba(255, 165, 0, 0.4); }}
                50% {{ box-shadow: 0 4px 25px rgba(255, 165, 0, 0.7); }}
            }}
            </style>
            """, unsafe_allow_html=True)
        else:
            # Kein Meeting — Button ausgegraut
            st.markdown("""
            <div style="display: block; text-align: center; padding: 14px 20px;
                        background: #e5e7eb; color: #9ca3af; font-size: 18px;
                        font-weight: bold; border-radius: 12px; cursor: not-allowed;">
                Video-Treffen beitreten
            </div>
            """, unsafe_allow_html=True)
            reason = access.get("timeStatus", {}).get("reason", "")
            if reason == "too_early":
                minutes = access["timeStatus"].get("minutesUntilStart", "?")
                st.caption(f"Noch {minutes} Minuten bis zum Treffen")
            else:
                st.caption("Kein Treffen gerade aktiv")


def _render_ablauf_ueberblick(current_week: int):
    """Zeigt den 12-Wochen-Ablauf der Lernreise."""
    with st.expander("Ablauf: Deine 12-Wochen-Lernreise", expanded=False):
        for week_num, name, description in WOCHEN_ABLAUF:
            if week_num < current_week:
                icon = "&#9989;"  # check mark
                opacity = "0.6"
                border = "#d1d5db"
                bg = "#f9fafb"
            elif week_num == current_week:
                icon = "&#9758;"  # pointing right
                opacity = "1"
                border = "#667eea"
                bg = "#eef2ff"
            else:
                icon = "&#9898;"  # white circle
                opacity = "0.5"
                border = "#e5e7eb"
                bg = "white"

            st.markdown(f"""
            <div style="display: flex; align-items: center; padding: 8px 12px;
                        margin: 3px 0; border-left: 3px solid {border};
                        background: {bg}; border-radius: 0 8px 8px 0;
                        opacity: {opacity};">
                <span style="font-size: 1.1em; margin-right: 10px;">{icon}</span>
                <span><strong>Woche {week_num}:</strong> {name}</span>
                <span style="color: #6b7280; margin-left: 10px; font-size: 0.9em;">— {description}</span>
            </div>
            """, unsafe_allow_html=True)


# ============================================
# ENTRY POINT
# ============================================

if __name__ == "__main__":
    if not handle_invitation_from_url():
        main()

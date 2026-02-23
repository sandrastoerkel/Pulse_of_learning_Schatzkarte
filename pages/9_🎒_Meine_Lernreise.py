# -*- coding: utf-8 -*-
"""
🎒 Meine Lernreise - Kind-Interface
=====================================
Startseite fuer Kinder in einer Lerngruppe.

Features:
- Einladungslink annehmen
- Gruppen-Info: Name, Startdatum, aktuelle Woche
- Treffen-Zeiten mit naechstem Termin
- Buttons: Schatzkarte, Video-Treffen
- Ablauf-Ueberblick (12 Wochen)
"""

import streamlit as st
from datetime import datetime, timedelta

try:
    from utils.user_system import (
        is_logged_in, get_current_user, get_current_user_id,
        render_user_login, get_user_by_id, try_auto_login
    )
    from utils.lerngruppen_db import (
        get_group, get_user_group,
        get_invitation, use_invitation,
        get_next_meeting, get_group_meetings,
        get_group_timezone, get_group_week,
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
    initial_sidebar_state="collapsed"
)

DAYS_OF_WEEK = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"]


# ============================================
# EINLADUNGS-HANDLING
# ============================================

def handle_invitation_from_url():
    """Verarbeitet ?invite=TOKEN aus der URL."""
    # Willkommens-Seite anzeigen wenn Kind gerade beigetreten ist
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
            _send_welcome_after_join(invitation, user_id)
            st.session_state["welcome_group_id"] = result["group_id"]
            st.query_params.clear()
            st.rerun()
        else:
            st.error(result['message'])

    return True


def _send_welcome_after_join(invitation: dict, user_id: str):
    """Sendet Willkommens-Email nach erfolgreichem Beitritt."""
    email = invitation.get("email")
    if not email:
        return

    group_id = invitation["group_id"]
    group_name = invitation.get("group_name", "Lerngruppe")

    user = get_current_user()
    child_name = user.get("display_name", "Lerner")

    group = get_group(group_id)
    start_date = None
    if group and group.get("start_date"):
        try:
            dt = datetime.strptime(group["start_date"], "%Y-%m-%d")
            start_date = dt.strftime("%d.%m.%Y")
        except ValueError:
            start_date = group["start_date"]

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

    group_name = group["name"]
    user = get_current_user()
    child_name = user.get("display_name", "Lerner") if user else "Lerner"

    st.markdown(f"""
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; padding: 25px; border-radius: 15px; text-align: center;
                margin-bottom: 20px;">
        <h1 style="margin: 0;">Willkommen, {child_name}!</h1>
        <h3 style="margin: 10px 0 0 0; opacity: 0.9;">Lerngruppe: {group_name}</h3>
    </div>
    """, unsafe_allow_html=True)

    st.balloons()
    _render_group_info(group)

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
    child_name = user.get("display_name", "Lerner") if user else "Lerner"

    group = get_user_group(user_id)
    if not group:
        st.info("Du bist noch keiner Lerngruppe beigetreten.")
        st.caption("Hast du einen Einladungslink? Klicke ihn einfach an!")
        return

    group_id = group["group_id"]
    group_name = group["name"]
    current_week = get_group_week(group_id)

    # Header
    st.markdown(f"""
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; padding: 20px; border-radius: 15px; text-align: center;
                margin-bottom: 20px;">
        <h2 style="margin: 0;">Meine Lernreise</h2>
        <h3 style="margin: 8px 0 0 0; opacity: 0.9;">{group_name}</h3>
        <p style="margin: 8px 0 0 0; opacity: 0.8;">Woche {current_week} von 12</p>
    </div>
    """, unsafe_allow_html=True)

    # Fortschrittsbalken
    st.progress(current_week / 12, text=f"Woche {current_week} von 12")

    # Infos + Treffen
    _render_group_info(group)

    # Naechstes Treffen Countdown
    st.markdown("")
    _render_next_meeting_countdown(group_id)

    # Buttons
    st.markdown("")
    st.markdown("---")
    col_a, col_b = st.columns(2)
    with col_a:
        if st.button("Zur Schatzkarte", type="primary", use_container_width=True):
            st.switch_page("pages/1_🗺️_Schatzkarte.py")
    with col_b:
        if st.button("Zum Video-Treffen", use_container_width=True):
            st.switch_page("pages/7_👥_Lerngruppen.py")


# ============================================
# WIEDERVERWENDBARE KOMPONENTEN
# ============================================

def _build_meeting_info_text(group_id: str) -> str:
    """Baut Meeting-Info-Text fuer Email und Anzeige."""
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

    # Startdatum
    start_date_str = "Wird noch bekannt gegeben"
    if group.get("start_date"):
        try:
            dt = datetime.strptime(group["start_date"], "%Y-%m-%d")
            start_date_str = dt.strftime("%d.%m.%Y")
        except ValueError:
            start_date_str = group["start_date"]

    meeting_html = _build_meeting_html(group_id)

    # Info-Karten
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

    # Tage bis zum naechsten Treffen berechnen
    try:
        start = datetime.fromisoformat(next_meeting["scheduled_start"])
        if start.tzinfo:
            now = datetime.now(start.tzinfo)
        else:
            now = datetime.now()
        delta = start - now
        days = delta.days
        if days == 0:
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


# ============================================
# ENTRY POINT
# ============================================

if __name__ == "__main__":
    if not handle_invitation_from_url():
        main()

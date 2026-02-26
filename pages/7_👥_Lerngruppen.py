# -*- coding: utf-8 -*-
"""
👥 Lerngruppen - Coach-Interface
=================================
Streamlit-Seite für Coaches zur Verwaltung von Lerngruppen.

Features:
- Gruppen erstellen, bearbeiten, löschen
- Kinder per Einladungslink einladen
- Wöchentliche Insel-Auswahl (Wochen 5-11)
- Gruppen-Fortschritt (XP, Level, Streak)
- Video-Treffen mit eingebettetem Jitsi Meet
- Zeitzonen-Support (Coach Malaysia ↔ Kinder DACH)
"""

import json
import streamlit as st
import streamlit.components.v1 as components
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

# Lokale Imports
try:
    from utils.user_system import (
        is_logged_in, get_current_user, get_current_user_id,
        render_user_login, get_user_by_id, is_coach, try_auto_login
    )
    from utils.lerngruppen_db import (
        create_group, get_group, get_coach_groups, update_group, delete_group,
        add_member, remove_member, get_group_members, get_user_group,
        create_invitation, get_invitation_url, get_group_invitations,
        delete_invitation, send_invitation_email,
        activate_weekly_island, get_activated_islands, get_available_islands,
        get_current_island, get_group_week, get_group_progress,
        FLEXIBLE_ISLANDS,
        # Zeitzonen
        get_group_timezone, set_group_timezone, convert_meeting_time_display,
        # Meetings
        schedule_meeting, get_next_meeting, get_group_meetings,
        get_meeting_access, cancel_meeting, record_meeting_join, record_meeting_leave,
        # JaaS JWT
        generate_jaas_jwt,
    )
    from schatzkarte.map_data import ISLANDS
except ImportError as e:
    st.error(f"Import-Fehler: {e}")
    st.info("Bitte stelle sicher, dass alle Module im richtigen Pfad liegen.")
    st.stop()


# ============================================
# KONFIGURATION
# ============================================

st.set_page_config(page_title="👥 Lerngruppen", page_icon="👥", layout="wide")

DAYS_OF_WEEK = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"]

COACH_TIMEZONES = [
    ("Asia/Kuala_Lumpur", "🇲🇾 Malaysia (UTC+8)"),
    ("Europe/Berlin", "🇩🇪 Deutschland (UTC+1/+2)"),
    ("Europe/Zurich", "🇨🇭 Schweiz"),
    ("Europe/Vienna", "🇦🇹 Österreich"),
]

GROUP_TIMEZONES = [
    ("Europe/Berlin", "🇩🇪 Deutschland (Berlin)"),
    ("Europe/Zurich", "🇨🇭 Schweiz (Zürich)"),
    ("Europe/Vienna", "🇦🇹 Österreich (Wien)"),
]


def get_island_info(island_id: str) -> dict:
    """Holt Insel-Informationen aus map_data."""
    return ISLANDS.get(island_id, {"name": island_id, "icon": "🏝️", "color": "#ccc"})


# ============================================
# HAUPT-UI
# ============================================

def main():
    st.title("👥 Lerngruppen-Verwaltung")

    # Auto-Login via Cookie (bei WebSocket-Verlust)
    try_auto_login()

    if not is_logged_in():
        st.warning("Bitte melde dich an, um Lerngruppen zu verwalten.")
        render_user_login()
        return

    user = get_current_user()
    user_id = get_current_user_id()

    if not is_coach(user_id):
        st.error("🔒 Diese Seite ist nur für Coaches zugänglich.")
        st.info("Kontaktiere einen Administrator, um Coach-Rechte zu erhalten.")
        return

    # Coach-Header
    st.markdown(f"""
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; padding: 15px 20px; border-radius: 10px; margin-bottom: 20px;">
        <h4 style="margin: 0;">🎓 Coach: {user.get('display_name', 'Coach')}</h4>
    </div>
    """, unsafe_allow_html=True)

    # Tabs
    tab1, tab2, tab3, tab4 = st.tabs([
        "📋 Meine Gruppen", "➕ Neue Gruppe", "📹 Video-Treffen", "🔗 Einladung prüfen"
    ])

    with tab1:
        render_my_groups(user_id)
    with tab2:
        render_create_group(user_id)
    with tab3:
        render_video_meetings(user_id)
    with tab4:
        render_check_invitation()


# ============================================
# TAB 1: MEINE GRUPPEN
# ============================================

def render_my_groups(coach_id: str):
    """Zeigt alle Gruppen des Coaches."""
    groups = get_coach_groups(coach_id)

    if not groups:
        st.info("📭 Du hast noch keine Lerngruppen erstellt.")
        st.markdown("Wechsle zum Tab **➕ Neue Gruppe**, um deine erste Gruppe zu erstellen!")
        return

    st.markdown(f"### 📚 {len(groups)} Lerngruppe(n)")
    for group in groups:
        render_group_card(group)


def render_group_card(group: dict):
    """Rendert eine Gruppen-Karte mit allen Details."""
    group_id = group['group_id']
    progress = get_group_progress(group_id)
    current_week = progress.get('current_week', 0)

    with st.expander(
        f"**{group['name']}** · Woche {current_week}/12 · {group.get('member_count', 0)} Kinder",
        expanded=False
    ):
        col1, col2 = st.columns([2, 1])

        with col1:
            st.progress(current_week / 12, text=f"Woche {current_week} von 12")
            st.markdown(f"""
            | 📊 Statistik | Wert |
            |-------------|------|
            | 👥 Mitglieder | {progress.get('member_count', 0)} |
            | ⭐ Gesamt-XP | {progress.get('total_xp', 0):,} |
            | 📈 Ø Level | {progress.get('avg_level', 1)} |
            | 🏝️ Aktivierte Inseln | {len(progress.get('activated_islands', []))} / 7 |
            """)

        with col2:
            st.markdown("**⚡ Aktionen:**")
            if st.button("🏝️ Insel wählen", key=f"btn_island_{group_id}", use_container_width=True):
                st.session_state[f"show_island_{group_id}"] = True
            if st.button("👥 Mitglieder", key=f"btn_members_{group_id}", use_container_width=True):
                st.session_state[f"show_members_{group_id}"] = True
            if st.button("📨 Einladen", key=f"btn_invite_{group_id}", use_container_width=True):
                st.session_state[f"show_invite_{group_id}"] = True
            if st.button("🕐 Zeitzone", key=f"btn_tz_{group_id}", use_container_width=True):
                st.session_state[f"show_tz_{group_id}"] = True
            if st.button("🗑️ Löschen", key=f"btn_delete_{group_id}", use_container_width=True, type="secondary"):
                st.session_state[f"confirm_delete_{group_id}"] = True

        # --- Panels ---

        if st.session_state.get(f"confirm_delete_{group_id}"):
            st.markdown("---")
            _render_delete_confirm(group)

        if st.session_state.get(f"show_island_{group_id}"):
            st.markdown("---")
            render_island_selector(group_id, current_week)

        if st.session_state.get(f"show_members_{group_id}"):
            st.markdown("---")
            render_members_list(group_id, progress.get('members', []))

        if st.session_state.get(f"show_invite_{group_id}"):
            st.markdown("---")
            render_invite_form(group_id, group['name'])

        if st.session_state.get(f"show_tz_{group_id}"):
            st.markdown("---")
            _render_timezone_selector(group_id)


def _render_delete_confirm(group: dict):
    group_id = group['group_id']
    st.warning(f"⚠️ Möchtest du die Gruppe **{group['name']}** wirklich löschen?")
    col_yes, col_no = st.columns(2)
    with col_yes:
        if st.button("✅ Ja, löschen", key=f"confirm_del_{group_id}", type="primary", use_container_width=True):
            if delete_group(group_id, soft_delete=False):
                st.success("Gruppe wurde gelöscht!")
                st.session_state[f"confirm_delete_{group_id}"] = False
                st.rerun()
            else:
                st.error("Fehler beim Löschen.")
    with col_no:
        if st.button("❌ Abbrechen", key=f"cancel_del_{group_id}", use_container_width=True):
            st.session_state[f"confirm_delete_{group_id}"] = False
            st.rerun()


def _render_timezone_selector(group_id: str):
    st.markdown("### 🕐 Zeitzone der Gruppe")
    current_tz = get_group_timezone(group_id)
    tz_options = [tz[0] for tz in GROUP_TIMEZONES]
    tz_labels = [tz[1] for tz in GROUP_TIMEZONES]
    current_idx = tz_options.index(current_tz) if current_tz in tz_options else 0

    selected = st.selectbox(
        "Zeitzone:", tz_labels, index=current_idx, key=f"tz_select_{group_id}"
    )
    new_tz = tz_options[tz_labels.index(selected)]

    col1, col2 = st.columns(2)
    with col1:
        if st.button("💾 Speichern", key=f"save_tz_{group_id}", type="primary", use_container_width=True):
            if set_group_timezone(group_id, new_tz):
                st.success(f"Zeitzone auf {selected} gesetzt!")
                st.rerun()
            else:
                st.error("Fehler beim Speichern.")
    with col2:
        if st.button("❌ Schließen", key=f"close_tz_{group_id}", use_container_width=True):
            st.session_state[f"show_tz_{group_id}"] = False
            st.rerun()


# ============================================
# INSEL-AUSWAHL
# ============================================

def render_island_selector(group_id: str, current_week: int):
    st.markdown("### 🏝️ Insel für diese Woche wählen")

    activated = get_activated_islands(group_id)
    if activated:
        st.markdown("**✅ Bereits aktiviert:**")
        activated_html = " → ".join([
            f"W{a['week_number']}: {get_island_info(a['island_id'])['icon']} {get_island_info(a['island_id'])['name']}"
            for a in activated
        ])
        st.markdown(activated_html)

    # Nächste flexible Woche berechnen
    next_flexible_week = 5
    for a in activated:
        if a['week_number'] >= next_flexible_week:
            next_flexible_week = a['week_number'] + 1

    if next_flexible_week > 11:
        st.success("🎉 Alle flexiblen Inseln wurden bereits gewählt!")
        if st.button("❌ Schließen", key=f"close_island_done_{group_id}"):
            st.session_state[f"show_island_{group_id}"] = False
            st.rerun()
        return

    if current_week < 4:
        st.info(f"🕐 Die flexible Insel-Auswahl beginnt ab Woche 5. Aktuell: Woche {current_week}")
        st.markdown("**Wochen 1-4 sind fest:** 💪 Festung der Stärke → 🔧 Insel der 7 Werkzeuge → 🌉 Insel der Brücken → 🧵 Insel der Fäden")
        if st.button("❌ Schließen", key=f"close_island_early_{group_id}"):
            st.session_state[f"show_island_{group_id}"] = False
            st.rerun()
        return

    st.markdown(f"**🎯 Wähle die Insel für Woche {next_flexible_week}:**")
    available = get_available_islands(group_id)
    if not available:
        st.warning("Keine Inseln mehr verfügbar!")
        return

    # Insel-Grid
    cols = st.columns(3)
    for idx, island_id in enumerate(available):
        info = get_island_info(island_id)
        with cols[idx % 3]:
            st.markdown(f"""
            <div style="background: {info['color']}22; border: 2px solid {info['color']};
                        border-radius: 10px; padding: 15px; margin: 5px 0; text-align: center;">
                <div style="font-size: 2em;">{info['icon']}</div>
                <div style="font-weight: bold;">{info['name']}</div>
            </div>
            """, unsafe_allow_html=True)
            if st.button("Wählen", key=f"choose_{group_id}_{island_id}", use_container_width=True):
                st.session_state[f"selected_island_{group_id}"] = island_id

    selected = st.session_state.get(f"selected_island_{group_id}")
    if selected:
        selected_info = get_island_info(selected)
        st.markdown("---")
        st.markdown(f"**Ausgewählt:** {selected_info['icon']} {selected_info['name']}")
        notes = st.text_area(
            "📝 Notizen (optional):",
            placeholder="z.B. 'Viele Kinder haben von Prüfungsangst berichtet...'",
            key=f"notes_{group_id}"
        )
        col1, col2 = st.columns(2)
        with col1:
            if st.button("✅ Bestätigen", type="primary", key=f"confirm_island_{group_id}", use_container_width=True):
                if activate_weekly_island(group_id, next_flexible_week, selected, notes):
                    st.success(f"🎉 {selected_info['name']} für Woche {next_flexible_week} aktiviert!")
                    st.session_state.pop(f"selected_island_{group_id}", None)
                    st.session_state[f"show_island_{group_id}"] = False
                    st.rerun()
                else:
                    st.error("Fehler beim Aktivieren.")
        with col2:
            if st.button("❌ Abbrechen", key=f"cancel_island_{group_id}", use_container_width=True):
                st.session_state.pop(f"selected_island_{group_id}", None)
                st.rerun()

    st.markdown("---")
    if st.button("❌ Schließen", key=f"close_island_{group_id}"):
        st.session_state[f"show_island_{group_id}"] = False
        st.rerun()


# ============================================
# MITGLIEDER-LISTE
# ============================================

def render_members_list(group_id: str, members: list):
    st.markdown("### 👥 Mitglieder")

    if not members:
        st.info("Noch keine Mitglieder. Lade Kinder per Einladungslink ein!")
    else:
        for member in members:
            col1, col2, col3, col4 = st.columns([3, 1, 1, 1])
            with col1:
                st.markdown(f"**{member.get('display_name', 'Unbekannt')}**")
            with col2:
                st.markdown(f"Level {member.get('level', 1)}")
            with col3:
                st.markdown(f"⭐ {member.get('xp_total', 0):,}")
            with col4:
                st.markdown(f"🔥 {member.get('current_streak', 0)}")

    st.markdown("---")
    if st.button("❌ Schließen", key=f"close_members_{group_id}"):
        st.session_state[f"show_members_{group_id}"] = False
        st.rerun()


# ============================================
# EINLADUNGS-FORMULAR
# ============================================

def render_invite_form(group_id: str, group_name: str):
    st.markdown("### 📨 Kind einladen")

    email = st.text_input(
        "Email-Adresse (optional, für Dokumentation):",
        placeholder="beispiel@email.de",
        key=f"invite_email_{group_id}"
    )

    col1, col2 = st.columns(2)
    with col1:
        if st.button("🔗 Einladungslink erstellen", type="primary", key=f"create_invite_{group_id}", use_container_width=True):
            token = create_invitation(group_id, email if email else None)
            if token:
                invite_url = get_invitation_url(token)
                st.session_state[f"invite_link_{group_id}"] = invite_url
                st.session_state[f"invite_token_{group_id}"] = token
                st.success("✅ Einladungslink erstellt!")
                if email:
                    if send_invitation_email(email, group_name, invite_url):
                        st.success(f"📧 Einladung per Email an {email} gesendet!")
                    else:
                        st.warning("📧 Email konnte nicht gesendet werden. Bitte Link manuell teilen.")
            else:
                st.error("Fehler beim Erstellen der Einladung.")
    with col2:
        if st.button("❌ Schließen", key=f"close_invite_{group_id}", use_container_width=True):
            st.session_state[f"show_invite_{group_id}"] = False
            st.rerun()

    invite_link = st.session_state.get(f"invite_link_{group_id}")
    if invite_link:
        st.markdown("---")
        st.markdown("**📋 Einladungslink (7 Tage gültig):**")
        st.code(invite_link, language=None)
        st.caption("Kopiere diesen Link und sende ihn per Email an das Kind/die Eltern.")

        with st.expander("📧 Email-Vorlage"):
            st.markdown(f"""
**Betreff:** Einladung zur Lerngruppe "{group_name}"

Hallo!

Du wurdest zur Lerngruppe **"{group_name}"** eingeladen!

Klicke auf diesen Link, um beizutreten:
{invite_link}

Der Link ist 7 Tage gültig.

Viel Spaß beim Lernen! 🎉
            """)

    # Bestehende Einladungen
    st.markdown("---")
    invitations = get_group_invitations(group_id, include_used=True)
    if invitations:
        st.markdown("**📜 Bisherige Einladungen:**")
        for inv in invitations[:10]:
            status = "✅ Verwendet" if inv.get('used_at') else "⏳ Offen"
            email_str = inv.get('email', 'Keine Email')
            col_info, col_del = st.columns([4, 1])
            with col_info:
                st.markdown(f"{email_str} · {status}")
            with col_del:
                if st.button("🗑️", key=f"del_inv_{inv['token']}", help="Einladung löschen"):
                    delete_invitation(inv['token'])
                    st.rerun()


# ============================================
# TAB 2: NEUE GRUPPE ERSTELLEN
# ============================================

def render_create_group(coach_id: str):
    st.markdown("### ➕ Neue Lerngruppe erstellen")

    with st.form("create_group_form"):
        name = st.text_input(
            "Name der Gruppe:",
            placeholder="z.B. Klasse 4a, Lerngruppe Mathe, ...",
            help="Ein eindeutiger Name für die Gruppe"
        )
        start_date = st.date_input("Startdatum (optional):", value=None,
                                   help="Wann beginnt die 12-wöchige Lernreise?")

        # Zeitzonen-Auswahl bei Erstellung
        tz_labels = [tz[1] for tz in GROUP_TIMEZONES]
        selected_tz_label = st.selectbox("Zeitzone der Gruppe:", tz_labels, index=0)
        selected_tz = [tz[0] for tz in GROUP_TIMEZONES][tz_labels.index(selected_tz_label)]

        st.markdown("---")
        submitted = st.form_submit_button("🚀 Gruppe erstellen", type="primary", use_container_width=True)

        if submitted:
            if not name or len(name.strip()) < 3:
                st.error("Bitte gib einen Namen mit mindestens 3 Zeichen ein.")
            else:
                start_str = start_date.isoformat() if start_date else None
                group_id = create_group(name.strip(), coach_id, start_str)
                if group_id:
                    set_group_timezone(group_id, selected_tz)
                    st.success(f"🎉 Lerngruppe **{name}** erstellt!")
                    st.balloons()
                    st.info("Wechsle zum Tab **📋 Meine Gruppen**, um Kinder einzuladen.")
                else:
                    st.error("Fehler beim Erstellen der Gruppe.")


# ============================================
# TAB 3: VIDEO-TREFFEN (mit eingebettetem Jitsi)
# ============================================

def render_video_meetings(coach_id: str):
    st.markdown("### 📹 Video-Treffen")

    groups = get_coach_groups(coach_id)
    if not groups:
        st.info("📭 Du hast noch keine Lerngruppen. Erstelle zuerst eine Gruppe!")
        return

    # Coach-Zeitzone
    coach_tz_labels = [tz[1] for tz in COACH_TIMEZONES]
    coach_tz_values = [tz[0] for tz in COACH_TIMEZONES]
    default_coach_tz = st.session_state.get("coach_timezone", "Asia/Kuala_Lumpur")
    default_idx = coach_tz_values.index(default_coach_tz) if default_coach_tz in coach_tz_values else 0

    selected_coach_tz_label = st.selectbox(
        "🌍 Deine Zeitzone:", coach_tz_labels, index=default_idx, key="coach_tz_select"
    )
    coach_tz = coach_tz_values[coach_tz_labels.index(selected_coach_tz_label)]
    st.session_state["coach_timezone"] = coach_tz

    # Gruppen-Auswahl
    group_options = {g['name']: g['group_id'] for g in groups}
    selected_name = st.selectbox("Lerngruppe:", list(group_options.keys()), key="meeting_group_select")
    selected_group_id = group_options[selected_name]

    # Sub-Tabs
    mtab1, mtab2 = st.tabs(["📅 Nächstes Treffen", "➕ Neues Treffen planen"])

    with mtab1:
        render_next_meeting(selected_group_id, coach_id, coach_tz)
    with mtab2:
        render_schedule_meeting(selected_group_id, coach_id, coach_tz)


def render_next_meeting(group_id: str, coach_id: str, coach_tz: str):
    """Zeigt das nächste Meeting an — mit eingebettetem Jitsi Video-Chat."""
    next_meeting = get_next_meeting(group_id)

    if not next_meeting:
        st.info("📭 Kein Treffen geplant. Plane ein neues Treffen im Tab '➕ Neues Treffen planen'!")
        return

    meeting = next_meeting
    group_tz = get_group_timezone(group_id)

    # Zeitkonvertierung für Anzeige
    time_info = convert_meeting_time_display(
        meeting['time_of_day'], meeting['day_of_week'], group_tz, coach_tz
    )

    # Meeting-Karte
    st.markdown(f"""
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; padding: 20px; border-radius: 15px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0;">📹 {meeting.get('title', 'Lerngruppen-Treffen')}</h3>
        <div style="font-size: 1.3em; font-weight: bold;">
            {time_info['group_day_name']}, {time_info['group_time']} Uhr (Gruppe)
        </div>
        {"<div style='opacity: 0.9; margin-top: 3px;'>= " + time_info['coach_day_name'] + ", " + time_info['coach_time'] + " Uhr (Deine Zeit)</div>" if group_tz != coach_tz else ""}
        <div style="opacity: 0.8; margin-top: 8px;">⏱️ {meeting['duration_minutes']} Minuten · {'🔄 Wöchentlich' if meeting.get('recurrence_type') == 'woechentlich' else '📅 Einmalig'}</div>
    </div>
    """, unsafe_allow_html=True)

    # Meeting-Zugang prüfen
    user = get_current_user()
    access = get_meeting_access(group_id, get_current_user_id(), 'coach')

    if access['canJoin']:
        _render_jitsi_meeting(access, user, meeting)
    elif access['timeStatus'].get('reason') == 'too_early':
        _render_waiting_room(access, meeting)
    elif access['timeStatus'].get('reason') == 'ended':
        st.info("⏰ Das Treffen ist bereits beendet.")
    else:
        st.warning(access['timeStatus'].get('message', 'Treffen nicht verfügbar'))

    # Raum-Details (nur Coach)
    with st.expander("🔑 Raum-Details (nur für Coach)"):
        room_name = meeting.get('jitsi_room_name', 'N/A')
        try:
            jaas_app_id = st.secrets["jaas"]["app_id"]
            jitsi_url = f"https://8x8.vc/{jaas_app_id}/{room_name}" if room_name else None
        except (KeyError, AttributeError):
            jitsi_url = None
        st.markdown(f"**Raum-Name:** `{room_name}`")
        if jitsi_url:
            st.markdown(f"**Externer Link:** {jitsi_url}")
        st.caption("Der sichere Raum-Name wird automatisch generiert.")

    # Treffen absagen
    st.markdown("---")
    col1, col2 = st.columns(2)
    with col1:
        if st.button("🗑️ Treffen absagen", key=f"cancel_{meeting['id']}", type="secondary"):
            st.session_state[f"confirm_cancel_{meeting['id']}"] = True

    if st.session_state.get(f"confirm_cancel_{meeting['id']}"):
        st.warning("⚠️ Möchtest du dieses Treffen wirklich absagen?")
        cy, cn = st.columns(2)
        with cy:
            if st.button("✅ Ja, absagen", key=f"yes_cancel_{meeting['id']}", type="primary"):
                if cancel_meeting(meeting['id']):
                    st.success("Treffen wurde abgesagt!")
                    st.session_state[f"confirm_cancel_{meeting['id']}"] = False
                    st.rerun()
        with cn:
            if st.button("❌ Nein", key=f"no_cancel_{meeting['id']}"):
                st.session_state[f"confirm_cancel_{meeting['id']}"] = False
                st.rerun()

    # Alle Treffen
    st.markdown("---")
    st.markdown("### 📋 Alle geplanten Treffen")
    all_meetings = get_group_meetings(group_id, include_past=False)
    if all_meetings:
        for m in all_meetings:
            ti = convert_meeting_time_display(m['time_of_day'], m['day_of_week'], group_tz, coach_tz)
            status_icon = "🟢" if m['status'] == 'scheduled' else "⚪"
            dual = f" (= {ti['coach_time']} deine Zeit)" if group_tz != coach_tz else ""
            recurrence_label = "🔄" if m.get('recurrence_type') == 'woechentlich' else ""

            col_info, col_cancel = st.columns([5, 1])
            with col_info:
                st.markdown(f"{status_icon} {recurrence_label} **{ti['group_day_name']}**, {ti['group_time']} Uhr{dual} — {m.get('title', 'Treffen')} ({m['duration_minutes']} Min.)")
            with col_cancel:
                confirm_key = f"confirm_cancel_list_{m['id']}"
                if st.session_state.get(confirm_key):
                    if st.button("✅ Ja", key=f"yes_list_{m['id']}"):
                        if cancel_meeting(m['id']):
                            st.session_state[confirm_key] = False
                            st.rerun()
                    if st.button("❌ Nein", key=f"no_list_{m['id']}"):
                        st.session_state[confirm_key] = False
                        st.rerun()
                else:
                    if st.button("🗑️", key=f"cancel_list_{m['id']}", help="Treffen absagen"):
                        st.session_state[confirm_key] = True
                        st.rerun()
    else:
        st.caption("Keine weiteren Treffen geplant.")


def _render_waiting_room(access: dict, meeting: dict):
    """Warteraum wenn Meeting noch nicht begonnen hat."""
    minutes = access['timeStatus'].get('minutesUntilStart', '?')
    st.markdown(f"""
    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                border: 2px solid #38bdf8; border-radius: 15px; padding: 25px;
                text-align: center; margin: 15px 0;">
        <div style="font-size: 3em;">⏳</div>
        <h3 style="color: #0369a1; margin: 10px 0;">Warteraum</h3>
        <div style="background: linear-gradient(135deg, #fbbf24, #f59e0b);
                    color: white; padding: 12px 24px; border-radius: 25px;
                    display: inline-block; font-size: 1.4em; font-weight: bold;">
            Noch ~{minutes} Minuten
        </div>
        <p style="color: #64748b; margin-top: 15px;">
            Du kannst 5 Minuten vor Beginn beitreten.<br>
            Die Seite aktualisiert sich automatisch.
        </p>
    </div>
    """, unsafe_allow_html=True)

    # Manueller Refresh-Button statt Auto-Reload
    # (window.parent.location.reload() in components.html zerstört die WebSocket-Verbindung
    #  und wird auch in unsichtbaren Tabs ausgeführt → Session-Verlust)
    if st.button("🔄 Aktualisieren", key="refresh_waiting_room"):
        st.rerun()


def _render_jitsi_meeting(access: dict, user: dict, meeting: dict):
    """Rendert das eingebettete Jitsi-Meeting via JaaS (8x8.vc) mit JWT."""
    room_name = access['roomName']
    display_name = user.get('display_name', 'Coach')
    config = access['config']
    interface_config = access['interfaceConfig']
    meeting_id = meeting['id']
    user_id = get_current_user_id()

    # JaaS JWT generieren
    try:
        jaas_cfg = st.secrets["jaas"]
        app_id = jaas_cfg["app_id"]
    except (KeyError, AttributeError):
        st.error("JaaS-Konfiguration fehlt. Bitte secrets.toml pruefen.")
        return

    jwt_token = generate_jaas_jwt(
        user_name=display_name,
        user_id=user_id,
        is_moderator=True,  # Coach = Moderator
        room=room_name,
        user_email=user.get('email', '')
    )
    if not jwt_token:
        st.error("JWT-Generierung fehlgeschlagen. Bitte JaaS-Konfiguration pruefen.")
        return

    # Participant-Tracking: Join registrieren (nur einmal pro Session)
    join_key = f"joined_{meeting_id}_{user_id}"
    if not st.session_state.get(join_key):
        record_meeting_join(meeting_id, user_id, display_name, 'coach')
        st.session_state[join_key] = True

    # Screen-Share Tipps
    st.markdown("""
    <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 10px 15px;
                border-radius: 0 8px 8px 0; margin-bottom: 15px; font-size: 0.9em;">
        💡 <strong>Tipp:</strong> Klicke auf 🖥️ in der Toolbar, um deinen Bildschirm zu teilen.
        Wähle dann ein Fenster oder den ganzen Bildschirm.
    </div>
    """, unsafe_allow_html=True)

    # Jitsi External API einbetten (JaaS / 8x8.vc)
    config_json = json.dumps(config)
    interface_config_json = json.dumps(interface_config)
    display_name_js = json.dumps(display_name)
    full_room_name = f"{app_id}/{room_name}"

    jitsi_html = f"""
    <div id="jitsi-container" style="width: 100%; height: 600px; border-radius: 12px;
         overflow: hidden; border: 2px solid #e2e8f0; background: #1a1a2e;"></div>

    <script src="https://8x8.vc/{app_id}/external_api.js"></script>
    <script>
    (function() {{
        var api = new JitsiMeetExternalAPI("8x8.vc", {{
            roomName: "{full_room_name}",
            jwt: "{jwt_token}",
            parentNode: document.querySelector('#jitsi-container'),
            width: "100%",
            height: 600,
            configOverwrite: {config_json},
            interfaceConfigOverwrite: {interface_config_json},
            userInfo: {{
                displayName: {display_name_js},
                email: ""
            }}
        }});

        // Event: Jemand hat den Raum betreten
        api.on('videoConferenceJoined', function(data) {{
            console.log('[JaaS] Meeting beigetreten:', data);
        }});

        // Event: Jemand hat den Raum verlassen
        api.on('videoConferenceLeft', function(data) {{
            console.log('[JaaS] Meeting verlassen:', data);
        }});

        // Event: Teilnehmer beigetreten
        api.on('participantJoined', function(data) {{
            console.log('[JaaS] Teilnehmer beigetreten:', data.displayName);
        }});

        // Event: Screen-Sharing geändert
        api.on('screenSharingStatusChanged', function(data) {{
            console.log('[JaaS] Screen-Sharing:', data.on ? 'gestartet' : 'gestoppt');
        }});
    }})();
    </script>
    """

    components.html(jitsi_html, height=620)

    # Meeting-Info unterhalb
    remaining = access['timeStatus'].get('minutesRemaining', '?')
    st.caption(f"🟢 Treffen läuft — noch ~{remaining} Minuten verbleibend")


def render_schedule_meeting(group_id: str, coach_id: str, coach_tz: str):
    """Formular zum Planen eines neuen Treffens."""
    st.markdown("### ➕ Neues Treffen planen")

    group_tz = get_group_timezone(group_id)
    if group_tz != coach_tz:
        # Aktuellen Zeitunterschied berechnen
        now = datetime.now(ZoneInfo(group_tz))
        now_coach = now.astimezone(ZoneInfo(coach_tz))
        offset_hours = (now_coach.utcoffset().total_seconds() - now.utcoffset().total_seconds()) / 3600
        offset_str = f"+{offset_hours:g}" if offset_hours >= 0 else f"{offset_hours:g}"
        coach_city = coach_tz.split('/')[-1].replace('_', ' ')
        group_city = group_tz.split('/')[-1].replace('_', ' ')
        st.info(f"⏰ Uhrzeiten werden in **{group_city}**-Zeit eingegeben — deine Zeit ({coach_city}) ist **{offset_str}h** davon")

    # Aktuelles Datum in Gruppen-Zeitzone für Datumspicker
    now_group = datetime.now(ZoneInfo(group_tz))

    with st.form("schedule_meeting_form"):
        title = st.text_input(
            "Titel (optional):",
            placeholder="z.B. Wöchentliches Lerngruppen-Treffen",
        )

        col1, col2 = st.columns(2)
        with col1:
            meeting_date = st.date_input(
                "📅 Datum:",
                value=now_group.date(),
                min_value=now_group.date(),
                format="DD.MM.YYYY",
                help="Wähle das genaue Datum für das Treffen"
            )
        with col2:
            coach_city_short = coach_tz.split('/')[-1].replace('_', ' ') if group_tz != coach_tz else ""
            time = st.time_input("⏰ Uhrzeit:", value=None,
                                 help=f"Uhrzeit in der Gruppen-Zeitzone ({group_tz.split('/')[-1].replace('_', ' ')})"
                                      + (f" — wird nach {coach_city_short} umgerechnet" if coach_city_short else ""))

        duration = st.select_slider(
            "⏱️ Dauer:", options=[15, 30, 45, 60, 90], value=30,
            format_func=lambda x: f"{x} Minuten"
        )

        recurrence = st.radio(
            "🔄 Wiederholung:", options=["einmalig", "woechentlich"],
            format_func=lambda x: "Einmalig" if x == "einmalig" else "Wöchentlich",
            horizontal=True
        )

        st.markdown("---")
        submitted = st.form_submit_button("📹 Treffen planen", type="primary", use_container_width=True)

        if submitted:
            if not time:
                st.error("Bitte wähle eine Uhrzeit aus.")
            else:
                time_str = time.strftime("%H:%M")
                day_index = meeting_date.weekday()
                day_name = DAYS_OF_WEEK[day_index]
                result = schedule_meeting(
                    group_id=group_id, coach_id=coach_id,
                    day_of_week=day_index, time_of_day=time_str,
                    duration_minutes=duration, recurrence=recurrence,
                    title=title or "Lerngruppen-Treffen",
                    specific_date=meeting_date
                )

                if result:
                    date_str = meeting_date.strftime("%d.%m.%Y")
                    if group_tz != coach_tz:
                        ti = convert_meeting_time_display(time_str, day_index, group_tz, coach_tz)
                        coach_city = coach_tz.split('/')[-1].replace('_', ' ')
                        st.toast(f"🎉 Treffen geplant: {day_name} {date_str}, {time_str} Uhr (Kinder) = {ti['coach_day_name']} {ti['coach_time']} Uhr ({coach_city})")
                    else:
                        st.toast(f"🎉 Treffen für {day_name} {date_str} um {time_str} Uhr geplant!")
                    st.rerun()
                elif result is None:
                    st.error("Fehler beim Planen des Treffens. Bitte prüfe die Server-Logs.")


# ============================================
# TAB 4: EINLADUNG PRÜFEN
# ============================================

def render_check_invitation():
    st.markdown("### 🔗 Einladungslink prüfen")
    st.caption("Support-Tool: Prüfe ob ein Einladungslink gültig ist.")

    token = st.text_input("Token eingeben:", placeholder="z.B. abc123...",
                          help="Der Teil nach ?invite= im Link")

    if st.button("🔍 Prüfen") and token:
        invitation = get_invitation(token.strip())
        if not invitation:
            st.error("❌ Token nicht gefunden.")
        else:
            st.success(f"✅ Gültige Einladung für Gruppe: **{invitation.get('group_name')}**")
            if invitation.get('used_at'):
                st.warning(f"⚠️ Bereits verwendet am {invitation['used_at']}")
            elif invitation.get('expires_at'):
                expires = datetime.fromisoformat(invitation['expires_at'])
                if datetime.now() > expires:
                    st.warning("⚠️ Einladung ist abgelaufen.")
                else:
                    st.info(f"⏳ Gültig bis: {expires.strftime('%d.%m.%Y %H:%M')}")


# ============================================
# ENTRY POINT
# ============================================

if __name__ == "__main__":
    main()

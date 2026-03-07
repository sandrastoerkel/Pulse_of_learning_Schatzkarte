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
        render_user_login, get_user_by_id, is_coach, try_auto_login,
        get_all_students_list, reset_student_password, delete_user,
        create_student_by_coach, update_user_age_group
    )
    from utils.lerngruppen_db import (
        create_group, get_group, get_coach_groups, update_group, delete_group,
        add_member, remove_member, get_group_members, get_user_group,
        create_invitation, get_invitation_url, get_group_invitations,
        delete_invitation, send_invitation_email,
        activate_weekly_island, deactivate_weekly_island,
        get_activated_islands, get_available_islands,
        get_current_island, get_current_islands, get_group_week, get_group_progress,
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
    tab1, tab2, tab3, tab4, tab5 = st.tabs([
        "📋 Meine Gruppen", "➕ Neue Gruppe", "📹 Video-Treffen",
        "👤 Teilnehmer", "🔗 Einladung prüfen"
    ])

    with tab1:
        render_my_groups(user_id)
    with tab2:
        render_create_group(user_id)
    with tab3:
        render_video_meetings(user_id)
    with tab4:
        render_assign_members(user_id)
    with tab5:
        render_check_invitation()


# ============================================
# TAB 1: MEINE GRUPPEN
# ============================================

@st.fragment
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
            | 🏝️ Aktivierte Inseln | {len(progress.get('activated_islands', []))} / 11 |
            """)

        with col2:
            st.markdown("**⚡ Aktionen:**")
            if st.button("🏝️ Insel wählen", key=f"btn_island_{group_id}", use_container_width=True):
                st.session_state[f"show_island_{group_id}"] = True
            if st.button("👥 Mitglieder", key=f"btn_members_{group_id}", use_container_width=True):
                st.session_state[f"show_members_{group_id}"] = True
            if st.button("📨 Einladen", key=f"btn_invite_{group_id}", use_container_width=True):
                st.session_state[f"show_invite_{group_id}"] = True
            if st.button("➕ Schüler anlegen", key=f"btn_create_student_{group_id}", use_container_width=True):
                st.session_state[f"show_create_student_{group_id}"] = True
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

        if st.session_state.get(f"show_create_student_{group_id}"):
            st.markdown("---")
            render_create_student_form(group_id, group['name'])

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
    st.markdown("### 🏝️ Inseln pro Woche wählen")

    activated = get_activated_islands(group_id)

    # Aktivierte Inseln nach Woche gruppiert anzeigen
    if activated:
        st.markdown("**✅ Bereits aktiviert:**")
        by_week = {}
        for a in activated:
            w = a['week_number']
            if w not in by_week:
                by_week[w] = []
            by_week[w].append(a)

        for w in sorted(by_week.keys()):
            islands_str = ", ".join([
                f"{get_island_info(a['island_id'])['icon']} {get_island_info(a['island_id'])['name']}"
                for a in by_week[w]
            ])
            st.markdown(f"**Woche {w}:** {islands_str}")

    # Woche wählen
    # Standard: nächste freie Woche oder letzte belegte Woche (zum Ergänzen)
    used_weeks = sorted(set(a['week_number'] for a in activated)) if activated else []
    default_week = (used_weeks[-1] if used_weeks else 0) + 1
    if default_week > 11:
        default_week = used_weeks[-1] if used_weeks else 1

    target_week = st.number_input(
        "📅 Woche wählen (1-11):",
        min_value=1, max_value=11, value=min(default_week, 11),
        key=f"week_input_{group_id}"
    )

    # Bereits in dieser Woche aktivierte Inseln
    week_islands = get_current_islands(group_id, target_week)
    if week_islands:
        st.info(f"Woche {target_week} hat bereits: " + ", ".join([
            f"{get_island_info(iid)['icon']} {get_island_info(iid)['name']}" for iid in week_islands
        ]))

    # Verfügbare Inseln (noch nicht in irgendeiner Woche aktiviert)
    available = get_available_islands(group_id)
    if not available and not week_islands:
        st.success("🎉 Alle Inseln wurden bereits zugewiesen!")
        if st.button("❌ Schließen", key=f"close_island_done_{group_id}"):
            st.session_state[f"show_island_{group_id}"] = False
            st.rerun()
        return

    # Multiselect für Inseln
    if available:
        st.markdown(f"**🎯 Inseln für Woche {target_week} hinzufügen:**")
        island_options = {
            f"{get_island_info(iid)['icon']} {get_island_info(iid)['name']}": iid
            for iid in available
        }
        selected_labels = st.multiselect(
            "Inseln auswählen:",
            options=list(island_options.keys()),
            key=f"multiselect_islands_{group_id}"
        )

        if selected_labels:
            notes = st.text_area(
                "📝 Notizen (optional):",
                placeholder="z.B. 'Viele Kinder haben von Prüfungsangst berichtet...'",
                key=f"notes_{group_id}"
            )
            if st.button("✅ Bestätigen", type="primary", key=f"confirm_islands_{group_id}", use_container_width=True):
                success_count = 0
                for label in selected_labels:
                    island_id = island_options[label]
                    if activate_weekly_island(group_id, target_week, island_id, notes):
                        success_count += 1
                if success_count > 0:
                    st.success(f"🎉 {success_count} Insel(n) für Woche {target_week} aktiviert!")
                    st.session_state[f"show_island_{group_id}"] = False
                    st.rerun()
                else:
                    st.error("Fehler beim Aktivieren.")

    # Inseln aus aktueller Woche entfernen
    if week_islands:
        st.markdown("---")
        st.markdown(f"**🗑️ Inseln aus Woche {target_week} entfernen:**")
        for iid in week_islands:
            info = get_island_info(iid)
            col1, col2 = st.columns([3, 1])
            with col1:
                st.markdown(f"{info['icon']} {info['name']}")
            with col2:
                if st.button("Entfernen", key=f"remove_{group_id}_{target_week}_{iid}", use_container_width=True):
                    if deactivate_weekly_island(group_id, target_week, iid):
                        st.success(f"{info['name']} entfernt!")
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
        age_group_options = ["Grundschule", "Unterstufe", "Mittelstufe", "Oberstufe"]
        age_group_lower = [a.lower() for a in age_group_options]
        for member in members:
            col1, col2, col3, col4, col5, col6 = st.columns([3, 2, 1, 1, 1, 0.7])
            with col1:
                st.markdown(f"**{member.get('display_name', 'Unbekannt')}**")
            with col2:
                current_age = member.get("age_group", "unterstufe").lower()
                current_idx = age_group_lower.index(current_age) if current_age in age_group_lower else 1
                new_age = st.selectbox(
                    "Altersstufe",
                    age_group_options,
                    index=current_idx,
                    key=f"age_group_{group_id}_{member['user_id']}",
                    label_visibility="collapsed",
                )
                new_age_lower = new_age.lower()
                if new_age_lower != current_age:
                    if update_user_age_group(member["user_id"], new_age_lower):
                        st.toast(f"Altersstufe von {member.get('display_name', '?')} → {new_age}")
                        st.rerun()
            with col3:
                st.markdown(f"Level {member.get('level', 1)}")
            with col4:
                st.markdown(f"⭐ {member.get('xp_total', 0):,}")
            with col5:
                st.markdown(f"🔥 {member.get('current_streak', 0)}")
            with col6:
                if st.button("🔑", key=f"reset_pw_{group_id}_{member['user_id']}",
                             help="Passwort zurücksetzen"):
                    st.session_state[f"confirm_reset_{group_id}_{member['user_id']}"] = True

            # Bestaetigungs-Dialog
            _render_password_reset_confirm(group_id, member)

            # Temp-Passwort anzeigen: persistent aus DB (solange Schueler nicht geaendert hat)
            temp_pw_db = member.get("temp_password_plain")
            temp_pw_session = st.session_state.get(f"temp_pw_{group_id}_{member['user_id']}")
            if temp_pw_db and member.get("must_change_password"):
                _render_temp_password_display(group_id, member, temp_pw_db)
            elif temp_pw_session:
                _render_temp_password_display(group_id, member, temp_pw_session)

    st.markdown("---")
    if st.button("❌ Schließen", key=f"close_members_{group_id}"):
        st.session_state[f"show_members_{group_id}"] = False
        st.rerun()


def _render_password_reset_confirm(group_id: str, member: dict):
    """Bestaetigungs-Dialog fuer Passwort-Reset."""
    confirm_key = f"confirm_reset_{group_id}_{member['user_id']}"
    if not st.session_state.get(confirm_key):
        return

    name = member.get('display_name', 'Unbekannt')
    st.warning(f"🔑 Passwort von **{name}** wirklich zurücksetzen?")
    st.caption("Ein temporäres Passwort wird generiert. Der Schüler muss es beim nächsten Login ändern.")

    col_yes, col_no = st.columns(2)
    with col_yes:
        if st.button("✅ Ja, zurücksetzen", key=f"yes_reset_{group_id}_{member['user_id']}",
                      type="primary"):
            coach_id = get_current_user_id()
            temp_pw = reset_student_password(coach_id, member['user_id'])
            st.session_state[confirm_key] = False
            if temp_pw:
                st.session_state[f"temp_pw_{group_id}_{member['user_id']}"] = temp_pw
                st.rerun()
            else:
                st.error("Fehler beim Zurücksetzen. Ist der Schüler in deiner Gruppe?")
    with col_no:
        if st.button("❌ Abbrechen", key=f"no_reset_{group_id}_{member['user_id']}"):
            st.session_state[confirm_key] = False
            st.rerun()


def _render_temp_password_display(group_id: str, member: dict, temp_pw: str):
    """Zeigt das temporaere Passwort an. Bleibt sichtbar bis Schueler es aendert."""
    name = member.get('display_name', 'Unbekannt')
    is_from_db = member.get("must_change_password") and member.get("temp_password_plain")

    # Kompakte Anzeige oder grosse Box (je nach Quelle)
    hide_key = f"hide_temp_pw_{group_id}_{member['user_id']}"
    if is_from_db and st.session_state.get(hide_key):
        # Minimiert: nur kleiner Hinweis
        col_hint, col_show = st.columns([4, 1])
        with col_hint:
            st.caption(f"🔑 Temp-Passwort aktiv für {name}")
        with col_show:
            if st.button("👁️ Zeigen", key=f"show_tp_{group_id}_{member['user_id']}",
                         use_container_width=True):
                st.session_state[hide_key] = False
                st.rerun()
        return

    st.markdown(f"""
    <div style="background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
                border: 3px solid #f59e0b; border-radius: 12px; padding: 20px;
                margin: 10px 0; text-align: center;">
        <div style="font-size: 1em; color: #92400e; margin-bottom: 8px;">
            Temporäres Passwort für <strong>{name}</strong>:
        </div>
        <div style="font-size: 2em; font-weight: bold; font-family: monospace;
                    background: white; padding: 12px 24px; border-radius: 8px;
                    display: inline-block; letter-spacing: 2px; color: #1a1a2e;">
            {temp_pw}
        </div>
        <div style="font-size: 0.85em; color: #78350f; margin-top: 10px;">
            Bitte teile dieses Passwort mündlich oder per Chat mit.<br>
            {"Sichtbar bis der Schüler ein eigenes Passwort wählt." if is_from_db else "Der Schüler muss es beim nächsten Login ändern (gültig 48h)."}
        </div>
    </div>
    """, unsafe_allow_html=True)

    btn_label = "🔽 Minimieren" if is_from_db else "✅ Verstanden, schließen"
    if st.button(btn_label, key=f"close_temp_pw_{group_id}_{member['user_id']}",
                  type="primary"):
        if is_from_db:
            st.session_state[hide_key] = True
        else:
            st.session_state.pop(f"temp_pw_{group_id}_{member['user_id']}", None)
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


def render_create_student_form(group_id: str = None, group_name: str = None, groups: list = None):
    """Formular zum Anlegen eines neuen Schuelers durch den Coach."""
    st.markdown("### ➕ Neuen Schüler anlegen")

    form_key = f"create_student_{group_id or 'tab4'}"
    student_name = st.text_input(
        "Name des Kindes:",
        placeholder="z.B. Max Mustermann",
        key=f"student_name_{form_key}"
    )

    age_options = {
        "Grundschule (6-10)": "grundschule",
        "Unterstufe (10-12)": "unterstufe",
        "Mittelstufe (12-15)": "mittelstufe",
        "Oberstufe (15-18)": "oberstufe",
    }
    age_label = st.selectbox("Altersstufe:", list(age_options.keys()), key=f"age_{form_key}")
    age_group = age_options[age_label]

    # Gruppen-Auswahl nur wenn keine feste Gruppe vorgegeben
    selected_group_id = group_id
    selected_group_name = group_name
    if not group_id and groups:
        group_options = {g['name']: g['group_id'] for g in groups}
        selected_name = st.selectbox("Gruppe:", list(group_options.keys()), key=f"group_select_{form_key}")
        selected_group_id = group_options[selected_name]
        selected_group_name = selected_name

    col1, col2 = st.columns(2)
    with col1:
        if st.button("✅ Schüler anlegen", type="primary", key=f"btn_create_{form_key}", use_container_width=True):
            if not student_name or not student_name.strip():
                st.error("Bitte einen Namen eingeben.")
            else:
                result = create_student_by_coach(
                    coach_id=get_current_user_id(),
                    display_name=student_name.strip(),
                    age_group=age_group,
                    group_id=selected_group_id
                )
                if result is None:
                    st.error("❌ Der Name ist bereits vergeben. Bitte einen anderen Namen wählen.")
                else:
                    st.session_state[f"created_student_{form_key}"] = result
    with col2:
        if group_id and st.button("❌ Schließen", key=f"close_create_{form_key}", use_container_width=True):
            st.session_state[f"show_create_student_{group_id}"] = False
            st.session_state.pop(f"created_student_{form_key}", None)
            st.rerun()

    # Erfolgs-Anzeige (erscheint im selben Render-Zyklus ohne rerun)
    created = st.session_state.get(f"created_student_{form_key}")
    if created:
        user = created["user"]
        temp_pw = created["temp_password"]
        st.success(f"✅ Schüler **{user.get('display_name', '')}** wurde erstellt!")
        if created["added_to_group"]:
            st.info(f"📋 Wurde der Gruppe **{selected_group_name or 'gewählt'}** zugewiesen.")
        st.warning(f"🔑 **Temporäres Passwort:** `{temp_pw}`")
        st.caption("Bitte dieses Passwort an das Kind weitergeben. Beim ersten Login muss ein eigenes Passwort gewählt werden.")
        if st.button("🔄 Weiteren Schüler anlegen", key=f"reset_{form_key}"):
            del st.session_state[f"created_student_{form_key}"]
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
# TAB 4: TEILNEHMER ZUWEISEN
# ============================================

@st.fragment
def render_assign_members(coach_id: str):
    """Zeigt alle registrierten Schueler und erlaubt Zuweisung zu Coach-Gruppen."""
    st.markdown("### 👤 Teilnehmer verwalten")

    groups = get_coach_groups(coach_id)
    if not groups:
        st.info("📭 Erstelle zuerst eine Lerngruppe, bevor du Teilnehmer zuweisen kannst.")
        return

    with st.expander("➕ Neuen Schüler anlegen"):
        render_create_student_form(groups=groups)

    students = get_all_students_list()
    if not students:
        st.info("📭 Noch keine Schüler registriert.")
        return

    # Gruppen-Zuordnung fuer jeden Schueler laden
    group_map = {}  # user_id -> {group_id, group_name}
    for g in groups:
        members = get_group_members(g['group_id'])
        for m in members:
            group_map[m['user_id']] = {
                'group_id': g['group_id'],
                'group_name': g['name']
            }

    # Suchfeld und Filter
    col_search, col_filter = st.columns([2, 1])
    with col_search:
        search = st.text_input("🔍 Suche nach Name:", key="assign_search", placeholder="Name eingeben...")
    with col_filter:
        filter_opt = st.selectbox("Filter:", ["Alle", "Ohne Gruppe", "In Gruppe"], key="assign_filter")

    # Filtern
    filtered = students
    if search:
        search_lower = search.lower()
        filtered = [s for s in filtered if search_lower in s.get('display_name', '').lower()]
    if filter_opt == "Ohne Gruppe":
        filtered = [s for s in filtered if s['user_id'] not in group_map]
    elif filter_opt == "In Gruppe":
        filtered = [s for s in filtered if s['user_id'] in group_map]

    st.caption(f"{len(filtered)} von {len(students)} Schüler(n)")

    if not filtered:
        st.info("Keine Schüler gefunden.")
        return

    # Tabellen-Header
    header_cols = st.columns([3, 2, 1, 1, 2, 2, 0.5])
    header_cols[0].markdown("**Name**")
    header_cols[1].markdown("**Altersstufe**")
    header_cols[2].markdown("**Level**")
    header_cols[3].markdown("**XP**")
    header_cols[4].markdown("**Gruppe**")
    header_cols[5].markdown("**Aktion**")
    st.divider()

    # Gruppen-Optionen fuer Selectbox
    group_options = {g['name']: g['group_id'] for g in groups}
    group_names = list(group_options.keys())

    age_group_options_tab = ["Grundschule", "Unterstufe", "Mittelstufe", "Oberstufe"]
    age_group_lower_tab = [a.lower() for a in age_group_options_tab]

    for student in filtered:
        uid = student['user_id']
        name = student.get('display_name', 'Unbekannt')
        level = student.get('level', 1)
        xp = student.get('xp_total', 0)
        assignment = group_map.get(uid)

        cols = st.columns([3, 2, 1, 1, 2, 2, 0.5])
        cols[0].markdown(f"**{name}**")

        # Altersstufe-Selectbox
        with cols[1]:
            current_age = student.get("age_group", "unterstufe").lower()
            current_idx = age_group_lower_tab.index(current_age) if current_age in age_group_lower_tab else 1
            new_age = st.selectbox(
                "Altersstufe",
                age_group_options_tab,
                index=current_idx,
                key=f"age_group_tab_{uid}",
                label_visibility="collapsed",
            )
            new_age_lower = new_age.lower()
            if new_age_lower != current_age:
                if update_user_age_group(uid, new_age_lower):
                    st.toast(f"Altersstufe von {name} → {new_age}")
                    st.rerun()

        cols[2].markdown(str(level))
        cols[3].markdown(f"{xp:,}")

        # Loeschen-Button (letzte Spalte)
        with cols[6]:
            if st.button("🗑️", key=f"del_user_{uid}", help=f"{name} löschen"):
                st.session_state[f"confirm_delete_user_{uid}"] = True

        if assignment:
            # Schueler ist in einer Coach-Gruppe
            cols[4].markdown(f"✅ {assignment['group_name']}")
            with cols[5]:
                if st.button("✕ Entfernen", key=f"remove_{uid}", type="secondary"):
                    st.session_state[f"confirm_remove_{uid}"] = True

            if st.session_state.get(f"confirm_remove_{uid}"):
                st.warning(f"**{name}** wirklich aus **{assignment['group_name']}** entfernen?")
                c_yes, c_no = st.columns(2)
                with c_yes:
                    if st.button("✅ Ja", key=f"yes_rem_{uid}", type="primary"):
                        if remove_member(assignment['group_id'], uid):
                            st.toast(f"{name} wurde entfernt.")
                            st.session_state.pop(f"confirm_remove_{uid}", None)
                            st.rerun()
                        else:
                            st.error("Fehler beim Entfernen.")
                with c_no:
                    if st.button("❌ Nein", key=f"no_rem_{uid}"):
                        st.session_state.pop(f"confirm_remove_{uid}", None)
                        st.rerun()
        else:
            # Schueler hat keine Gruppe — pruefen ob in fremder Gruppe
            other_group = get_user_group(uid)
            if other_group:
                cols[4].markdown(f"🔒 {other_group.get('name', 'Andere')}")
                cols[5].caption("Anderer Coach")
            else:
                cols[4].markdown("—")
                with cols[5]:
                    sel_key = f"grp_select_{uid}"
                    if len(group_names) == 1:
                        chosen = group_names[0]
                    else:
                        chosen = st.selectbox(
                            "Gruppe", group_names, key=sel_key,
                            label_visibility="collapsed"
                        )
                    if st.button("＋ Zuweisen", key=f"assign_{uid}"):
                        target_gid = group_options[chosen]
                        if add_member(target_gid, uid):
                            st.toast(f"{name} → {chosen}")
                            st.rerun()
                        else:
                            st.error("Fehler — evtl. bereits in einer Gruppe.")

        # Bestaetigungs-Dialog fuer User-Loeschung
        if st.session_state.get(f"confirm_delete_user_{uid}"):
            st.error(f"⚠️ **{name}** wirklich komplett löschen? Alle Daten (XP, Badges, Gruppen-Mitgliedschaft) gehen verloren!")
            c_yes, c_no = st.columns(2)
            with c_yes:
                if st.button("🗑️ Ja, endgültig löschen", key=f"yes_del_user_{uid}", type="primary"):
                    result = delete_user(uid)
                    if result:
                        st.toast(f"{name} wurde gelöscht.")
                        st.session_state.pop(f"confirm_delete_user_{uid}", None)
                        st.rerun()
                    else:
                        st.error(f"Fehler beim Löschen von {name} (ID: {uid}). Siehe Terminal-Log.")
            with c_no:
                if st.button("❌ Abbrechen", key=f"no_del_user_{uid}"):
                    st.session_state.pop(f"confirm_delete_user_{uid}", None)
                    st.rerun()


# ============================================
# TAB 5: EINLADUNG PRÜFEN
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

# -*- coding: utf-8 -*-
"""
🔐 Admin-Seite
==============

Verwaltung von Benutzer-Rollen.
Zugang nur mit Admin-Passwort.
"""

import streamlit as st
from utils.user_system import (
    get_all_users, get_user_role, set_user_role,
    ROLE_STUDENT, ROLE_COACH, ROLE_ADMIN
)

# ============================================
# KONFIGURATION
# ============================================

st.set_page_config(
    page_title="🔐 Admin",
    page_icon="🔐",
    layout="wide"
)

# Admin-Passwort (aendern fuer Produktion!)
ADMIN_PASSWORD = "puls2024"

# ============================================
# PASSWORT-SCHUTZ
# ============================================

def check_admin_access() -> bool:
    """Prueft ob Admin-Zugang gewaehrt wurde."""
    if st.session_state.get("admin_authenticated", False):
        return True

    st.title("🔐 Admin-Bereich")
    st.warning("Diese Seite ist passwortgeschuetzt.")

    password = st.text_input("Admin-Passwort:", type="password", key="admin_pw")

    if st.button("Anmelden", type="primary"):
        if password == ADMIN_PASSWORD:
            st.session_state.admin_authenticated = True
            st.rerun()
        else:
            st.error("Falsches Passwort!")

    return False

# ============================================
# HAUPT-UI
# ============================================

def main():
    st.title("🔐 Admin-Bereich")

    # Abmelden-Button
    col1, col2, col3 = st.columns([2, 1, 1])
    with col3:
        if st.button("🚪 Abmelden", use_container_width=True):
            st.session_state.admin_authenticated = False
            st.rerun()

    st.success("✅ Angemeldet als Administrator")

    # Tabs
    tab1, tab2 = st.tabs(["👥 Benutzer-Rollen", "📊 Statistiken"])

    with tab1:
        render_user_roles()

    with tab2:
        render_statistics()


def render_user_roles():
    """Zeigt und verwaltet Benutzer-Rollen."""

    st.markdown("### 👥 Benutzer-Rollen verwalten")

    # Alle User laden
    users = get_all_users()

    if not users:
        st.info("Noch keine Benutzer registriert.")
        return

    # Rollen-Icons
    role_icons = {
        ROLE_STUDENT: "🎒",
        ROLE_COACH: "🎓",
        ROLE_ADMIN: "👑"
    }

    role_labels = {
        ROLE_STUDENT: "Schueler",
        ROLE_COACH: "Coach",
        ROLE_ADMIN: "Admin"
    }

    # Schnellfilter
    st.markdown("**Schnellfilter:**")
    filter_cols = st.columns(4)
    with filter_cols[0]:
        show_all = st.checkbox("Alle", value=True, key="filter_all")
    with filter_cols[1]:
        show_students = st.checkbox("🎒 Schueler", value=False, key="filter_students")
    with filter_cols[2]:
        show_coaches = st.checkbox("🎓 Coaches", value=False, key="filter_coaches")
    with filter_cols[3]:
        show_admins = st.checkbox("👑 Admins", value=False, key="filter_admins")

    st.markdown("---")

    # User-Liste
    for user in users:
        user_id = user['user_id']
        display_name = user.get('display_name', 'Unbekannt')
        current_role = get_user_role(user_id)

        # Filter anwenden
        if not show_all:
            if show_students and current_role != ROLE_STUDENT:
                continue
            if show_coaches and current_role != ROLE_COACH:
                continue
            if show_admins and current_role != ROLE_ADMIN:
                continue
            if not (show_students or show_coaches or show_admins):
                continue

        role_icon = role_icons.get(current_role, "❓")

        col1, col2, col3, col4 = st.columns([3, 2, 2, 2])

        with col1:
            st.markdown(f"**{role_icon} {display_name}**")
            st.caption(f"ID: {user_id[:8]}...")

        with col2:
            st.markdown(f"Level {user.get('level', 1)} · {user.get('xp_total', 0):,} XP")

        with col3:
            # Rollen-Auswahl
            new_role = st.selectbox(
                "Rolle",
                options=[ROLE_STUDENT, ROLE_COACH, ROLE_ADMIN],
                index=[ROLE_STUDENT, ROLE_COACH, ROLE_ADMIN].index(current_role),
                format_func=lambda x: f"{role_icons.get(x, '')} {role_labels.get(x, x)}",
                key=f"role_select_{user_id}",
                label_visibility="collapsed"
            )

        with col4:
            if new_role != current_role:
                if st.button("💾 Speichern", key=f"save_role_{user_id}", use_container_width=True):
                    if set_user_role(user_id, new_role):
                        st.success(f"Rolle geaendert!")
                        st.rerun()
                    else:
                        st.error("Fehler beim Speichern.")
            else:
                st.markdown("")  # Platzhalter

        st.markdown("---")

    # Zusammenfassung
    st.markdown("### 📊 Zusammenfassung")

    role_counts = {ROLE_STUDENT: 0, ROLE_COACH: 0, ROLE_ADMIN: 0}
    for user in users:
        role = get_user_role(user['user_id'])
        role_counts[role] = role_counts.get(role, 0) + 1

    sum_cols = st.columns(3)
    with sum_cols[0]:
        st.metric("🎒 Schueler", role_counts[ROLE_STUDENT])
    with sum_cols[1]:
        st.metric("🎓 Coaches", role_counts[ROLE_COACH])
    with sum_cols[2]:
        st.metric("👑 Admins", role_counts[ROLE_ADMIN])


def render_statistics():
    """Zeigt allgemeine Statistiken."""

    st.markdown("### 📊 System-Statistiken")

    users = get_all_users()

    if not users:
        st.info("Noch keine Daten vorhanden.")
        return

    # Allgemeine Stats
    total_users = len(users)
    total_xp = sum(u.get('xp_total', 0) for u in users)
    avg_level = sum(u.get('level', 1) for u in users) / max(1, total_users)

    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("👥 Gesamt-Benutzer", total_users)
    with col2:
        st.metric("⭐ Gesamt-XP", f"{total_xp:,}")
    with col3:
        st.metric("📈 Ø Level", f"{avg_level:.1f}")

    st.markdown("---")

    # Top 5 nach XP
    st.markdown("### 🏆 Top 5 nach XP")

    sorted_users = sorted(users, key=lambda x: x.get('xp_total', 0), reverse=True)[:5]

    for i, user in enumerate(sorted_users, 1):
        medal = {1: "🥇", 2: "🥈", 3: "🥉"}.get(i, "  ")
        st.markdown(f"{medal} **{user.get('display_name', 'Unbekannt')}** - {user.get('xp_total', 0):,} XP (Level {user.get('level', 1)})")


# ============================================
# ENTRY POINT
# ============================================

if check_admin_access():
    main()

# -*- coding: utf-8 -*-
"""
👥 Lerngruppen - Coach-Interface
================================

Streamlit-Seite für Coaches zur Verwaltung von Lerngruppen.

Features:
- Gruppen erstellen
- Kinder per Email einladen
- Wöchentliche Insel-Auswahl
- Gruppen-Fortschritt überwachen
"""

import streamlit as st
from datetime import datetime, timedelta

# Lokale Imports (Pfade anpassen falls nötig)
try:
    from utils.user_system import (
        is_logged_in, get_current_user, get_current_user_id,
        render_user_login, get_user_by_id, is_coach
    )
    from utils.lerngruppen_db import (
        create_group, get_group, get_coach_groups, update_group, delete_group,
        add_member, remove_member, get_group_members, get_user_group,
        create_invitation, get_invitation, use_invitation, get_group_invitations,
        activate_weekly_island, get_activated_islands, get_available_islands,
        get_current_island, get_group_week, get_group_progress,
        FLEXIBLE_ISLANDS
    )
    from schatzkarte.map_data import ISLANDS
except ImportError as e:
    st.error(f"Import-Fehler: {e}")
    st.info("Bitte stelle sicher, dass alle Module im richtigen Pfad liegen.")
    st.stop()

# ============================================
# KONFIGURATION
# ============================================

st.set_page_config(
    page_title="👥 Lerngruppen",
    page_icon="👥",
    layout="wide"
)

# Insel-Info Helper
def get_island_info(island_id: str) -> dict:
    """Holt Insel-Informationen aus map_data."""
    return ISLANDS.get(island_id, {"name": island_id, "icon": "🏝️", "color": "#ccc"})

# ============================================
# HAUPT-UI
# ============================================

def main():
    st.title("👥 Lerngruppen-Verwaltung")
    
    # Login prüfen
    if not is_logged_in():
        st.warning("Bitte melde dich an, um Lerngruppen zu verwalten.")
        render_user_login()
        return
    
    user = get_current_user()
    user_id = get_current_user_id()
    
    # Coach-Check
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
    
    # Tabs für verschiedene Bereiche
    tab1, tab2, tab3 = st.tabs(["📋 Meine Gruppen", "➕ Neue Gruppe", "🔗 Einladung prüfen"])
    
    with tab1:
        render_my_groups(user_id)
    
    with tab2:
        render_create_group(user_id)
    
    with tab3:
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
    
    with st.expander(f"**{group['name']}** · Woche {current_week}/12 · {group.get('member_count', 0)} Kinder", expanded=False):
        
        col1, col2 = st.columns([2, 1])
        
        with col1:
            # Fortschrittsbalken
            week_progress = current_week / 12
            st.progress(week_progress, text=f"Woche {current_week} von 12")
            
            # Statistiken
            st.markdown(f"""
            | 📊 Statistik | Wert |
            |-------------|------|
            | 👥 Mitglieder | {progress.get('member_count', 0)} |
            | ⭐ Gesamt-XP | {progress.get('total_xp', 0):,} |
            | 📈 Ø Level | {progress.get('avg_level', 1)} |
            | 🏝️ Aktivierte Inseln | {len(progress.get('activated_islands', []))} / 7 |
            """)
        
        with col2:
            # Quick Actions
            st.markdown("**⚡ Aktionen:**")
            
            if st.button("🏝️ Insel wählen", key=f"btn_select_island_{group_id}", use_container_width=True):
                st.session_state[f"show_island_selector_{group_id}"] = True

            if st.button("👥 Mitglieder", key=f"btn_show_members_{group_id}", use_container_width=True):
                st.session_state[f"show_members_{group_id}"] = True

            if st.button("📨 Einladen", key=f"btn_invite_{group_id}", use_container_width=True):
                st.session_state[f"show_invite_{group_id}"] = True

            if st.button("🗑️ Löschen", key=f"btn_delete_{group_id}", use_container_width=True, type="secondary"):
                st.session_state[f"confirm_delete_{group_id}"] = True

        # ========== GRUPPE LÖSCHEN ==========
        if st.session_state.get(f"confirm_delete_{group_id}", False):
            st.markdown("---")
            st.warning(f"⚠️ Möchtest du die Gruppe **{group['name']}** wirklich löschen?")
            col_yes, col_no = st.columns(2)
            with col_yes:
                if st.button("✅ Ja, löschen", key=f"btn_confirm_delete_{group_id}", type="primary", use_container_width=True):
                    if delete_group(group_id, soft_delete=False):
                        st.success("Gruppe wurde gelöscht!")
                        st.session_state[f"confirm_delete_{group_id}"] = False
                        st.rerun()
                    else:
                        st.error("Fehler beim Löschen.")
            with col_no:
                if st.button("❌ Abbrechen", key=f"btn_cancel_delete_{group_id}", use_container_width=True):
                    st.session_state[f"confirm_delete_{group_id}"] = False
                    st.rerun()

        # ========== INSEL-AUSWAHL ==========
        if st.session_state.get(f"show_island_selector_{group_id}", False):
            st.markdown("---")
            render_island_selector(group_id, current_week)
        
        # ========== MITGLIEDER ==========
        if st.session_state.get(f"show_members_{group_id}", False):
            st.markdown("---")
            render_members_list(group_id, progress.get('members', []))
        
        # ========== EINLADUNG ==========
        if st.session_state.get(f"show_invite_{group_id}", False):
            st.markdown("---")
            render_invite_form(group_id, group['name'])

# ============================================
# INSEL-AUSWAHL (Woche für Woche)
# ============================================

def render_island_selector(group_id: str, current_week: int):
    """UI für die wöchentliche Insel-Auswahl."""
    
    st.markdown("### 🏝️ Insel für diese Woche wählen")
    
    # Zeige bereits aktivierte Inseln
    activated = get_activated_islands(group_id)
    if activated:
        st.markdown("**✅ Bereits aktiviert:**")
        activated_html = " → ".join([
            f"W{a['week_number']}: {get_island_info(a['island_id'])['icon']} {get_island_info(a['island_id'])['name']}"
            for a in activated
        ])
        st.markdown(activated_html)
    
    # Prüfe ob flexible Wochen (5-11)
    next_flexible_week = 5
    for a in activated:
        if a['week_number'] >= next_flexible_week:
            next_flexible_week = a['week_number'] + 1
    
    if next_flexible_week > 11:
        st.success("🎉 Alle flexiblen Inseln wurden bereits gewählt!")
        if st.button("❌ Schließen", key=f"close_island_{group_id}"):
            st.session_state[f"show_island_selector_{group_id}"] = False
            st.rerun()
        return
    
    if current_week < 4:
        st.info(f"🕐 Die flexible Insel-Auswahl beginnt ab Woche 5. Aktuell: Woche {current_week}")
        st.markdown("**Wochen 1-4 sind fest:**")
        st.markdown("- Woche 1: 💪 Festung der Stärke")
        st.markdown("- Woche 2: 🔧 Insel der 7 Werkzeuge")
        st.markdown("- Woche 3: 🌉 Insel der Brücken")
        st.markdown("- Woche 4: 🧵 Insel der Fäden")
        
        if st.button("❌ Schließen", key=f"close_island_early_{group_id}"):
            st.session_state[f"show_island_selector_{group_id}"] = False
            st.rerun()
        return
    
    st.markdown(f"**🎯 Wähle die Insel für Woche {next_flexible_week}:**")
    
    # Verfügbare Inseln
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
            
            if st.button(f"Wählen", key=f"choose_{group_id}_{island_id}", use_container_width=True):
                st.session_state[f"selected_island_{group_id}"] = island_id
    
    # Notizen und Bestätigung
    selected = st.session_state.get(f"selected_island_{group_id}")
    
    if selected:
        selected_info = get_island_info(selected)
        st.markdown(f"---")
        st.markdown(f"**Ausgewählt:** {selected_info['icon']} {selected_info['name']}")
        
        notes = st.text_area(
            "📝 Notizen (optional) - Warum diese Insel?",
            placeholder="z.B. 'Viele Kinder haben diese Woche von Prüfungsangst berichtet...'",
            key=f"notes_{group_id}"
        )
        
        col1, col2 = st.columns(2)
        
        with col1:
            if st.button("✅ Bestätigen", type="primary", key=f"confirm_{group_id}", use_container_width=True):
                success = activate_weekly_island(group_id, next_flexible_week, selected, notes)
                if success:
                    st.success(f"🎉 {selected_info['name']} für Woche {next_flexible_week} aktiviert!")
                    # State aufräumen
                    del st.session_state[f"selected_island_{group_id}"]
                    st.session_state[f"show_island_selector_{group_id}"] = False
                    st.rerun()
                else:
                    st.error("Fehler beim Aktivieren der Insel.")
        
        with col2:
            if st.button("❌ Abbrechen", key=f"cancel_{group_id}", use_container_width=True):
                del st.session_state[f"selected_island_{group_id}"]
                st.rerun()
    
    # Schließen-Button
    st.markdown("---")
    if st.button("❌ Schließen", key=f"close_selector_{group_id}"):
        st.session_state[f"show_island_selector_{group_id}"] = False
        st.rerun()

# ============================================
# MITGLIEDER-LISTE
# ============================================

def render_members_list(group_id: str, members: list):
    """Zeigt die Mitglieder einer Gruppe."""
    
    st.markdown("### 👥 Mitglieder")
    
    if not members:
        st.info("Noch keine Mitglieder. Lade Kinder per Email ein!")
        if st.button("❌ Schließen", key=f"close_members_{group_id}"):
            st.session_state[f"show_members_{group_id}"] = False
            st.rerun()
        return
    
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
    if st.button("❌ Schließen", key=f"close_members_btn_{group_id}"):
        st.session_state[f"show_members_{group_id}"] = False
        st.rerun()

# ============================================
# EINLADUNGS-FORMULAR
# ============================================

def render_invite_form(group_id: str, group_name: str):
    """Formular zum Erstellen von Einladungen."""
    
    st.markdown("### 📨 Kind einladen")
    
    email = st.text_input(
        "Email-Adresse des Kindes (oder der Eltern):",
        placeholder="beispiel@email.de",
        key=f"invite_email_{group_id}"
    )
    
    col1, col2 = st.columns(2)
    
    with col1:
        if st.button("🔗 Einladungslink erstellen", type="primary", key=f"create_invite_{group_id}", use_container_width=True):
            token = create_invitation(group_id, email if email else None)
            if token:
                # Generiere Link (anpassen an deine Domain)
                invite_url = f"https://deine-app.streamlit.app/?invite={token}"
                st.session_state[f"invite_link_{group_id}"] = invite_url
                st.session_state[f"invite_token_{group_id}"] = token
                st.success("✅ Einladungslink erstellt!")
            else:
                st.error("Fehler beim Erstellen der Einladung.")
    
    with col2:
        if st.button("❌ Schließen", key=f"close_invite_{group_id}", use_container_width=True):
            st.session_state[f"show_invite_{group_id}"] = False
            st.rerun()
    
    # Zeige erstellten Link
    invite_link = st.session_state.get(f"invite_link_{group_id}")
    if invite_link:
        st.markdown("---")
        st.markdown("**📋 Einladungslink (7 Tage gültig):**")
        st.code(invite_link, language=None)
        st.caption("Kopiere diesen Link und sende ihn per Email an das Kind/die Eltern.")
        
        # Email-Vorlage
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
        for inv in invitations[:5]:  # Zeige max. 5
            status = "✅ Verwendet" if inv.get('used_at') else "⏳ Offen"
            email_str = inv.get('email', 'Keine Email')
            st.markdown(f"- {email_str} · {status}")

# ============================================
# TAB 2: NEUE GRUPPE ERSTELLEN
# ============================================

def render_create_group(coach_id: str):
    """Formular zum Erstellen einer neuen Gruppe."""
    
    st.markdown("### ➕ Neue Lerngruppe erstellen")
    
    with st.form("create_group_form"):
        name = st.text_input(
            "Name der Gruppe:",
            placeholder="z.B. Klasse 4a, Lerngruppe Mathe, ...",
            help="Ein eindeutiger Name für die Gruppe"
        )
        
        start_date = st.date_input(
            "Startdatum (optional):",
            value=None,
            help="Wann beginnt die 12-wöchige Lernreise?"
        )
        
        st.markdown("---")
        
        submitted = st.form_submit_button("🚀 Gruppe erstellen", type="primary", use_container_width=True)
        
        if submitted:
            if not name or len(name.strip()) < 3:
                st.error("Bitte gib einen Namen mit mindestens 3 Zeichen ein.")
            else:
                start_str = start_date.isoformat() if start_date else None
                group_id = create_group(name.strip(), coach_id, start_str)
                
                if group_id:
                    st.success(f"🎉 Lerngruppe **{name}** erstellt!")
                    st.balloons()
                    st.info("Wechsle zum Tab **📋 Meine Gruppen**, um Kinder einzuladen.")
                else:
                    st.error("Fehler beim Erstellen der Gruppe.")

# ============================================
# TAB 3: EINLADUNG PRÜFEN
# ============================================

def render_check_invitation():
    """Prüft einen Einladungslink (für Debugging/Support)."""
    
    st.markdown("### 🔗 Einladungslink prüfen")
    st.caption("Für Support: Prüfe ob ein Einladungslink gültig ist.")
    
    token = st.text_input(
        "Token eingeben:",
        placeholder="z.B. abc123...",
        help="Der Teil nach ?invite= im Link"
    )
    
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
# EINLADUNGS-HANDLING (Query Parameter)
# ============================================

def handle_invitation_from_url():
    """Verarbeitet ?invite=TOKEN aus der URL."""
    
    query_params = st.query_params
    invite_token = query_params.get("invite")
    
    if not invite_token:
        return False
    
    st.markdown("## 📨 Einladung zur Lerngruppe")
    
    invitation = get_invitation(invite_token)
    
    if not invitation:
        st.error("❌ Ungültiger oder abgelaufener Einladungslink.")
        return True
    
    st.markdown(f"""
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; padding: 20px; border-radius: 15px; text-align: center;">
        <h2>🎉 Du wurdest eingeladen!</h2>
        <h3>Gruppe: {invitation['group_name']}</h3>
    </div>
    """, unsafe_allow_html=True)
    
    if not is_logged_in():
        st.warning("Bitte melde dich zuerst an, um der Gruppe beizutreten.")
        render_user_login()
        return True
    
    user_id = get_current_user_id()
    
    if st.button("✅ Gruppe beitreten", type="primary", use_container_width=True):
        result = use_invitation(invite_token, user_id)
        
        if result['success']:
            st.success(result['message'])
            st.balloons()
            # Token aus URL entfernen
            st.query_params.clear()
            st.rerun()
        else:
            st.error(result['message'])
    
    return True

# ============================================
# ENTRY POINT
# ============================================

if __name__ == "__main__":
    # Prüfe zuerst auf Einladungslink
    if not handle_invitation_from_url():
        main()

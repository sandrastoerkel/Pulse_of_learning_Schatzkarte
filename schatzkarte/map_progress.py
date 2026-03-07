# -*- coding: utf-8 -*-
"""Freischaltungs-Logik fuer die Schatzkarte."""
import streamlit as st
from .map_data import ISLANDS, CHOOSABLE_ISLANDS

def is_preview_mode():
    """Prueft ob Preview-Modus aktiv."""
    return st.session_state.get("preview_mode", False)

def get_preview_week():
    """Gibt simulierte Woche zurueck (None = alles offen)."""
    if not is_preview_mode():
        return None
    return st.session_state.get("preview_week", None)

def get_unlocked_islands(user_id, current_week=None):
    """
    Gibt freigeschaltete Inseln zurueck.

    - Coach: ALLE Inseln immer freigeschaltet
    - Gruppen-Mitglied: Inseln die der Coach fuer die Gruppe aktiviert hat
    - Preview: preview_week = None -> alles offen, preview_week = 4 -> bis Woche 4
    - Fallback: Progressive Freischaltung nach Woche
    """
    from utils.user_system import is_coach
    from utils.lerngruppen_db import get_user_group, get_activated_islands, get_group_week

    # Coach: ALLE Inseln immer freigeschaltet
    if is_coach(user_id):
        return list(ISLANDS.keys())

    # Preview: Alles offen?
    if is_preview_mode() and get_preview_week() is None:
        return list(ISLANDS.keys())

    # Gruppen-basierte Freischaltung
    group = get_user_group(user_id)
    if group:
        group_id = group["group_id"]
        group_week = get_group_week(group_id)
        activated = get_activated_islands(group_id)

        unlocked = ["start"]
        # Alle Inseln freischalten, die fuer Wochen <= aktuelle Woche aktiviert sind
        for a in activated:
            if a["week_number"] <= group_week and a["island_id"] not in unlocked:
                unlocked.append(a["island_id"])

        # Finale (Woche 12)
        if group_week >= 12:
            unlocked.append("meister_berg")

        return unlocked

    # Fallback: Progressive Freischaltung (kein Gruppen-Mitglied)
    week = get_preview_week() if is_preview_mode() else (current_week or 0)
    unlocked = ["start"]
    for i, island_id in enumerate(CHOOSABLE_ISLANDS):
        if week >= (i + 1):
            unlocked.append(island_id)
    if week >= 12:
        unlocked.append("meister_berg")

    return unlocked

def get_island_status(island_id, unlocked_list):
    """
    Status einer Insel.
    Returns: 'locked', 'unlocked', 'completed'
    """
    if island_id not in unlocked_list:
        return "locked"
    return "unlocked"

# Test
if __name__ == "__main__":
    # Simuliere Preview
    st.session_state = {"preview_mode": True, "preview_week": 4}
    
    unlocked = get_unlocked_islands("test")
    print(f"Woche 4: {len(unlocked)} Inseln")
    print(unlocked)

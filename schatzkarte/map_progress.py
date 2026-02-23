# -*- coding: utf-8 -*-
"""Freischaltungs-Logik fuer die Schatzkarte."""
import streamlit as st
from .map_data import ISLANDS, FIXED_ISLANDS, FLEXIBLE_ISLANDS

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
    
    Preview-Modus:
    - preview_week = None -> ALLE Inseln offen
    - preview_week = 4 -> Nur bis Woche 4
    """
    # Preview: Alles offen?
    if is_preview_mode() and get_preview_week() is None:
        return list(ISLANDS.keys())
    
    # Woche bestimmen
    week = get_preview_week() if is_preview_mode() else (current_week or 0)
    
    # Inseln sammeln (Basiscamp + Mental stark immer offen)
    unlocked = ["start", "festung"]

    # Feste Inseln (Woche 2-4, festung ist schon drin)
    for i, island_id in enumerate(FIXED_ISLANDS):
        if island_id == "festung":
            continue  # bereits freigeschaltet
        if week >= (i + 1):
            unlocked.append(island_id)
    
    # Flexible Inseln (Woche 5-13)
    if week >= 5:
        for i, island_id in enumerate(FLEXIBLE_ISLANDS):
            if week >= (5 + i):
                unlocked.append(island_id)
    
    # Finale (Woche 14)
    if week >= 14:
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

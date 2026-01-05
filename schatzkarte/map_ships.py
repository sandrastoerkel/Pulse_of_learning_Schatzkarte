# -*- coding: utf-8 -*-
"""Schwimmende Schiffe für Bandura & Hattie Challenges."""

import streamlit as st
from typing import Dict, List, Any

# ===============================================================
# CSS FÜR SCHWIMMENDE SCHIFFE
# ===============================================================

def get_ships_css() -> str:
    """CSS für die schwimmenden Schiffe."""
    return """
    <style>
    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
    }

    @keyframes flame {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
    }

    .ship-card {
        background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
        border-radius: 16px;
        padding: 15px;
        color: white;
        animation: float 3s ease-in-out infinite;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
        border: 2px solid #3949ab;
    }

    .ship-card:hover {
        transform: scale(1.05);
        box-shadow: 0 8px 25px rgba(26, 35, 126, 0.4);
    }

    .ship-card.bandura {
        background: linear-gradient(135deg, #4a148c 0%, #7b1fa2 100%);
        border-color: #9c27b0;
    }

    .ship-card.hattie {
        background: linear-gradient(135deg, #1565c0 0%, #1976d2 100%);
        border-color: #2196f3;
    }

    .ship-icon {
        font-size: 2.5em;
        text-align: center;
        margin-bottom: 8px;
    }

    .ship-title {
        font-size: 1.1em;
        font-weight: bold;
        text-align: center;
        margin-bottom: 10px;
    }

    .ship-stats {
        background: rgba(255,255,255,0.15);
        border-radius: 8px;
        padding: 8px 10px;
        font-size: 0.85em;
        margin-bottom: 10px;
    }

    .ship-progress {
        display: flex;
        gap: 4px;
        justify-content: center;
        margin: 8px 0;
    }

    .progress-dot {
        width: 20px;
        height: 20px;
        border-radius: 4px;
        background: rgba(255,255,255,0.3);
    }

    .progress-dot.filled {
        background: #4caf50;
    }

    .flame-icon {
        display: inline-block;
        animation: flame 0.5s ease-in-out infinite;
    }
    </style>
    """


# ===============================================================
# BANDURA SCHIFF
# ===============================================================

def get_bandura_data(user_id: str) -> Dict[str, Any]:
    """Holt Bandura-Daten für das Schiff."""
    try:
        from utils.bandura_sources_widget import get_bandura_stats, BANDURA_SOURCES
        stats = get_bandura_stats(user_id)
        return {
            "sources_today": stats.get("sources_today", []),
            "streak": stats.get("bandura_streak", 0),
            "total": stats.get("bandura_total", 0),
            "all_sources": list(BANDURA_SOURCES.keys())
        }
    except ImportError:
        return {
            "sources_today": [],
            "streak": 0,
            "total": 0,
            "all_sources": ["mastery", "vicarious", "persuasion", "physiological"]
        }


def render_bandura_ship_html(data: Dict[str, Any]) -> str:
    """Rendert das Bandura-Schiff als HTML."""
    sources_today = set(data.get("sources_today", []))
    all_sources = data.get("all_sources", [])
    streak = data.get("streak", 0)

    # Progress-Dots für die 4 Quellen
    dots_html = ""
    source_icons = {"mastery": "🏆", "vicarious": "👀", "persuasion": "💬", "physiological": "🧘"}
    for source in all_sources:
        filled = "filled" if source in sources_today else ""
        icon = source_icons.get(source, "⬜")
        dots_html += f'<div class="progress-dot {filled}" title="{source}">{icon}</div>'

    # Streak mit Flamme
    flame = '<span class="flame-icon">🔥</span>' if streak >= 3 else '🔥'

    return f"""
    <div class="ship-card bandura">
        <div class="ship-icon">🚢🔥</div>
        <div class="ship-title">Bandura-Challenge</div>
        <div class="ship-stats">
            <div style="text-align: center; margin-bottom: 5px;">Heute:</div>
            <div class="ship-progress">{dots_html}</div>
            <div style="text-align: center; margin-top: 8px;">
                {flame} <strong>{streak}</strong> Tage Streak
            </div>
        </div>
    </div>
    """


# ===============================================================
# HATTIE SCHIFF
# ===============================================================

def get_hattie_data(user_id: str) -> Dict[str, Any]:
    """Holt Hattie-Daten für das Schiff."""
    try:
        from utils.gamification_db import get_open_challenges, get_user_challenges
        open_challenges = get_open_challenges(user_id)
        all_challenges = get_user_challenges(user_id)
        completed = [c for c in all_challenges if c.get("completed_at")]
        return {
            "open_count": len(open_challenges),
            "completed_count": len(completed),
            "total_count": len(all_challenges)
        }
    except ImportError:
        return {
            "open_count": 0,
            "completed_count": 0,
            "total_count": 0
        }


def render_hattie_ship_html(data: Dict[str, Any]) -> str:
    """Rendert das Hattie-Schiff als HTML."""
    open_count = data.get("open_count", 0)
    completed_count = data.get("completed_count", 0)

    # Status-Anzeige
    if open_count > 0:
        status = f"⏳ {open_count} offen"
        status_color = "#ffeb3b"
    else:
        status = "✅ Keine offenen"
        status_color = "#4caf50"

    return f"""
    <div class="ship-card hattie">
        <div class="ship-icon">🚢🎯</div>
        <div class="ship-title">Hattie-Challenge</div>
        <div class="ship-stats">
            <div style="text-align: center; color: {status_color};">
                {status}
            </div>
            <div style="text-align: center; margin-top: 8px;">
                ✓ <strong>{completed_count}</strong> abgeschlossen
            </div>
        </div>
    </div>
    """


# ===============================================================
# HAUPT-RENDER-FUNKTIONEN
# ===============================================================

def render_ships(user_id: str, unlocked_islands: List[str]):
    """
    Rendert beide Schiffe wenn Woche 1 (Festung) freigeschaltet ist.

    Args:
        user_id: Die User-ID
        unlocked_islands: Liste der freigeschalteten Inseln
    """
    # Schiffe erst ab Woche 1 (Festung) sichtbar
    if "festung" not in unlocked_islands:
        return

    # CSS einbinden
    st.markdown(get_ships_css(), unsafe_allow_html=True)

    # Daten holen
    bandura_data = get_bandura_data(user_id)
    hattie_data = get_hattie_data(user_id)

    # Layout: Bandura links, Platz in Mitte, Hattie rechts
    col_bandura, col_space, col_hattie = st.columns([1, 2, 1])

    with col_bandura:
        st.markdown(render_bandura_ship_html(bandura_data), unsafe_allow_html=True)
        if st.button("🔮 Öffnen", key="open_bandura_ship", use_container_width=True):
            st.session_state.show_bandura_modal = True
            st.rerun()

    with col_hattie:
        st.markdown(render_hattie_ship_html(hattie_data), unsafe_allow_html=True)
        if st.button("🎯 Öffnen", key="open_hattie_ship", use_container_width=True):
            st.session_state.show_hattie_modal = True
            st.rerun()


def render_bandura_modal():
    """Rendert das Bandura-Challenge Modal."""
    if not st.session_state.get("show_bandura_modal", False):
        return False

    # Schließen-Button OBEN - gut sichtbar
    col1, col2, col3 = st.columns([1, 2, 1])
    with col3:
        if st.button("❌ Zurück zur Karte", key="close_bandura_modal", type="primary"):
            st.session_state.show_bandura_modal = False
            st.rerun()

    st.markdown("""
    <div style="background: linear-gradient(135deg, #4a148c 0%, #7b1fa2 100%);
                color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
        <h2 style="margin: 0;">🧠 Bandura-Challenge</h2>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">Die 4 Quellen der Selbstwirksamkeit</p>
    </div>
    """, unsafe_allow_html=True)

    # Bandura-Widget einbinden
    try:
        from utils.bandura_sources_widget import render_bandura_sources_widget
        render_bandura_sources_widget(compact=False, color="#9C27B0")
    except ImportError:
        st.error("Bandura-Widget konnte nicht geladen werden.")

    return True


def render_hattie_modal():
    """Rendert das Hattie-Challenge Modal."""
    if not st.session_state.get("show_hattie_modal", False):
        return False

    # Schließen-Button OBEN - gut sichtbar
    col1, col2, col3 = st.columns([1, 2, 1])
    with col3:
        if st.button("❌ Zurück zur Karte", key="close_hattie_modal", type="primary"):
            st.session_state.show_hattie_modal = False
            st.rerun()

    st.markdown("""
    <div style="background: linear-gradient(135deg, #1565c0 0%, #1976d2 100%);
                color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
        <h2 style="margin: 0;">🎯 Hattie-Challenge</h2>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">Trainiere deine Selbsteinschätzung</p>
    </div>
    """, unsafe_allow_html=True)

    # Hattie-Widget einbinden
    try:
        from utils.hattie_challenge_widget import render_hattie_challenge_widget
        render_hattie_challenge_widget(compact=False, color="#1976d2")
    except ImportError:
        st.error("Hattie-Widget konnte nicht geladen werden.")

    return True

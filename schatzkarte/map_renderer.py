# -*- coding: utf-8 -*-
"""
Rendert die interaktive Schatzkarte mit WOW-Effekten.
"""
import streamlit as st
from .map_data import ISLANDS
from .map_progress import get_unlocked_islands, get_island_status
from .map_styles import get_map_css


def render_streak_box(streak_days: int):
    """Rendert die Streak-Flamme."""
    return f"""
    <div class="streak-box">
        <span class="streak-flame">🔥</span>
        <div class="streak-number">{streak_days} Tage</div>
        <div style="color: white; font-size: 14px;">Lern-Streak!</div>
    </div>
    """


def render_xp_box(xp: int, level: int):
    """Rendert die XP-Anzeige."""
    return f"""
    <div class="xp-box">
        <div style="font-size: 14px; color: #333;">Level {level}</div>
        <div class="xp-number">⭐ {xp:,} XP</div>
    </div>
    """


def render_progress_bar(current: int, total: int):
    """Rendert den Fortschritts-Balken."""
    percent = (current / total) * 100 if total > 0 else 0
    return f"""
    <div class="progress-bar-container">
        <div class="progress-bar-fill" style="width: {percent}%;">
            <span style="color: white; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);">
                {current}/{total} Inseln
            </span>
        </div>
    </div>
    """


def render_island_card(island_id: str, island: dict, status: str, clickable: bool = False):
    """
    Rendert eine einzelne Insel-Karte.

    status: 'locked', 'unlocked', 'current', 'completed'
    clickable: Wenn True, ist die ganze Karte klickbar (triggert den naechsten Button)
    """
    # CSS-Klasse basierend auf Status
    css_class = "island-card"
    if status == "locked":
        css_class += " island-locked"
    elif status == "current":
        css_class += " island-current"
    elif status == "completed":
        css_class += " island-completed"

    # Klickbare Karten bekommen extra Klasse
    if clickable and status != "locked":
        css_class += " island-card-clickable"

    treasure_count = len(island.get("treasures", []))

    # onclick-Handler nur fuer klickbare Karten
    onclick = ""
    if clickable and status != "locked":
        # JavaScript: Finde den Button im naechsten Geschwister-div und klicke ihn
        onclick = f'''onclick="
            var card = this;
            var parent = card.parentElement;
            while(parent && !parent.querySelector('button')) {{
                parent = parent.parentElement;
            }}
            if(parent) {{
                var btn = parent.querySelector('button');
                if(btn) btn.click();
            }}
        "'''

    return f"""
    <div class="{css_class}" {onclick}
         style="background: linear-gradient(135deg, {island['color']}40, {island['color']}20);
                border-left: 6px solid {island['color']};">
        <span class="island-icon">{island['icon']}</span>
        <div style="font-weight: bold; font-size: 15px; margin: 8px 0;">
            {island['name']}
        </div>
        <div style="font-size: 13px; color: #666;">
            💎 {treasure_count} Schaetze
        </div>
    </div>
    """


def render_treasure_item(treasure: dict, collected: bool = False):
    """Rendert ein Schatz-Item."""
    css_class = "treasure-item"
    if collected:
        css_class += " treasure-collected"
    
    check = "✅" if collected else "⬜"
    
    return f"""
    <div class="{css_class}">
        <span class="treasure-icon">{treasure['name'].split()[0]}</span>
        <div style="flex: 1;">
            <div style="font-weight: bold;">{treasure['name']}</div>
            <div style="font-size: 12px; color: #666;">+{treasure.get('xp', 50)} XP</div>
        </div>
        <span style="font-size: 24px;">{check}</span>
    </div>
    """


def render_confetti():
    """Rendert nichts - nutze st.balloons() stattdessen."""
    return ""


def render_xp_popup(xp_amount: int):
    """Rendert XP-Popup Animation."""
    return f"""
    <div class="xp-pop" style="top: 50%; left: 50%;">
        +{xp_amount} XP! ⭐
    </div>
    """


def render_map_title():
    """Rendert den animierten Titel."""
    return """
    <h1 class="title-gradient">
        🗺 Deine Schatzkarte
    </h1>
    """


def render_full_map(user_id: str, completed_islands: list = None):
    """
    Rendert die komplette Schatzkarte.
    
    Returns: HTML-String
    """
    completed_islands = completed_islands or []
    unlocked = get_unlocked_islands(user_id)
    
    html_parts = []
    
    # CSS einbinden
    html_parts.append(get_map_css())
    
    # Confetti-Script
    html_parts.append(render_confetti())
    
    # Titel
    html_parts.append(render_map_title())
    
    # Fortschritt
    html_parts.append(render_progress_bar(len(unlocked), len(ISLANDS)))
    
    # Karten-Container
    html_parts.append('<div class="ocean-bg" style="margin-top: 20px;">')
    html_parts.append('<div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px;">')
    
    for island_id, island in ISLANDS.items():
        # Status bestimmen
        if island_id in completed_islands:
            status = "completed"
        elif island_id == unlocked[-1] if unlocked else False:
            status = "current"
        elif island_id in unlocked:
            status = "unlocked"
        else:
            status = "locked"
        
        html_parts.append(render_island_card(island_id, island, status))
    
    html_parts.append('</div>')  # Grid
    html_parts.append('</div>')  # Ocean
    
    return '\n'.join(html_parts)


# Test
if __name__ == "__main__":
    html = render_full_map("test_user")
    print(f"HTML generiert: {len(html)} Zeichen")

"""
🎮 Gamification UI Components
=============================

Streamlit UI-Komponenten für das Hattie-Challenge Gamification System.
Visualisierung von XP, Levels, Streaks, Badges und Progress.

Inspiriert von:
- Duolingo (XP-Bars, Level-Display)
- GitHub Contribution Graph
- Khan Academy (Badges)
"""

import streamlit as st
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import json

# Badge-Definitionen (Bandura's 4 Quellen)
BADGES = {
    # === MASTERY EXPERIENCES (Eigene Erfolge) ===
    "first_challenge": {
        "name": "Erster Schritt",
        "icon": "🎯",
        "description": "Deine erste Hattie-Challenge abgeschlossen",
        "category": "mastery",
        "condition": lambda s: s.get("total_challenges", 0) >= 1
    },
    "exceeded_3": {
        "name": "Übertreffer",
        "icon": "📈",
        "description": "3x deine Erwartung übertroffen",
        "category": "mastery",
        "condition": lambda s: s.get("times_exceeded", 0) >= 3
    },
    "exceeded_10": {
        "name": "Selbstvertrauen-Booster",
        "icon": "🚀",
        "description": "10x deine Erwartung übertroffen",
        "category": "mastery",
        "condition": lambda s: s.get("times_exceeded", 0) >= 10
    },
    "perfect_prediction": {
        "name": "Punktlandung",
        "icon": "🎯",
        "description": "Exakte Vorhersage getroffen",
        "category": "mastery",
        "condition": lambda s: s.get("exact_predictions", 0) >= 1
    },
    "five_perfect": {
        "name": "Selbstkenner",
        "icon": "🔮",
        "description": "5 exakte Vorhersagen",
        "category": "mastery",
        "condition": lambda s: s.get("exact_predictions", 0) >= 5
    },
    
    # === STREAK BADGES (Konsistenz) ===
    "streak_3": {
        "name": "Dreier-Serie",
        "icon": "🔥",
        "description": "3 Tage in Folge geübt",
        "category": "streak",
        "condition": lambda s: s.get("current_streak", 0) >= 3 or s.get("longest_streak", 0) >= 3
    },
    "streak_7": {
        "name": "Wochenkrieger",
        "icon": "💪",
        "description": "7 Tage in Folge geübt",
        "category": "streak",
        "condition": lambda s: s.get("current_streak", 0) >= 7 or s.get("longest_streak", 0) >= 7
    },
    "streak_14": {
        "name": "Zwei-Wochen-Champion",
        "icon": "🏅",
        "description": "14 Tage in Folge geübt",
        "category": "streak",
        "condition": lambda s: s.get("current_streak", 0) >= 14 or s.get("longest_streak", 0) >= 14
    },
    "streak_30": {
        "name": "Monatsmeister",
        "icon": "👑",
        "description": "30 Tage in Folge geübt",
        "category": "streak",
        "condition": lambda s: s.get("current_streak", 0) >= 30 or s.get("longest_streak", 0) >= 30
    },
    
    # === EFFORT BADGES (Ausdauer) ===
    "ten_challenges": {
        "name": "Zehnkämpfer",
        "icon": "🎖️",
        "description": "10 Challenges abgeschlossen",
        "category": "effort",
        "condition": lambda s: s.get("total_challenges", 0) >= 10
    },
    "twentyfive_challenges": {
        "name": "Viertelhundert",
        "icon": "🌟",
        "description": "25 Challenges abgeschlossen",
        "category": "effort",
        "condition": lambda s: s.get("total_challenges", 0) >= 25
    },
    "fifty_challenges": {
        "name": "Halbhundert-Held",
        "icon": "🏆",
        "description": "50 Challenges abgeschlossen",
        "category": "effort",
        "condition": lambda s: s.get("total_challenges", 0) >= 50
    },
    "hundred_challenges": {
        "name": "Zenturio",
        "icon": "💎",
        "description": "100 Challenges abgeschlossen",
        "category": "effort",
        "condition": lambda s: s.get("total_challenges", 0) >= 100
    },
    
    # === DIVERSITY BADGES (Vielfalt) ===
    "multi_subject_3": {
        "name": "Multitalent",
        "icon": "🌈",
        "description": "In 3 verschiedenen Fächern geübt",
        "category": "diversity",
        "condition": lambda s: s.get("unique_subjects", 0) >= 3
    },
    "multi_subject_5": {
        "name": "Universalgenie",
        "icon": "🌍",
        "description": "In 5+ Fächern geübt",
        "category": "diversity",
        "condition": lambda s: s.get("unique_subjects", 0) >= 5
    },
    
    # === LEVEL BADGES ===
    "level_3": {
        "name": "Lernender",
        "icon": "📚",
        "description": "Level 3 erreicht",
        "category": "level",
        "condition": lambda s: s.get("level", 1) >= 3
    },
    "level_5": {
        "name": "Aufsteiger",
        "icon": "📊",
        "description": "Level 5 erreicht",
        "category": "level",
        "condition": lambda s: s.get("level", 1) >= 5
    },
    "level_8": {
        "name": "Champion",
        "icon": "👑",
        "description": "Höchstes Level erreicht",
        "category": "level",
        "condition": lambda s: s.get("level", 1) >= 8
    },
}

LEVELS = {
    1: {"name": "Anfänger", "icon": "🌱", "min_xp": 0},
    2: {"name": "Entdecker", "icon": "🔍", "min_xp": 100},
    3: {"name": "Lernender", "icon": "📚", "min_xp": 250},
    4: {"name": "Aufsteiger", "icon": "📈", "min_xp": 500},
    5: {"name": "Übertreffer", "icon": "🚀", "min_xp": 1000},
    6: {"name": "Meister", "icon": "🏆", "min_xp": 2000},
    7: {"name": "Experte", "icon": "⭐", "min_xp": 5000},
    8: {"name": "Champion", "icon": "👑", "min_xp": 10000},
}

SUBJECTS = [
    "Mathematik", "Deutsch", "Englisch", "Physik", "Chemie", 
    "Biologie", "Geschichte", "Geographie", "Musik", "Kunst",
    "Sport", "Informatik", "Latein", "Französisch", "Sonstiges"
]

# ============================================
# LEVEL & XP DISPLAY
# ============================================

def render_level_card(level: int, xp: int, compact: bool = False):
    """Zeigt das aktuelle Level mit XP-Progress-Bar."""
    level_info = LEVELS.get(level, LEVELS[1])
    next_level = min(level + 1, 8)
    next_level_info = LEVELS.get(next_level, level_info)
    
    # Progress zum nächsten Level
    current_level_xp = level_info["min_xp"]
    next_level_xp = next_level_info["min_xp"]
    
    if next_level > level:
        progress = (xp - current_level_xp) / max(1, (next_level_xp - current_level_xp))
        xp_to_next = next_level_xp - xp
    else:
        progress = 1.0
        xp_to_next = 0
    
    progress = min(1.0, max(0.0, progress))  # Clamp 0-1
    
    if compact:
        st.markdown(f"""
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white; padding: 12px 16px; border-radius: 12px; 
                    display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 1.8em;">{level_info['icon']}</span>
            <div style="flex: 1;">
                <div style="font-size: 0.85em; opacity: 0.9;">Level {level} · {level_info['name']}</div>
                <div style="background: rgba(255,255,255,0.3); border-radius: 6px; height: 8px; margin-top: 4px;">
                    <div style="background: #fff; width: {progress*100}%; height: 100%; border-radius: 6px;"></div>
                </div>
            </div>
            <div style="text-align: right; font-size: 0.9em;">
                <div style="font-weight: bold;">{xp:,} XP</div>
            </div>
        </div>
        """, unsafe_allow_html=True)
    else:
        st.markdown(f"""
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white; padding: 20px; border-radius: 15px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 15px;">
                <span style="font-size: 3em;">{level_info['icon']}</span>
                <div style="flex: 1;">
                    <div style="font-size: 0.9em; opacity: 0.9;">Level {level}</div>
                    <div style="font-size: 1.4em; font-weight: bold;">{level_info['name']}</div>
                    <div style="font-size: 0.85em; margin-top: 5px;">{xp:,} XP gesammelt</div>
                </div>
            </div>
            <div style="margin-top: 15px;">
                <div style="background: rgba(255,255,255,0.3); border-radius: 10px; height: 12px; overflow: hidden;">
                    <div style="background: #fff; width: {progress*100}%; height: 100%; border-radius: 10px;
                                transition: width 0.5s ease;"></div>
                </div>
                <div style="font-size: 0.8em; margin-top: 5px; opacity: 0.9;">
                    {f'{xp_to_next:,} XP bis Level {next_level}' if xp_to_next > 0 else '🎉 Höchstes Level erreicht!'}
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)

# ============================================
# STREAK DISPLAY
# ============================================

def render_streak_display(current_streak: int, longest_streak: int):
    """Zeigt den aktuellen Streak an."""
    # Streak-Farbe basierend auf Länge
    if current_streak >= 30:
        color = "#e74c3c"
        fire_emoji = "🔥🔥🔥"
        streak_text = "UNGLAUBLICH!"
    elif current_streak >= 14:
        color = "#e67e22"
        fire_emoji = "🔥🔥"
        streak_text = "Fantastisch!"
    elif current_streak >= 7:
        color = "#f39c12"
        fire_emoji = "🔥"
        streak_text = "Super!"
    elif current_streak >= 3:
        color = "#f1c40f"
        fire_emoji = "✨"
        streak_text = "Gut dabei!"
    else:
        color = "#95a5a6"
        fire_emoji = "💤" if current_streak == 0 else "🌱"
        streak_text = "Starte jetzt!" if current_streak == 0 else "Weiter so!"
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown(f"""
        <div style="background: {color}15; border: 2px solid {color}; 
                    padding: 15px; border-radius: 12px; text-align: center;">
            <div style="font-size: 1.8em;">{fire_emoji}</div>
            <div style="font-size: 2.2em; font-weight: bold; color: {color};">{current_streak}</div>
            <div style="font-size: 0.85em; color: #666;">Tage Streak</div>
            <div style="font-size: 0.75em; color: {color}; margin-top: 4px;">{streak_text}</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown(f"""
        <div style="background: #f8f9fa; border: 2px solid #dee2e6;
                    padding: 15px; border-radius: 12px; text-align: center;">
            <div style="font-size: 1.8em;">🏆</div>
            <div style="font-size: 2.2em; font-weight: bold; color: #495057;">{longest_streak}</div>
            <div style="font-size: 0.85em; color: #666;">Bester Streak</div>
            <div style="font-size: 0.75em; color: #6c757d; margin-top: 4px;">Dein Rekord</div>
        </div>
        """, unsafe_allow_html=True)

# ============================================
# BADGES DISPLAY
# ============================================

def render_badges_showcase(earned_badge_ids: List[str], show_locked: bool = True):
    """Zeigt alle Badges an (verdiente hervorgehoben)."""
    
    categories = {
        "mastery": ("🏆 Meisterschaft", "Durch eigene Erfolge verdient"),
        "streak": ("🔥 Streaks", "Durch Konstanz verdient"),
        "effort": ("💪 Ausdauer", "Durch Durchhaltevermögen verdient"),
        "diversity": ("🌈 Vielfalt", "Durch Abwechslung verdient"),
        "level": ("📊 Level", "Durch Fortschritt verdient"),
    }
    
    for cat_id, (cat_name, cat_desc) in categories.items():
        cat_badges = [(bid, binfo) for bid, binfo in BADGES.items() if binfo["category"] == cat_id]
        
        if not cat_badges:
            continue
            
        st.markdown(f"**{cat_name}**")
        st.caption(cat_desc)
        
        cols = st.columns(min(len(cat_badges), 5))
        
        for i, (badge_id, badge_info) in enumerate(cat_badges):
            with cols[i % 5]:
                earned = badge_id in earned_badge_ids
                
                if earned:
                    bg_color = "#e8f5e9"
                    border_color = "#4caf50"
                    opacity = "1"
                    icon_filter = ""
                else:
                    if not show_locked:
                        continue
                    bg_color = "#f5f5f5"
                    border_color = "#ddd"
                    opacity = "0.4"
                    icon_filter = "filter: grayscale(100%);"
                
                st.markdown(f"""
                <div style="background: {bg_color}; border: 2px solid {border_color};
                            padding: 10px; border-radius: 10px; text-align: center;
                            opacity: {opacity}; margin-bottom: 8px;">
                    <div style="font-size: 1.8em; {icon_filter}">{badge_info['icon']}</div>
                    <div style="font-size: 0.75em; font-weight: bold; margin-top: 4px; 
                                color: {'#2e7d32' if earned else '#999'};">
                        {badge_info['name']}
                    </div>
                </div>
                """, unsafe_allow_html=True)
                
                if earned:
                    st.caption(badge_info['description'])
        
        st.markdown("")  # Spacing

def render_new_badge_celebration(badge_info: Dict):
    """Zeigt eine Feier-Animation für ein neues Badge."""
    st.balloons()
    st.success(f"""
    ### 🎉 Neues Badge freigeschaltet!
    
    ## {badge_info['icon']} {badge_info['name']}
    
    *{badge_info['description']}*
    """)

# ============================================
# CHALLENGE RESULT DISPLAY
# ============================================

def render_challenge_result(result: Dict):
    """Zeigt das Ergebnis einer Challenge an."""
    outcome = result.get("outcome", "below")
    prediction = result.get("prediction", 0)
    actual = result.get("actual_result", 0)
    xp = result.get("xp_earned", 0)
    streak = result.get("streak", 0)
    level_up = result.get("level_up", False)
    
    # Level-Up Celebration
    if level_up:
        st.balloons()
        st.success("### 🎉 LEVEL UP!")
    
    # Outcome-spezifische Darstellung
    if outcome == "exceeded":
        st.markdown(f"""
        <div style="background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
                    color: white; padding: 25px; border-radius: 15px; text-align: center;">
            <div style="font-size: 3em;">🚀</div>
            <h2 style="margin: 10px 0;">ÜBERTROFFEN!</h2>
            <p style="font-size: 1.2em; opacity: 0.95;">
                Du hast <strong>{actual}</strong> geschafft – mehr als deine Schätzung von <strong>{prediction}</strong>!
            </p>
            <div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 8px; margin-top: 15px;">
                <span style="font-size: 1.5em;">+{xp} XP</span>
                {f' · 🔥 {streak} Tage Streak!' if streak >= 3 else ''}
            </div>
        </div>
        """, unsafe_allow_html=True)
        
        st.info("""
        **💡 Das passiert gerade in deinem Gehirn:**
        
        Dein Gehirn speichert: *"Ich kann mehr, als ich dachte!"*
        Das ist der stärkste Weg, Selbstwirksamkeit aufzubauen (Bandura: Mastery Experience).
        """)
        
    elif outcome == "exact":
        st.markdown(f"""
        <div style="background: linear-gradient(135deg, #2196F3 0%, #03A9F4 100%);
                    color: white; padding: 25px; border-radius: 15px; text-align: center;">
            <div style="font-size: 3em;">🎯</div>
            <h2 style="margin: 10px 0;">PUNKTLANDUNG!</h2>
            <p style="font-size: 1.2em; opacity: 0.95;">
                Exakt <strong>{actual}</strong> – genau wie vorhergesagt!
            </p>
            <div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 8px; margin-top: 15px;">
                <span style="font-size: 1.5em;">+{xp} XP</span>
                {f' · 🔥 {streak} Tage Streak!' if streak >= 3 else ''}
            </div>
        </div>
        """, unsafe_allow_html=True)
        
        st.info("""
        **💡 Das zeigt echte Selbstkenntnis!**
        
        Du weißt genau, was du kannst. Das ist eine wichtige Fähigkeit für 
        realistische Zielsetzung und strategisches Lernen.
        """)
        
    else:  # below
        st.markdown(f"""
        <div style="background: linear-gradient(135deg, #FF9800 0%, #FFC107 100%);
                    color: white; padding: 25px; border-radius: 15px; text-align: center;">
            <div style="font-size: 3em;">🤔</div>
            <h2 style="margin: 10px 0;">Knapp daneben</h2>
            <p style="font-size: 1.2em; opacity: 0.95;">
                Du hast <strong>{actual}</strong> geschafft – deine Schätzung war <strong>{prediction}</strong>.
            </p>
            <div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 8px; margin-top: 15px;">
                <span style="font-size: 1.5em;">+{xp} XP</span>
                {f' · 🔥 {streak} Tage Streak!' if streak >= 3 else ''}
            </div>
        </div>
        """, unsafe_allow_html=True)
        
        st.warning("""
        **💡 Das ist KEIN Misserfolg!**
        
        Du hast geübt und XP gesammelt. Frag dich:
        - War die Aufgabe schwerer als gedacht?
        - Was würdest du beim nächsten Mal anders machen?
        - War deine Schätzung vielleicht zu optimistisch?
        
        *Jede Challenge macht dich besser im Einschätzen!*
        """)

# ============================================
# STATS OVERVIEW
# ============================================

def render_stats_overview(stats: Dict):
    """Zeigt eine Übersicht der wichtigsten Statistiken."""
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric(
            label="Challenges",
            value=stats.get("total_challenges", 0),
            help="Abgeschlossene Hattie-Challenges"
        )
    
    with col2:
        st.metric(
            label="Übertroffen",
            value=stats.get("times_exceeded", 0),
            help="Wie oft du deine Erwartung übertroffen hast"
        )
    
    with col3:
        success_rate = stats.get("success_rate", 0)
        st.metric(
            label="Erfolgsquote",
            value=f"{success_rate}%",
            help="Übertroffen + Exakt / Gesamt"
        )
    
    with col4:
        st.metric(
            label="Fächer",
            value=stats.get("unique_subjects", 0),
            help="Verschiedene Fächer geübt"
        )

# ============================================
# CHALLENGE HISTORY
# ============================================

def render_challenge_history(challenges: List[Dict], limit: int = 5):
    """Zeigt die letzten Challenges als Timeline."""
    if not challenges:
        st.info("Noch keine Challenges abgeschlossen. Starte jetzt!")
        return
    
    st.markdown("**📜 Letzte Challenges:**")
    
    for challenge in challenges[:limit]:
        outcome = challenge.get("outcome", "")
        
        if outcome == "exceeded":
            icon = "🚀"
            color = "#4CAF50"
        elif outcome == "exact":
            icon = "🎯"
            color = "#2196F3"
        elif outcome == "below":
            icon = "🤔"
            color = "#FF9800"
        else:
            icon = "⏳"
            color = "#9E9E9E"
        
        date = challenge.get("challenge_date", "")
        subject = challenge.get("subject", "")
        prediction = challenge.get("prediction", 0)
        actual = challenge.get("actual_result", "?")
        xp = challenge.get("xp_earned", 0)
        
        st.markdown(f"""
        <div style="display: flex; align-items: center; gap: 12px; padding: 8px 12px;
                    background: {color}10; border-left: 3px solid {color}; 
                    border-radius: 0 8px 8px 0; margin-bottom: 8px;">
            <span style="font-size: 1.3em;">{icon}</span>
            <div style="flex: 1;">
                <strong>{subject}</strong>
                <span style="color: #666; font-size: 0.85em;"> · {date}</span>
            </div>
            <div style="text-align: right; font-size: 0.9em;">
                <span style="color: #666;">Schätzung: {prediction}</span>
                <span style="color: {color}; font-weight: bold;"> → {actual}</span>
            </div>
            <div style="background: {color}20; padding: 2px 8px; border-radius: 4px; font-size: 0.8em;">
                +{xp} XP
            </div>
        </div>
        """, unsafe_allow_html=True)

# ============================================
# ACTIVITY HEATMAP (GitHub-Style)
# ============================================

def render_activity_heatmap(activity_data: List[Dict], weeks: int = 12):
    """Zeigt eine GitHub-Style Activity Heatmap."""
    # Erstelle ein Dictionary mit Aktivitäten pro Tag
    activity_dict = {a['challenge_date']: a['count'] for a in activity_data}
    
    # Generiere die letzten N Wochen
    today = datetime.now().date()
    start_date = today - timedelta(days=weeks * 7)
    
    # Berechne den Start (Montag der ersten Woche)
    days_since_monday = start_date.weekday()
    start_date = start_date - timedelta(days=days_since_monday)
    
    # HTML für Heatmap
    html_rows = []
    
    # Wochentage-Labels
    day_labels = ["Mo", "", "Mi", "", "Fr", "", "So"]
    
    html = '<div style="display: flex; gap: 2px; font-family: -apple-system, sans-serif;">'
    
    # Day labels column
    html += '<div style="display: flex; flex-direction: column; gap: 2px; margin-right: 4px;">'
    for label in day_labels:
        html += f'<div style="width: 20px; height: 12px; font-size: 9px; color: #666; text-align: right;">{label}</div>'
    html += '</div>'
    
    # Weeks
    current_date = start_date
    for week in range(weeks):
        html += '<div style="display: flex; flex-direction: column; gap: 2px;">'
        for day in range(7):
            date_str = current_date.strftime("%Y-%m-%d")
            count = activity_dict.get(date_str, 0)
            
            # Farbe basierend auf Aktivität
            if current_date > today:
                color = "#f6f8fa"  # Zukunft
            elif count == 0:
                color = "#ebedf0"
            elif count == 1:
                color = "#9be9a8"
            elif count <= 3:
                color = "#40c463"
            else:
                color = "#30a14e"
            
            html += f'<div style="width: 12px; height: 12px; background: {color}; border-radius: 2px;" title="{date_str}: {count} Challenge(s)"></div>'
            current_date += timedelta(days=1)
        html += '</div>'
    
    html += '</div>'
    
    # Legende
    html += '''
    <div style="display: flex; align-items: center; gap: 4px; margin-top: 8px; font-size: 11px; color: #666;">
        <span>Weniger</span>
        <div style="width: 12px; height: 12px; background: #ebedf0; border-radius: 2px;"></div>
        <div style="width: 12px; height: 12px; background: #9be9a8; border-radius: 2px;"></div>
        <div style="width: 12px; height: 12px; background: #40c463; border-radius: 2px;"></div>
        <div style="width: 12px; height: 12px; background: #30a14e; border-radius: 2px;"></div>
        <span>Mehr</span>
    </div>
    '''
    
    st.markdown(html, unsafe_allow_html=True)

"""
🎮 Pulse of Learning - Gamification Utils
==========================================

Enthält alle Module für das Hattie-Challenge Gamification System.

Module:
- gamification_db: SQLite-Datenbankschicht
- gamification_ui: Streamlit UI-Komponenten
- hattie_challenge_widget: Haupt-Widget für Integration

Verwendung:
    from utils.hattie_challenge_widget import render_hattie_challenge_widget
    render_hattie_challenge_widget()
"""

from .gamification_db import (
    init_database,
    get_or_create_user,
    create_challenge,
    complete_challenge,
    get_user_stats,
    get_user_challenges,
    get_open_challenges,
    get_user_badges,
    check_and_award_badges,
    get_activity_heatmap,
    calculate_level,
    get_level_info,
    XP_CONFIG,
    LEVELS
)

from .gamification_ui import (
    render_level_card,
    render_streak_display,
    render_badges_showcase,
    render_challenge_result,
    render_stats_overview,
    render_challenge_history,
    render_activity_heatmap,
    render_new_badge_celebration,
    BADGES,
    SUBJECTS
)

from .hattie_challenge_widget import render_hattie_challenge_widget

__all__ = [
    # Database
    'init_database',
    'get_or_create_user',
    'create_challenge',
    'complete_challenge',
    'get_user_stats',
    'get_user_challenges',
    'get_open_challenges',
    'get_user_badges',
    'check_and_award_badges',
    'get_activity_heatmap',
    'calculate_level',
    'get_level_info',
    'XP_CONFIG',
    'LEVELS',
    
    # UI
    'render_level_card',
    'render_streak_display',
    'render_badges_showcase',
    'render_challenge_result',
    'render_stats_overview',
    'render_challenge_history',
    'render_activity_heatmap',
    'render_new_badge_celebration',
    'BADGES',
    'SUBJECTS',
    
    # Widget
    'render_hattie_challenge_widget',
]

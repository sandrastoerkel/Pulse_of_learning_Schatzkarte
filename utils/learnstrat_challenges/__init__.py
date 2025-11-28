"""
🎓 Lernstrategie Challenges Package
===================================

Gamifizierte Lernstrategie-Challenges für die Pulse of Learning App.

Challenges:
1. Die 7 Powertechniken (wissenschaftlich fundierte Lerntechniken) ✅
2. Das Geheimnis der Überflieger (Transfer-Strategien) ✅
3. Die Birkenbihl-Methode ✅
"""

# Challenge 1: Powertechniken
from .challenge_content import (
    POWERTECHNIKEN,
    CHALLENGE_XP,
    LEARNSTRAT_BADGES,
    CERTIFICATE_TEXTS,
    EFFECT_SIZES,
    get_technique_content,
    get_all_techniques_for_age,
    get_technique_names,
    get_technique_icons,
    get_technique_by_order,
)

from .powertechniken_widget import (
    render_powertechniken_challenge,
    init_learnstrat_tables,
    save_technique_progress,
    save_top3_preferences,
    get_user_learnstrat_progress,
    get_user_top3,
)

# Challenge 2: Transfer
from .transfer_content import (
    TRANSFER_XP,
    TRANSFER_BADGES,
    TRANSFER_CERTIFICATE,
    TRANSFER_EFFECT_SIZE,
    get_transfer_content_for_age,
    get_phase_content,
)

from .transfer_widget import (
    render_transfer_challenge,
    save_transfer_progress,
    get_transfer_progress,
)

# Challenge 3: Birkenbihl
from .birkenbihl_content import (
    BIRKENBIHL_XP,
    BIRKENBIHL_BADGES,
    BIRKENBIHL_CERTIFICATE,
    BIRKENBIHL_INFO,
    get_birkenbihl_content_for_age,
    get_birkenbihl_phase_content,
)

from .birkenbihl_widget import (
    render_birkenbihl_challenge,
    save_birkenbihl_progress,
    get_birkenbihl_progress,
)

__all__ = [
    # Challenge 1: Powertechniken Content
    "POWERTECHNIKEN",
    "CHALLENGE_XP",
    "LEARNSTRAT_BADGES",
    "CERTIFICATE_TEXTS",
    "EFFECT_SIZES",
    "get_technique_content",
    "get_all_techniques_for_age",
    "get_technique_names",
    "get_technique_icons",
    "get_technique_by_order",
    # Challenge 1: Powertechniken Widget
    "render_powertechniken_challenge",
    "init_learnstrat_tables",
    "save_technique_progress",
    "save_top3_preferences",
    "get_user_learnstrat_progress",
    "get_user_top3",
    # Challenge 2: Transfer Content
    "TRANSFER_XP",
    "TRANSFER_BADGES",
    "TRANSFER_CERTIFICATE",
    "TRANSFER_EFFECT_SIZE",
    "get_transfer_content_for_age",
    "get_phase_content",
    # Challenge 2: Transfer Widget
    "render_transfer_challenge",
    "save_transfer_progress",
    "get_transfer_progress",
    # Challenge 3: Birkenbihl Content
    "BIRKENBIHL_XP",
    "BIRKENBIHL_BADGES",
    "BIRKENBIHL_CERTIFICATE",
    "BIRKENBIHL_INFO",
    "get_birkenbihl_content_for_age",
    "get_birkenbihl_phase_content",
    # Challenge 3: Birkenbihl Widget
    "render_birkenbihl_challenge",
    "save_birkenbihl_progress",
    "get_birkenbihl_progress",
]

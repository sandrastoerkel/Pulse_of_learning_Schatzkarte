"""
Ressourcen Module Package.

Enthält ausgelagerten Code für die Ressourcen-Seite.
"""

from utils.ressourcen.content_database import CONTENT_DATABASE
from utils.ressourcen.helpers import (
    embed_youtube,
    render_video_section,
    render_tipps_section,
    render_wissenschaft_section
)
from utils.ressourcen.matheff_content import render_matheff_altersstufen

__all__ = [
    'CONTENT_DATABASE',
    'embed_youtube',
    'render_video_section',
    'render_tipps_section',
    'render_wissenschaft_section',
    'render_matheff_altersstufen',
]

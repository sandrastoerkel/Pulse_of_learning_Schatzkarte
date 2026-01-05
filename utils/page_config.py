# -*- coding: utf-8 -*-
"""
Zentrale Seiten-Konfiguration
=============================

Ermöglicht dynamische Seitenpfad-Ermittlung, sodass die Reihenfolge
der Seiten geändert werden kann, ohne Code-Änderungen vornehmen zu müssen.

Verwendung:
    from utils.page_config import get_page_path, PAGE_KEYS

    st.switch_page(get_page_path("ressourcen"))
    st.page_link(get_page_path("schatzkarte"), label="Zur Schatzkarte")
"""

from pathlib import Path
from typing import Optional
import glob

# Basis-Pfad zum pages-Ordner
PAGES_DIR = Path(__file__).parent.parent / "pages"

# Seiten-Schlüssel (Emoji + Name ohne Nummer)
# Diese werden verwendet, um die Dateien zu finden
PAGE_PATTERNS = {
    "schatzkarte": "🗺️_Schatzkarte",
    "ressourcen": "📚_Ressourcen",
    "elternakademie": "🎓_Elternakademie",
    "screening": "🔍_Screening_Diagnostik",
    "auswertung": "📊_Auswertung",
    "pisa": "📖_PISA_Forschungsgrundlage",
    "lerngruppen": "👥_Lerngruppen",
    "admin": "🔐_Admin",
}

# Cache für gefundene Pfade (Performance)
_path_cache = {}


def get_page_path(page_key: str) -> Optional[str]:
    """
    Ermittelt den aktuellen Pfad einer Seite anhand ihres Schlüssels.

    Args:
        page_key: Schlüssel der Seite (z.B. "ressourcen", "schatzkarte")

    Returns:
        Relativer Pfad zur Seite (z.B. "pages/2_📚_Ressourcen.py")
        oder None wenn nicht gefunden

    Beispiel:
        >>> get_page_path("ressourcen")
        "pages/2_📚_Ressourcen.py"
    """
    # Normalisiere Key
    key = page_key.lower().strip()

    # Cache prüfen
    if key in _path_cache:
        return _path_cache[key]

    # Pattern für diese Seite holen
    pattern = PAGE_PATTERNS.get(key)
    if not pattern:
        print(f"Warnung: Unbekannter Seiten-Schlüssel '{page_key}'")
        return None

    # Datei suchen (mit beliebiger Nummer am Anfang)
    search_pattern = str(PAGES_DIR / f"*_{pattern}.py")
    matches = glob.glob(search_pattern)

    if not matches:
        # Fallback: Suche ohne Emoji (falls Encoding-Probleme)
        simple_name = pattern.split("_", 1)[-1] if "_" in pattern else pattern
        search_pattern = str(PAGES_DIR / f"*_*_{simple_name}.py")
        matches = glob.glob(search_pattern)

    if matches:
        # Nimm den ersten Treffer und konvertiere zu relativem Pfad
        found_path = Path(matches[0])
        relative_path = f"pages/{found_path.name}"
        _path_cache[key] = relative_path
        return relative_path

    print(f"Warnung: Seite '{page_key}' nicht gefunden (Pattern: {pattern})")
    return None


def clear_cache():
    """Leert den Pfad-Cache (nötig nach Umbenennung von Dateien)."""
    global _path_cache
    _path_cache = {}


def get_all_pages() -> dict:
    """
    Gibt alle verfügbaren Seiten mit ihren aktuellen Pfaden zurück.

    Returns:
        Dict mit {schlüssel: pfad}
    """
    clear_cache()
    return {key: get_page_path(key) for key in PAGE_PATTERNS.keys()}


# Verfügbare Schlüssel für einfachen Import
PAGE_KEYS = list(PAGE_PATTERNS.keys())

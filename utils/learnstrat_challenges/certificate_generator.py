"""
🎓 Certificate Generator
========================

Generiert schöne Zertifikate als Bilder mit PIL/Pillow.
Löst das HTML-Rendering-Problem in Streamlit.

Verwendung:
    from certificate_generator import generate_powertechniken_certificate, generate_transfer_certificate

    # Zertifikat generieren
    img = generate_powertechniken_certificate(
        user_name="Max Mustermann",
        top3=["active_recall", "spaced_repetition", "feynman"],
        total_xp=285
    )

    # In Streamlit anzeigen
    st.image(img, use_container_width=True)

Quellen:
- GeeksforGeeks: Create Certificates using Python-PIL
- Medium: Build your own certificate generator with python
"""

from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
from datetime import datetime
from typing import List, Optional, Tuple
import os

# ============================================
# FARBEN (als RGB Tuples)
# ============================================

COLORS = {
    # Powertechniken Theme (Gold/Amber)
    "gold_light": (254, 243, 199),      # #fef3c7
    "gold_medium": (253, 230, 138),     # #fde68a
    "gold_dark": (217, 119, 6),         # #d97706
    "gold_text": (146, 64, 14),         # #92400e
    "gold_subtitle": (180, 83, 9),      # #b45309
    "gold_body": (120, 53, 15),         # #78350f

    # Transfer Theme (Pink/Purple)
    "purple_light": (250, 232, 255),    # #fae8ff
    "purple_medium": (245, 208, 254),   # #f5d0fe
    "purple_dark": (168, 85, 247),      # #a855f7
    "purple_text": (107, 33, 168),      # #6b21a8

    # Birkenbihl Theme (Deep Violet/Indigo)
    "violet_light": (237, 233, 254),    # #ede9fe
    "violet_medium": (221, 214, 254),   # #ddd6fe
    "violet_dark": (124, 58, 237),      # #7c3aed
    "violet_text": (91, 33, 182),       # #5b21b6
    "violet_body": (76, 29, 149),       # #4c1d95

    # Allgemein
    "white": (255, 255, 255),
    "black": (0, 0, 0),
    "gray": (107, 114, 128),            # #6b7280
}

# ============================================
# TECHNIK NAMEN UND ICONS (für Text)
# ============================================

TECHNIQUE_DISPLAY = {
    # Powertechniken
    "pomodoro": ("Pomodoro-Technik", "🍅"),
    "active_recall": ("Active Recall", "🔄"),
    "retrieval_practice": ("Retrieval Practice", "⚡"),
    "feynman": ("Feynman-Methode", "👶"),
    "spaced_repetition": ("Spaced Repetition", "📅"),
    "teaching": ("Lernen durch Lehren", "👥"),
    "loci": ("Loci-Methode", "🏰"),
    "interleaving": ("Interleaving", "🔀"),
}

# ============================================
# HELPER FUNCTIONS
# ============================================

def get_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    """Lädt eine Schriftart. Fallback auf Default wenn nicht verfügbar."""
    # Versuche verschiedene System-Fonts
    font_paths = [
        # macOS
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/SFNSText.ttf",
        "/Library/Fonts/Arial.ttf",
        # Linux
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        # Windows
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeui.ttf",
    ]

    if bold:
        bold_paths = [
            "/System/Library/Fonts/Helvetica.ttc",
            "/Library/Fonts/Arial Bold.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "C:/Windows/Fonts/arialbd.ttf",
        ]
        font_paths = bold_paths + font_paths

    for path in font_paths:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except:
                continue

    # Fallback auf Default-Font
    return ImageFont.load_default()

def draw_rounded_rect(draw: ImageDraw.Draw, xy: Tuple, radius: int, fill: Tuple, outline: Tuple = None, width: int = 0):
    """Zeichnet ein Rechteck mit abgerundeten Ecken."""
    x1, y1, x2, y2 = xy

    # Hauptrechteck
    draw.rectangle([x1 + radius, y1, x2 - radius, y2], fill=fill)
    draw.rectangle([x1, y1 + radius, x2, y2 - radius], fill=fill)

    # Ecken
    draw.ellipse([x1, y1, x1 + 2*radius, y1 + 2*radius], fill=fill)
    draw.ellipse([x2 - 2*radius, y1, x2, y1 + 2*radius], fill=fill)
    draw.ellipse([x1, y2 - 2*radius, x1 + 2*radius, y2], fill=fill)
    draw.ellipse([x2 - 2*radius, y2 - 2*radius, x2, y2], fill=fill)

    if outline and width:
        # Rahmen zeichnen (vereinfacht)
        draw.rounded_rectangle(xy, radius, outline=outline, width=width)

def create_gradient_background(width: int, height: int, color1: Tuple, color2: Tuple) -> Image.Image:
    """Erstellt einen Hintergrund mit vertikalem Farbverlauf."""
    img = Image.new('RGB', (width, height))

    for y in range(height):
        ratio = y / height
        r = int(color1[0] * (1 - ratio) + color2[0] * ratio)
        g = int(color1[1] * (1 - ratio) + color2[1] * ratio)
        b = int(color1[2] * (1 - ratio) + color2[2] * ratio)

        for x in range(width):
            img.putpixel((x, y), (r, g, b))

    return img

def center_text(draw: ImageDraw.Draw, text: str, font: ImageFont.FreeTypeFont, y: int, width: int, fill: Tuple):
    """Zeichnet zentrierten Text."""
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    x = (width - text_width) // 2
    draw.text((x, y), text, font=font, fill=fill)

# ============================================
# POWERTECHNIKEN ZERTIFIKAT
# ============================================

def generate_powertechniken_certificate(
    user_name: str,
    top3: List[str],
    total_xp: int,
    date: Optional[str] = None
) -> Image.Image:
    """
    Generiert ein schönes Powertechniken-Zertifikat als Bild.

    Args:
        user_name: Name des Users
        top3: Liste der Top 3 Technik-Keys
        total_xp: Gesamte verdiente XP
        date: Optional, Datum (default: heute)

    Returns:
        PIL Image object
    """
    # Bildgröße (A4-ähnlich, aber für Bildschirm optimiert)
    width, height = 800, 600

    # Hintergrund mit Gradient
    img = create_gradient_background(width, height, COLORS["gold_light"], COLORS["gold_medium"])
    draw = ImageDraw.Draw(img)

    # Rahmen
    border_width = 8
    draw.rectangle(
        [border_width, border_width, width - border_width, height - border_width],
        outline=COLORS["gold_dark"],
        width=border_width
    )

    # Innerer Rahmen (dekorativ)
    inner_margin = 25
    draw.rectangle(
        [inner_margin, inner_margin, width - inner_margin, height - inner_margin],
        outline=COLORS["gold_dark"],
        width=2
    )

    # Fonts laden
    font_title = get_font(48, bold=True)
    font_subtitle = get_font(24)
    font_name = get_font(36, bold=True)
    font_body = get_font(18)
    font_small = get_font(14)
    font_tech = get_font(20)

    # === HEADER ===
    y_pos = 50

    # Trophäe-Emoji als Text (links oben)
    draw.text((40, 35), "🏆", font=get_font(40), fill=COLORS["gold_dark"])

    # Trophäe-Emoji als Text (rechts oben)
    draw.text((width - 80, 35), "🎓", font=get_font(40), fill=COLORS["gold_dark"])

    # Titel
    center_text(draw, "ZERTIFIKAT", font_title, y_pos, width, COLORS["gold_text"])
    y_pos += 60

    # Untertitel
    center_text(draw, "Lerntechniken-Entdecker", font_subtitle, y_pos, width, COLORS["gold_subtitle"])
    y_pos += 50

    # === BESTÄTIGUNG ===
    center_text(draw, "Hiermit wird bestätigt, dass", font_body, y_pos, width, COLORS["gold_body"])
    y_pos += 35

    # Name (groß und prominent)
    center_text(draw, user_name, font_name, y_pos, width, COLORS["gold_text"])
    y_pos += 50

    center_text(draw, "erfolgreich die 7 Powertechniken kennengelernt hat!", font_body, y_pos, width, COLORS["gold_body"])
    y_pos += 45

    # === TOP 3 BOX ===
    box_margin = 150
    box_top = y_pos
    box_bottom = y_pos + 120

    # Weißer Hintergrund für Top 3
    draw.rounded_rectangle(
        [box_margin, box_top, width - box_margin, box_bottom],
        radius=15,
        fill=COLORS["white"],
        outline=COLORS["gold_dark"],
        width=2
    )

    # Top 3 Header
    center_text(draw, "Meine Top 3 Lerntechniken:", font_body, box_top + 10, width, COLORS["gold_text"])

    # Top 3 Techniken
    tech_y = box_top + 40
    for i, tech_key in enumerate(top3[:3], 1):
        tech_name, tech_icon = TECHNIQUE_DISPLAY.get(tech_key, (tech_key, "📚"))
        tech_text = f"{i}. {tech_icon} {tech_name}"
        center_text(draw, tech_text, font_tech, tech_y, width, COLORS["gold_body"])
        tech_y += 25

    y_pos = box_bottom + 20

    # === STATS ===
    stats_y = y_pos + 10

    # XP
    xp_x = width // 3
    draw.text((xp_x - 40, stats_y), "Verdiente XP", font=font_small, fill=COLORS["gold_text"])
    draw.text((xp_x - 20, stats_y + 18), f"{total_xp} XP", font=font_name, fill=COLORS["gold_dark"])

    # Datum
    if not date:
        date = datetime.now().strftime("%d.%m.%Y")

    date_x = 2 * width // 3
    draw.text((date_x - 20, stats_y), "Datum", font=font_small, fill=COLORS["gold_text"])
    draw.text((date_x - 30, stats_y + 18), date, font=font_subtitle, fill=COLORS["gold_body"])

    # === FOOTER ===
    footer_y = height - 50

    # Trennlinie
    draw.line([(100, footer_y - 15), (width - 100, footer_y - 15)], fill=COLORS["gold_dark"], width=2)

    # Footer Text
    center_text(draw, "🧠 Pulse of Learning – Wissenschaftlich fundiert lernen", font_small, footer_y, width, COLORS["gold_text"])

    return img

# ============================================
# TRANSFER ZERTIFIKAT
# ============================================

def generate_transfer_certificate(
    user_name: str,
    total_xp: int,
    date: Optional[str] = None
) -> Image.Image:
    """
    Generiert ein schönes Transfer-Zertifikat als Bild.

    Args:
        user_name: Name des Users
        total_xp: Gesamte verdiente XP
        date: Optional, Datum (default: heute)

    Returns:
        PIL Image object
    """
    # Bildgröße
    width, height = 800, 550

    # Hintergrund mit Gradient (Pink/Purple Theme)
    img = create_gradient_background(width, height, COLORS["purple_light"], COLORS["purple_medium"])
    draw = ImageDraw.Draw(img)

    # Rahmen
    border_width = 8
    draw.rectangle(
        [border_width, border_width, width - border_width, height - border_width],
        outline=COLORS["purple_dark"],
        width=border_width
    )

    # Innerer Rahmen
    inner_margin = 25
    draw.rectangle(
        [inner_margin, inner_margin, width - inner_margin, height - inner_margin],
        outline=COLORS["purple_dark"],
        width=2
    )

    # Fonts laden
    font_title = get_font(48, bold=True)
    font_subtitle = get_font(24)
    font_name = get_font(36, bold=True)
    font_body = get_font(18)
    font_small = get_font(14)
    font_skill = get_font(18)

    # === HEADER ===
    y_pos = 50

    # Emojis
    draw.text((40, 35), "🚀", font=get_font(40), fill=COLORS["purple_dark"])
    draw.text((width - 80, 35), "🏆", font=get_font(40), fill=COLORS["purple_dark"])

    # Titel
    center_text(draw, "ZERTIFIKAT", font_title, y_pos, width, COLORS["purple_text"])
    y_pos += 60

    # Untertitel
    center_text(draw, "Transfer-Meister", font_subtitle, y_pos, width, COLORS["purple_dark"])
    y_pos += 50

    # === BESTÄTIGUNG ===
    center_text(draw, "Hiermit wird bestätigt, dass", font_body, y_pos, width, COLORS["purple_text"])
    y_pos += 35

    # Name
    center_text(draw, user_name, font_name, y_pos, width, COLORS["purple_text"])
    y_pos += 50

    center_text(draw, "das Geheimnis der Überflieger entdeckt hat!", font_body, y_pos, width, COLORS["purple_text"])
    y_pos += 45

    # === SKILLS BOX ===
    box_margin = 150
    box_top = y_pos
    box_bottom = y_pos + 100

    draw.rounded_rectangle(
        [box_margin, box_top, width - box_margin, box_bottom],
        radius=15,
        fill=COLORS["white"],
        outline=COLORS["purple_dark"],
        width=2
    )

    # Skills Header
    center_text(draw, "Erlernte Fähigkeiten:", font_body, box_top + 10, width, COLORS["purple_text"])

    # Skills
    skills = ["✅ Near Transfer beherrscht", "✅ Far Transfer gewagt", "✅ Brückenprinzipien erkannt"]
    skill_y = box_top + 35
    for skill in skills:
        center_text(draw, skill, font_skill, skill_y, width, COLORS["purple_text"])
        skill_y += 22

    y_pos = box_bottom + 20

    # === STATS ===
    stats_y = y_pos + 5

    # XP
    xp_x = width // 4
    draw.text((xp_x - 40, stats_y), "Verdiente XP", font=font_small, fill=COLORS["purple_text"])
    draw.text((xp_x - 20, stats_y + 18), f"{total_xp} XP", font=font_name, fill=COLORS["purple_dark"])

    # Effektstärke
    effect_x = width // 2
    draw.text((effect_x - 50, stats_y), "Effektstärke gelernt", font=font_small, fill=COLORS["purple_text"])
    draw.text((effect_x - 20, stats_y + 18), "d=0.86", font=font_name, fill=COLORS["purple_dark"])

    # Datum
    if not date:
        date = datetime.now().strftime("%d.%m.%Y")

    date_x = 3 * width // 4
    draw.text((date_x - 20, stats_y), "Datum", font=font_small, fill=COLORS["purple_text"])
    draw.text((date_x - 30, stats_y + 18), date, font=font_subtitle, fill=COLORS["purple_text"])

    # === FOOTER ===
    footer_y = height - 45

    # Trennlinie
    draw.line([(100, footer_y - 15), (width - 100, footer_y - 15)], fill=COLORS["purple_dark"], width=2)

    # Footer Text
    center_text(draw, "🧠 Pulse of Learning – Das Geheimnis der Überflieger", font_small, footer_y, width, COLORS["purple_text"])

    return img

# ============================================
# BIRKENBIHL ZERTIFIKAT
# ============================================

def generate_birkenbihl_certificate(
    user_name: str,
    total_xp: int,
    date: Optional[str] = None
) -> Image.Image:
    """
    Generiert ein schönes Birkenbihl-Zertifikat als Bild.

    Args:
        user_name: Name des Users
        total_xp: Gesamte verdiente XP
        date: Optional, Datum (default: heute)

    Returns:
        PIL Image object
    """
    # Bildgröße
    width, height = 800, 600

    # Hintergrund mit Gradient (Violet Theme)
    img = create_gradient_background(width, height, COLORS["violet_light"], COLORS["violet_medium"])
    draw = ImageDraw.Draw(img)

    # Rahmen
    border_width = 8
    draw.rectangle(
        [border_width, border_width, width - border_width, height - border_width],
        outline=COLORS["violet_dark"],
        width=border_width
    )

    # Innerer Rahmen
    inner_margin = 25
    draw.rectangle(
        [inner_margin, inner_margin, width - inner_margin, height - inner_margin],
        outline=COLORS["violet_dark"],
        width=2
    )

    # Fonts laden
    font_title = get_font(48, bold=True)
    font_subtitle = get_font(24)
    font_name = get_font(36, bold=True)
    font_body = get_font(18)
    font_small = get_font(14)
    font_skill = get_font(18)
    font_quote = get_font(14)

    # === HEADER ===
    y_pos = 45

    # Emojis
    draw.text((40, 30), "🧠", font=get_font(40), fill=COLORS["violet_dark"])
    draw.text((width - 80, 30), "🧵", font=get_font(40), fill=COLORS["violet_dark"])

    # Titel
    center_text(draw, "ZERTIFIKAT", font_title, y_pos, width, COLORS["violet_text"])
    y_pos += 55

    # Untertitel
    center_text(draw, "Birkenbihl-Methode Meister", font_subtitle, y_pos, width, COLORS["violet_dark"])
    y_pos += 45

    # === BESTÄTIGUNG ===
    center_text(draw, "Hiermit wird bestätigt, dass", font_body, y_pos, width, COLORS["violet_text"])
    y_pos += 32

    # Name
    center_text(draw, user_name, font_name, y_pos, width, COLORS["violet_text"])
    y_pos += 45

    center_text(draw, "die Birkenbihl-Methode erfolgreich gemeistert hat!", font_body, y_pos, width, COLORS["violet_text"])
    y_pos += 40

    # === SKILLS BOX ===
    box_margin = 120
    box_top = y_pos
    box_bottom = y_pos + 110

    draw.rounded_rectangle(
        [box_margin, box_top, width - box_margin, box_bottom],
        radius=15,
        fill=COLORS["white"],
        outline=COLORS["violet_dark"],
        width=2
    )

    # Skills Header
    center_text(draw, "Erlernte Fähigkeiten:", font_body, box_top + 8, width, COLORS["violet_text"])

    # Skills
    skills = ["Das Faden-Prinzip verstanden", "Eigene Gedanken notieren", "Wissensnetz aufbauen", "Im Alltag anwenden"]
    skill_y = box_top + 32
    for skill in skills:
        center_text(draw, f"* {skill}", font_skill, skill_y, width, COLORS["violet_body"])
        skill_y += 20

    y_pos = box_bottom + 15

    # === ZITAT ===
    quote = "Nicht aufschreiben was der andere sagt - sondern was DU denkst!"
    center_text(draw, f'"{quote}"', font_quote, y_pos, width, COLORS["violet_dark"])
    center_text(draw, "– Vera F. Birkenbihl", font_small, y_pos + 18, width, COLORS["violet_body"])
    y_pos += 45

    # === STATS ===
    stats_y = y_pos

    # XP
    xp_x = width // 3
    draw.text((xp_x - 40, stats_y), "Verdiente XP", font=font_small, fill=COLORS["violet_text"])
    draw.text((xp_x - 20, stats_y + 18), f"{total_xp} XP", font=font_name, fill=COLORS["violet_dark"])

    # Datum
    if not date:
        date = datetime.now().strftime("%d.%m.%Y")

    date_x = 2 * width // 3
    draw.text((date_x - 20, stats_y), "Datum", font=font_small, fill=COLORS["violet_text"])
    draw.text((date_x - 30, stats_y + 18), date, font=font_subtitle, fill=COLORS["violet_body"])

    # === FOOTER ===
    footer_y = height - 45

    # Trennlinie
    draw.line([(100, footer_y - 15), (width - 100, footer_y - 15)], fill=COLORS["violet_dark"], width=2)

    # Footer Text
    center_text(draw, "🧠 Pulse of Learning – Die Birkenbihl-Methode", font_small, footer_y, width, COLORS["violet_text"])

    return img

# ============================================
# IMAGE TO BYTES (für Streamlit)
# ============================================

def image_to_bytes(img: Image.Image) -> BytesIO:
    """Konvertiert ein PIL Image zu BytesIO für Streamlit."""
    buffer = BytesIO()
    img.save(buffer, format='PNG', quality=95)
    buffer.seek(0)
    return buffer

# ============================================
# TEST
# ============================================

if __name__ == "__main__":
    # Test Powertechniken
    img1 = generate_powertechniken_certificate(
        user_name="Max Mustermann",
        top3=["active_recall", "spaced_repetition", "feynman"],
        total_xp=285
    )
    img1.save("test_powertechniken_cert.png")
    print("✅ Powertechniken Zertifikat gespeichert: test_powertechniken_cert.png")

    # Test Transfer
    img2 = generate_transfer_certificate(
        user_name="Lisa Schmidt",
        total_xp=160
    )
    img2.save("test_transfer_cert.png")
    print("✅ Transfer Zertifikat gespeichert: test_transfer_cert.png")

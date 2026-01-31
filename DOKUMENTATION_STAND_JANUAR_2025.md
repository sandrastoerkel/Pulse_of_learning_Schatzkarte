# Pulse of Learning - Schatzkarte
## Dokumentation Stand 31. Januar 2025

---

# HEUTIGE ÄNDERUNGEN (31. Januar 2025)

## 🃏 Loot / Lernkarten - Neues freischwebendes Element!

### Neues Feature: Spaced Repetition Lernkarten auf der Schatzkarte

Ein neues freischwebendes Element "Loot" wurde zur Schatzkarte hinzugefügt - wie Polarstern, Goldener Schlüssel und Selbsteinschätzung.

### Neue Dateien erstellt:

| Datei | Beschreibung |
|-------|--------------|
| `icons/LootIcon.tsx` | SVG-Icon: Gestapelte goldene Karten mit Glanzeffekt und Häkchen-Badge |
| `LootLernkarten.tsx` | Vollständige Lernkarten-Komponente (~1000 Zeilen) |
| `styles/loot-lernkarten.css` | Komplettes Styling (~700 Zeilen) |
| `public/ocr-test.html` | Test-Seite für Tesseract.js OCR (Texterkennung) |

### Features der Lernkarten:

**Dashboard:**
- 16 Schulfächer zur Auswahl (Englisch, Latein, Französisch, Deutsch, Mathe, Bio, Physik, Chemie, Geschichte, Geo, Musik, Kunst, Informatik, Religion, Spanisch, Sonstiges)
- Streak-Anzeige (🔥)
- Münzen-Anzeige (🪙)
- "Heute fällig" Card mit Direktstart

**Deck-Verwaltung:**
- Decks pro Fach erstellen
- Decks umbenennen/löschen
- Karten hinzufügen (einzeln)
- **Text-Import**: Vokabellisten einfügen (Tab, -, =, :, ; als Trennzeichen erkannt)

**Spaced Repetition (SM-2 Algorithmus):**
- Flip-Card Lernmodus mit 3D-Animation
- 4 Bewertungsstufen: Nochmal, Schwer, Gut, Leicht
- Automatische Wiederholungsintervalle (1 Tag → 6 Tage → exponentiell)
- Fortschritts-Tracking pro Karte

**Belohnungssystem:**
- XP für richtige Antworten (5-15 XP)
- Münzen für Lernerfolge
- Konfetti-Animation bei Session-Abschluss
- Floating Reward Popups (+10 🪙)

### Position auf der Karte:

Das Loot-Icon erscheint **rechts oben** auf der Schatzkarte (gegenüber dem Polarstern).
- Badge zeigt Anzahl fälliger Karten (pulsiert orange)
- Hover-Glow-Effekt in Gold

### Integration in App.tsx:

```tsx
// Neue States
const [showLootModal, setShowLootModal] = useState(false);
const [lootDueCount, setLootDueCount] = useState(5);

// Handler
const handleLootClick = useCallback(() => {
  setShowLootModal(true);
}, []);

// Props an WorldMapIllustrated
onLootClick={handleLootClick}
lootDueCount={lootDueCount}

// Modal rendern
<LootLernkarten
  isOpen={showLootModal}
  onClose={() => setShowLootModal(false)}
  onXPEarned={handleLootXPEarned}
  onCoinsEarned={handleLootCoinsEarned}
/>
```

### Geänderte Dateien:

| Datei | Änderung |
|-------|----------|
| `icons/index.ts` | LootIcon Export hinzugefügt |
| `WorldMapIllustrated.tsx` | LootIcon importiert, Props hinzugefügt, FloatingShip für 'loot' Typ erweitert |
| `illustrated-map.css` | CSS für `.loot-ship` Position und Styling |
| `App.tsx` | State, Handler und Modal-Integration |

---

## 📷 OCR Test-Seite für Texterkennung

### Geplantes Feature: Kamera + OCR für Lernkarten-Import

Eine Test-Seite wurde erstellt, um Tesseract.js (clientseitige Texterkennung) zu evaluieren.

**Datei:** `public/ocr-test.html`

**Features:**
- Kamera-Zugriff (Rückkamera auf iPad/Handy)
- Bild-Upload (für Laptop-Tests)
- Sprachen: Deutsch, Englisch, Französisch, Latein, Spanisch
- Text-Parsing zu Karteikarten (erkennt Trennzeichen automatisch)

**Zum Testen:**
```bash
cd components/rpg_schatzkarte/frontend
npm run dev
# Dann öffnen: http://localhost:5173/ocr-test.html
```

**Status:** Test-Phase - Wenn OCR gut funktioniert, wird es in die Lernkarten-App integriert.

---

## TODO: OCR in Lernkarten integrieren

Wenn Tesseract.js gut funktioniert, sollte folgendes hinzugefügt werden:

1. **Kamera-Button** im Import-Bereich der Lernkarten
2. **Tesseract.js** als npm Dependency hinzufügen
3. **Foto aufnehmen** → Text erkennen → Karteikarten parsen
4. **Vorschau** der erkannten Karten vor dem Import

---

# ÄNDERUNGEN (21. Januar 2025)

## 🖼️ Hintergrundbilder für Insel-Experiences

### Neues Design-Feature: Immersive Hintergründe mit Glaseffekt

Die Insel-Experiences haben jetzt atmosphärische Hintergrundbilder mit transparenten, verschwommenen Container-Elementen für einen modernen Glaseffekt.

### Fertige Inseln mit Hintergrundbildern:

| Insel | Hintergrundbild | CSS-Datei |
|-------|-----------------|-----------|
| 🏠 Base Camp (Starthafen) | `/public/basecamp-bg.jpg` | `starthafen-island.css` |
| 🏰 Mental stark (Festung) | `/public/festung-bg.jpg` | `festung-island.css` |
| 🔧 Cleverer lernen (Werkzeuge) | `/public/werkzeuge-bg.jpg` | `werkzeuge-island.css` |
| 🧵 Station der Fäden | `/public/faeden-bg.jpg` | `faeden-island.css` |
| 🔧 PowertechnikenChallenge | `/public/werkzeuge-bg.jpg` | `powertechniken-challenge.css` |

### CSS-Muster für Hintergrundbilder:

```css
/* Haupt-Container mit Hintergrundbild */
.insel-island {
  background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%),
              url('/hintergrund-bg.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  color: var(--white);
}

/* Transparente Container mit Glaseffekt */
.insel-island .phase-container,
.insel-island .quest-card,
.insel-island .scroll-section {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Weiße Textfarbe mit Schatten für Lesbarkeit */
.insel-island h1, .insel-island h2, .insel-island h3,
.insel-island p, .insel-island li {
  color: var(--white);
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

/* Spezialfall: Heller Hintergrund mit dunklem Text */
.insel-island .speech-bubble {
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50 !important;
}
```

### Bilder in `/public/` Ordner:
- `basecamp-bg.jpg` - Hafen/Segelboot-Szene
- `festung-bg.jpg` - Mittelalterliche Burg
- `werkzeuge-bg.jpg` - Werkstatt/Tools
- `faeden-bg.jpg` - Plasma/Neuronales Netzwerk

### TODO: Fehlende Hintergrundbilder

Diese Inseln brauchen noch Hintergrundbilder:
- [ ] 🌉 Brücken (`bruecken-island.css`)
- [ ] 🧠 Spiegel-See (`spiegel-see-island.css`)
- [ ] 🔥 Vulkan (`vulkan-island.css`)
- [ ] 😌 Ruhe-Oase (`ruhe-oase-island.css`)
- [ ] 🏆 Ausdauer-Gipfel (`ausdauer-gipfel-island.css`)
- [ ] 🎯 Fokus-Leuchtturm (`fokus-leuchtturm-island.css`)
- [ ] 🌱 Wachstums-Garten (`wachstum-garten-island.css`)
- [ ] 🏫 Lehrer-Turm (`lehrer-turm-island.css`)
- [ ] 🏠 Wohlfühl-Dorf (`wohlfuehl-dorf-island.css`)
- [ ] 🛡️ Schutz-Burg (`schutz-burg-island.css`)
- [ ] ⛰️ Berg der Meisterschaft (`meister-berg-island.css`)

### Anleitung für neue Hintergrundbilder:

1. **Bild vorbereiten**: JPG-Format, ca. 1920x1080px
2. **Bild kopieren**: In `/components/rpg_schatzkarte/frontend/public/` speichern
3. **CSS anpassen**: In der entsprechenden CSS-Datei:
   - Haupt-Container: `background: linear-gradient(...), url('/name-bg.jpg')`
   - `.phase-container`, `.quest-card`, `.scroll-section`: Transparent machen
   - Textfarben: Weiß mit `text-shadow`
4. **Build erstellen**: `npm run build` im frontend-Verzeichnis

---

# ÄNDERUNGEN (16. Januar 2025)

## 1. Alle 15 Custom SVG Insel-Icons integriert

### Vollständiges Icon-System für die Weltkarte
Alle 15 Inseln haben jetzt individuelle, handgezeichnete SVG-Icons mit Animationen:

**Datei:** `frontend/src/components/icons/`

| Insel | Icon-Datei | Beschreibung |
|-------|------------|--------------|
| 🏠 Starthafen | StartHafenIcon.tsx | Hafen mit Leuchtturm und Anker |
| 🏰 Festung | FestungIcon.tsx | Burg mit wehenden Fahnen |
| 🔧 Werkzeuge | WerkzeugeIcon.tsx | Werkzeugkasten mit Zahnrädern |
| 🌋 Vulkan | VulkanIcon.tsx | Aktiver Vulkan mit Lava |
| ⛰️ Meisterberg | MeisterBergIcon.tsx | Goldener Gipfel mit Krone |
| 🌉 Brücken | BrueckenIcon.tsx | Regenbogenbrücke |
| 🧵 Fäden | FaedenIcon.tsx | Vernetztes Spinnenetz |
| 🪞 Spiegel-See | SpiegelSeeIcon.tsx | Mystischer See mit Reflexion |
| 🌴 Ruhe-Oase | RuheOaseIcon.tsx | Palmen und Wasserfall |
| 🏔️ Ausdauer-Gipfel | AusdauerGipfelIcon.tsx | Schneebedeckter Berg |
| 🗼 Fokus-Leuchtturm | FokusLeuchtturmIcon.tsx | Strahlender Leuchtturm |
| 🌱 Wachstums-Garten | WachstumGartenIcon.tsx | Blühender Garten mit Schmetterlingen |
| 🏫 Lehrer-Turm | LehrerTurmIcon.tsx | Weiser Turm mit Sternen |
| 🏘️ Wohlfühl-Dorf | WohlfuehlDorfIcon.tsx | Gemütliches Dorf mit Herzen |
| 🏯 Schutz-Burg | SchutzBurgIcon.tsx | Burg mit leuchtendem Schutzschild |

**Features aller Icons:**
- Animierte Elemente (Shimmer, Funkeln, Bewegung)
- Gradient-Füllungen für 3D-Effekt
- Props: `size`, `animated`, `glowing`
- Einzigartige IDs pro Instanz (keine Konflikte)
- Glow-Ringe entfernt für sauberes Design

## 2. Schiff-Icons komplett

Alle 3 Schiffe haben jetzt SVG-Icons:

| Schiff | Icon-Datei | Beschreibung |
|--------|------------|--------------|
| 🔑 Goldener Schlüssel | GoldenKeyIcon.tsx | Goldener Schlüssel mit Glitzer |
| ⚖️ Hattie-Waage | HattieWaageIcon.tsx | Waage für Selbsteinschätzung |
| ⭐ Polarstern | PolarsternIcon.tsx | Leuchtender Nordstern |

## 3. Lerntechniken-Widget Icon

**Datei:** `frontend/src/components/icons/LerntechnikenIcon.tsx`

Neues Magic-Book-Icon für das Lerntechniken-Widget:
- Aufgeschlagenes Zauberbuch
- Schwebende Symbole (Glühbirne, Zahnrad, Stern)
- Animierte Partikel

## 4. Widget-Styling wie Schiffe

**Dateien:**
- `frontend/src/components/WorldMapIllustrated.tsx`
- `frontend/src/styles/illustrated-map.css`

Widgets (Lerntechniken & Tagebuch) sind jetzt wie die Schiffe gestaltet:
- Transparenter Hintergrund (keine farbige Box)
- Icon schwebt frei
- Label darunter (wie bei Schiffen)
- Hover-Glow-Effekt

## 5. Legende aktualisiert

**Änderung:** Farbige Punkte durch Emojis ersetzt

| Alt | Neu |
|-----|-----|
| 🟢 Grüner Punkt | ⭐ Abgeschlossen |
| 🔴 Roter Punkt | 🔒 Gesperrt |

## 6. Avatar vergrößert

**Änderung:** Avatar-Größe von 80px auf 110px erhöht
- `.player-avatar-frame`: 70px → 100px
- Bessere Sichtbarkeit auf der Karte

## 7. Text-Lesbarkeit in PowertechnikenChallenge

**Datei:** `frontend/src/styles/powertechniken-challenge.css`

Umfassende Verbesserung der Textlesbarkeit:
- CSS-Variable `--pt-text-light`: #f5f5f5 → #ffffff
- CSS-Variable `--pt-text-muted`: #9ca3af → #d1d5db
- `.progress-text`: Weiß mit Text-Shadow
- `.overview-intro`: Weiß mit stärkerem Hintergrund
- `.back-btn`: Besserer Kontrast

## 8. Admin TestPanel im Streamlit-Modus

**Dateien:**
- `components/rpg_schatzkarte/__init__.py`
- `pages/1_🗺️_Schatzkarte.py`

Neuer Parameter `is_admin` ermöglicht Zugriff auf das TestPanel:

```python
result = rpg_schatzkarte(
    islands=islands,
    user_progress=user_data.get("progress", {}),
    hero_data=hero_data,
    unlocked_islands=unlocked_islands,
    current_island=current_island,
    age_group=age_group,
    is_admin=True,  # TestPanel aktivieren
    height=900,
    key="rpg_schatzkarte"
)
```

---

# ÄNDERUNGEN (15. Januar 2025)

## 1. Avatar-Qualität verbessert

### Detailreicherer & realistischerer Avatar
Die Avatar-Darstellung wurde deutlich verbessert mit Premium-SVG-Rendering:

**Datei:** `frontend/src/components/AvatarDisplay.tsx`

**Verbesserungen:**
- **Multi-Stop Hautfarben-Gradienten** - Natürlichere Übergänge statt flacher Farben
- **Verbesserte Augen** - Mehrere Glanzlichter, Iris-Details, dezente Schatten
- **Haar-Glanz-Overlays** - Realistische Lichtreflexe auf den Haaren
- **Nasenlöcher-Andeutung** - Subtile Details für mehr Tiefe
- **Lippen-Gradienten** - Natürlichere Mund-Darstellung
- **Kleidungs-Details** - Falten, Schatten, Highlights für mehr Tiefe
- **Einzigartige Gradient-IDs** - Jede Avatar-Instanz hat eigene IDs zur Vermeidung von Konflikten

## 2. Memory-Spiel integriert (NEU!)

### Vollständiges Memory-Spiel mit XP-Wettsystem

Ein neues Mini-Spiel wurde zur Schatzkarte hinzugefügt, bei dem Spieler XP riskieren können.

### Neue Dateien erstellt:

| Datei | Beschreibung |
|-------|--------------|
| `MiniGames/Memory/MemoryGame.tsx` | Haupt-Spiellogik mit Timer, Leben, Karten |
| `MiniGames/Memory/MemoryCard.tsx` | 3D-Flip-Karten mit Framer Motion |
| `MiniGames/Memory/BettingPhase.tsx` | XP-Wett-UI mit Schwierigkeitsauswahl |
| `MiniGames/Memory/memory-game.css` | Komplettes Styling (~850 Zeilen) |
| `MiniGames/Memory/index.ts` | Modul-Exports |
| `MiniGames/index.ts` | Haupt-Exports für alle MiniGames |
| `types/games.ts` | TypeScript-Typen für Spiele |

### Features:

**Wett-Phase:**
- Einsatz wählen: 25, 50, 100 XP oder "All-In"
- 3 Schwierigkeitsgrade: Leicht (×1.5), Mittel (×2.0), Schwer (×3.0)
- Anzeige von Leben, Zeit und Paaren pro Schwierigkeit

**Spiel-Phase:**
- 3D-Kartenflip-Animationen
- Leben-System (3-5 Herzen je nach Schwierigkeit)
- Timer mit Warn-Farben (grün → orange → rot)
- Züge-Zähler und Paare-Anzeige
- Shake-Animation bei falschem Paar
- Sparkle-Effekte bei richtigem Paar

**Ergebnis-Phase:**
- Gewinn: Konfetti-Animation, XP-Gewinn, optionaler Gold-Bonus bei perfektem Spiel
- Verlust: XP-Verlust, Tipp für nächstes Mal
- "Nochmal" oder "Fertig" Buttons

### Integration in App.tsx:

```tsx
// Neue Imports
import { MemoryGame } from './components/MiniGames';
import type { GameResult } from './types/games';

// Neue States
const [showMemoryGame, setShowMemoryGame] = useState(false);
const [playerXP, setPlayerXP] = useState(heroData.xp);
const [playerGold, setPlayerGold] = useState(heroData.gold);

// Handler für Spielende
const handleMemoryGameEnd = useCallback((result: GameResult) => {
  setPlayerXP(prev => Math.max(0, prev + result.xpWon));
  if (result.goldWon > 0) {
    setPlayerGold(prev => prev + result.goldWon);
  }
  setShowMemoryGame(false);
}, []);
```

### CSS-Styles hinzugefügt (rpg-theme.css):

- `.memory-game-modal` - Vollbild-Overlay für das Spiel
- `.memory-game-widget` - Schwebendes Widget unten rechts
- Animiertes Gehirn-Icon mit Puls-Effekt
- XP-Anzeige im Widget

### So spielst du Memory:

1. Klicke auf das 🧠 Memory-Widget unten rechts auf der Karte
2. Wähle deinen XP-Einsatz (25, 50, 100 oder All-In)
3. Wähle die Schwierigkeit (Leicht/Mittel/Schwer)
4. Klicke "🎮 Spiel starten"
5. Finde alle Paare bevor Zeit oder Leben aufgebraucht sind!
6. Bei Gewinn: XP × Multiplikator als Belohnung
7. Bei Verlust: Einsatz wird abgezogen

---

# ÄNDERUNGEN (14. Januar 2025)

## 1. Karten-Anpassungen

### Hintergrundbild verbreitert
Die Schatzkarte wurde angepasst, um blaue Ränder innerhalb des goldenen Rahmens zu eliminieren:
- **Datei:** `illustrated-map.css`
- **Änderung:** `.map-image` auf 115% Breite mit -7.5% margin-left
- Schiffe bleiben aufrecht (keine Rotation)

### Inseln neu positioniert
Alle 15 Inseln wurden gleichmäßig auf der Landmasse verteilt:
- **Datei:** `WorldMapIllustrated.tsx`
- **Änderung:** Vertikale Verteilung von y: 12 bis y: 85
- Alle Inseln sind jetzt auf der Landmasse (nicht im Wasser)

---

## 2. Video-Chat Integration (NEU!)

### Neues Feature: Jitsi Meet Video-Treffen für Lerngruppen

Coaches können jetzt Video-Treffen für ihre Lerngruppen planen. Kinder sehen einen Countdown und können zur geplanten Zeit beitreten.

### Neue Dateien erstellt:

| Datei | Beschreibung |
|-------|--------------|
| `VideoChat/ScreenShareHelper.jsx` | Kindgerechte Screen-Sharing-Anleitung (Schritt für Schritt) |
| `VideoChat/SchatzkarteMeetingWithScreenShare.jsx` | Jitsi Meeting-Komponente mit Sidebar |
| `VideoChat/screen-share-helper.css` | Nintendo-inspirierte Styles |
| `VideoChat/video-chat.css` | Meeting-Container, Warteraum, Scheduler Styles |
| `hooks/useMeeting.ts` | React Hook für Meeting-Zugriff |

### Backend-Erweiterungen:

**lerngruppen_db.py** - Neue Meeting-Tabellen und Funktionen:
- `scheduled_meetings` Tabelle (Treffen planen)
- `meeting_participants` Tabelle (Teilnahme tracken)
- `init_meeting_tables()` - Tabellen initialisieren
- `schedule_meeting()` - Treffen planen
- `get_next_meeting()` - Nächstes Treffen abrufen
- `get_group_meetings()` - Alle Treffen einer Gruppe
- `get_meeting_access()` - Zugriffsrechte prüfen
- `get_jitsi_config()` - Rollen-basierte Jitsi-Konfiguration
- `record_meeting_join()` / `record_meeting_leave()` - Teilnahme erfassen
- `cancel_meeting()` - Treffen absagen

### Streamlit UI:

**pages/7_👥_Lerngruppen.py** - Neuer Tab "📹 Video-Treffen":
- Gruppen-Auswahl Dropdown
- "📅 Nächstes Treffen" - Zeigt geplante Treffen mit Details
- "➕ Neues Treffen planen" - Formular mit Tag, Uhrzeit, Dauer, Wiederholung
- Treffen absagen mit Bestätigung

### Dependencies:

- `@jitsi/react-sdk` (v1.4.4) zu npm hinzugefügt

### Features:
- Coach plant wöchentliche/einmalige Meetings
- Sichere, nicht-erratbare Raum-Namen (Hash-basiert)
- Kindgerechte Screen-Sharing-Anleitung
- Warteraum mit Countdown für Kinder
- Rollen-basierte Jitsi-Konfiguration (Coach vs Kind)
- Mikro/Kamera standardmäßig aus für Kinder
- **🚀 Jetzt beitreten** Button öffnet Jitsi direkt im Browser

### Bug-Fixes (14. Januar):
- `status`-Spalte Migration für `group_members` Tabelle hinzugefügt
- `jitsi_room_name` Feldname korrigiert (war: `room_name`)
- Alte Datenbank-Tabellen gelöscht und neu erstellt

### Jitsi Meet Hinweise:

**Für Coaches (Moderatoren):**
- Der Coach muss sich mit **Google anmelden** um Moderator zu sein
- Nach der Anmeldung kann er Teilnehmer einlassen und die Konferenz steuern

**Für Kinder (Teilnehmer):**
- Kinder müssen sich **NICHT** anmelden
- Sie warten im Warteraum bis der Coach sie reinlässt

### So startest du ein Video-Treffen:

1. Gehe zu **👥 Lerngruppen** → Tab **📹 Video-Treffen**
2. Wähle deine Lerngruppe im Dropdown
3. Falls kein Treffen existiert: Tab "➕ Neues Treffen planen" → Treffen erstellen
4. Klicke auf **🚀 Jetzt beitreten** (grüner Button)
5. Melde dich mit Google an (nur einmalig als Moderator)
6. Warte auf Teilnehmer und lasse sie rein

---

# WICHTIGE ZUGANGSDATEN

## Admin-Zugang
- **Passwort:** `puls2024`
- **Seite:** 🔐 Admin in der Sidebar

## So machst du dich zum Coach:
1. Starte die App: `streamlit run Home.py`
2. Gehe zu **🔐 Admin** in der Sidebar
3. Gib das Passwort ein: `puls2024`
4. Finde deinen Namen in der Liste
5. Wähle "🎓 Coach" im Dropdown
6. Klicke "💾 Speichern"

Danach hast du Zugang zur **👥 Lerngruppen**-Seite.

---

# HEUTIGE ÄNDERUNGEN (13. Januar 2025)

## Neues Insel-Design-System - Alle 14 Inseln komplett! 🎨

**ERLEDIGT!** Das animierte Design-System wurde auf **alle 14 Inseln** angewendet! Jede Insel hat jetzt:
- Eine eigene Experience-Komponente mit Framer Motion Animationen
- Eine eigene CSS-Datei mit insel-spezifischen Farben
- Quest-Karten für Video, Scroll, Quiz und Challenge
- "Coming Soon"-Placeholder für Inseln ohne Inhalt

### Neue Dateien erstellt (13. Januar):

| Datei | Beschreibung |
|-------|--------------|
| `SpiegelSeeIslandExperience.tsx` | Spiegel-See Experience (Blau) |
| `VulkanIslandExperience.tsx` | Vulkan Experience (Rot) |
| `RuheOaseIslandExperience.tsx` | Ruhe-Oase Experience (Türkis) |
| `AusdauerGipfelIslandExperience.tsx` | Ausdauer-Gipfel Experience (Orange) |
| `FokusLeuchtturmIslandExperience.tsx` | Fokus-Leuchtturm Experience (Hellorange) |
| `WachstumGartenIslandExperience.tsx` | Wachstums-Garten Experience (Grün) |
| `LehrerTurmIslandExperience.tsx` | Lehrer-Turm Experience (Lila) |
| `WohlfuehlDorfIslandExperience.tsx` | Wohlfühl-Dorf Experience (Sanftgrün) |
| `SchutzBurgIslandExperience.tsx` | Schutz-Burg Experience (Pink) |
| `MeisterBergIslandExperience.tsx` | Berg der Meisterschaft Experience (Gold) |
| 10 CSS-Dateien | Entsprechende Styles für jede Insel |

### Neue Dateien erstellt (12. Januar):

| Datei | Beschreibung |
|-------|--------------|
| `FestungIslandExperience.tsx` | Animierte Festung-Insel |
| `BrueckenIslandExperience.tsx` | Animierte Brücken-Insel |
| `festung-island.css` | CSS für Festung (~400 Zeilen) |
| `bruecken-island.css` | CSS für Brücken (~400 Zeilen) |
| `TransferChallenge.tsx` | **ÜBERARBEITET** - Kreative 4-Phasen Challenge |
| `transferChallengeTypes.ts` | **ÜBERARBEITET** - Neue Inhalte |

### Bug-Fix: SuperheldenTagebuch öffnet sich jetzt!

**Problem:** Das Tagebuch ließ sich nicht öffnen (egal ob Widget, Button oder Schriftrolle).

**Ursache:** Der interne `modalOpen` State wurde nur einmal initialisiert, aber nicht mit dem `isOpen` Prop synchronisiert.

**Lösung:** `useEffect` hinzugefügt in `SuperheldenTagebuch.tsx`:
```tsx
useEffect(() => {
  setModalOpen(isOpen);
}, [isOpen]);
```

### Quiz für Brücken-Insel - Alle 3 Altersstufen!

Neue Quiz-Dateien erstellt:
- `brueckenQuizContent.ts` - Grundschule (existierte)
- `brueckenQuizContent_unterstufe.ts` - **NEU**
- `brueckenQuizContent_mittelstufe.ts` - **NEU**

---

# 🎨 DESIGN-SYSTEM FÜR INSELN (Template für morgen!)

## So wendest du das Design auf eine neue Insel an:

### Schritt 1: Neue Dateien erstellen

```
frontend/src/components/[Insel]IslandExperience.tsx
frontend/src/styles/[insel]-island.css
```

### Schritt 2: Component-Struktur kopieren

Kopiere `FestungIslandExperience.tsx` als Template. Die Struktur ist:

```tsx
// ============================================
// [Insel] Island Experience
// ============================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgeGroup } from '../types';
import '../styles/[insel]-island.css';

// QUEST INFO - Anpassen pro Insel!
const QUEST_INFO: Record<QuestKey, {...}> = {
  video: { name: "...", icon: "📜", color: "#9b59b6", xp: 25 },
  scroll: { name: "...", icon: "📖", color: "#3498db", xp: 20 },
  quiz: { name: "...", icon: "⚔️", color: "#e74c3c", xp: 50 },
  challenge: { name: "...", icon: "🏆", color: "#f39c12", xp: 40 },
};

// HAUPT-KOMPONENTE
export function [Insel]IslandExperience({
  ageGroup,
  onClose,
  onQuestComplete,
}: Props) {
  const [currentView, setCurrentView] = useState<'overview' | QuestKey>('overview');
  const [progress, setProgress] = useState<Progress>({...});

  return (
    <div className="[insel]-island">
      {/* Header mit Titel + XP */}
      {/* Progress-Bar */}
      {/* AnimatePresence für View-Wechsel */}
      {/* QuestCards Grid */}
      {/* Phasen: VideoPhase, ScrollPhase, QuizPhase, ChallengePhase */}
    </div>
  );
}
```

### Schritt 3: Die 4 Phasen implementieren

#### VideoPhase
```tsx
function VideoPhase({ content, onComplete, onBack }) {
  return (
    <div className="phase-container video-phase">
      <PhaseHeader icon="📜" title="..." color="#9b59b6" onBack={onBack} />
      <div className="video-container">
        {/* YouTube iframe oder Placeholder */}
      </div>
      <motion.button className="complete-btn" onClick={onComplete}>
        Video abgeschlossen ✓
      </motion.button>
    </div>
  );
}
```

#### ScrollPhase
```tsx
function ScrollPhase({ content, ageGroup, onComplete, onBack }) {
  return (
    <div className="phase-container scroll-phase">
      <PhaseHeader icon="📖" title="..." color="#3498db" onBack={onBack} />
      <div className="scroll-container">
        {/* Titel, Intro, Sections mit Expandern */}
      </div>
      <motion.button className="complete-btn" onClick={onComplete}>
        Gelesen ✓
      </motion.button>
    </div>
  );
}
```

#### QuizPhase
```tsx
function QuizPhase({ ageGroup, onComplete, onBack }) {
  const [quizStarted, setQuizStarted] = useState(false);

  if (quizStarted) {
    return <BattleQuiz quiz={...} onComplete={onComplete} onClose={onBack} />;
  }

  return (
    <div className="phase-container quiz-phase">
      <PhaseHeader icon="⚔️" title="..." color="#e74c3c" onBack={onBack} />
      {/* Quiz-Intro mit Start-Button */}
    </div>
  );
}
```

#### ChallengePhase
```tsx
function ChallengePhase({ onComplete, onBack, ...props }) {
  return (
    <div className="phase-container challenge-phase">
      <PhaseHeader icon="🏆" title="..." color="#f39c12" onBack={onBack} />
      {/* Insel-spezifische Challenge */}
    </div>
  );
}
```

### Schritt 4: CSS-Datei erstellen

Kopiere `festung-island.css` und passe die Variablen an:

```css
/* ============================================
   [INSEL] ISLAND EXPERIENCE
   ============================================ */

.[insel]-island {
  /* FARB-VARIABLEN - Pro Insel anpassen! */
  --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-header: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%);
  --color-primary: #667eea;
  --color-secondary: #764ba2;

  /* STANDARD-VARIABLEN (gleich für alle) */
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.1);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.15);
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.2);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;

  /* Layout */
  padding: 20px;
  min-height: 100%;
  background: var(--gradient-primary);
}

/* Header */
.[insel]-island .island-header { ... }

/* Quest Cards Grid */
.[insel]-island .quests-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

/* Responsive */
@media (max-width: 600px) {
  .[insel]-island .quests-grid {
    grid-template-columns: 1fr;
  }
}
```

### Schritt 5: In QuestModal.tsx einbinden

```tsx
// Import hinzufügen
import { [Insel]IslandExperience } from './[Insel]IslandExperience';

// Im JSX (nach den anderen Inseln)
{island.id === '[insel]' ? (
  <[Insel]IslandExperience
    ageGroup={ageGroup}
    onClose={onClose}
    onQuestComplete={onQuestComplete}
    // + weitere Props falls nötig
  />
) : /* nächste Insel */ }
```

---

## Framer Motion Animationen (Copy-Paste!)

### QuestCard Animation
```tsx
<motion.button
  className="quest-card"
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.1, type: "spring", bounce: 0.4 }}
  whileHover={{ scale: 1.05, rotate: [-1, 1, -1, 0] }}
  whileTap={{ scale: 0.95 }}
>
```

### Phase-Wechsel Animation
```tsx
<AnimatePresence mode="wait">
  {currentView === 'overview' && (
    <motion.div
      key="overview"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
    >
      {/* Content */}
    </motion.div>
  )}
</AnimatePresence>
```

### XP-Reward Popup
```tsx
<AnimatePresence>
  {showXPReward && (
    <motion.div
      className="xp-reward-popup"
      initial={{ scale: 0, y: 50, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ scale: 0, y: -50, opacity: 0 }}
    >
      +{xp} XP!
    </motion.div>
  )}
</AnimatePresence>
```

### Icon-Animationen
```tsx
// Pulsieren
<motion.span
  animate={{ scale: [1, 1.2, 1] }}
  transition={{ repeat: Infinity, duration: 2 }}
>
  ⭐
</motion.span>

// Wackeln
<motion.span
  animate={{ rotate: [0, -10, 10, -10, 0] }}
  transition={{ repeat: Infinity, duration: 3 }}
>
  🏆
</motion.span>
```

---

## Checkliste: Design-Status aller Inseln

| # | Insel | Experience | CSS | Quiz GS | Quiz US | Quiz MS | Challenge |
|:-:|-------|:----------:|:---:|:-------:|:-------:|:-------:|:---------:|
| 1 | 🏰 Festung der Stärke | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ (Schiffe) |
| 2 | 🔧 Insel der 7 Werkzeuge | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ (Powertechniken) |
| 3 | 🌉 Insel der Brücken | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (Transfer) |
| 4 | 🧵 Insel der Fäden | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ (Fäden) |
| 5 | 🧠 Spiegel-See | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 6 | 🔥 Vulkan der Motivation | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 7 | 😌 Ruhe-Oase | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 8 | 🏆 Ausdauer-Gipfel | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 9 | 🎯 Fokus-Leuchtturm | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 10 | 🌱 Wachstums-Garten | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 11 | 🏫 Lehrer-Turm | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 12 | 🏠 Wohlfühl-Dorf | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 13 | 🛡️ Schutz-Burg | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 14 | ⛰️ Berg der Meisterschaft | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

**Legende:** GS = Grundschule, US = Unterstufe, MS = Mittelstufe

### Zusammenfassung:
- **Design (Experience + CSS):** ✅ Alle 14 Inseln fertig!
- **Quiz fehlt noch:** Werkzeuge (US/MS), Fäden (alle), Inseln 5-14 (alle)
- **Challenge fehlt noch:** Inseln 5-14

---

# ÄNDERUNGEN VOM 8. Januar 2025

## Insel der 7 Werkzeuge - Grundschule Challenge KOMPLETT! 🎉

Die **7 Powertechniken Challenge** für Grundschüler (8-10 Jahre) wurde vollständig implementiert!

### Neue Komponenten erstellt:

| Datei | Beschreibung |
|-------|--------------|
| `PowertechnikenChallenge.tsx` | Hauptchallenge mit 7 interaktiven Übungen |
| `LerntechnikenUebersicht.tsx` | Persönliche Übersicht aller Techniken |
| `LerntechnikenZertifikat.tsx` | Urkunde "Lerntechniken-Entdecker" |
| `powertechnikenTypes.ts` | TypeScript-Typen und Technik-Daten |
| `powertechniken-challenge.css` | Nintendo-Style CSS (~3000 Zeilen) |

### Die 7 Powertechniken mit interaktiven Übungen:

| # | Technik | Übung |
|---|---------|-------|
| 1 | 🍅 Pomodoro | Timer mit Lern-Pause-Zyklen |
| 2 | 🔄 Active Recall | Memory-Spiel (5 Wörter merken) |
| 3 | 👶 Feynman-Methode | Teddy-Erklärer Checkbox |
| 4 | 📅 Spaced Repetition | Wiederholungs-Kalender + Anki-Tipp |
| 5 | 👥 Lernen durch Lehren | Partner-Checkliste |
| 6 | 🏰 Loci-Methode | Zimmer-Spaziergang (5 Orte belegen) |
| 7 | 🔀 Interleaved Practice | Mathe-Mixer (+, -, ×) |

### Verbesserungen an den Übungen:

#### 🍅 Pomodoro - Zyklus-System
- **Lern-Pause-Wechsel**: Lernen → Pause → Lernen → Pause (beliebig oft)
- **Zyklus-Zähler**: Zeigt 🍅🍅🍅 für abgeschlossene Pomodoros
- **Phasen-Anzeige**: Rot = Lernen, Grün = Pause
- **Buttons**: "☕ Pause starten" / "🍅 Weiter lernen" / "✅ Fertig für heute"

#### 📅 Spaced Repetition - Anki-Hinweis für Eltern
```
💡 Tipp für Eltern:
Die kostenlose App „Anki" macht Spaced Repetition automatisch!
📱 Kostenlos: apps.ankiweb.net
```

#### 🏰 Loci-Methode - Grammatik korrigiert
- ✅ "Was legst du auf **das** Bett?" (war: "auf den Bett")
- ✅ "Was legst du auf **das** Fenster?"
- ✅ "Was legst du auf **die** Tür?"

#### 🔀 Interleaving - Verbessert
- **Erklärungsbox**: "Was ist Interleaving?" mit Prinzip-Erklärung
- **Schwierigere Aufgaben**: 3.-4. Klasse Niveau (47+28, 72-45, 7×6)
- **Plus, Minus UND Mal** gemischt (12 Aufgaben)
- **Hinweis**: "Das geht auch mit: Vokabeln, Sachkunde, Rechtschreibung..."
- **Breiteres Lösungsfeld**: 70px statt 50px für 2-3 stellige Zahlen

### 🎓 Urkunde "Lerntechniken-Entdecker"

- **Top 3 Auswahl**: Kind wählt seine 3 Lieblingstechniken (🥇🥈🥉)
- **Alle Techniken mit Anwendungen**: Zeigt was das Kind bei jeder Technik geschrieben hat
- **Buttons funktionieren jetzt**:
  - 📥 Als Bild speichern (html2canvas → PNG Download)
  - 🖨️ Drucken (Browser-Druckdialog)

### 🗺️ WorldMap - Lerntechniken-Widget

Neuer Floating-Button unten rechts auf der Weltkarte:
- 📋 "Lerntechniken" (Standard-Ansicht)
- Badge mit Fortschritt (z.B. "3/7")
- 🎓 "Zertifikat" mit goldenem Glow wenn alle 7 abgeschlossen

### Neue/Geänderte Dateien (8. Januar):

| Datei | Änderung |
|-------|----------|
| `PowertechnikenChallenge.tsx` | **NEU** - Hauptchallenge |
| `LerntechnikenUebersicht.tsx` | **NEU** - Übersicht Modal |
| `LerntechnikenZertifikat.tsx` | **NEU** - Zertifikat mit Download |
| `powertechnikenTypes.ts` | **NEU** - Types & Daten |
| `powertechniken-challenge.css` | **NEU** - ~3000 Zeilen CSS |
| `QuestModal.tsx` | Challenge-Integration für werkzeuge |
| `WorldMap.tsx` | Lerntechniken-Widget Props |
| `App.tsx` | State & Handler für Lerntechniken |

### Dependencies hinzugefügt:
- `html2canvas` - Für Zertifikat-Download als PNG

---

## TODO für 14. Januar

### 1. ✅ ~~🎨 Design auf alle Inseln anwenden~~ (ERLEDIGT 13. Januar!)
~~Das neue animierte Design von Festung & Brücken auf alle anderen Inseln übertragen.~~
**Gelöst!** Alle 14 Inseln haben jetzt das Design-System (Experience + CSS).

### 2. ✅ ~~BUG: Superhelden-Tagebuch~~ (ERLEDIGT 12. Januar)
~~**Problem:** Das Superhelden-Tagebuch öffnete sich nicht.~~
**Gelöst!** useEffect für State-Sync hinzugefügt.

### 3. Quiz für Festung - Mittelstufe
**Problem:** Festung hat noch kein Quiz für Mittelstufe (fällt auf Grundschule zurück).
- Datei erstellen: `festungQuizContent_mittelstufe.ts`

### 4. Quiz für alle Stufen - Fäden-Insel
**Problem:** Fäden-Insel hat noch kein Quiz für alle Altersstufen.
- Datei erstellen: `faedenQuizContent.ts` (Grundschule)
- Datei erstellen: `faedenQuizContent_unterstufe.ts`
- Datei erstellen: `faedenQuizContent_mittelstufe.ts`

### 5. Quiz für Werkzeuge - Unterstufe & Mittelstufe
**Problem:** Werkzeuge-Insel hat nur Quiz für Grundschule.
- Datei erstellen: `werkzeugeQuizContent_unterstufe.ts`
- Datei erstellen: `werkzeugeQuizContent_mittelstufe.ts`

---

# ÄNDERUNGEN VOM 7. Januar 2025

## Bandura-Urkunde & Verbesserungen

### 1. Bandura-Urkunde zeigt echte Einträge
Die Urkunde zeigt jetzt die **tatsächlichen Texte** der Einträge statt nur Zahlen!

**Vorher:** Nur "1", "2", "3" als Anzahl
**Nachher:** "• schneller gelaufen als 3s...", "• Mathe-Test bestanden..." etc.

Betroffen:
- `BanduraChallenge.tsx` - React-Komponente (Urkunde im freischwebenden Schiff)
- `bandura_sources_widget.py` - Python/Streamlit-Komponente (Portfolio-Urkunde)

### 2. Effektstärke-Dropdown bei Werkzeuge-Insel
Neues Dropdown-Menü unter der Überschrift "Insel der 7 Werkzeuge" mit Erklärung:
- d = 0.40 → Ein Jahr Lernfortschritt (Durchschnitt)
- d > 0.40 → Mehr als ein Jahr!
- d < 0.40 → Weniger als ein Jahr
- d = 0.80 → Zwei Jahre Fortschritt in einem Jahr!

Für alle 3 Altersstufen (Grundschule, Unterstufe, Mittelstufe) hinzugefügt.

### 3. Festung zeigt vollständige Bandura-Challenge
Bei der Festung der Stärke wird jetzt **direkt** die vollständige Bandura-Challenge angezeigt (mit Portfolio, Übersicht, Urkunde & WOW-Effekten) - nicht mehr die Kurzversion.

**Änderung:** `showFullBandura` State von `false` auf `true` geändert in QuestModal.tsx

### 4. Text-Korrektur
"Das Paradox: Warum sich gutes Lernen **falsch** anfühlt" → "....**anstrengend** anfühlt"
(Grundschule + Unterstufe)

### Neue/Geänderte Dateien (7. Januar):

| Datei | Änderung |
|-------|----------|
| `frontend/src/components/BanduraChallenge.tsx` | Urkunde zeigt echte Texte |
| `frontend/src/components/QuestModal.tsx` | showFullBandura = true |
| `frontend/src/content/werkzeugeContent.ts` | Effektstärke-Dropdown, Text-Korrektur |
| `frontend/src/styles/bandura-challenge.css` | Neue CSS-Klassen für Urkunde |
| `utils/bandura_sources_widget.py` | Urkunde zeigt echte Texte (Python) |

### Neue Komponenten erstellt:

| Datei | Beschreibung |
|-------|--------------|
| `BanduraChallenge.tsx` | Vollständige Bandura-Challenge mit Tabs, Portfolio, Urkunde |
| `HattieChallenge.tsx` | Hattie-Challenge Komponente |
| `Brainy.tsx` | Brainy Maskottchen-Komponente |
| `WerkzeugeTutorial.tsx` | Tutorial für Werkzeuge-Insel |
| `banduraTypes.ts` | TypeScript-Typen für Bandura |
| `hattieTypes.ts` | TypeScript-Typen für Hattie |

---

# ÄNDERUNGEN VOM 6. Januar 2025

## Superhelden-Quiz mit Leben-System

Das Superhelden-Quiz wurde vollständig in die Schatzkarte integriert!

### Neue Features:

#### 1. Leben-System (3 Herzen)
- Spieler startet mit 3 Leben (Herzen)
- Bei falscher Antwort: -1 Leben
- Bei 0 Leben: Game Over Screen
- Victory Screen zeigt verbleibende Leben

#### 2. Neue Fragetypen
- **Single-Choice:** Klassische Multiple-Choice (100 Punkte)
- **Multi-Select:** Mehrere richtige Antworten wählen (150 Punkte)
- **Matching:** Power-Ups den Beispielen zuordnen (200 Punkte)
- **Ordering:** Schritte in richtige Reihenfolge bringen (150 Punkte)

#### 3. Superhelden-Quiz Fragen
- 10 Fragen in 3 Welten:
  - **World 1:** Banduras 4 Power-Ups (4 Fragen)
  - **World 2:** Hattie-Challenge (4 Fragen)
  - **World 3:** Bonus Boss (2 Fragen)

#### 4. Festung der Stärke - Challenges integriert
- Bandura-Challenge: 4 Quellen mit Tagebuch-Einträgen
- Hattie-Challenge: 5-Schritt-Flow (Fach → Aufgabe → Schätzung → Ergebnis → Reflexion)
- Challenge-Auswahl: Erst Bandura, dann Hattie zur Wahl

#### 5. Selbstcheck für Grundschule
- Interaktiver Nintendo Switch-Style Quiz am Ende der Erklärung
- 4 Aussagen mit 1-5 Skala bewerten
- Automatische Auswertung mit Feedback

### Geänderte/Neue Dateien:

| Datei | Änderung |
|-------|----------|
| `frontend/src/types.ts` | Erweitert: QuestionType, MultiSelectQuestion, MatchingQuestion, OrderingQuestion, BattleState mit playerLives |
| `frontend/src/content/festungQuizContent.ts` | **NEU:** 10 Superhelden-Quiz Fragen |
| `frontend/src/components/BattleQuiz.tsx` | Erweitert: Leben-System, 4 Fragetypen, Game Over Screen |
| `frontend/src/components/QuestModal.tsx` | Erweitert: BattleQuiz Integration, Challenge-System |
| `frontend/src/styles/rpg-theme.css` | Erweitert: ~500 Zeilen für Quiz, Challenges, Selfcheck |
| `frontend/src/content/festungContent.ts` | Erweitert: Selfcheck-System, Content-Struktur |
| `schatzkarte/map_data.py` | Fix: "Festung der Stärke" mit Umlaut |

---

# ÄNDERUNGEN VOM 5. Januar 2025

## Großes Redesign: React Custom Component

Die Schatzkarte wurde **komplett neu gebaut** als interaktive React-Komponente im RPG-Stil!

### Was geändert wurde:

#### 1. Neue React-Komponente erstellt
- **Ordner:** `components/rpg_schatzkarte/`
- **Frontend:** `components/rpg_schatzkarte/frontend/` (Vite + TypeScript + React)
- **Python-Bridge:** `components/rpg_schatzkarte/__init__.py`

#### 2. Schatzkarte.py komplett überarbeitet
- **Vorher:** Reines Streamlit mit HTML/CSS-Rendering
- **Jetzt:** React Custom Component mit bidirektionaler Kommunikation
- **Sidebar:** Eingeklappt für mehr Platz
- **Aktionen:** Quest-Abschlüsse und Schatz-Sammlungen werden in Echtzeit verarbeitet

#### 3. map_data.py erweitert
- **Tutorial-System:** Starthafen hat jetzt strukturierte Tutorial-Schritte
- **Insel-Typen:** `tutorial`, `flexible`, `finale` für unterschiedliches Verhalten
- **Neue Felder:** `has_quiz`, `has_challenge`, `tutorial_steps`

### Neue Projektstruktur:

```
components/
├── __init__.py
└── rpg_schatzkarte/
    ├── __init__.py           # Python-Bridge für Streamlit
    └── frontend/
        ├── src/
        │   ├── App.tsx       # Haupt-Komponente (14KB!)
        │   ├── types.ts      # TypeScript Definitionen
        │   ├── components/   # React Sub-Komponenten
        │   ├── content/      # Inhalte für Inseln
        │   └── styles/       # CSS
        ├── build/            # Kompiliertes Frontend
        ├── package.json
        └── vite.config.ts
```

### React-Komponente nutzen:

```python
from components.rpg_schatzkarte import rpg_schatzkarte

result = rpg_schatzkarte(
    islands=islands,              # Liste der Inseln
    user_progress=user_progress,  # Fortschritt pro Insel
    hero_data=hero_data,          # Name, Level, XP, Gold
    unlocked_islands=unlocked,    # Freigeschaltete Inseln
    current_island=current,       # Aktuelle Insel
    age_group=age_group,          # Altersstufe
    height=750,
    key="rpg_schatzkarte"
)

# Aktionen verarbeiten
if result:
    if result["action"] == "quest_completed":
        # Video/Erklärung/Quiz/Challenge abgeschlossen
    elif result["action"] == "treasure_collected":
        # Schatz gesammelt
```

### Aktionen die zurückkommen:

| Action | Beschreibung | Felder |
|--------|--------------|--------|
| `quest_completed` | Quest auf einer Insel abgeschlossen | islandId, questType (wisdom/scroll/battle/challenge) |
| `treasure_collected` | Schatz gesammelt | islandId, treasureId, xpEarned |

---

# APP-ÜBERSICHT

## Seiten (8 Stück)

| Seite | Funktion | Status |
|-------|----------|--------|
| 1_🗺️_Schatzkarte | **RPG-Weltkarte (React!)** | ✅ Neu gebaut |
| 2_📚_Ressourcen | Lern-Ressourcen mit Videos, Tipps, Challenges | ✅ Fertig |
| 3_🎓_Elternakademie | Diagnostik für Eltern-Unterstützung | ✅ Fertig |
| 4_🔍_Screening_Diagnostik | 2-stufiges Schüler-Screening | ✅ Fertig |
| 5_📊_Auswertung | Ergebnis-Darstellung mit Hattie-Bezug | ✅ Fertig |
| 6_📖_PISA_Forschungsgrundlage | Info-Seite zur Forschung | ✅ Fertig |
| 7_👥_Lerngruppen | Coach-Interface für Gruppenverwaltung | ✅ Fertig |
| 8_🔐_Admin | Benutzer-Rollen verwalten | ✅ Fertig |

---

# SCHATZKARTE - AKTUELLER STAND

## Was funktioniert:

### React-Frontend
- ✅ Interaktive Weltkarte mit Inseln
- ✅ RPG-artiges Design mit Hero-Profil
- ✅ Quest-System (Video, Erklärung, Quiz, Challenge)
- ✅ Schätze sammeln mit XP
- ✅ Fortschritts-Tracking pro Insel
- ✅ Bidirektionale Kommunikation mit Streamlit

### Inseln (15 Stück)
- **Woche 0:** Starthafen (Tutorial) - mit strukturierten Tutorial-Schritten
- **Woche 1:** Festung der Stärke (Selbstwirksamkeit)
- **Woche 2:** Insel der 7 Werkzeuge (Lernstrategien)
- **Woche 3:** Insel der Brücken (Transfer)
- **Woche 4:** Insel der Fäden (Birkenbihl)
- **Woche 5-11:** 7 aus 9 flexiblen Inseln (Coach wählt wochenweise)
- **Woche 12:** Berg der Meisterschaft (Finale)

### Tutorial-System (NEU!)
Der Starthafen hat jetzt strukturierte Tutorial-Schritte:
1. **Willkommen** (Video) - Begrüßungsvideo
2. **So funktioniert's** (Erklärung) - Anleitung zur Nutzung
3. **Deine Lerngruppe** (Link) - Gruppenchat-Einladung

### Gamification
- ✅ XP-System mit Leveln
- ✅ Gold-System (XP / 10)
- ✅ Streak-Tracking
- ✅ Schätze pro Insel
- ✅ Fortschrittsbalken
- ✅ Celebration bei Aktionen (Toast + Balloons)

---

## Was noch TODO ist:

### 1. ✅ Urkunden zeigen echte Einträge (ERLEDIGT 7. Januar)
~~**Problem:** Urkunde zeigte nur Zahlen statt echte Texte~~
**Gelöst!** Urkunde zeigt jetzt die tatsächlichen Einträge der Kinder.

### 2. PDF-Download für Urkunde
**Problem:** Urkunde kann nur gedruckt werden (Strg+P), nicht als PDF heruntergeladen.

**Anforderungen:**
- PDF-Generator für Urkunden
- Download-Button in der Urkunden-Ansicht
- Personalisiert mit Name, Datum, Einträgen

### 3. Inhalte für weitere Inseln
**Problem:** Die Content-Dateien für die anderen Inseln müssen noch mit Quiz-Fragen erweitert werden.

**Bereits fertig:**
- ✅ Festung der Stärke (festungContent.ts + festungQuizContent.ts)
- ✅ Insel der 7 Werkzeuge - Grundschule KOMPLETT! (PowertechnikenChallenge)
- ⏳ Insel der 7 Werkzeuge - Unterstufe Challenge fehlt
- ⏳ Insel der 7 Werkzeuge - Quiz fehlt noch
- ⏳ Insel der Fäden (faedenContent.ts - Quiz fehlt)
- ⏳ Insel der Brücken (brueckenContent.ts - Quiz fehlt)

### 4. Willkommensvideo
**Problem:** URL ist noch leer in `map_data.py`

**Wo:** `schatzkarte/map_data.py` Zeile 27:
```python
"welcome_video_url": "",  # <-- URL einfügen
```

### 5. Gruppenchat-Link
**Problem:** Platzhalter für Gruppenchat

**Lösung:** Discord/WhatsApp-Link oder eigenes Chat-System

### 6. Quiz-Daten speichern
**Problem:** Quiz-Ergebnisse werden noch nicht in der Datenbank gespeichert.

**Lösung:** Python-Endpoint für Quiz-Ergebnisse erweitern

---

# TECHNISCHE DETAILS

## App starten
```bash
cd /Users/sandra/Documents/Pulse_of_learning/Pulse_of_learning_Schatzkarte

# Beim ersten Mal: React-Komponente bauen
cd components/rpg_schatzkarte/frontend
npm install
npm run build
cd ../../..

# App starten
streamlit run Home.py
```

## React-Komponente entwickeln (Development-Modus)
```bash
# Terminal 1: Vite dev server
cd components/rpg_schatzkarte/frontend
npm run dev  # Läuft auf Port 3001

# Terminal 2: Streamlit
# In __init__.py: _RELEASE = False setzen
streamlit run Home.py
```

## React-Komponente für Production bauen
```bash
cd components/rpg_schatzkarte/frontend
npm run build
# Dann in __init__.py: _RELEASE = True setzen
```

## Datenbank zurücksetzen
```bash
rm data/hattie_gamification.db
# App neu starten - Tabellen werden automatisch erstellt
```

---

# DATEISTRUKTUR (AKTUALISIERT)

```
Pulse_of_learning_Schatzkarte/
├── Home.py                     # Einstiegspunkt
├── pages/
│   ├── 1_🗺️_Schatzkarte.py    # ← Nutzt jetzt React-Komponente!
│   ├── 2_📚_Ressourcen.py
│   ├── 3_🎓_Elternakademie.py
│   ├── 4_🔍_Screening_Diagnostik.py
│   ├── 5_📊_Auswertung.py
│   ├── 6_📖_PISA_Forschungsgrundlage.py
│   ├── 7_👥_Lerngruppen.py
│   └── 8_🔐_Admin.py
├── components/                  # ← NEU!
│   ├── __init__.py
│   └── rpg_schatzkarte/
│       ├── __init__.py         # Python-Bridge
│       └── frontend/           # React-App
│           ├── src/
│           │   ├── App.tsx
│           │   ├── types.ts
│           │   ├── components/
│           │   ├── content/
│           │   └── styles/
│           ├── build/          # Kompiliert
│           └── package.json
├── schatzkarte/
│   ├── map_data.py             # Insel-Definitionen (erweitert!)
│   ├── map_db.py               # Datenbank-Funktionen
│   ├── map_modal.py            # (Legacy, wird durch React ersetzt)
│   ├── map_progress.py         # Freischaltungs-Logik
│   ├── map_renderer.py         # (Legacy)
│   ├── map_ships.py            # (Legacy)
│   └── map_styles.py           # (Legacy)
├── utils/
│   ├── user_system.py          # Login, Rollen, Preview
│   ├── gamification_db.py      # XP, Level, Streaks
│   ├── lerngruppen_db.py       # Coach-Gruppen
│   ├── coaching_db.py          # Schüler-Management
│   └── ressourcen/             # Content für Ressourcen-Seite
└── data/
    └── *.db                    # SQLite-Datenbanken
```

---

# NÄCHSTE SCHRITTE (15. Januar 2025)

## Hohe Priorität
1. **Quiz für Festung - Mittelstufe** - `festungQuizContent_mittelstufe.ts` erstellen
2. **Quiz für Werkzeuge - Unterstufe** - `werkzeugeQuizContent_unterstufe.ts` erstellen
3. **Quiz für Werkzeuge - Mittelstufe** - `werkzeugeQuizContent_mittelstufe.ts` erstellen
4. **Quiz für Fäden - Alle Stufen** - `faedenQuizContent.ts` + US + MS erstellen

## Mittlere Priorität
5. **Video URLs eintragen** - Werkzeuge, Brücken, Fäden haben Placeholder-Videos
6. **Inhalt für Spiegel-See** - Als nächste leere Insel mit Inhalt befüllen
7. **Quiz-Ergebnisse speichern** - Datenbank-Erweiterung
8. **Weitere Mini-Spiele** - Runner-Spiel als nächstes MiniGame hinzufügen

## Niedrige Priorität
9. **Inhalt für restliche Inseln** - Vulkan, Ruhe-Oase, Ausdauer-Gipfel, etc.
10. **Willkommensvideo** - YouTube-URL produzieren
11. **Gruppenchat** - Lösung finden

## ✅ ERLEDIGT (15. Januar)
- **🧠 Memory-Spiel integriert** → Vollständiges XP-Wett-Spiel mit 3 Schwierigkeitsgraden!
  - MemoryGame.tsx, MemoryCard.tsx, BettingPhase.tsx
  - memory-game.css (~850 Zeilen)
  - types/games.ts für Spiel-Typen
  - Widget-Button auf der Schatzkarte
- **🎨 Avatar-Qualität verbessert** → Premium-SVG-Rendering mit Gradienten und Details
  - Multi-Stop Hautfarben, verbesserte Augen, Haar-Glanz
  - Lippen-Gradienten, Kleidungs-Details

## ✅ ERLEDIGT (13. Januar)
- ~~🎨 Design auf alle Inseln anwenden~~ → **Alle 14 Inseln haben jetzt das Design-System!**
  - SpiegelSeeIslandExperience.tsx + spiegel-see-island.css (Blau)
  - VulkanIslandExperience.tsx + vulkan-island.css (Rot)
  - RuheOaseIslandExperience.tsx + ruhe-oase-island.css (Türkis)
  - AusdauerGipfelIslandExperience.tsx + ausdauer-gipfel-island.css (Orange)
  - FokusLeuchtturmIslandExperience.tsx + fokus-leuchtturm-island.css (Hellorange)
  - WachstumGartenIslandExperience.tsx + wachstum-garten-island.css (Grün)
  - LehrerTurmIslandExperience.tsx + lehrer-turm-island.css (Lila)
  - WohlfuehlDorfIslandExperience.tsx + wohlfuehl-dorf-island.css (Sanftgrün)
  - SchutzBurgIslandExperience.tsx + schutz-burg-island.css (Pink)
  - MeisterBergIslandExperience.tsx + meister-berg-island.css (Gold)
- QuestModal.tsx aktualisiert mit allen neuen Imports und Routing

## ✅ ERLEDIGT (12. Januar)
- ~~Superhelden-Tagebuch Bug~~ → useEffect für State-Sync hinzugefügt!
- ~~Design für Festung der Stärke~~ → FestungIslandExperience komplett!
- ~~Design für Insel der Brücken~~ → BrueckenIslandExperience komplett!
- ~~Quiz für Brücken Unterstufe/Mittelstufe~~ → Alle 3 Altersstufen fertig!

## ✅ ERLEDIGT (8. Januar)
- ~~PDF-Download für Urkunde~~ → PNG-Download mit html2canvas implementiert!
- ~~Challenge für Werkzeuge-Insel Grundschule~~ → 7 Powertechniken komplett!

---

# GIT-STATUS

## Committed am 6. Januar 2025:
- Superhelden-Quiz mit Leben-System
- Bandura/Hattie Challenge Integration
- Selbstcheck für Grundschule
- Alle Content-Dateien für Festung der Stärke
- BattleQuiz mit 4 Fragetypen

## Wichtige Dateien im Repository:
```
components/rpg_schatzkarte/frontend/
├── src/
│   ├── components/BattleQuiz.tsx      # Quiz mit Leben-System
│   ├── components/QuestModal.tsx      # Modal mit Challenges
│   ├── content/festungContent.ts      # Inhalte Festung
│   ├── content/festungQuizContent.ts  # Quiz-Fragen
│   ├── types.ts                       # Erweiterte Typen
│   └── styles/rpg-theme.css           # Alle Styles
└── build/                              # Kompiliertes Frontend
```

---

# ÄNDERUNGSHISTORIE

| Datum | Was | Details |
|-------|-----|---------|
| **21.01.2025** | **🖼️ Hintergrundbilder** | 4 Inseln mit immersiven Hintergründen: Starthafen, Festung, Werkzeuge, Fäden |
| 21.01.2025 | Glaseffekt-Design | Transparente Container mit backdrop-filter blur für modernen Look |
| 21.01.2025 | PowertechnikenChallenge | Komplett auf neues Design umgestellt mit werkzeuge-bg.jpg |
| **16.01.2025** | **🎨 15 Custom SVG Icons** | Alle 15 Insel-Icons + 3 Schiff-Icons + Lerntechniken-Icon komplett |
| 16.01.2025 | Widget-Redesign | Lerntechniken & Tagebuch wie Schiffe gestaltet (transparent, Label unten) |
| 16.01.2025 | Legende aktualisiert | Farbige Punkte → Emoji-Indikatoren (⭐/🔒) |
| 16.01.2025 | Avatar vergrößert | 80px → 110px für bessere Sichtbarkeit |
| 16.01.2025 | Text-Lesbarkeit | PowertechnikenChallenge mit weißem Text + Shadows |
| 16.01.2025 | Admin TestPanel | is_admin Parameter für Streamlit hinzugefügt |
| **15.01.2025** | **🧠 Memory-Spiel** | Vollständiges Mini-Spiel mit XP-Wettsystem, 3 Schwierigkeiten, Timer, Leben |
| 15.01.2025 | Avatar verbessert | Premium-SVG mit Multi-Stop Gradienten, Haar-Glanz, Augen-Details |
| 15.01.2025 | MiniGames-System | Neue Ordnerstruktur für Mini-Spiele, types/games.ts |
| **14.01.2025** | **📹 Video-Chat Integration** | Jitsi Meet für Lerngruppen: Coach plant Treffen, Kinder sehen Countdown |
| 14.01.2025 | Karten-Anpassung | Hintergrundbild 115% breit, Inseln neu auf Landmasse verteilt |
| 14.01.2025 | Neue Komponenten | VideoChat/, useMeeting Hook, Meeting-Tabellen in DB |
| 14.01.2025 | Lerngruppen UI | Neuer Tab "📹 Video-Treffen" für Coaches |
| **13.01.2025** | **🎨 Design auf ALLE 14 Inseln** | 10 neue Experience-Komponenten + 10 CSS-Dateien erstellt! |
| 13.01.2025 | Neue Experience-Komponenten | SpiegelSee, Vulkan, RuheOase, AusdauerGipfel, FokusLeuchtturm, WachstumGarten, LehrerTurm, WohlfuehlDorf, SchutzBurg, MeisterBerg |
| 13.01.2025 | Dokumentation aktualisiert | SCHATZKARTE_STATUS_UEBERSICHT.md komplett überarbeitet |
| **12.01.2025** | **🎨 Neues Insel-Design-System** | FestungIslandExperience + BrueckenIslandExperience mit Framer Motion Animationen |
| 12.01.2025 | TransferChallenge Redesign | 4 kreative Phasen: Verbindungen, Mein Trick, Mission, Tagebuch |
| 12.01.2025 | Bug-Fix SuperheldenTagebuch | useEffect für isOpen State-Sync hinzugefügt |
| 12.01.2025 | Brücken Quiz komplett | Quiz für alle 3 Altersstufen (GS, US, MS) |
| 12.01.2025 | Design-Dokumentation | Template + Anleitung für weitere Inseln |
| **08.01.2025** | **7 Powertechniken Challenge** | Grundschule komplett: 7 interaktive Übungen, Zertifikat, PNG-Download |
| 08.01.2025 | Pomodoro Zyklus-System | Lern-Pause-Wechsel beliebig oft, Zyklus-Zähler |
| 08.01.2025 | Anki-Hinweis | Eltern-Tipp bei Spaced Repetition |
| 08.01.2025 | Loci Grammatik | Artikel korrigiert (das Bett, die Tür) |
| 08.01.2025 | Interleaving verbessert | Plus/Minus/Mal, 3.-4. Klasse Niveau, Erklärungsbox |
| 08.01.2025 | Zertifikat-Download | html2canvas für PNG-Export, Drucken-Button |
| 08.01.2025 | WorldMap Widget | Floating-Button für Lerntechniken-Übersicht |
| **07.01.2025** | **Bandura-Urkunde** | Zeigt jetzt echte Einträge statt nur Zahlen (React + Python) |
| 07.01.2025 | Effektstärke-Dropdown | Neues Dropdown bei Werkzeuge-Insel für alle Altersstufen |
| 07.01.2025 | Vollständige Bandura | Festung zeigt direkt vollständige Challenge (nicht Kurzversion) |
| 07.01.2025 | Text-Korrektur | "anstrengend anfühlt" statt "falsch anfühlt" |
| 07.01.2025 | Neue Komponenten | BanduraChallenge.tsx, HattieChallenge.tsx, Brainy.tsx, WerkzeugeTutorial.tsx |
| **06.01.2025** | **Superhelden-Quiz** | Leben-System (3 Herzen), 4 Fragetypen (single, multi-select, matching, ordering), Game Over Screen |
| 06.01.2025 | Bandura-Challenge | 4 Quellen mit Tagebuch-Einträgen integriert |
| 06.01.2025 | Hattie-Challenge | 5-Schritt-Flow komplett implementiert |
| 06.01.2025 | Selbstcheck | Nintendo Switch-Style interaktiver Quiz für Grundschule |
| 06.01.2025 | Festung-Content | Umfangreiche Inhalte für alle Altersstufen |
| **05.01.2025** | **React-Redesign** | Schatzkarte als React Custom Component, Vite+TypeScript, bidirektionale Kommunikation |
| 05.01.2025 | Tutorial-System | Starthafen mit strukturierten Schritten |
| 05.01.2025 | Insel-Typen | tutorial, flexible, finale Typen hinzugefügt |
| 10.12.2024 | Lerngruppen-UI | Coach kann Gruppen erstellen, Kinder einladen |
| 10.12.2024 | Rollen-System | user_system.py erweitert um role-Spalte |
| Früher | Schatzkarte Grundgerüst | 15 Inseln, Modal-System, Schiffe |

---

# WENN DU WEITERARBEITEST

## Schnellstart
```bash
cd /Users/sandra/Documents/Pulse_of_learning/Pulse_of_learning_Schatzkarte

# App starten (Build ist bereits fertig!)
streamlit run Home.py
```

## 🖼️ AKTUELL: Hintergrundbilder für Inseln

**Stand:** 4 von 15 Inseln haben Hintergrundbilder.

### So fügst du ein neues Hintergrundbild hinzu:

1. **Bild finden**: Unsplash oder ähnlich (frei verwendbar)
2. **Bild speichern**: Als `[insel]-bg.jpg` in `/components/rpg_schatzkarte/frontend/public/`
3. **CSS anpassen**: Die entsprechende `[insel]-island.css` Datei bearbeiten:

```css
/* 1. Haupt-Container */
.[insel]-island {
  background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%),
              url('/[insel]-bg.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  color: var(--white);
}

/* 2. Container transparent machen */
.[insel]-island .phase-container,
.[insel]-island .quest-card,
.[insel]-island .scroll-section,
.[insel]-island .scroll-intro {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 3. Text weiß mit Schatten */
.[insel]-island h1, .[insel]-island h2, .[insel]-island h3,
.[insel]-island p, .[insel]-island li {
  color: var(--white);
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}
```

4. **Build**: `cd components/rpg_schatzkarte/frontend && npm run build`

### Fertige Beispiele:
- `starthafen-island.css` - Base Camp
- `festung-island.css` - Mental stark
- `werkzeuge-island.css` - Cleverer lernen
- `faeden-island.css` - Station der Fäden
- `powertechniken-challenge.css` - Challenge 7

---

## 🎨 Design-System ist FERTIG!

Alle 14 Inseln haben jetzt das animierte Design-System. Die nächsten Aufgaben sind:

### HAUPTAUFGABE: Quiz-Content erstellen

**Priorität 1: Festung Mittelstufe**
- Erstelle: `festungQuizContent_mittelstufe.ts`
- Template: Kopiere von `festungQuizContent_unterstufe.ts`
- Passe Fragen für 15-18 Jahre an

**Priorität 2: Werkzeuge Unterstufe/Mittelstufe**
- Erstelle: `werkzeugeQuizContent_unterstufe.ts`
- Erstelle: `werkzeugeQuizContent_mittelstufe.ts`
- Template: Kopiere von `werkzeugeQuizContent.ts`

**Priorität 3: Fäden alle Stufen**
- Erstelle: `faedenQuizContent.ts` (Grundschule)
- Erstelle: `faedenQuizContent_unterstufe.ts`
- Erstelle: `faedenQuizContent_mittelstufe.ts`

## Zum Testen des neuen Designs:

1. Schatzkarte öffnen
2. **Jede Insel** anklicken → Alle haben jetzt animiertes Design!
3. Quest-Karten zeigen "Coming Soon" für leere Inseln
4. XP-Popup und Animationen prüfen

## Farb-Schema aller Inseln:

| Insel | Farbe | CSS-Datei |
|-------|-------|-----------|
| 🏰 Festung | Lila/Pink | festung-island.css |
| 🔧 Werkzeuge | Grün | werkzeuge-island.css |
| 🌉 Brücken | Türkis | bruecken-island.css |
| 🧵 Fäden | Lila | faeden-island.css |
| 🧠 Spiegel-See | Blau | spiegel-see-island.css |
| 🔥 Vulkan | Rot | vulkan-island.css |
| 😌 Ruhe-Oase | Türkis | ruhe-oase-island.css |
| 🏆 Ausdauer-Gipfel | Orange | ausdauer-gipfel-island.css |
| 🎯 Fokus-Leuchtturm | Hellorange | fokus-leuchtturm-island.css |
| 🌱 Wachstums-Garten | Grün | wachstum-garten-island.css |
| 🏫 Lehrer-Turm | Lila | lehrer-turm-island.css |
| 🏠 Wohlfühl-Dorf | Sanftgrün | wohlfuehl-dorf-island.css |
| 🛡️ Schutz-Burg | Pink | schutz-burg-island.css |
| ⛰️ Berg der Meisterschaft | Gold | meister-berg-island.css |

## Bei Problemen
- **"Component nicht gefunden"?** → `cd components/rpg_schatzkarte/frontend && npm run build`
- **Fehler in React?** → Console im Browser prüfen (F12)
- **Import-Fehler?** → Prüfe ob `components/__init__.py` existiert
- **DB-Fehler?** → `rm data/hattie_gamification.db` und neu starten
- **CSS lädt nicht?** → Import in Experience.tsx prüfen

---

# WICHTIGE DATEIEN FÜR WEITERENTWICKLUNG

| Datei | Beschreibung |
|-------|--------------|
| `components/rpg_schatzkarte/frontend/src/App.tsx` | Haupt-React-Komponente |
| `components/rpg_schatzkarte/frontend/src/types.ts` | TypeScript-Definitionen |
| `components/rpg_schatzkarte/__init__.py` | Python-Bridge zu Streamlit |
| `pages/1_🗺️_Schatzkarte.py` | Streamlit-Seite die React nutzt |
| `schatzkarte/map_data.py` | Insel-Definitionen |

---

**Letzte Bearbeitung:** 16. Januar 2025
**Nächster Meilenstein:** Quiz-Content für fehlende Stufen erstellen (Festung MS, Werkzeuge US/MS, Fäden alle)

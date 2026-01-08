# Pulse of Learning - Schatzkarte
## Dokumentation Stand 8. Januar 2025

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

# HEUTIGE ÄNDERUNGEN (8. Januar 2025)

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

## TODO für 9. Januar

### 1. Insel der 7 Werkzeuge - UNTERSTUFE
Die **Insel der 7 Werkzeuge für Unterstufe** muss noch gemacht werden!
- Gleiche 7 Techniken, aber angepasste Sprache/Übungen für ältere Schüler
- Komplexere Interleaving-Aufgaben
- Längere Pomodoro-Zeiten (25 Min statt 15 Min)

### 2. 🐛 BUG: Superhelden-Tagebuch lässt sich nicht schließen
**Problem:** Das Superhelden-Tagebuch (Grundschule) lässt sich nicht schließen.
- Vermutlich überdeckt ein Button den Schließen-Button
- **Komponente:** `SuperheldenTagebuch.tsx`
- **Zu prüfen:** Z-Index, Button-Positionierung, Click-Handler

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

# NÄCHSTE SCHRITTE (9. Januar 2025)

## Hohe Priorität
1. **Insel der 7 Werkzeuge - UNTERSTUFE** - Challenge für ältere Schüler erstellen
   - Angepasste Sprache (weniger kindlich)
   - Komplexere Interleaving-Aufgaben
   - Längere Pomodoro-Zeiten (25 Min statt 15 Min)
2. **🐛 BUG FIX: Superhelden-Tagebuch** - Schließen-Button funktioniert nicht
   - Vermutlich Z-Index oder Button-Überlappung
   - Komponente: `SuperheldenTagebuch.tsx`
3. **Quiz für Werkzeuge-Insel** - Quiz-Fragen für alle Altersstufen

## Mittlere Priorität
4. **Quiz-Ergebnisse speichern** - Datenbank-Erweiterung
5. **Willkommensvideo** - YouTube-URL produzieren
6. **Design-Feinschliff** - CSS anpassen nach Feedback

## Niedrige Priorität
7. **Gruppenchat** - Lösung finden
8. **Weitere Selfchecks** - Für andere Altersstufen/Inseln

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

# WENN DU MORGEN WEITERARBEITEST

## Schnellstart
```bash
cd /Users/sandra/Documents/Pulse_of_learning/Pulse_of_learning_Schatzkarte

# App starten (Build ist bereits fertig!)
streamlit run Home.py
```

## Was als erstes tun?
1. **Powertechniken-Challenge testen** - Insel der 7 Werkzeuge → alle 7 Übungen durchspielen → Zertifikat erstellen
2. **Unterstufe Challenge** - Gleiche 7 Techniken, aber für ältere Schüler anpassen
3. **Quiz-Fragen** - Für Werkzeuge-Insel erstellen

## Zum Testen der Powertechniken-Challenge:
1. Schatzkarte öffnen (als Grundschüler eingeloggt)
2. Insel der 7 Werkzeuge anklicken
3. Challenge starten
4. Alle 7 Techniken durchspielen:
   - 🍅 Pomodoro-Timer starten (30 Sek Demo)
   - 🔄 Active Recall Memory-Spiel
   - 👶 Feynman Teddy-Erklärer
   - 📅 Spaced Repetition Kalender
   - 👥 Teaching Partner-Checkliste
   - 🏰 Loci 5 Orte belegen
   - 🔀 Interleaving Mathe-Mixer
5. Zertifikat erstellen → Download als PNG testen

## Zum Testen des WorldMap-Widgets:
1. Schatzkarte öffnen
2. Unten rechts: Floating-Button "📋 Lerntechniken"
3. Klicken → Übersicht öffnet sich
4. Nach 7 Techniken: Goldener Glow + "🎓 Zertifikat"

## Bei Problemen
- **"Component nicht gefunden"?** → `cd components/rpg_schatzkarte/frontend && npm run build`
- **Fehler in React?** → Console im Browser prüfen (F12)
- **Import-Fehler?** → Prüfe ob `components/__init__.py` existiert
- **DB-Fehler?** → `rm data/hattie_gamification.db` und neu starten

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

**Letzte Bearbeitung:** 8. Januar 2025
**Nächster Meilenstein:** Insel der 7 Werkzeuge - Unterstufe Challenge implementieren

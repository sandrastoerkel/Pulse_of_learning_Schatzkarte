# Pulse of Learning - Schatzkarte
## Dokumentation Stand 6. Januar 2025

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

# HEUTIGE ÄNDERUNGEN (6. Januar 2025)

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

### 1. Urkunden/Zertifikate für Bandura-Challenge
**Problem:** Nach Abschluss der Bandura-Challenge soll eine Urkunde erstellt werden können.

**Anforderungen:**
- PDF-Generator für Urkunden
- Personalisiert mit Name des Schülers
- Zeigt abgeschlossene Power-Ups
- Datum und XP-Punkte
- Druckbar/Downloadbar

### 2. Inhalte für weitere Inseln
**Problem:** Die Content-Dateien für die anderen Inseln müssen noch mit Quiz-Fragen erweitert werden.

**Bereits fertig:**
- ✅ Festung der Stärke (festungContent.ts + festungQuizContent.ts)
- ⏳ Insel der 7 Werkzeuge (werkzeugeContent.ts - Quiz fehlt)
- ⏳ Insel der Fäden (faedenContent.ts - Quiz fehlt)
- ⏳ Insel der Brücken (brueckenContent.ts - Quiz fehlt)

### 3. Willkommensvideo
**Problem:** URL ist noch leer in `map_data.py`

**Wo:** `schatzkarte/map_data.py` Zeile 27:
```python
"welcome_video_url": "",  # <-- URL einfügen
```

### 4. Gruppenchat-Link
**Problem:** Platzhalter für Gruppenchat

**Lösung:** Discord/WhatsApp-Link oder eigenes Chat-System

### 5. Quiz-Daten speichern
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

# NÄCHSTE SCHRITTE (7. Januar 2025)

## Hohe Priorität
1. **Urkunden-System für Bandura-Challenge** - PDF-Generator implementieren
   - Vorlage designen (A4 Querformat)
   - Name, Datum, Power-Ups, XP einfügen
   - Download-Button nach Challenge-Abschluss
2. **Quiz für andere Inseln erstellen** - Werkzeuge, Fäden, Brücken
3. **Testen** - Superhelden-Quiz durchspielen, alle Fragetypen prüfen

## Mittlere Priorität
4. **Quiz-Ergebnisse speichern** - Datenbank-Erweiterung
5. **Willkommensvideo** - YouTube-URL produzieren
6. **Design-Feinschliff** - CSS anpassen nach Feedback

## Niedrige Priorität
7. **Gruppenchat** - Lösung finden
8. **Weitere Selfchecks** - Für andere Altersstufen/Inseln

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
1. **Superhelden-Quiz testen** - Festung der Stärke → Monster besiegen → Quiz starten
2. **Urkunden-System planen** - Siehe TODO #1
3. **Weitere Quiz-Fragen** - Für Werkzeuge, Fäden, Brücken erstellen

## Zum Testen des Superhelden-Quiz:
1. Schatzkarte öffnen
2. Festung der Stärke anklicken
3. "Monster besiegen" wählen
4. "Quiz starten" klicken
5. Alle 10 Fragen durchspielen (3 Leben!)

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

**Letzte Bearbeitung:** 6. Januar 2025
**Nächster Meilenstein:** Urkunden-System für Bandura-Challenge implementieren

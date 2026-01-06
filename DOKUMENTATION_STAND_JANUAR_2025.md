# Pulse of Learning - Schatzkarte
## Dokumentation Stand 5. Januar 2025

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

# HEUTIGE ÄNDERUNGEN (5. Januar 2025)

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

### 1. React-Komponente bauen (WICHTIG!)
**Problem:** Die React-Komponente muss vor dem ersten Start gebaut werden!

**Lösung:**
```bash
cd components/rpg_schatzkarte/frontend
npm install
npm run build
```

### 2. Inhalte in React einfügen
**Problem:** Die Inhalte (Videos, Erklärungen, Quiz-Fragen) müssen noch in die React-Komponente eingepflegt werden.

**Wo:** `components/rpg_schatzkarte/frontend/src/content/`

### 3. Quiz-System implementieren
**Problem:** Das Quiz ("battle") ist als Konzept da, aber noch nicht spielbar.

**Lösung:** Quiz-Logik in React implementieren mit:
- Fragen aus `content/` laden
- Richtige/Falsche Antworten tracken
- XP vergeben bei Bestehen

### 4. Bandura & Hattie Schiffe
**Problem:** Die schwimmenden Schiffe waren im alten System, müssen in React neu gebaut werden.

### 5. Willkommensvideo
**Problem:** URL ist noch leer in `map_data.py`

**Wo:** `schatzkarte/map_data.py` Zeile 27:
```python
"welcome_video_url": "",  # <-- URL einfügen
```

### 6. Gruppenchat-Link
**Problem:** Platzhalter für Gruppenchat

**Lösung:** Discord/WhatsApp-Link oder eigenes Chat-System

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

# NÄCHSTE SCHRITTE (MORGEN)

## Hohe Priorität
1. **React-Komponente bauen** - `npm install && npm run build` im frontend-Ordner
2. **Testen** - App starten und Schatzkarte ausprobieren
3. **Inhalte einfügen** - Videos, Erklärungen in React-Content-Ordner

## Mittlere Priorität
4. **Quiz-System** - React-Komponente für Quiz-Kämpfe
5. **Bandura/Hattie Schiffe** - In React neu implementieren
6. **Design-Feinschliff** - CSS anpassen

## Niedrige Priorität
7. **Willkommensvideo** - YouTube-URL produzieren
8. **Gruppenchat** - Lösung finden

---

# GIT-STATUS

## Nicht committed:
- `pages/1_🗺️_Schatzkarte.py` - Komplett neu geschrieben
- `schatzkarte/map_data.py` - Tutorial-System erweitert
- `utils/user_system.py` - Kleine Änderungen
- `components/` - Komplett neuer Ordner (nicht im Git!)

## Empfehlung:
```bash
git add -A
git commit -m "Feature: React Custom Component für Schatzkarte (RPG-Redesign)"
```

---

# ÄNDERUNGSHISTORIE

| Datum | Was | Details |
|-------|-----|---------|
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

# WICHTIG: React bauen (falls noch nicht geschehen)
cd components/rpg_schatzkarte/frontend
npm install
npm run build
cd ../../..

# App starten
streamlit run Home.py
```

## Was als erstes tun?
1. **React bauen** - Siehe Schnellstart oben
2. **Testen** - Schatzkarte öffnen, Inseln erkunden
3. **Console prüfen** - Bei Fehlern: Browser-Konsole (F12) öffnen

## Bei Problemen
- **"Component nicht gefunden"?** → `npm run build` ausführen
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

**Letzte Bearbeitung:** 5. Januar 2025
**Nächster Meilenstein:** React-Komponente testen und Inhalte einfügen

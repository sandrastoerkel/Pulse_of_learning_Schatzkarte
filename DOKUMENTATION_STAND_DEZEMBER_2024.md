# Pulse of Learning - Schatzkarte
## Dokumentation Stand 10. Dezember 2024

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

# APP-ÜBERSICHT

## Seiten (8 Stück)

| Seite | Funktion | Status |
|-------|----------|--------|
| 1_📚_Ressourcen | Lern-Ressourcen mit Videos, Tipps, Challenges | ✅ Fertig |
| 2_🎓_Elternakademie | Diagnostik für Eltern-Unterstützung | ✅ Fertig |
| 3_🔍_Screening_Diagnostik | 2-stufiges Schüler-Screening | ✅ Fertig |
| 4_📊_Auswertung | Ergebnis-Darstellung mit Hattie-Bezug | ✅ Fertig |
| 5_📖_PISA_Forschungsgrundlage | Info-Seite zur Forschung | ✅ Fertig |
| 6_🗺️_Schatzkarte | Gamifizierte Lernreise (15 Inseln) | ✅ Grundgerüst fertig |
| 7_👥_Lerngruppen | Coach-Interface für Gruppenverwaltung | ✅ Fertig (10.12.24) |
| 8_🔐_Admin | Benutzer-Rollen verwalten | ✅ Fertig |

---

# SCHATZKARTE - DETAILSTATUS

## Was funktioniert:

### Inseln (15 Stück)
- **Woche 0:** Starthafen (Welcome)
- **Woche 1:** Festung der Stärke (Selbstwirksamkeit)
- **Woche 2:** Insel der 7 Werkzeuge (Lernstrategien)
- **Woche 3:** Insel der Brücken (Transfer)
- **Woche 4:** Insel der Fäden (Birkenbihl)
- **Woche 5-11:** 7 aus 9 flexiblen Inseln (Coach wählt **wochenweise**)
- **Woche 12:** Berg der Meisterschaft (Finale)

### Gamification-System
- ✅ XP-System mit 8 Leveln
- ✅ Streak-Tracking (Tage in Folge)
- ✅ Schätze sammeln auf jeder Insel
- ✅ Fortschrittsbalken
- ✅ Celebration (Balloons + Toast) bei Schatzsammeln

### User-System
- ✅ Login mit Name + Altersstufe
- ✅ Preview-Modus (ohne Anmeldung testen)
- ✅ Altersstufen-Weiche (nur Grundschule/Unterstufe sehen Schatzkarte)
- ✅ Avatar-System mit DiceBear

### Rollen-System
- ✅ 3 Rollen: Student, Coach, Admin
- ✅ Admin-Seite zur Rollenverwaltung
- ✅ Coach-Bereich für Lerngruppen

### Lerngruppen (Coach-Features) - NEU 10.12.2024
- ✅ Gruppen erstellen (Name + optionales Startdatum)
- ✅ Kinder per Email-Einladungslink einladen (Token-basiert, 7 Tage gültig)
- ✅ **Wöchentliche Insel-Auswahl** - Coach wählt Woche für Woche basierend auf Gruppendynamik
- ✅ Gruppen-Fortschritt überwachen (XP, Level, Mitglieder)
- ✅ Kind kann nur in EINER Gruppe sein (DB-Constraint)
- ✅ Coach kann beliebig viele Gruppen haben

### Schwimmende Schiffe
- ✅ Bandura-Schiff (4 Quellen der Selbstwirksamkeit)
- ✅ Hattie-Schiff (Selbsteinschätzungs-Challenge)

### Modal-System
- ✅ Insel-Modal öffnet sich bei Klick auf "Erkunden"
- ✅ Header mit Insel-Icon, Name, Beschreibung
- ✅ Fortschrittsbalken (0-100%)
- ✅ 4 Lernaktionen: Video, Erklärung, Quiz, Challenge
- ✅ Schätze-Sektion
- ✅ XP-Vergabe bei Aktionen

---

## Was noch NICHT funktioniert / TODO:

### 1. Modal-Inhalte fehlen
**Problem:** Das Modal zeigt die Struktur, aber die eigentlichen Inhalte sind noch nicht verknüpft.

**Was fehlt:**
- Kein echtes Video wird abgespielt (nur Platzhalter)
- Keine echte Erklärung wird angezeigt
- Kein echtes Quiz wird gestartet
- Keine echte Challenge wird geöffnet

**Wo:** `schatzkarte/map_modal.py` Zeile 21-42 hat ein `ISLAND_CONTENT_MAP` das Inseln auf Content-Quellen mappt, aber die Verbindung zur Ressourcen-Seite fehlt.

**Lösung:** Content aus `utils/ressourcen/` in die Modals integrieren.

### 2. Willkommensvideo fehlt
**Problem:** `welcome_video_url` ist leer in `map_data.py`

**Wo:** `schatzkarte/map_data.py` Zeile ~20
```python
"content": {
    "welcome_video_url": "",  # <-- LEER
    "show_group_chat_link": True,
}
```

**Lösung:** YouTube-Video-URL einfügen.

### 3. Gruppenchat-Link fehlt (Platzhalter)
**Problem:** Nur Platzhalter-Text "(Link wird hier eingefügt)"

**Wo:** `schatzkarte/map_data.py` und `pages/6_🗺️_Schatzkarte.py`

**Lösung:** Echten Chat-Link (z.B. Discord, WhatsApp-Gruppe, oder eigenes Chat-System) einfügen.

**Hinweis:** Der Gruppenchat ist bewusst als Platzhalter gebaut. Der Coach nutzt den Chat um zu sehen, welche Themen die Kinder beschäftigen, und wählt dann die passende flexible Insel.

### 4. Reflexionsfragen nur angezeigt, nicht interaktiv
**Problem:** Berg der Meisterschaft zeigt Reflexionsfragen, aber keine Eingabemöglichkeit.

**Wo:** `schatzkarte/map_modal.py` Zeile 253-265

**Lösung:** Text-Inputs oder Formular für Antworten hinzufügen.

### 5. Domain für Einladungslinks anpassen
**Problem:** Einladungslinks zeigen `https://deine-app.streamlit.app/`

**Wo:** `pages/7_👥_Lerngruppen.py` Zeile ~347
```python
invite_url = f"https://deine-app.streamlit.app/?invite={token}"
```

**Lösung:** Echte Domain eintragen wenn deployed.

### 6. Admin-Passwort externalisieren
**Problem:** Passwort ist hardcoded im Code.

**Wo:** `pages/8_🔐_Admin.py` Zeile 24
```python
ADMIN_PASSWORD = "puls2024"
```

**Lösung:** Für Produktion in Umgebungsvariable auslagern:
```python
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "puls2024")
```

---

# LERNGRUPPEN-SYSTEM - TECHNISCHE DETAILS

## Konzept: Wöchentliche Insel-Auswahl

Der Coach wählt **nicht** alle 7 flexiblen Inseln am Anfang, sondern **Woche für Woche**:

```
Woche 1-4:   Feste Inseln (automatisch)
Woche 5:     Coach sieht "Welche Insel diese Woche?" 
             → Wählt aus 9 verfügbaren
             → Basierend auf Gruppenchat-Themen
Woche 6:     Coach wählt aus 8 verbleibenden
...
Woche 11:   Coach wählt aus 3 verbleibenden
Woche 12:   Berg der Meisterschaft (automatisch)
```

**Warum so?** Der Coach kann auf die Gruppendynamik reagieren. Wenn viele Kinder diese Woche von Prüfungsangst berichten → Ruhe-Oase wählen.

## DB-Tabellen (in hattie_gamification.db)

```sql
-- Lerngruppen
CREATE TABLE learning_groups (
    group_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    coach_id TEXT NOT NULL,
    created_at TIMESTAMP,
    start_date DATE,
    current_week INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1
);

-- Gruppen-Mitglieder (Kind kann nur in 1 Gruppe)
CREATE TABLE group_members (
    id INTEGER PRIMARY KEY,
    group_id TEXT NOT NULL,
    user_id TEXT NOT NULL UNIQUE,  -- UNIQUE = max 1 Gruppe
    joined_at TIMESTAMP,
    status TEXT DEFAULT 'active'
);

-- Einladungs-Tokens
CREATE TABLE group_invitations (
    token TEXT PRIMARY KEY,
    group_id TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMP,
    expires_at TIMESTAMP,
    used_at TIMESTAMP,
    used_by TEXT
);

-- Wöchentliche Insel-Auswahl
CREATE TABLE group_weekly_islands (
    id INTEGER PRIMARY KEY,
    group_id TEXT NOT NULL,
    week_number INTEGER NOT NULL,   -- 5-11
    island_id TEXT NOT NULL,
    activated_at TIMESTAMP,
    coach_notes TEXT,               -- Warum diese Insel?
    UNIQUE(group_id, week_number),  -- 1 Insel pro Woche
    UNIQUE(group_id, island_id)     -- Jede Insel nur 1x
);
```

## Flexible Inseln (9 Stück)

| ID | Name | Icon | Thema |
|----|------|------|-------|
| spiegel_see | Spiegel-See | 🧠 | Selbstreflexion |
| vulkan | Vulkan der Motivation | 🔥 | Intrinsische Motivation |
| ruhe_oase | Ruhe-Oase | 😌 | Entspannung, Prüfungsangst |
| ausdauer_gipfel | Ausdauer-Gipfel | 🏆 | Durchhaltevermögen |
| fokus_leuchtturm | Fokus-Leuchtturm | 🎯 | Konzentration |
| wachstum_garten | Wachstums-Garten | 🌱 | Growth Mindset |
| lehrer_turm | Lehrer-Turm | 🏫 | Lehrer-Schüler-Beziehung |
| wohlfuehl_dorf | Wohlfühl-Dorf | 🏠 | Lernumgebung |
| schutz_burg | Schutz-Burg | 🛡️ | Grenzen setzen |

---

# DATENBANKEN

| Datenbank | Inhalt | Pfad |
|-----------|--------|------|
| hattie_gamification.db | Users, XP, Streaks, Challenges, Lerngruppen, Schätze | data/ oder /tmp/ |
| coaching.db | Schüler, Assessments, Entwicklungspläne | Projekt-Root |
| pisa_2022_germany.db | 6.116 PISA-Schüler, 50+ Skalen (Read-Only) | data/ |

---

# DATEISTRUKTUR

```
Pulse_of_learning_Schatzkarte/
├── Home.py                 # Einstiegspunkt
├── pages/
│   ├── 1_📚_Ressourcen.py
│   ├── 2_🎓_Elternakademie.py
│   ├── 3_🔍_Screening_Diagnostik.py
│   ├── 4_📊_Auswertung.py
│   ├── 5_📖_PISA_Forschungsgrundlage.py
│   ├── 6_🗺️_Schatzkarte.py
│   ├── 7_👥_Lerngruppen.py      # Coach-Interface
│   └── 8_🔐_Admin.py
├── schatzkarte/
│   ├── map_data.py         # 15 Inseln definiert
│   ├── map_db.py           # Datenbank-Funktionen
│   ├── map_modal.py        # Insel-Detail-Modal
│   ├── map_progress.py     # Freischaltungs-Logik
│   ├── map_renderer.py     # HTML-Rendering
│   ├── map_ships.py        # Bandura & Hattie Schiffe
│   └── map_styles.py       # CSS
├── utils/
│   ├── user_system.py      # Login, Rollen, Preview
│   ├── gamification_db.py  # XP, Level, Streaks
│   ├── lerngruppen_db.py   # Coach-Gruppen (NEU)
│   ├── coaching_db.py      # Schüler-Management
│   └── ressourcen/         # Content für Ressourcen-Seite
└── data/
    └── *.db                # SQLite-Datenbanken
```

---

# NÄCHSTE SCHRITTE (Priorität)

## Hohe Priorität
1. **Modal-Inhalte verknüpfen** - Videos, Erklärungen, Quizze aus Ressourcen laden
2. **Willkommensvideo** - YouTube-URL einfügen
3. **Domain anpassen** - Für Einladungslinks

## Mittlere Priorität
4. **Gruppenchat-Lösung** - Discord/WhatsApp/eigenes System
5. **Reflexionsfragen interaktiv** - Eingabefelder hinzufügen
6. **Quiz-System** - Echte Fragen pro Insel erstellen

## Niedrige Priorität (Produktion)
7. **Admin-Passwort** - In Umgebungsvariable
8. **Detaillierte Auswertung** - TODO in Screening_Diagnostik.py Zeile 438
9. **Videos produzieren** - Begrüßungsvideo, Insel-Erklärvideos

---

# TECHNISCHE DETAILS

## App starten
```bash
cd /Users/sandra/Documents/Pulse_of_learning/Pulse_of_learning_Schatzkarte
streamlit run Home.py
```

## Einen User zum Coach machen (Alternative ohne UI)
```python
from utils.user_system import set_user_role, ROLE_COACH, get_all_users

# Zeige alle User
for u in get_all_users():
    print(f"{u['display_name']}: {u['user_id']}")

# Mache User zum Coach
set_user_role("USER_ID_HIER", ROLE_COACH)
```

## Datenbank zurücksetzen
```bash
rm data/hattie_gamification.db
# App neu starten - Tabellen werden automatisch erstellt
```

## Lerngruppen testen
```python
from utils.lerngruppen_db import (
    create_group, get_coach_groups, create_invitation,
    activate_weekly_island, get_available_islands
)

# Gruppe erstellen
group_id = create_group("Testgruppe", "COACH_USER_ID")

# Einladung erstellen
token = create_invitation(group_id, "test@email.de")
print(f"Einladungslink: ?invite={token}")

# Verfügbare Inseln anzeigen
print(get_available_islands(group_id))  # Alle 9

# Insel für Woche 5 aktivieren
activate_weekly_island(group_id, 5, "ruhe_oase", "Viele Kinder waren gestresst")
```

---

# ÄNDERUNGSHISTORIE

| Datum | Was | Details |
|-------|-----|---------|
| 10.12.2024 | Lerngruppen-UI gebaut | Coach kann Gruppen erstellen, Kinder einladen, wöchentlich Inseln wählen |
| 10.12.2024 | Rollen-System | user_system.py erweitert um role-Spalte |
| 10.12.2024 | DB-Erweiterung | 4 neue Tabellen für Lerngruppen |
| Früher | Schatzkarte Grundgerüst | 15 Inseln, Modal-System, Schiffe |

---

# WENN DU WIEDERKOMMST (Nach 3 Wochen)

## Schnellstart
1. Terminal öffnen
2. `cd /Users/sandra/Documents/Pulse_of_learning/Pulse_of_learning_Schatzkarte`
3. `streamlit run Home.py`
4. Browser: http://localhost:8501

## Was zuerst tun?
1. **Testen:** Einloggen, zur Schatzkarte gehen, Inseln erkunden
2. **Coach testen:** Admin → dich zum Coach machen → Lerngruppen erstellen
3. **Dokumentation lesen:** Diese Datei durchgehen

## Bei Problemen
- **Import-Fehler?** Prüfe ob alle Dateien in den richtigen Ordnern liegen
- **DB-Fehler?** `rm data/hattie_gamification.db` und neu starten
- **Rollen funktionieren nicht?** Prüfe ob `role`-Spalte in users-Tabelle existiert

---

# KONTAKT / NOTIZEN

**Letzte Bearbeitung:** 10. Dezember 2024

**Wichtige Dateien für Weiterentwicklung:**
- `schatzkarte/map_modal.py` - Modal-Logik
- `schatzkarte/map_data.py` - Insel-Definitionen  
- `utils/user_system.py` - Rollen-System
- `utils/lerngruppen_db.py` - Lerngruppen-DB-Funktionen
- `pages/7_👥_Lerngruppen.py` - Coach-Interface

**Nächster großer Meilenstein:** Content (Videos, Erklärungen, Quizze) in die Modals integrieren

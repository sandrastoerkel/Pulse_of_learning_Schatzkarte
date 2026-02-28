# Pulse of Learning - Schatzkarte
## Dokumentation Stand 28. Februar 2026

---

# ÄNDERUNGEN (28. Februar 2026)

## Nachrichtenboard: WhatsApp-Style Chat fuer Lerngruppen

### Zweck
Kinder und Coach koennen asynchron Nachrichten austauschen — auch wenn jemand aus dem Video-Chat faellt oder ausserhalb der Treffen etwas mitteilen moechte.

### Architektur
| Aspekt | Loesung |
|--------|---------|
| **Nachrichten speichern** | Python → Supabase (ueber `onAction`-Bridge) |
| **Nachrichten laden** | Python laedt initiale Nachrichten, uebergibt als Props an React |
| **Echtzeit-Updates** | Supabase Realtime `postgres_changes` direkt im React-Frontend |
| **UI-Pattern** | `FloatingChatWidget` analog zum `FloatingJitsiWidget` |

### Neue Dateien

**1. SQL-Migration:** `sql/01_migration_group_messages.sql`
- Tabelle `group_messages` mit Soft-Delete, DM-Support, 500-Zeichen-Limit
- RLS-Policies: `anon` lesen, `service_role` schreiben
- Supabase Realtime aktiviert
- `last_seen_chat` Spalte in `group_members` fuer Ungelesen-Badge

**2. Backend:** `utils/nachrichten_db.py`
```
Funktionen:
├── get_group_messages(group_id, user_id)   → Gruppen-Chat + eigene DMs
├── send_message(group_id, sender_id, ...)  → Gruppen-Nachricht
├── send_direct_message(...)                → DM innerhalb einer Gruppe
├── send_system_message(group_id, text)     → System-Nachricht
├── delete_message(message_id, deleted_by)  → Soft-Delete (Coach)
├── get_unread_count(group_id, user_id)     → Ungelesene Nachrichten
├── update_last_seen(group_id, user_id)     → Badge zuruecksetzen (Kind)
├── update_last_seen_coach(group_id, ...)   → Badge zuruecksetzen (Coach, via settings JSON)
└── load_chat_data(user_id)                 → Alle Daten fuer React-Komponente
```

**3. React:** `components/rpg_schatzkarte/frontend/src/components/Chat/FloatingChatWidget.tsx`
- Schwebendes Chat-Widget rechts unten (wie FloatingJitsiWidget)
- WhatsApp-Style Nachrichten-Bubbles (eigene rechts/blau, andere links/grau)
- Quick-Emoji-Bar (10 kinderfreundliche Emojis)
- Supabase Realtime Subscription fuer Live-Updates
- Optimistic Updates beim Senden
- Notification Sound bei neuen Nachrichten
- Ungelesen-Badge auf dem FAB-Button
- DM-System: Briefumschlag-Button → Mitglied waehlen → Direktnachricht
- Coach kann Nachrichten loeschen (Moderation)

### Gruppen-Wechsler (Coaches mit mehreren Gruppen)
Coaches mit mehreren Lerngruppen sehen im Header den Gruppennamen mit ▼-Pfeil. Klick oeffnet ein Dropdown mit allen Gruppen. Beim Wechsel werden Nachrichten und Mitglieder direkt von Supabase geladen (kein Page-Reload). Die Realtime-Subscription wechselt automatisch mit.

### Resize + Drag
- **Verschieben:** Am Header (lila Balken) ziehen — Maus + Touch
- **Stufenlos resizen:** An der oberen linken Ecke ziehen (Min: 300x350, Max: 800x900)
- **Preset-Groessen:** ⊕/⊖ Button wechselt zwischen klein (380x520) und gross (600x700)

### Geaenderte Dateien

| Datei | Aenderung |
|-------|-----------|
| `pages/1_🗺️_Schatzkarte.py` | Import nachrichten_db, `chat_data` laden, 4 neue Action-Handler (message_send, message_send_dm, message_delete, chat_seen) |
| `components/rpg_schatzkarte/__init__.py` | `chat_data` Parameter + `chatData` an Component durchreichen |
| `components/rpg_schatzkarte/frontend/src/App.tsx` | Import FloatingChatWidget, chatData in Props + Rendering |
| `components/rpg_schatzkarte/frontend/src/types.ts` | 4 neue Actions + 4 neue Felder (messageText, messageId, recipientId, groupId) |
| `components/rpg_schatzkarte/frontend/package.json` | `@supabase/supabase-js` Dependency |

### Datenfluss
```
Kind tippt Nachricht
        │
        ▼ onAction({ action: 'message_send', messageText, groupId })
[React] FloatingChatWidget → [Streamlit Bridge]
        │
        ▼
[Python] Schatzkarte.py → nachrichten_db.send_message()
        │
        ▼
[Supabase] INSERT in group_messages
        │
        ▼ postgres_changes Event (Realtime)
[React] Supabase Subscription → setMessages([...prev, newMsg])
        │
        ▼
Alle Gruppenmitglieder sehen die Nachricht sofort
```

### Datenbank-Schema: group_messages
```sql
CREATE TABLE group_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id TEXT NOT NULL REFERENCES learning_groups(group_id),
    sender_id TEXT NOT NULL REFERENCES users(user_id),
    sender_name TEXT NOT NULL,
    recipient_id TEXT REFERENCES users(user_id),  -- NULL = Gruppe, gesetzt = DM
    message_text TEXT NOT NULL CHECK (char_length(message_text) <= 500),
    message_type TEXT DEFAULT 'text',  -- 'text', 'system', 'emoji'
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_by TEXT REFERENCES users(user_id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

# ÄNDERUNGEN (26. Februar 2026)

## Login-Loop Fix: Deferred Cookie Pattern

### Problem
Einloggen direkt auf der Schatzkarte fuehrte zu einer Dauerschleife — die Seite lud staendig neu, ohne den Login abzuschliessen. Das Problem trat auch nach Streamlit-Neustarts auf.

### Ursache
`_set_cookie_js()` in `login_user()` nutzt `components.html()`, das ein unsichtbares iframe rendert. Waehrend eines Button-Callbacks kollidiert dieses iframe mit dem anschliessenden `st.rerun()` — Streamlit kann nicht gleichzeitig ein iframe rendern und die Seite neu laden.

### Loesung: Deferred Cookie Setting
Der Cookie wird nicht mehr direkt im Button-Callback gesetzt, sondern zwischengespeichert und beim naechsten normalen Render-Durchlauf geschrieben:

```python
# In login_user() — Cookie nur vormerken:
token = _create_login_token(user['user_id'])
st.session_state._pending_login_cookie = token  # Statt _set_cookie_js()

# Registrierungs-State aufraeumen (verhindert Login-Loop):
for key in ["registration_step", "registration_name", "registration_age", "registration_password"]:
    if key in st.session_state:
        del st.session_state[key]

# In render_user_login() — Cookie im normalen Render setzen:
if st.session_state.get("_pending_login_cookie"):
    _set_cookie_js(COOKIE_NAME, st.session_state._pending_login_cookie, COOKIE_MAX_AGE_DAYS)
    del st.session_state["_pending_login_cookie"]
```

**Datei:** `utils/user_system.py`

---

## Meeting-Planung: Datums-Auswahl + Zeitzonen-Anzeige + Absagen

### Aenderungen an der Lerngruppen-Seite (`pages/7_👥_Lerngruppen.py`)

**1. Datums-Picker statt Wochentag:**
Statt eines Wochentag-Dropdowns gibt es jetzt einen `st.date_input` mit konkretem Datum (DD.MM.YYYY).

**2. Zeitzonen-Offset-Anzeige:**
Beim Planen wird der Zeitunterschied zwischen Gruppen-Zeitzone und Coach-Zeitzone angezeigt:
```
⏰ Uhrzeiten werden in Berlin-Zeit eingegeben — deine Zeit (Kuala Lumpur) ist +7h davon
```

**3. Treffen absagen:**
Jedes geplante Treffen hat jetzt einen 🗑️-Button mit Bestaetigungs-Dialog. Beim Absagen wird der Jitsi-Raumname freigegeben (`cancelled-{meeting_id}`), damit er nicht die Unique-Constraint blockiert.

**4. Toast + Rerun statt Success:**
Nach dem Planen eines Treffens wird `st.toast()` + `st.rerun()` verwendet (statt `st.success()` + `st.balloons()`), damit das Treffen sofort im "Naechstes Treffen"-Tab erscheint. Problem war: Streamlit rendert Tab 1 bevor Tab 2 das Formular verarbeitet.

### Aenderungen an der Datenbank-Logik (`utils/lerngruppen_db.py`)

**1. `schedule_meeting()` akzeptiert `specific_date`:**
```python
def schedule_meeting(group_id, coach_id, day_of_week, time_of_day,
                    duration_minutes=45, recurrence='einmalig', title=None, specific_date=None):
```

**2. `calculate_next_meeting_date()` beruecksichtigt Dauer:**
Wenn ein Treffen noch laeuft (Startzeit + Dauer > jetzt), wird es nicht auf naechste Woche verschoben.

**3. `generate_secure_room_name()` nutzt volle Startzeit:**
Vorher nur Datum im Hash → Duplikat-Fehler bei mehreren Treffen am selben Tag. Jetzt wird der volle `scheduled_start` Timestamp verwendet.

**4. `cancel_meeting()` gibt Raumnamen frei:**
```python
def cancel_meeting(meeting_id):
    result = get_db().table("scheduled_meetings").update({
        "status": "cancelled",
        "jitsi_room_name": f"cancelled-{meeting_id}"
    }).eq("id", meeting_id).execute()
```

---

## JaaS fuer Kinder: Meine Lernreise mit 8x8.vc

### Problem
Kinder auf der Seite "Meine Lernreise" wurden zu `meet.jit.si` (oeffentlicher Server) geleitet, waehrend der Coach auf `8x8.vc` (JaaS) war. Die Kinder sahen "The conference has not yet started" und konnten nicht beitreten.

### Loesung
`pages/9_🎒_Meine_Lernreise.py` wurde ueberarbeitet:
- Alte `_build_jitsi_url()` Funktion (meet.jit.si) entfernt
- Neue `_render_jitsi_kid()` Funktion mit JaaS-Einbettung:
  ```python
  jwt_token = generate_jaas_jwt(
      user_name=display_name, user_id=user_id,
      is_moderator=False, room=room_name, user_email='')
  ```
- Jitsi wird direkt via `components.html()` mit 8x8.vc External API eingebettet
- Kind ist `is_moderator=False` (kein Mute-alle-Button etc.)

---

## FloatingJitsiWidget: Komplett-Rewrite (Audio bleibt bei Minimierung)

### Problem
Jeder Button-Klick auf dem Video-Widget (klein/gross/minimieren/schliessen) loggte den Benutzer aus. Zusaetzlich wurde beim Minimieren das Audio gestoppt — Kinder konnten den Coach nicht mehr hoeren.

### Ursache
`useEffect` mit `[widgetState]` Dependency fuehrte bei jedem State-Wechsel zu:
`dispose()` → `videoConferenceLeft` Event → `Streamlit.setComponentValue()` → Seiten-Rerun → Logout

### Loesung: Persistent Jitsi
**Datei:** `components/rpg_schatzkarte/frontend/src/components/VideoChat/FloatingJitsiWidget.tsx`

- Jitsi wird einmal geladen (`jitsiActive` Flag) und bleibt am Leben
- Minimieren versteckt den Container offscreen (`left: -9999px`), aber das iframe bleibt im DOM → Audio laeuft weiter
- `isLeavingRef` Flag: Nur der ✕-Button loest einen Streamlit-Rerun aus
- Resize/Toggle aendert nur CSS, kein Jitsi-Restart
- Neue eindeutige Button-Icons: □ (maximieren), ↗ (neuer Tab), ─ (minimieren), ✕ (schliessen)

---

## Virtueller Hintergrund in Jitsi

`select-background` wurde zur Toolbar-Button-Liste in `get_jitsi_config()` hinzugefuegt:
```python
base_buttons = [
    'microphone', 'camera', 'desktop', 'hangup',
    'chat', 'raisehand', 'tileview', 'select-background'
]
```
Coach und Kinder koennen jetzt ihren Video-Hintergrund aendern (verschwommen, Bild, etc.).

---

# ÄNDERUNGEN (21. Februar 2026)

## Datenbank-Migration: SQLite → Supabase (PostgreSQL)

### Warum?
Die App lief auf Streamlit Cloud mit SQLite unter `/tmp`. Bei jedem App-Neustart gingen alle Daten verloren. Fuer den 12-Wochen-Test mit Kindern muessen die Daten dauerhaft gespeichert werden.

### Was wurde gemacht?

**Neues zentrales Datenbankmodul:** `utils/database.py`
```python
from utils.database import get_db

# Supabase Query Builder statt SQL
result = get_db().table("users").select("*").eq("user_id", uid).execute()
users = result.data  # Liste von Dicts
```

**Alle 12 Datenbank-Module migriert:**

| Datei | Aenderung |
|-------|-----------|
| `utils/database.py` | NEU: Zentrales Supabase-Verbindungsmodul (session-basierter Client) |
| `utils/user_system.py` | SQLite → Supabase Query Builder |
| `utils/gamification_db.py` | SQLite → Supabase Query Builder |
| `schatzkarte/map_db.py` | SQLite → Supabase + Batch-Query `get_all_island_progress()` |
| `utils/lerngruppen_db.py` | SQLite → Supabase (26 Funktionen, SQL JOINs → separate Queries) |
| `utils/bandura_sources_widget.py` | SQLite → Supabase |
| `utils/polarstern_widget.py` | SQLite → Supabase |
| `utils/coaching_db.py` | SQLite → Supabase (10 Funktionen) |
| `utils/motivation_challenges/motivation_db.py` | SQLite → Supabase (20 Funktionen, `conn`-Parameter beibehalten aber ignoriert) |
| `utils/learnstrat_challenges/transfer_widget.py` | SQLite → Supabase |
| `utils/learnstrat_challenges/birkenbihl_widget.py` | SQLite → Supabase |
| `utils/learnstrat_challenges/powertechniken_widget.py` | SQLite → Supabase |

**Inline-DB-Code in Pages bereinigt:**
- `pages/1_Schatzkarte.py` — Reset-Button auf Supabase umgestellt
- `pages/2_Ressourcen.py` — `get_connection()` entfernt
- `utils/ressourcen/learnstrat_content.py` — `sqlite3` Import entfernt
- `utils/ressourcen/motivation_content.py` — `sqlite3` Import entfernt

**Cleanup:**
- Alle `init_*_tables()` Aufrufe entfernt (Tabellen existieren in Supabase)
- Alle `import sqlite3` entfernt (ausser PISA-Daten, die bleiben lokal)
- Alle `conn.commit()` / `conn.close()` entfernt
- `.streamlit/secrets.toml.example` auf Supabase-Format aktualisiert

### Supabase-Konfiguration

**Credentials (in Streamlit Cloud Secrets und lokal in `.streamlit/secrets.toml`):**
```
SUPABASE_URL = "https://djkjjqabwxzclgvulpzu.supabase.co"
SUPABASE_KEY = "sb_publishable_..."
APP_URL = "https://pulse-of-learning.streamlit.app"
JITSI_ROOM_SECRET = "ein-sicherer-zufalls-string"
```

**Tabellen in Supabase (alle vorhanden):**
- `users` (vorexistierend, Spalten hinzugefuegt: user_id, username, display_name, xp_total, level, role, etc.)
- `polarstern_goals` (vorexistierend, Spalten hinzugefuegt: category, achievement_reflection)
- `completed_challenges`, `user_badges`, `activity_log` (vorexistierend, user_id von BIGINT auf TEXT geaendert)
- `challenges`, `bandura_entries`, `learning_groups`, `group_members`
- `group_invitations`, `group_weekly_islands`, `scheduled_meetings`, `meeting_participants`
- `user_treasures`, `island_progress`, `students`, `assessments`, `development_plans`
- `progress_logs`, `assessment_requests`, `user_learning_preferences`, `learnstrat_progress`
- `motivation_challenges`, `motivation_sdt_progress`, `motivation_streaks`
- `motivation_activity_log`, `motivation_badges`, `motivation_certificates`

**PISA-Daten bleiben lokal:** `data/pisa_2022_germany.db` (read-only, kein Supabase)

### Wichtige Supabase-Patterns
```python
# SELECT
result = get_db().table("users").select("*").eq("user_id", uid).execute()
if result.data:
    user = result.data[0]

# INSERT
result = get_db().table("users").insert({...}).execute()
new_id = result.data[0]["id"]

# UPDATE
get_db().table("users").update({"xp_total": 100}).eq("user_id", uid).execute()

# DELETE
get_db().table("users").delete().eq("user_id", uid).execute()

# Kein conn.commit() oder conn.close() noetig!
```

### Performance-Optimierung
- `get_all_island_progress(user_id)`: Laedt Fortschritt aller 15 Inseln in 1 Query statt 15
- Supabase-Client wird pro Session erstellt (`st.session_state`), nicht global gecacht

---

# ÄNDERUNGEN (23. Februar 2026)

## Lerngruppen-System Überarbeitung: React → Pure Streamlit + Jitsi External API

### Warum?
Die bisherige Video-Chat-Lösung basierte auf React-Komponenten (`SchatzkarteMeetingWithScreenShare.jsx`, `ScreenShareHelper.jsx`, `useMeeting.ts`, CSS-Dateien), die aber **nie in die Streamlit-Seite eingebunden** waren. Es gab nur einen externen Jitsi-Link. Zusätzlich fehlte Zeitzonen-Support (Coach in Malaysia, Kinder in DACH).

### Was wurde gemacht?

| Metrik | Vorher | Nachher |
|--------|--------|---------|
| Python-Code | 1.428 Zeilen | 1.686 Zeilen |
| React/CSS | 2.210 Zeilen (nicht eingebunden) | 0 (entfernt) |
| **Gesamt** | **3.638 Zeilen** | **1.686 Zeilen** |
| Video-Chat | Nur externer Link | Eingebettet in Seite |
| Zeitzonen | Nicht implementiert | Voll funktionsfähig |
| Recurring Meetings | Nicht implementiert | Automatische Erneuerung |
| Einladungs-URL | Platzhalter-Domain | Konfigurierbar via Secrets |

### Datenbank
**Keine Migration nötig.** Alle 6 Lerngruppen-Tabellen bleiben unverändert:
`learning_groups`, `group_members`, `group_invitations`, `group_weekly_islands`, `scheduled_meetings`, `meeting_participants`

Details zu den Code-Änderungen: siehe Abschnitt "Video-Chat Integration" unter den Änderungen vom 14. Januar 2025.

---

# ÄNDERUNGEN (31. Januar 2025)

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

## 2. Video-Chat Integration (ÜBERARBEITET 23. Februar 2026)

### Architektur-Wechsel: React-Komponenten entfernt, Jitsi direkt in Streamlit eingebettet

Die ursprünglichen React-Komponenten (`SchatzkarteMeetingWithScreenShare.jsx`, `ScreenShareHelper.jsx`, `useMeeting.ts`, CSS-Dateien) waren nie in die Streamlit-Seite eingebunden und wurden komplett durch eine reine Streamlit-Lösung ersetzt. Jitsi Meet wird jetzt direkt via `JitsiMeetExternalAPI` in `streamlit.components.v1.html()` eingebettet.

### Entfernte Dateien (nicht mehr benötigt):

| Datei | Zeilen | Status |
|-------|--------|--------|
| `VideoChat/ScreenShareHelper.jsx` | 363 | Entfernt (Archiv) |
| `VideoChat/SchatzkarteMeetingWithScreenShare.jsx` | 308 | Entfernt (Archiv) |
| `VideoChat/screen-share-helper.css` | 871 | Entfernt (Archiv) |
| `VideoChat/video-chat.css` | 515 | Entfernt (Archiv) |
| `hooks/useMeeting.ts` | 153 | Entfernt (Archiv) |

**Dependency `@jitsi/react-sdk` wird nicht mehr gebraucht.**

### Geänderte Dateien:

**`utils/lerngruppen_db.py`** (684 → 854 Zeilen):

Neue Funktionen:
- `_get_room_secret()` — Room-Secret aus `st.secrets` statt hardcoded
- `_get_app_url()` — App-URL aus `st.secrets` für Einladungslinks
- `get_group_timezone(group_id)` — Liest Zeitzone aus `settings` JSON-Feld
- `set_group_timezone(group_id, timezone)` — Setzt Zeitzone
- `convert_meeting_time_display(time, day, group_tz, coach_tz)` — Zeitkonvertierung für Dual-Anzeige
- `get_invitation_url(token)` — Generiert vollständige Einladungs-URL
- `renew_recurring_meeting(meeting)` — Erstellt automatisch nächstes Meeting für wöchentliche Treffen

Geänderte Funktionen:
- `calculate_next_meeting_date()` — Nutzt `ZoneInfo` für Timezone-aware Datumsberechnung
- `schedule_meeting()` — Nutzt Gruppen-Zeitzone
- `get_next_meeting()` — Nutzt Gruppen-Zeitzone + Auto-Renewal für wöchentliche Meetings
- `get_group_meetings()` — Nutzt Gruppen-Zeitzone
- `get_meeting_access()` — Nutzt Gruppen-Zeitzone + Legacy-Fallback für naive Datetimes
- `delete_group()` — Löscht jetzt auch `scheduled_meetings` und `meeting_participants` (mit Guard für leere Listen)
- `generate_secure_room_name()` — Nutzt Secret aus `st.secrets`

**`pages/7_👥_Lerngruppen.py`** (744 → 832+ Zeilen):

Tab 1 (Meine Gruppen):
- Zeitzone-Button zum Aendern direkt in der Gruppen-Karte

Tab 2 (Neue Gruppe):
- Zeitzonen-Auswahl bei Gruppenerstellung (Default: Europe/Berlin)

Tab 3 (Video-Treffen) — KOMPLETT NEU:
- Coach-Zeitzonen-Selectbox (Malaysia/DE/CH/AT)
- Zeitzonen-Offset-Anzeige: "deine Zeit (Kuala Lumpur) ist +7h davon" (seit 26.02.)
- **Eingebettetes Jitsi-Meeting** via `JitsiMeetExternalAPI` in `components.html()` (JaaS/8x8.vc)
- Warteraum mit Countdown + Auto-Refresh (30s via JavaScript)
- Screen-Share direkt ueber Jitsi-Toolbar (kein separater Helper mehr)
- Participant-Tracking bei Beitritt (mit Session-State Guard gegen Duplikate)
- **Datums-Picker** statt Wochentag-Dropdown (seit 26.02.)
- Alle geplanten Treffen mit Dual-Zeitanzeige
- **Treffen einzeln absagen** mit Bestaetigungs-Dialog (seit 26.02.)

### Zeitzonen-Support (NEU):

Sandra (Coach) ist in Malaysia (UTC+8), die Kinder in Deutschland (UTC+1/+2).
- **Zeitzone pro Gruppe** im `settings`-JSON der `learning_groups`-Tabelle gespeichert
- **Coach-Zeitzone** per Selectbox, gespeichert in `st.session_state`
- **Dual-Anzeige** bei allen Uhrzeiten: z.B. "Mittwoch, 16:00 Uhr (Gruppe) = Mittwoch, 23:00 Uhr (Deine Zeit)"
- **Keine externe Dependency**: Python stdlib `zoneinfo` (3.9+)

### Konfiguration (Streamlit Secrets):

Folgende Werte müssen in `.streamlit/secrets.toml` oder Streamlit Cloud Secrets stehen:
```toml
APP_URL = "https://pulse-of-learning.streamlit.app"
JITSI_ROOM_SECRET = "ein-sicherer-zufalls-string"
```

### Jitsi-Einbettung (technisches Detail):

**Seit 23.02.2026: JaaS (8x8.vc) statt meet.jit.si** — mit JWT-Authentifizierung, kein 5-Minuten-Limit.

```python
# JWT generieren (Server-seitig)
jwt_token = generate_jaas_jwt(
    user_name=display_name, user_id=user_id,
    is_moderator=is_coach, room=room_name, user_email=email)

app_id = st.secrets["jaas"]["app_id"]
jitsi_html = f"""
<div id="jitsi-container" style="width: 100%; height: 600px;"></div>
<script src="https://8x8.vc/{app_id}/external_api.js"></script>
<script>
(function() {{
    var api = new JitsiMeetExternalAPI("8x8.vc", {{
        roomName: "{app_id}/{room_name}",
        jwt: "{jwt_token}",
        parentNode: document.querySelector('#jitsi-container'),
        configOverwrite: {config_json},
        interfaceConfigOverwrite: {interface_config_json}
    }});
}})();
</script>
"""
components.html(jitsi_html, height=620)
```

### Features:
- Coach plant wöchentliche/einmalige Meetings
- Sichere, nicht-erratbare Raum-Namen (SHA256-Hash-basiert)
- Wöchentliche Meetings werden automatisch erneuert (`renew_recurring_meeting`)
- Warteraum mit Countdown (Beitritt 5 Min. vor Start)
- Screen-Sharing direkt über Jitsi-Toolbar
- Rollen-basierte Jitsi-Konfiguration (Coach: mute-everyone, participants-pane, settings / Kind: Basis-Toolbar)
- XSS-Schutz: `display_name` via `json.dumps()` escaped
- Participant-Tracking mit Session-State Guard (kein Doppel-Insert bei Re-Render)

### So startest du ein Video-Treffen:

1. Gehe zu **Lerngruppen** → Tab **Video-Treffen**
2. Wähle deine Zeitzone (z.B. Malaysia) und Lerngruppe
3. Falls kein Treffen existiert: Tab "Neues Treffen planen" → Treffen erstellen
4. Das Jitsi-Meeting wird **direkt auf der Seite** eingebettet (kein externer Link)
5. Screen-Sharing: Klicke auf das Bildschirm-Symbol in der Jitsi-Toolbar

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

## Seiten (9 Stueck)

| Seite | Funktion | Status |
|-------|----------|--------|
| 1_🗺️_Schatzkarte | **RPG-Weltkarte (React!)** | ✅ Neu gebaut |
| 2_📚_Ressourcen | Lern-Ressourcen mit Videos, Tipps, Challenges | ✅ Fertig |
| 3_🎓_Elternakademie | Diagnostik fuer Eltern-Unterstuetzung | ✅ Fertig |
| 4_🔍_Screening_Diagnostik | 2-stufiges Schueler-Screening | ✅ Fertig |
| 5_📊_Auswertung | Ergebnis-Darstellung mit Hattie-Bezug | ✅ Fertig |
| 6_📖_PISA_Forschungsgrundlage | Info-Seite zur Forschung | ✅ Fertig |
| 7_👥_Lerngruppen | Coach-Interface: Gruppen, Meetings, Video-Treffen | ✅ Fertig |
| 8_🔐_Admin | Benutzer-Rollen verwalten | ✅ Fertig |
| 9_🎒_Meine_Lernreise | Kind-Interface: Lerngruppe, Video-Treffen (JaaS) | ✅ Fertig |

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

## Datenbank
Die App nutzt **Supabase** (PostgreSQL Cloud-DB). Keine lokalen SQLite-Dateien mehr (ausser PISA).
- Supabase Dashboard: https://djkjjqabwxzclgvulpzu.supabase.co
- Credentials in `.streamlit/secrets.toml` (lokal) und Streamlit Cloud Secrets

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
│   ├── 8_🔐_Admin.py
│   └── 9_🎒_Meine_Lernreise.py
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
│   ├── database.py             # Zentrales Supabase-Verbindungsmodul
│   ├── user_system.py          # Login, Rollen, Preview
│   ├── gamification_db.py      # XP, Level, Streaks
│   ├── lerngruppen_db.py       # Coach-Gruppen
│   ├── coaching_db.py          # Schueler-Management
│   └── ressourcen/             # Content fuer Ressourcen-Seite
└── data/
    └── pisa_2022_germany.db    # PISA-Daten (read-only, bleibt lokal)
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
| **26.02.2026** | **Login-Loop Fix** | Deferred Cookie Pattern: Cookie wird im normalen Render gesetzt statt im Button-Callback. Registrierungs-State wird nach Login aufgeraeumt. |
| 26.02.2026 | Meeting-Planung verbessert | Datums-Picker statt Wochentag, Zeitzonen-Offset-Anzeige (Berlin ↔ Kuala Lumpur), Treffen absagen mit Bestaetigungs-Dialog |
| 26.02.2026 | Duplikat-Raumnamen Fix | `generate_secure_room_name()` nutzt vollen Timestamp statt nur Datum. `cancel_meeting()` gibt Raumnamen frei. |
| 26.02.2026 | Meeting-Anzeige Fix | Toast + Rerun statt Success, damit Treffen sofort im Tab erscheint |
| 26.02.2026 | JaaS fuer Kinder | `pages/9_Meine_Lernreise.py`: meet.jit.si durch 8x8.vc JaaS ersetzt, Kinder als nicht-Moderator |
| 26.02.2026 | FloatingJitsiWidget Rewrite | Jitsi bleibt persistent, Minimierung versteckt nur CSS, Audio laeuft weiter, nur ✕ loest Rerun aus |
| 26.02.2026 | Virtueller Hintergrund | `select-background` Button in Jitsi-Toolbar fuer Coach und Kinder |
| **21.02.2026** | **Supabase-Migration** | Komplette DB-Migration von SQLite zu Supabase (PostgreSQL). 12 Module, 23 Dateien. Persistente Cloud-Datenbank fuer 12-Wochen-Test. |
| 21.02.2026 | Performance-Optimierung | Batch-Query fuer Insel-Fortschritt (1 statt 15 Queries), Session-basierter Supabase-Client |
| 21.02.2026 | Supabase Schema-Fixes | user_id BIGINT→TEXT in vorexistierenden Tabellen, fehlende Spalten (category, achievement_reflection, role) |
| **21.01.2025** | **Hintergrundbilder** | 4 Inseln mit immersiven Hintergründen: Starthafen, Festung, Werkzeuge, Fäden |
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
- **DB-Fehler?** → Supabase Dashboard pruefen (SQL Editor), Spalten/Tabellen vorhanden?
- **CSS lädt nicht?** → Import in Experience.tsx prüfen

---

# WICHTIGE DATEIEN FÜR WEITERENTWICKLUNG

| Datei | Beschreibung |
|-------|--------------|
| `components/rpg_schatzkarte/frontend/src/App.tsx` | Haupt-React-Komponente |
| `components/rpg_schatzkarte/frontend/src/types.ts` | TypeScript-Definitionen |
| `components/rpg_schatzkarte/__init__.py` | Python-Bridge zu Streamlit |
| `pages/1_🗺️_Schatzkarte.py` | Streamlit-Seite die React nutzt |
| `pages/7_👥_Lerngruppen.py` | Coach-Interface: Gruppen, Meetings, Video |
| `pages/9_🎒_Meine_Lernreise.py` | Kind-Interface: Lerngruppe, Video (JaaS) |
| `utils/lerngruppen_db.py` | Meeting-Planung, Jitsi-Config, JWT-Generierung |
| `utils/user_system.py` | Login, Rollen, Cookie-System |
| `schatzkarte/map_data.py` | Insel-Definitionen |

---

# AENDERUNGEN (23. Februar 2026)

## JaaS Video-Integration: Jitsi ohne 5-Minuten-Limit

### Problem
Die eingebettete Jitsi-Videokonferenz (meet.jit.si) hatte ein 5-Minuten-Demo-Limit fuer iframe-Einbettungen. Nach 5 Minuten erschien eine Warnung und der Teilnehmer wurde getrennt. Fuer die Lerngruppen-Treffen (30-60 Min) nicht nutzbar.

### Loesung: JaaS (Jitsi as a Service) mit JWT-Authentifizierung
Registrierung bei **jaas.8x8.vc** (Free Tier, 25 MAU). Server-seitige JWT-Generierung mit RS256 Private Key.

### Was wurde gemacht?

**1. JaaS-Konfiguration**
- `.streamlit/secrets.toml`: `[jaas]`-Section mit app_id, key_id, private_key_path
- `.secrets/jaas_key`: RSA Private Key (PKCS#8, nicht in Git)
- `.gitignore`: `.secrets/` hinzugefuegt

**2. JWT-Generierung** (`utils/lerngruppen_db.py`)
```python
generate_jaas_jwt(user_name, user_id, is_moderator, room, user_email)
# RS256 JWT mit 2h Gueltigkeit
# Coach = is_moderator=True, Kind = is_moderator=False
```

**3. Lerngruppen-Seite** (`pages/7_Lerngruppen.py`)
- `_render_jitsi_meeting()`: `meet.jit.si` durch `8x8.vc` mit JWT ersetzt
- External API von `https://8x8.vc/{appId}/external_api.js` laden
- Raum-Name Format: `{appId}/{roomName}`
- Raum-Details Link aktualisiert auf 8x8.vc

**4. Schatzkarte FloatingJitsiWidget** (`FloatingJitsiWidget.tsx`)
- `@jitsi/react-sdk` komplett umgangen (SDK hat einen Caching-Bug: cached `window.JitsiMeetExternalAPI` auf Modul-Ebene, laed nie von 8x8.vc nach)
- Eigene `loadJaaSApi(appId)` Funktion: loescht Cache, entfernt alte Scripts, laed frisch von 8x8.vc
- `JitsiMeetExternalAPI` direkt instanziiert mit domain='8x8.vc', JWT, fullRoomName

**5. Coach-Gruppenzuordnung** (`pages/1_Schatzkarte.py`)
- `load_meeting_data()` prueft jetzt sowohl `group_members` als auch `learning_groups.coach_id`
- Iteriert alle Coach-Gruppen und findet die mit aktivem Meeting

### JaaS-Credentials
| Setting | Wert |
|---------|------|
| AppID | `vpaas-magic-cookie-b84a3592bf8743339eab099ce877c682` |
| Key-ID | `vpaas-magic-cookie-b84a3592bf8743339eab099ce877c682/dd082c` |
| Private Key | `.secrets/jaas_key` (lokal) / `private_key` als String (Streamlit Cloud) |

### Z-Index im React-iframe
| Element | Z-Index |
|---------|---------|
| Map | 1-10 |
| Jitsi Widget | 900 |
| Insel-Modals | 1000 |
| Brainy/Bandura | 2000 |

### Widget-Zustaende (FloatingJitsiWidget)
- **join-button**: Goldener "Video-Treffen beitreten" Button (unten rechts)
- **small** (320x240): Jitsi-Video klein, Kontrollleiste
- **large** (80vw x 80vh): Jitsi-Video gross, zentriert
- **minimized**: Kleine Pill "Video-Treffen"
- **waiting**: Pill mit Countdown "Treffen in X Min"

## Bekannte offene Bugs

### ✅ GELÖST: Login-Loop auf der Schatzkarte
~~Einloggen direkt auf der Schatzkarte fuehrte zu einer Dauerschleife.~~
**Geloest am 26.02.2026** durch Deferred Cookie Pattern (siehe Aenderungen 26. Februar 2026). `components.html()` im Button-Callback kollidierte mit `st.rerun()`. Cookie wird jetzt im naechsten normalen Render-Durchlauf gesetzt.

### Coach nicht in group_members
Coaches stehen nur in `learning_groups.coach_id`, nicht in `group_members`. `load_meeting_data()` in Schatzkarte.py prueft beides.

## Commits (23. Feb 2026)
- `fe6328a` Feat: JaaS JWT-Authentifizierung fuer Jitsi Video-Widget
- `b27c0e6` Fix: JaaSMeeting statt JitsiMeeting fuer korrekte JaaS-Authentifizierung
- `4abc274` Feat: JaaS 8x8.vc Integration fuer Jitsi Video ohne 5-Min-Limit

---

# TODO / Naechste Schritte

### Prioritaet 1 (naechste Session)
- [ ] JaaS Secrets auf Streamlit Cloud konfigurieren (`private_key` als String in Cloud-Secrets)
- [ ] End-to-End Test: Kind tritt ueber Meine Lernreise dem Meeting bei waehrend Coach auf Lerngruppen-Seite ist
- [ ] End-to-End Test: Kind tritt ueber Schatzkarte-Widget dem Meeting bei

### Prioritaet 2
- [ ] Quiz-Content fuer fehlende Stufen erstellen (Festung MS, Werkzeuge US/MS, Faeden alle)
- [ ] Hintergrundbilder fuer restliche 11 Inseln

### Erledigt (26.02.2026)
- [x] Login-Loop auf der Schatzkarte gefixt (Deferred Cookie Pattern)
- [x] JaaS fuer Kinder auf Meine Lernreise (8x8.vc statt meet.jit.si)
- [x] FloatingJitsiWidget: Audio bleibt bei Minimierung, kein Logout bei Button-Klick
- [x] Meeting-Planung: Datums-Picker, Zeitzonen-Anzeige, Absagen-Funktion
- [x] Duplikat-Raumnamen und Meeting-Anzeige Bugs gefixt
- [x] Virtueller Hintergrund in Jitsi-Toolbar

### Erledigt (23.02.2026)
- [x] JaaS Video-Integration (kein 5-Minuten-Limit mehr)
- [x] Lerngruppen-System Ueberarbeitung (React-Komponenten entfernt, pure Streamlit)

---

**Letzte Bearbeitung:** 26. Februar 2026
**Letzter Meilenstein:** Video-System komplett (JaaS fuer Coach + Kinder, persistentes Widget, Login-Loop gefixt)
**Naechster Meilenstein:** Streamlit Cloud Deployment mit JaaS + End-to-End Tests

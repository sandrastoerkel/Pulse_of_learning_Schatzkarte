# Integration Briefing: Schatzkammer Loci-System

## Übersicht

Du erhältst ein vollständiges React/TypeScript Feature-Modul für die **Schatzkarte-Plattform**. Das Modul implementiert ein gamifiziertes Lernsystem basierend auf der **Loci-Methode** (Gedächtnispalast).

| Eigenschaft | Wert |
|-------------|------|
| Dateien | 33 |
| Zeilen | ~10.000 |
| Sprache | TypeScript (strict) |
| Framework | React 18 |
| Styling | Inline Styles |
| Dependencies | Nur React |

---

## Was das Modul macht

### Konzept: Loci-Methode
Schüler erstellen virtuelle "Räume" (z.B. Zaubererturm, Piratenhöhle) mit festen Plätzen (Slots). An jeden Platz wird eine Lernstation mit Inhalt platziert. Beim "Rundgang" geht der Schüler mental durch den Raum und erinnert sich an die Inhalte.

### Features
- **6 Raum-Templates** (Zaubererturm, Piratenhöhle, Raumstation, Drachenburg, Tempel, Baumhaus)
- **8-14 Slots pro Template** mit festen Positionen
- **Stationen** mit Icon, Titel, Inhalt, Hinweis
- **Journey-Modus** (Rundgang mit Aufdecken + Selbsteinschätzung)
- **Spaced Repetition** (Review-Intervalle 1/3/7 Tage)
- **XP-System** (Mastered=10, Almost=5, Practice=2, Perfect-Bonus=+25)
- **SVG-Hintergründe** (3 von 6 fertig)

---

## Zielordner

```
src/features/schatzkammer/
```

---

## Modul-Struktur

```
schatzkammer/
├── index.ts                    # Public API (alle Exports)
├── types/
│   └── index.ts                # TypeScript-Definitionen
├── constants/
│   ├── index.ts                # Zentrale Exports
│   ├── artifacts.ts            # Artefakt-Typen (Poster, Figur, etc.)
│   ├── templates.ts            # 6 Raum-Templates mit Slot-Positionen
│   └── theme.ts                # Farben, XP-Config, Animationen
├── utils/
│   └── index.ts                # Helper-Funktionen
├── hooks/
│   ├── index.ts                # Hook-Exports
│   ├── lociRoomReducer.ts      # Reducer für einzelnen Raum
│   ├── useLociRoom.ts          # Hook für Raum-State
│   ├── chamberReducer.ts       # Reducer für Raum-Übersicht
│   ├── useChamber.ts           # Hook für Chamber-State
│   └── useSpacedRepetition.ts  # Spaced Repetition Algorithmus
└── components/
    ├── index.ts                # Komponenten-Exports
    ├── chamber/                # Übersichts-Seite
    │   ├── ChamberOverview.tsx # Hauptseite mit Raum-Grid
    │   ├── RoomCard.tsx        # Einzelne Raum-Karte
    │   ├── CreateRoomModal.tsx # Modal: Neuen Raum erstellen
    │   └── DeleteRoomModal.tsx # Modal: Raum löschen
    ├── room/                   # Einzelner Loci-Raum
    │   ├── LociRoom.tsx        # Haupt-Container
    │   ├── Slot.tsx            # Interaktiver Slot
    │   ├── JourneyPath.tsx     # SVG-Pfad zwischen Stationen
    │   └── RoomHeader.tsx      # Header mit Modi-Buttons
    ├── modals/                 # Dialoge
    │   ├── StationModal.tsx    # View/Edit/Journey für Station
    │   ├── AddStationModal.tsx # Neue Station erstellen
    │   ├── ResultsModal.tsx    # Rundgang-Ergebnis
    │   └── OrderPanel.tsx      # Reihenfolge bearbeiten
    └── backgrounds/            # SVG-Hintergründe
        ├── index.ts            # Exports + Mapping
        ├── WizardTower.tsx     # Zaubererturm
        ├── PirateCave.tsx      # Piratenhöhle
        └── SpaceStation.tsx    # Raumstation
```

---

## Wichtige Exports

```tsx
import {
  // === HOOKS ===
  useChamber,           // State für Raum-Übersicht
  useLociRoom,          // State für einzelnen Raum
  useSpacedRepetition,  // Review-Priorisierung
  
  // === COMPONENTS ===
  // Chamber (Übersicht)
  ChamberOverview,
  RoomCard,
  CreateRoomModal,
  DeleteRoomModal,
  
  // Room (Loci-Raum)
  LociRoom,
  Slot,
  JourneyPath,
  RoomHeader,
  
  // Modals
  StationModal,
  AddStationModal,
  ResultsModal,
  OrderPanel,
  
  // Backgrounds
  WizardTower,
  PirateCave,
  SpaceStation,
  getBackgroundComponent,  // templateId → Background Component
  
  // === TYPES ===
  Room,
  Station,
  Chamber,
  TemplateId,
  RoomMode,
  RecallStatus,
  JourneyResult,
  
  // === CONSTANTS ===
  ROOM_TEMPLATES,
  ARTIFACT_CONFIGS,
  GOLD,
  DARK,
  
} from '@/features/schatzkammer';
```

---

## Routing-Vorschlag

```tsx
// In deinem Router (z.B. React Router)

import { ChamberOverview, LociRoom } from '@/features/schatzkammer';

<Routes>
  {/* Bestehende Routes */}
  
  {/* Schatzkammer */}
  <Route path="/schatzkammer" element={<SchatzkammerPage />} />
  <Route path="/schatzkammer/room/:roomId" element={<LociRoomPage />} />
</Routes>
```

---

## Beispiel: Page-Wrapper

### SchatzkammerPage.tsx

```tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChamberOverview, 
  useChamber,
  CreateRoomModal,
} from '@/features/schatzkammer';

export const SchatzkammerPage: React.FC = () => {
  const navigate = useNavigate();
  
  // TODO: Chamber + Rooms aus Backend/Storage laden
  const chamber = { id: 'chamber_1', userId: 'user_1', totalXp: 0, createdAt: new Date().toISOString() };
  const rooms: Room[] = []; // Aus Storage laden
  
  const {
    state,
    sortedRooms,
    createRoom,
    deleteRoom,
    openCreateModal,
    closeModals,
  } = useChamber({ chamber, rooms });

  const handleRoomClick = (roomId: string) => {
    navigate(`/schatzkammer/room/${roomId}`);
  };

  const handleStartJourney = (roomId: string) => {
    navigate(`/schatzkammer/room/${roomId}?mode=journey`);
  };

  return (
    <ChamberOverview
      rooms={sortedRooms}
      roomStats={state.roomStats}
      totalXp={chamber.totalXp}
      isCreateModalOpen={state.modals.createRoom}
      onCreateRoom={(data) => {
        const newRoom = createRoom(data);
        // TODO: In Backend/Storage speichern
      }}
      onOpenCreateModal={openCreateModal}
      onCloseCreateModal={closeModals}
      onRoomClick={handleRoomClick}
      onEditRoom={(id) => navigate(`/schatzkammer/room/${id}?mode=edit`)}
      onDeleteRoom={(id) => {
        deleteRoom(id);
        // TODO: Aus Backend/Storage löschen
      }}
      onStartJourney={handleStartJourney}
    />
  );
};
```

### LociRoomPage.tsx

```tsx
import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  LociRoom,
  useLociRoom,
  StationModal,
  AddStationModal,
  ResultsModal,
  getBackgroundComponent,
} from '@/features/schatzkammer';

export const LociRoomPage: React.FC = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // TODO: Room + Stations aus Backend/Storage laden
  const room = { /* ... */ };
  const stations = [ /* ... */ ];
  
  const {
    state,
    orderedStations,
    setMode,
    selectStation,
    addStation,
    updateStation,
    deleteStation,
    startJourney,
    revealStation,
    rateStation,
    // ...
  } = useLociRoom({ room, stations });

  const Background = getBackgroundComponent(room.templateId);

  return (
    <>
      <LociRoom
        room={room}
        stations={stations}
        stats={state.stats}
        mode={state.mode}
        selectedStationId={state.selectedStationId}
        journeyProgress={state.journey ? {
          current: state.journey.currentIndex + 1,
          total: state.journey.stationIds.length,
          percent: ((state.journey.currentIndex + 1) / state.journey.stationIds.length) * 100
        } : undefined}
        journeyIndex={state.journey?.currentIndex ?? -1}
        BackgroundComponent={Background}
        onBack={() => navigate('/schatzkammer')}
        onModeChange={setMode}
        onStartJourney={startJourney}
        onSlotClick={(slotId) => {/* Open AddStationModal */}}
        onStationClick={selectStation}
      />

      {/* Modals hier */}
    </>
  );
};
```

---

## Daten-Persistenz

Das Modul liefert **nur UI + State-Logik**. Du musst die Persistenz implementieren:

### Option A: localStorage (für Prototyp)

```tsx
// Speichern
localStorage.setItem('schatzkammer_rooms', JSON.stringify(rooms));
localStorage.setItem('schatzkammer_stations', JSON.stringify(stations));

// Laden
const rooms = JSON.parse(localStorage.getItem('schatzkammer_rooms') || '[]');
```

### Option B: Backend-API

```tsx
// Beispiel mit fetch
const loadRooms = async (userId: string) => {
  const res = await fetch(`/api/schatzkammer/rooms?userId=${userId}`);
  return res.json();
};

const saveStation = async (station: Station) => {
  await fetch('/api/schatzkammer/stations', {
    method: 'POST',
    body: JSON.stringify(station),
  });
};
```

### Datenmodell

```typescript
// Hauptentitäten
interface Chamber {
  id: string;
  userId: string;
  totalXp: number;
  createdAt: string;
}

interface Room {
  id: string;
  chamberId: string;
  templateId: TemplateId;
  name: string;
  description: string;
  subject?: string;
  colorTag: ColorTag;
  journeyOrder: string[];  // Station IDs in Reihenfolge
  createdAt: string;
  updatedAt: string;
}

interface Station {
  id: string;
  roomId: string;
  slotId: string;
  artifactType: ArtifactType;
  icon: string;
  title: string;
  content: string;
  hint: string;
  recallStatus: RecallStatus | null;
  reviewCount: number;
  lastReviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
```

---

## Styling-Kontext

### Farb-Schema (bereits im Modul)

```typescript
const GOLD = {
  primary: '#FFD700',
  light: '#FFE55C',
  dark: '#B8960F',
  gradient: 'linear-gradient(135deg, #FFE55C 0%, #FFD700 50%, #B8960F 100%)',
};

const DARK = {
  deepest: '#0a0a14',
  base: '#12121e',
  elevated: '#1a1a2e',
  surface: '#252538',
};
```

### Design-Prinzipien

- **Gold-Akzente** für wichtige Elemente
- **Dunkler Hintergrund** mit subtilen Gradienten
- **Glow-Effekte** für interaktive Elemente
- **Emojis** als Icons (kein Icon-Library nötig)
- **Deutsche UI-Texte**

---

## Offene Aufgaben

### Must-Have für Integration

- [ ] Routing einrichten
- [ ] Page-Wrapper erstellen
- [ ] Daten-Persistenz (localStorage oder API)
- [ ] Navigation von/zur Hauptapp

### Nice-to-Have

- [ ] Fehlende SVG-Backgrounds:
  - `DragonCastle.tsx` (dragon-castle)
  - `AncientTemple.tsx` (ancient-temple)
  - `Treehouse.tsx` (treehouse)
- [ ] Offline-Support
- [ ] Sound-Effekte
- [ ] Animationen mit Framer Motion erweitern

---

## Test-Szenario

1. `/schatzkammer` öffnen → ChamberOverview (leer)
2. "Neuer Raum" klicken → CreateRoomModal
3. Template wählen (z.B. Zaubererturm), Name eingeben
4. Raum erstellen → RoomCard erscheint
5. RoomCard klicken → LociRoom öffnet sich
6. In "Bearbeiten"-Modus wechseln
7. Leeren Slot klicken → AddStationModal
8. Station erstellen → Station erscheint im Slot
9. 3-4 Stationen erstellen
10. "Rundgang" starten → Journey-Modus
11. Jede Station: Aufdecken → Bewerten
12. Am Ende: ResultsModal mit XP

---

## Fragen?

Falls etwas unklar ist:
- **Types:** Siehe `types/index.ts`
- **Templates:** Siehe `constants/templates.ts`
- **Theme:** Siehe `constants/theme.ts`
- **Hook-Nutzung:** Siehe Props der Komponenten

Das Modul ist self-contained und sollte ohne Anpassungen funktionieren, sobald Routing und Persistenz implementiert sind.

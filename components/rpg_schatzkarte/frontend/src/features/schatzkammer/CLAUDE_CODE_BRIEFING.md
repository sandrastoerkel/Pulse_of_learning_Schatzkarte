# Schatzkammer Loci-System - Integration Briefing

## Was ist das?

Ein vollständiges React/TypeScript Feature-Modul für die Schatzkarte-Lernplattform.
Implementiert die **Loci-Methode** (Gedächtnispalast) mit gamifizierten Lernstationen.

**Umfang:** 33 Dateien, ~10.000 Zeilen, TypeScript strict mode, 0 Fehler

---

## Verzeichnisstruktur

```
src/features/schatzkammer/
├── index.ts                    # Public API - ALLE Exports
├── types/
│   └── index.ts                # TypeScript-Definitionen
├── constants/
│   ├── index.ts
│   ├── artifacts.ts            # 5 Artefakt-Typen
│   ├── templates.ts            # 6 Raum-Templates mit Slot-Positionen
│   └── theme.ts                # GOLD/DARK Farben, XP-Config
├── utils/
│   └── index.ts                # Hilfsfunktionen
├── hooks/
│   ├── index.ts
│   ├── lociRoomReducer.ts      # Reducer für einzelnen Raum
│   ├── useLociRoom.ts          # Hook für Raum-State
│   ├── chamberReducer.ts       # Reducer für Übersicht
│   ├── useChamber.ts           # Hook für Chamber-State
│   └── useSpacedRepetition.ts  # Spaced Repetition Algorithmus
└── components/
    ├── index.ts
    ├── chamber/                # Übersichtsseite
    │   ├── ChamberOverview.tsx
    │   ├── RoomCard.tsx
    │   ├── CreateRoomModal.tsx
    │   └── DeleteRoomModal.tsx
    ├── room/                   # Einzelner Loci-Raum
    │   ├── LociRoom.tsx
    │   ├── Slot.tsx
    │   ├── JourneyPath.tsx
    │   └── RoomHeader.tsx
    ├── modals/                 # Dialoge
    │   ├── StationModal.tsx
    │   ├── AddStationModal.tsx
    │   ├── ResultsModal.tsx
    │   └── OrderPanel.tsx
    └── backgrounds/            # SVG-Hintergründe
        ├── index.ts
        ├── WizardTower.tsx
        ├── PirateCave.tsx
        └── SpaceStation.tsx
```

---

## Wichtige Design-Entscheidungen

### Styling
- **Inline Styles** (kein CSS/Tailwind) - für Portabilität
- **GOLD/DARK Theme** aus `constants/theme.ts`
- **Schatzkarte-Branding:** Goldene Gradienten, Glow-Effekte, Sterne

### State Management
- **useReducer + Context Pattern**
- Kein Redux/Zustand - self-contained
- Hooks exportieren Actions + Selectors

### Komponenten-Pattern
- Funktionale Komponenten mit TypeScript
- Props-Interfaces exportiert
- Callbacks für alle Interaktionen (kein interner State für Business-Logik)

---

## Haupt-Datentypen

```typescript
// Kernentitäten
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
}

interface Room {
  id: string;
  chamberId: string;
  templateId: TemplateId;
  name: string;
  description: string;
  subject: string;
  colorTag: ColorTag;
  journeyOrder: string[];  // Station-IDs in Rundgang-Reihenfolge
  createdAt: string;
  updatedAt: string;
}

interface Chamber {
  id: string;
  userId: string;
  totalXp: number;
  createdAt: string;
}

// Enums
type TemplateId = 'wizard-tower' | 'pirate-cave' | 'space-station' | 
                  'dragon-castle' | 'ancient-temple' | 'treehouse';
type ArtifactType = 'poster' | 'figurine' | 'chest' | 'scroll' | 'magic-object';
type RecallStatus = 'mastered' | 'almost' | 'needs_practice';
type RoomMode = 'view' | 'edit' | 'order' | 'journey';
type ColorTag = 'gold' | 'ruby' | 'emerald' | 'sapphire' | 'amethyst' | 'copper';
```

---

## Verwendung (Beispiel)

```tsx
import {
  // Hooks
  useChamber,
  useLociRoom,
  
  // Komponenten
  ChamberOverview,
  LociRoom,
  StationModal,
  AddStationModal,
  ResultsModal,
  
  // Hintergründe
  getBackgroundComponent,
  
  // Types
  type Room,
  type Station,
} from '@/features/schatzkammer';

// Chamber-Seite (Übersicht aller Räume)
function ChamberPage() {
  const { state, sortedRooms, createRoom, openCreateModal, ... } = useChamber({
    chamber: chamberData,
    rooms: roomsData,
  });

  return (
    <ChamberOverview
      rooms={sortedRooms}
      roomStats={state.roomStats}
      isCreateModalOpen={state.modals.createRoom}
      onCreateRoom={createRoom}
      onRoomClick={(id) => navigate(`/room/${id}`)}
      // ...
    />
  );
}

// Raum-Seite (einzelner Loci-Raum)
function RoomPage({ roomId }) {
  const { state, addStation, startJourney, rateStation, ... } = useLociRoom({
    room: roomData,
    stations: stationsData,
  });

  const Background = getBackgroundComponent(state.room.templateId);

  return (
    <>
      <LociRoom
        room={state.room}
        stations={state.stations}
        mode={state.mode}
        journeyProgress={state.journey?.progress}
        BackgroundComponent={Background}
        onSlotClick={(slotId) => openAddModal(slotId)}
        onStationClick={(id) => openStationModal(id)}
        // ...
      />
      
      <StationModal
        isOpen={state.modals.station}
        station={state.selectedStation}
        mode={state.mode === 'journey' ? 'journey' : 'view'}
        onRate={(status) => rateStation(status)}
        // ...
      />
    </>
  );
}
```

---

## Integration in bestehendes Projekt

### 1. Dateien kopieren
Kopiere den gesamten `schatzkammer/` Ordner nach `src/features/`

### 2. Abhängigkeiten prüfen
- React 18+
- TypeScript 5+
- Keine externen Abhängigkeiten (kein Framer Motion nötig für Basis)

### 3. Routing einrichten
```tsx
// Beispiel mit React Router
<Route path="/schatzkammer" element={<ChamberPage />} />
<Route path="/schatzkammer/room/:roomId" element={<RoomPage />} />
```

### 4. Daten-Layer anbinden
Die Hooks erwarten Daten als Props. Anbindung an:
- localStorage (offline)
- Supabase/Firebase
- REST API

---

## Offene Erweiterungen

1. **Fehlende Backgrounds:** DragonCastle, AncientTemple, Treehouse
2. **Persistenz:** localStorage oder Backend-Anbindung
3. **Audio:** Sound-Effekte für Journey
4. **Animationen:** Framer Motion für Übergänge
5. **Tests:** Jest/Vitest Unit Tests

---

## Dateien-Reihenfolge für Kontext

Falls du die Dateien einzeln lesen musst, diese Reihenfolge:

1. `types/index.ts` - Alle Typen verstehen
2. `constants/theme.ts` - Farben + Styling
3. `constants/templates.ts` - Raum-Templates + Slots
4. `hooks/useLociRoom.ts` - Haupt-Hook
5. `components/room/LociRoom.tsx` - Haupt-Komponente
6. `components/modals/StationModal.tsx` - Journey-Flow

Der Rest ergibt sich aus diesen Kern-Dateien.

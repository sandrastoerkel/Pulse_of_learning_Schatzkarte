/**
 * Schatzkammer Loci-System - Type Definitions
 * 
 * Hierarchie:
 * Chamber (Schatzkammer) → Room[] (Loci-Räume) → Station[] (Lernstationen)
 */

// =============================================================================
// CORE ENTITIES
// =============================================================================

/**
 * Eine Lernstation an einem bestimmten Ort im Raum
 */
export interface Station {
  id: string;
  roomId: string;
  slotId: string;
  artifactType: ArtifactType;
  icon: string;
  title: string;
  content: string;
  hint: string;
  /** Verknüpfung zu einem Quiz (optional) */
  quizId?: string;
  /** Letzter Recall-Status */
  recallStatus: RecallStatus | null;
  /** Anzahl der Wiederholungen */
  reviewCount: number;
  /** Letztes Review-Datum (ISO 8601) */
  lastReviewedAt: string | null;
  /** Erstellungsdatum (ISO 8601) */
  createdAt: string;
  /** Aktualisierungsdatum (ISO 8601) */
  updatedAt: string;
}

/**
 * Ein Loci-Raum mit einem bestimmten Template
 */
export interface Room {
  id: string;
  chamberId: string;
  name: string;
  description: string;
  templateId: TemplateId;
  /** Reihenfolge der Stationen für den Rundgang */
  journeyOrder: string[];
  /** Sortierung in der Übersicht */
  sortOrder: number;
  /** Verknüpftes Fach/Thema */
  subject?: string;
  /** Farb-Tag für die Übersicht */
  colorTag: ColorTag;
  /** Erstellungsdatum (ISO 8601) */
  createdAt: string;
  /** Aktualisierungsdatum (ISO 8601) */
  updatedAt: string;
}

/**
 * Die Schatzkammer eines Benutzers (Container für alle Räume)
 */
export interface Chamber {
  id: string;
  userId: string;
  name: string;
  /** Gesamte verdiente XP */
  totalXp: number;
  /** Erstellungsdatum (ISO 8601) */
  createdAt: string;
  /** Aktualisierungsdatum (ISO 8601) */
  updatedAt: string;
}

// =============================================================================
// TEMPLATE SYSTEM
// =============================================================================

/**
 * Verfügbare Raum-Templates
 */
export type TemplateId = 
  | 'wizard-tower'
  | 'pirate-cave'
  | 'space-station'
  | 'dragon-castle'
  | 'ancient-temple'
  | 'treehouse';

/**
 * Ein Slot (Ablageplatz) im Raum
 */
export interface Slot {
  id: string;
  label: string;
  /** X-Position (0-1000 normalisiert) */
  x: number;
  /** Y-Position (0-600 normalisiert) */
  y: number;
  /** Breite des Interaktionsbereichs */
  width: number;
  /** Höhe des Interaktionsbereichs */
  height: number;
}

/**
 * Template-Definition für einen Raum-Typ
 */
export interface RoomTemplate {
  id: TemplateId;
  name: string;
  description: string;
  icon: string;
  /** Empfohlene Altersgruppe */
  ageGroup: '8-12' | '13-18' | 'all';
  /** Verfügbare Slots in diesem Template */
  slots: Slot[];
  /** Vorschaubild-Pfad */
  previewImage?: string;
}

// =============================================================================
// ARTIFACT TYPES
// =============================================================================

/**
 * Verfügbare Artefakt-Typen für Stationen
 */
export type ArtifactType = 
  | 'poster'      // Text, Formeln, Definitionen
  | 'figure'      // Charakter mit Erklärung
  | 'chest'       // Verknüpfung zu Quiz
  | 'scroll'      // Längerer Text, Geschichte
  | 'magic_item'; // Visuell-assoziatives Element

/**
 * Konfiguration für einen Artefakt-Typ
 */
export interface ArtifactConfig {
  type: ArtifactType;
  name: string;
  description: string;
  icon: string;
  /** Standard-Icon für neue Stationen */
  defaultIcon: string;
  /** Empfohlene Verwendung */
  useCase: string;
}

// =============================================================================
// RECALL & SPACED REPETITION
// =============================================================================

/**
 * Status nach einer Selbsteinschätzung
 */
export type RecallStatus = 
  | 'mastered'       // Perfekt gewusst
  | 'almost'         // Fast richtig
  | 'needs_practice'; // Muss üben

/**
 * Ergebnis eines einzelnen Recall-Versuchs
 */
export interface RecallAttempt {
  stationId: string;
  status: RecallStatus;
  timestamp: string;
}

/**
 * Ergebnis eines kompletten Rundgangs
 */
export interface JourneyResult {
  roomId: string;
  completedAt: string;
  attempts: RecallAttempt[];
  /** Verdiente XP für diesen Rundgang */
  xpEarned: number;
  /** Statistik */
  stats: {
    mastered: number;
    almost: number;
    needsPractice: number;
    total: number;
  };
}

// =============================================================================
// UI STATE
// =============================================================================

/**
 * Modi der Raum-Ansicht
 */
export type RoomMode = 
  | 'view'     // Stationen ansehen
  | 'edit'     // Stationen bearbeiten/hinzufügen
  | 'order'    // Reihenfolge festlegen
  | 'journey'; // Rundgang durchführen

/**
 * State für den Journey-Modus
 */
export interface JourneyState {
  /** Aktueller Index in journeyOrder */
  currentIndex: number;
  /** Ist der Inhalt aufgedeckt? */
  isRevealed: boolean;
  /** Bisherige Ergebnisse */
  results: RecallAttempt[];
  /** Journey läuft? */
  isActive: boolean;
}

/**
 * Haupt-State für einen Loci-Raum
 */
export interface LociRoomState {
  room: Room | null;
  stations: Station[];
  mode: RoomMode;
  selectedStationId: string | null;
  selectedSlotId: string | null;
  journey: JourneyState;
  /** Modal-States */
  modals: {
    addStation: boolean;
    editStation: boolean;
    results: boolean;
    orderPanel: boolean;
  };
  /** Loading/Error States */
  isLoading: boolean;
  error: string | null;
}

/**
 * Haupt-State für die Chamber-Übersicht
 */
export interface ChamberState {
  chamber: Chamber | null;
  rooms: Room[];
  /** Für jeden Raum: Anzahl Stationen und Review-Status */
  roomStats: Record<string, RoomStats>;
  /** Modal-States */
  modals: {
    createRoom: boolean;
    editRoom: boolean;
    deleteRoom: boolean;
  };
  /** Aktuell ausgewählter Raum (für Edit/Delete) */
  selectedRoomId: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Statistiken für einen Raum
 */
export interface RoomStats {
  totalStations: number;
  masteredStations: number;
  /** Stationen, die wiederholt werden sollten */
  dueForReview: number;
  /** Letzter Rundgang */
  lastJourneyAt: string | null;
  /** Durchschnittliche Erfolgsrate (0-1) */
  averageRecallRate: number;
}

// =============================================================================
// ACTIONS (für useReducer)
// =============================================================================

/**
 * Actions für LociRoom Reducer
 */
export type LociRoomAction =
  // Mode & Selection
  | { type: 'SET_MODE'; payload: RoomMode }
  | { type: 'SELECT_STATION'; payload: string | null }
  | { type: 'SELECT_SLOT'; payload: string | null }
  | { type: 'CLOSE_ALL_MODALS' }
  // CRUD Stations
  | { type: 'SET_ROOM'; payload: Room }
  | { type: 'SET_STATIONS'; payload: Station[] }
  | { type: 'ADD_STATION'; payload: Station }
  | { type: 'UPDATE_STATION'; payload: Partial<Station> & { id: string } }
  | { type: 'DELETE_STATION'; payload: string }
  // Journey Order
  | { type: 'SET_JOURNEY_ORDER'; payload: string[] }
  | { type: 'MOVE_IN_ORDER'; payload: { stationId: string; direction: 'up' | 'down' } }
  // Journey Mode
  | { type: 'START_JOURNEY' }
  | { type: 'REVEAL_CONTENT' }
  | { type: 'RATE_RECALL'; payload: RecallStatus }
  | { type: 'END_JOURNEY' }
  | { type: 'RESET_JOURNEY' }
  // Modals
  | { type: 'OPEN_ADD_MODAL' }
  | { type: 'OPEN_RESULTS_MODAL' }
  | { type: 'TOGGLE_ORDER_PANEL' }
  // Loading/Error
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

/**
 * Actions für Chamber Reducer
 */
export type ChamberAction =
  | { type: 'SET_CHAMBER'; payload: Chamber }
  | { type: 'SET_ROOMS'; payload: Room[] }
  | { type: 'ADD_ROOM'; payload: Room }
  | { type: 'UPDATE_ROOM'; payload: Partial<Room> & { id: string } }
  | { type: 'DELETE_ROOM'; payload: string }
  | { type: 'SET_ROOM_STATS'; payload: Record<string, RoomStats> }
  | { type: 'SELECT_ROOM'; payload: string | null }
  | { type: 'OPEN_CREATE_MODAL' }
  | { type: 'OPEN_EDIT_MODAL' }
  | { type: 'OPEN_DELETE_MODAL' }
  | { type: 'CLOSE_ALL_MODALS' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// =============================================================================
// THEME & STYLING
// =============================================================================

/**
 * Farb-Tags für Räume
 */
export type ColorTag = 
  | 'gold'
  | 'ruby'
  | 'emerald'
  | 'sapphire'
  | 'amethyst'
  | 'copper';

/**
 * Status-Farben für Recall
 */
export interface StatusColors {
  mastered: string;
  almost: string;
  needsPractice: string;
  neutral: string;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Für das Erstellen neuer Entitäten (ohne auto-generierte Felder)
 */
export type CreateStation = Omit<Station, 'id' | 'createdAt' | 'updatedAt' | 'reviewCount' | 'recallStatus' | 'lastReviewedAt'>;
export type CreateRoom = Omit<Room, 'id' | 'createdAt' | 'updatedAt' | 'journeyOrder' | 'sortOrder'>;
export type CreateChamber = Omit<Chamber, 'id' | 'createdAt' | 'updatedAt' | 'totalXp'>;

/**
 * Für Updates (alle Felder optional außer id)
 */
export type UpdateStation = Partial<Omit<Station, 'id' | 'roomId' | 'createdAt'>> & { id: string };
export type UpdateRoom = Partial<Omit<Room, 'id' | 'chamberId' | 'createdAt'>> & { id: string };

/**
 * Position im 2D-Raum
 */
export interface Position2D {
  x: number;
  y: number;
}

/**
 * Dimensionen
 */
export interface Dimensions {
  width: number;
  height: number;
}

/**
 * XP-Konfiguration
 */
export interface XpConfig {
  mastered: number;
  almost: number;
  needsPractice: number;
  /** Bonus für perfekten Rundgang */
  perfectBonus: number;
  /** Bonus für tägliches Üben */
  streakBonus: number;
}

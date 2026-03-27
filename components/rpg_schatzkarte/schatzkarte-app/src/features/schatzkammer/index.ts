/**
 * Schatzkammer Loci-System
 * 
 * Public API für das Feature-Modul
 */

// Types
export type {
  // Core Entities
  Station,
  Room,
  Chamber,
  // Template System
  TemplateId,
  Slot as SlotData,
  RoomTemplate,
  // Artifact Types
  ArtifactType,
  ArtifactConfig,
  // Recall & Spaced Repetition
  RecallStatus,
  RecallAttempt,
  JourneyResult,
  // UI State
  RoomMode,
  JourneyState,
  LociRoomState,
  ChamberState,
  RoomStats,
  // Actions
  LociRoomAction,
  ChamberAction,
  // Theme
  ColorTag,
  StatusColors,
  XpConfig,
  // Utility Types
  CreateStation,
  CreateRoom,
  CreateChamber,
  UpdateStation,
  UpdateRoom,
  Position2D,
  Dimensions,
} from './types';

// Constants
export {
  // Artifacts
  ARTIFACT_CONFIGS,
  ARTIFACT_TYPES,
  DEFAULT_ARTIFACT_TYPE,
  ARTIFACT_ICON_SUGGESTIONS,
  getArtifactConfig,
  // Templates
  ROOM_TEMPLATES,
  TEMPLATE_IDS,
  DEFAULT_TEMPLATE,
  getTemplate,
  getTemplateSlots,
  findSlot,
  getTemplatesByAgeGroup,
  // Theme
  GOLD,
  DARK,
  STATUS_COLORS,
  COLOR_TAGS,
  COLOR_TAG_OPTIONS,
  XP_CONFIG,
  calculateJourneyXp,
  REVIEW_INTERVALS,
  REVIEW_THRESHOLD_DAYS,
  needsReview,
  ANIMATIONS,
  ANIMATION_DURATIONS,
  KEYFRAMES,
  ROOM_VIEWPORT,
  DEFAULT_SLOT_SIZE,
  MODAL_SIZES,
  Z_INDEX,
  STATUS_LABELS,
  STATUS_EMOJIS,
  getResultEmoji,
  getResultMessage,
} from './constants';

// Utils
export {
  // ID Generation
  generateId,
  generateStationId,
  generateRoomId,
  generateChamberId,
  // Date Utilities
  nowISO,
  formatDate,
  formatRelativeDate,
  daysSince,
  // Entity Factories
  createStation,
  createRoom,
  createChamber,
  // Statistics
  calculateRoomStats,
  calculateSuccessRate,
  // Sorting & Filtering
  sortStationsByJourneyOrder,
  getStationsDueForReview,
  sortRoomsBySortOrder,
  // Validation
  validateStation,
  validateRoom,
  // Misc
  truncate,
  stationsBySlot,
  findFreeSlots,
  clamp,
} from './utils';

// Components
export {
  // Chamber
  ChamberOverview,
  type ChamberOverviewProps,
  RoomCard,
  type RoomCardProps,
  CreateRoomModal,
  type CreateRoomModalProps,
  DeleteRoomModal,
  type DeleteRoomModalProps,
  // Room
  LociRoom,
  type LociRoomProps,
  Slot,
  type SlotProps,
  JourneyPath,
  type JourneyPathProps,
  RoomHeader,
  type RoomHeaderProps,
  // Modals
  StationModal,
  type StationModalProps,
  type StationModalMode,
  AddStationModal,
  type AddStationModalProps,
  ResultsModal,
  type ResultsModalProps,
  OrderPanel,
  type OrderPanelProps,
  // Backgrounds
  WizardTower,
  type WizardTowerProps,
  PirateCave,
  type PirateCaveProps,
  SpaceStation,
  type SpaceStationProps,
  BACKGROUND_COMPONENTS,
  getBackgroundComponent,
} from './components';

// Hooks
export {
  // Loci Room
  useLociRoom,
  type UseLociRoomOptions,
  type UseLociRoomReturn,
  lociRoomReducer,
  lociRoomActions,
  createInitialLociRoomState,
  // Chamber
  useChamber,
  type UseChamberOptions,
  type UseChamberReturn,
  chamberReducer,
  chamberActions,
  createInitialChamberState,
  // Spaced Repetition
  useSpacedRepetition,
  type ReviewInfo,
  type SpacedRepetitionStats,
  type UseSpacedRepetitionReturn,
} from './hooks';

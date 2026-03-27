/**
 * Components - Zentrale Exports
 */

// Chamber (Übersicht)
export {
  ChamberOverview,
  type ChamberOverviewProps,
  RoomCard,
  type RoomCardProps,
  CreateRoomModal,
  type CreateRoomModalProps,
  DeleteRoomModal,
  type DeleteRoomModalProps,
} from './chamber';

// Room (Loci-Raum)
export {
  LociRoom,
  type LociRoomProps,
  Slot,
  type SlotProps,
  JourneyPath,
  type JourneyPathProps,
  RoomHeader,
  type RoomHeaderProps,
} from './room';

// Modals
export {
  StationModal,
  type StationModalProps,
  type StationModalMode,
  AddStationModal,
  type AddStationModalProps,
  ResultsModal,
  type ResultsModalProps,
  OrderPanel,
  type OrderPanelProps,
} from './modals';

// Backgrounds
export {
  WizardTower,
  type WizardTowerProps,
  PirateCave,
  type PirateCaveProps,
  SpaceStation,
  type SpaceStationProps,
  BACKGROUND_COMPONENTS,
  getBackgroundComponent,
} from './backgrounds';

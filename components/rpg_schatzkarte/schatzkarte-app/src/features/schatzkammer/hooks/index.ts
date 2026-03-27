/**
 * Hooks - Zentrale Exports
 */

// Loci Room
export { 
  useLociRoom,
  type UseLociRoomOptions,
  type UseLociRoomReturn,
} from './useLociRoom';

export {
  lociRoomReducer,
  lociRoomActions,
  createInitialLociRoomState,
} from './lociRoomReducer';

// Chamber
export {
  useChamber,
  type UseChamberOptions,
  type UseChamberReturn,
} from './useChamber';

export {
  chamberReducer,
  chamberActions,
  createInitialChamberState,
} from './chamberReducer';

// Spaced Repetition
export {
  useSpacedRepetition,
  type ReviewInfo,
  type SpacedRepetitionStats,
  type UseSpacedRepetitionReturn,
} from './useSpacedRepetition';

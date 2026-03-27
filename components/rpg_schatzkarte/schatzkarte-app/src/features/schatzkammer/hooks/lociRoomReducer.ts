/**
 * Loci Room Reducer
 * 
 * State-Management für einen einzelnen Loci-Raum mit allen Modi
 * (View, Edit, Order, Journey)
 */

import type {
  LociRoomState,
  LociRoomAction,
  Station,
  Room,
  RecallStatus,
  RoomMode,
} from '../types';
import { nowISO } from '../utils';

// =============================================================================
// INITIAL STATE
// =============================================================================

export const initialJourneyState: LociRoomState['journey'] = {
  currentIndex: 0,
  isRevealed: false,
  results: [],
  isActive: false,
};

export const initialModalsState: LociRoomState['modals'] = {
  addStation: false,
  editStation: false,
  results: false,
  orderPanel: false,
};

export function createInitialLociRoomState(
  room?: Room,
  stations?: Station[]
): LociRoomState {
  return {
    room: room ?? null,
    stations: stations ?? [],
    mode: 'view',
    selectedStationId: null,
    selectedSlotId: null,
    journey: initialJourneyState,
    modals: initialModalsState,
    isLoading: false,
    error: null,
  };
}

// =============================================================================
// REDUCER
// =============================================================================

export function lociRoomReducer(
  state: LociRoomState,
  action: LociRoomAction
): LociRoomState {
  switch (action.type) {
    // =========================================================================
    // MODE & SELECTION
    // =========================================================================

    case 'SET_MODE': {
      const newMode = action.payload;
      
      // Reset selections when changing mode
      let newState: LociRoomState = {
        ...state,
        mode: newMode,
        selectedStationId: null,
        selectedSlotId: null,
      };

      // Open/close order panel based on mode
      if (newMode === 'order') {
        newState.modals = { ...newState.modals, orderPanel: true };
      } else {
        newState.modals = { ...newState.modals, orderPanel: false };
      }

      // Reset journey when leaving journey mode
      if (state.mode === 'journey' && newMode !== 'journey') {
        newState.journey = initialJourneyState;
      }

      return newState;
    }

    case 'SELECT_STATION': {
      const stationId = action.payload;
      
      // In journey mode, don't allow manual selection
      if (state.mode === 'journey') {
        return state;
      }

      return {
        ...state,
        selectedStationId: stationId,
        selectedSlotId: null,
        modals: {
          ...state.modals,
          editStation: stationId !== null && state.mode === 'edit',
        },
      };
    }

    case 'SELECT_SLOT': {
      const slotId = action.payload;
      
      // Check if slot is occupied
      const existingStation = state.stations.find(s => s.slotId === slotId);
      
      if (existingStation) {
        // Select the station instead
        return {
          ...state,
          selectedStationId: existingStation.id,
          selectedSlotId: null,
          modals: {
            ...state.modals,
            editStation: state.mode === 'edit',
          },
        };
      }

      // Empty slot - open add modal in edit mode
      return {
        ...state,
        selectedStationId: null,
        selectedSlotId: slotId,
        modals: {
          ...state.modals,
          addStation: state.mode === 'edit',
        },
      };
    }

    case 'CLOSE_ALL_MODALS': {
      return {
        ...state,
        selectedStationId: null,
        selectedSlotId: null,
        modals: initialModalsState,
      };
    }

    // =========================================================================
    // CRUD - ROOM & STATIONS
    // =========================================================================

    case 'SET_ROOM': {
      return {
        ...state,
        room: action.payload,
      };
    }

    case 'SET_STATIONS': {
      return {
        ...state,
        stations: action.payload,
      };
    }

    case 'ADD_STATION': {
      const newStation = action.payload;
      const updatedStations = [...state.stations, newStation];
      
      // Add to journey order if room exists
      let updatedRoom = state.room;
      if (updatedRoom) {
        updatedRoom = {
          ...updatedRoom,
          journeyOrder: [...updatedRoom.journeyOrder, newStation.id],
          updatedAt: nowISO(),
        };
      }

      return {
        ...state,
        room: updatedRoom,
        stations: updatedStations,
        selectedSlotId: null,
        modals: {
          ...state.modals,
          addStation: false,
        },
      };
    }

    case 'UPDATE_STATION': {
      const { id, ...updates } = action.payload;
      const updatedStations = state.stations.map(station =>
        station.id === id
          ? { ...station, ...updates, updatedAt: nowISO() }
          : station
      );

      return {
        ...state,
        stations: updatedStations,
        modals: {
          ...state.modals,
          editStation: false,
        },
      };
    }

    case 'DELETE_STATION': {
      const stationId = action.payload;
      const updatedStations = state.stations.filter(s => s.id !== stationId);
      
      // Remove from journey order
      let updatedRoom = state.room;
      if (updatedRoom) {
        updatedRoom = {
          ...updatedRoom,
          journeyOrder: updatedRoom.journeyOrder.filter(id => id !== stationId),
          updatedAt: nowISO(),
        };
      }

      return {
        ...state,
        room: updatedRoom,
        stations: updatedStations,
        selectedStationId: null,
        modals: {
          ...state.modals,
          editStation: false,
        },
      };
    }

    // =========================================================================
    // JOURNEY ORDER
    // =========================================================================

    case 'SET_JOURNEY_ORDER': {
      if (!state.room) return state;

      return {
        ...state,
        room: {
          ...state.room,
          journeyOrder: action.payload,
          updatedAt: nowISO(),
        },
      };
    }

    case 'MOVE_IN_ORDER': {
      if (!state.room) return state;

      const { stationId, direction } = action.payload;
      const order = [...state.room.journeyOrder];
      const currentIndex = order.indexOf(stationId);

      if (currentIndex === -1) return state;

      const newIndex = direction === 'up' 
        ? currentIndex - 1 
        : currentIndex + 1;

      // Bounds check
      if (newIndex < 0 || newIndex >= order.length) return state;

      // Swap
      [order[currentIndex], order[newIndex]] = [order[newIndex]!, order[currentIndex]!];

      return {
        ...state,
        room: {
          ...state.room,
          journeyOrder: order,
          updatedAt: nowISO(),
        },
      };
    }

    // =========================================================================
    // JOURNEY MODE
    // =========================================================================

    case 'START_JOURNEY': {
      if (!state.room || state.room.journeyOrder.length === 0) {
        return state;
      }

      const firstStationId = state.room.journeyOrder[0];

      return {
        ...state,
        mode: 'journey',
        selectedStationId: firstStationId ?? null,
        journey: {
          currentIndex: 0,
          isRevealed: false,
          results: [],
          isActive: true,
        },
        modals: initialModalsState,
      };
    }

    case 'REVEAL_CONTENT': {
      if (!state.journey.isActive) return state;

      return {
        ...state,
        journey: {
          ...state.journey,
          isRevealed: true,
        },
      };
    }

    case 'RATE_RECALL': {
      if (!state.room || !state.journey.isActive) return state;

      const status = action.payload;
      const currentStationId = state.room.journeyOrder[state.journey.currentIndex];
      
      if (!currentStationId) return state;

      // Update station with recall status
      const updatedStations = state.stations.map(station =>
        station.id === currentStationId
          ? {
              ...station,
              recallStatus: status,
              reviewCount: station.reviewCount + 1,
              lastReviewedAt: nowISO(),
              updatedAt: nowISO(),
            }
          : station
      );

      // Add to results
      const newResult = {
        stationId: currentStationId,
        status,
        timestamp: nowISO(),
      };
      const updatedResults = [...state.journey.results, newResult];

      // Check if journey is complete
      const nextIndex = state.journey.currentIndex + 1;
      const isComplete = nextIndex >= state.room.journeyOrder.length;

      if (isComplete) {
        // Journey complete - show results
        return {
          ...state,
          stations: updatedStations,
          journey: {
            ...state.journey,
            results: updatedResults,
            isActive: false,
          },
          modals: {
            ...state.modals,
            results: true,
          },
        };
      }

      // Move to next station
      const nextStationId = state.room.journeyOrder[nextIndex];

      return {
        ...state,
        stations: updatedStations,
        selectedStationId: nextStationId ?? null,
        journey: {
          ...state.journey,
          currentIndex: nextIndex,
          isRevealed: false,
          results: updatedResults,
        },
      };
    }

    case 'END_JOURNEY': {
      return {
        ...state,
        mode: 'view',
        selectedStationId: null,
        journey: initialJourneyState,
        modals: {
          ...state.modals,
          results: false,
        },
      };
    }

    case 'RESET_JOURNEY': {
      // Restart journey from beginning
      if (!state.room || state.room.journeyOrder.length === 0) {
        return state;
      }

      const firstStationId = state.room.journeyOrder[0];

      return {
        ...state,
        mode: 'journey',
        selectedStationId: firstStationId ?? null,
        journey: {
          currentIndex: 0,
          isRevealed: false,
          results: [],
          isActive: true,
        },
        modals: {
          ...state.modals,
          results: false,
        },
      };
    }

    // =========================================================================
    // MODALS
    // =========================================================================

    case 'OPEN_ADD_MODAL': {
      return {
        ...state,
        modals: {
          ...state.modals,
          addStation: true,
        },
      };
    }

    case 'OPEN_RESULTS_MODAL': {
      return {
        ...state,
        modals: {
          ...state.modals,
          results: true,
        },
      };
    }

    case 'TOGGLE_ORDER_PANEL': {
      const isOpen = !state.modals.orderPanel;
      return {
        ...state,
        mode: isOpen ? 'order' : 'view',
        modals: {
          ...state.modals,
          orderPanel: isOpen,
        },
      };
    }

    // =========================================================================
    // LOADING & ERROR
    // =========================================================================

    case 'SET_LOADING': {
      return {
        ...state,
        isLoading: action.payload,
      };
    }

    case 'SET_ERROR': {
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    }

    default: {
      // TypeScript exhaustiveness check
      const _exhaustive: never = action;
      return state;
    }
  }
}

// =============================================================================
// ACTION CREATORS
// =============================================================================

export const lociRoomActions = {
  // Mode & Selection
  setMode: (mode: RoomMode): LociRoomAction => ({ type: 'SET_MODE', payload: mode }),
  selectStation: (id: string | null): LociRoomAction => ({ type: 'SELECT_STATION', payload: id }),
  selectSlot: (id: string | null): LociRoomAction => ({ type: 'SELECT_SLOT', payload: id }),
  closeAllModals: (): LociRoomAction => ({ type: 'CLOSE_ALL_MODALS' }),

  // CRUD
  setRoom: (room: Room): LociRoomAction => ({ type: 'SET_ROOM', payload: room }),
  setStations: (stations: Station[]): LociRoomAction => ({ type: 'SET_STATIONS', payload: stations }),
  addStation: (station: Station): LociRoomAction => ({ type: 'ADD_STATION', payload: station }),
  updateStation: (data: Partial<Station> & { id: string }): LociRoomAction => ({ type: 'UPDATE_STATION', payload: data }),
  deleteStation: (id: string): LociRoomAction => ({ type: 'DELETE_STATION', payload: id }),

  // Journey Order
  setJourneyOrder: (order: string[]): LociRoomAction => ({ type: 'SET_JOURNEY_ORDER', payload: order }),
  moveInOrder: (stationId: string, direction: 'up' | 'down'): LociRoomAction => ({ type: 'MOVE_IN_ORDER', payload: { stationId, direction } }),

  // Journey Mode
  startJourney: (): LociRoomAction => ({ type: 'START_JOURNEY' }),
  revealContent: (): LociRoomAction => ({ type: 'REVEAL_CONTENT' }),
  rateRecall: (status: RecallStatus): LociRoomAction => ({ type: 'RATE_RECALL', payload: status }),
  endJourney: (): LociRoomAction => ({ type: 'END_JOURNEY' }),
  resetJourney: (): LociRoomAction => ({ type: 'RESET_JOURNEY' }),

  // Modals
  openAddModal: (): LociRoomAction => ({ type: 'OPEN_ADD_MODAL' }),
  openResultsModal: (): LociRoomAction => ({ type: 'OPEN_RESULTS_MODAL' }),
  toggleOrderPanel: (): LociRoomAction => ({ type: 'TOGGLE_ORDER_PANEL' }),

  // Loading & Error
  setLoading: (loading: boolean): LociRoomAction => ({ type: 'SET_LOADING', payload: loading }),
  setError: (error: string | null): LociRoomAction => ({ type: 'SET_ERROR', payload: error }),
};

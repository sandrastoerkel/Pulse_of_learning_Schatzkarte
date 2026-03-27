/**
 * Chamber Reducer
 * 
 * State-Management für die Schatzkammer-Übersicht (alle Räume)
 */

import type {
  ChamberState,
  ChamberAction,
  Chamber,
  Room,
  RoomStats,
} from '../types';
import { nowISO } from '../utils';

// =============================================================================
// INITIAL STATE
// =============================================================================

export const initialModalsState: ChamberState['modals'] = {
  createRoom: false,
  editRoom: false,
  deleteRoom: false,
};

export function createInitialChamberState(
  chamber?: Chamber,
  rooms?: Room[]
): ChamberState {
  return {
    chamber: chamber ?? null,
    rooms: rooms ?? [],
    roomStats: {},
    modals: initialModalsState,
    selectedRoomId: null,
    isLoading: false,
    error: null,
  };
}

// =============================================================================
// REDUCER
// =============================================================================

export function chamberReducer(
  state: ChamberState,
  action: ChamberAction
): ChamberState {
  switch (action.type) {
    // =========================================================================
    // CHAMBER
    // =========================================================================

    case 'SET_CHAMBER': {
      return {
        ...state,
        chamber: action.payload,
      };
    }

    // =========================================================================
    // ROOMS
    // =========================================================================

    case 'SET_ROOMS': {
      // Sort rooms by sortOrder
      const sortedRooms = [...action.payload].sort((a, b) => a.sortOrder - b.sortOrder);
      return {
        ...state,
        rooms: sortedRooms,
      };
    }

    case 'ADD_ROOM': {
      const newRoom = action.payload;
      
      // Calculate sortOrder for new room (at the end)
      const maxSortOrder = state.rooms.reduce(
        (max, room) => Math.max(max, room.sortOrder),
        -1
      );
      
      const roomWithOrder = {
        ...newRoom,
        sortOrder: maxSortOrder + 1,
      };

      return {
        ...state,
        rooms: [...state.rooms, roomWithOrder],
        modals: {
          ...state.modals,
          createRoom: false,
        },
      };
    }

    case 'UPDATE_ROOM': {
      const { id, ...updates } = action.payload;
      const updatedRooms = state.rooms.map(room =>
        room.id === id
          ? { ...room, ...updates, updatedAt: nowISO() }
          : room
      );

      return {
        ...state,
        rooms: updatedRooms,
        selectedRoomId: null,
        modals: {
          ...state.modals,
          editRoom: false,
        },
      };
    }

    case 'DELETE_ROOM': {
      const roomId = action.payload;
      const updatedRooms = state.rooms.filter(room => room.id !== roomId);

      // Also remove stats for this room
      const { [roomId]: _removedStats, ...remainingStats } = state.roomStats;

      return {
        ...state,
        rooms: updatedRooms,
        roomStats: remainingStats,
        selectedRoomId: null,
        modals: {
          ...state.modals,
          deleteRoom: false,
        },
      };
    }

    // =========================================================================
    // ROOM STATS
    // =========================================================================

    case 'SET_ROOM_STATS': {
      return {
        ...state,
        roomStats: action.payload,
      };
    }

    // =========================================================================
    // SELECTION & MODALS
    // =========================================================================

    case 'SELECT_ROOM': {
      return {
        ...state,
        selectedRoomId: action.payload,
      };
    }

    case 'OPEN_CREATE_MODAL': {
      return {
        ...state,
        modals: {
          ...state.modals,
          createRoom: true,
        },
      };
    }

    case 'OPEN_EDIT_MODAL': {
      return {
        ...state,
        modals: {
          ...state.modals,
          editRoom: true,
        },
      };
    }

    case 'OPEN_DELETE_MODAL': {
      return {
        ...state,
        modals: {
          ...state.modals,
          deleteRoom: true,
        },
      };
    }

    case 'CLOSE_ALL_MODALS': {
      return {
        ...state,
        selectedRoomId: null,
        modals: initialModalsState,
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

export const chamberActions = {
  // Chamber
  setChamber: (chamber: Chamber): ChamberAction => ({ type: 'SET_CHAMBER', payload: chamber }),

  // Rooms
  setRooms: (rooms: Room[]): ChamberAction => ({ type: 'SET_ROOMS', payload: rooms }),
  addRoom: (room: Room): ChamberAction => ({ type: 'ADD_ROOM', payload: room }),
  updateRoom: (data: Partial<Room> & { id: string }): ChamberAction => ({ type: 'UPDATE_ROOM', payload: data }),
  deleteRoom: (id: string): ChamberAction => ({ type: 'DELETE_ROOM', payload: id }),

  // Stats
  setRoomStats: (stats: Record<string, RoomStats>): ChamberAction => ({ type: 'SET_ROOM_STATS', payload: stats }),

  // Selection & Modals
  selectRoom: (id: string | null): ChamberAction => ({ type: 'SELECT_ROOM', payload: id }),
  openCreateModal: (): ChamberAction => ({ type: 'OPEN_CREATE_MODAL' }),
  openEditModal: (): ChamberAction => ({ type: 'OPEN_EDIT_MODAL' }),
  openDeleteModal: (): ChamberAction => ({ type: 'OPEN_DELETE_MODAL' }),
  closeAllModals: (): ChamberAction => ({ type: 'CLOSE_ALL_MODALS' }),

  // Loading & Error
  setLoading: (loading: boolean): ChamberAction => ({ type: 'SET_LOADING', payload: loading }),
  setError: (error: string | null): ChamberAction => ({ type: 'SET_ERROR', payload: error }),
};

/**
 * useChamber Hook
 * 
 * State-Management für die Schatzkammer-Übersicht (alle Räume).
 */

import { useReducer, useCallback, useMemo } from 'react';
import type {
  Room,
  Chamber,
  RoomStats,
  CreateRoom,
  TemplateId,
  ColorTag,
} from '../types';
import {
  chamberReducer,
  createInitialChamberState,
  chamberActions,
} from './chamberReducer';
import { createRoom, sortRoomsBySortOrder } from '../utils';

// =============================================================================
// HOOK INTERFACE
// =============================================================================

export interface UseChamberOptions {
  chamber?: Chamber;
  rooms?: Room[];
}

export interface UseChamberReturn {
  // State
  state: ReturnType<typeof createInitialChamberState>;
  
  // Derived Values
  sortedRooms: Room[];
  selectedRoom: Room | null;
  totalRooms: number;
  totalStations: number;
  totalMastered: number;
  roomsDueForReview: Room[];
  
  // Chamber Actions
  loadChamber: (chamber: Chamber, rooms: Room[], stats?: Record<string, RoomStats>) => void;
  
  // Room CRUD
  createRoom: (data: {
    name: string;
    description?: string;
    templateId: TemplateId;
    subject?: string;
    colorTag?: ColorTag;
  }) => Room;
  updateRoom: (id: string, data: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  
  // Room Stats
  setRoomStats: (stats: Record<string, RoomStats>) => void;
  updateRoomStats: (roomId: string, stats: RoomStats) => void;
  
  // Selection & Navigation
  selectRoom: (id: string | null) => void;
  
  // Modals
  openCreateModal: () => void;
  openEditModal: (roomId: string) => void;
  openDeleteModal: (roomId: string) => void;
  closeModals: () => void;
  
  // Loading & Error
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function useChamber(options: UseChamberOptions = {}): UseChamberReturn {
  const { chamber, rooms } = options;

  // Initialize reducer
  const [state, dispatch] = useReducer(
    chamberReducer,
    createInitialChamberState(chamber, rooms)
  );

  // ==========================================================================
  // DERIVED VALUES
  // ==========================================================================

  /**
   * Rooms sorted by sortOrder
   */
  const sortedRooms = useMemo((): Room[] => {
    return sortRoomsBySortOrder(state.rooms);
  }, [state.rooms]);

  /**
   * Currently selected room
   */
  const selectedRoom = useMemo((): Room | null => {
    if (!state.selectedRoomId) return null;
    return state.rooms.find(r => r.id === state.selectedRoomId) ?? null;
  }, [state.selectedRoomId, state.rooms]);

  /**
   * Total number of rooms
   */
  const totalRooms = useMemo(() => state.rooms.length, [state.rooms]);

  /**
   * Total stations across all rooms
   */
  const totalStations = useMemo(() => {
    return Object.values(state.roomStats).reduce(
      (sum, stats) => sum + stats.totalStations,
      0
    );
  }, [state.roomStats]);

  /**
   * Total mastered stations
   */
  const totalMastered = useMemo(() => {
    return Object.values(state.roomStats).reduce(
      (sum, stats) => sum + stats.masteredStations,
      0
    );
  }, [state.roomStats]);

  /**
   * Rooms that have stations due for review
   */
  const roomsDueForReview = useMemo((): Room[] => {
    return state.rooms.filter(room => {
      const stats = state.roomStats[room.id];
      return stats && stats.dueForReview > 0;
    });
  }, [state.rooms, state.roomStats]);

  // ==========================================================================
  // CHAMBER ACTIONS
  // ==========================================================================

  const loadChamber = useCallback((
    newChamber: Chamber,
    newRooms: Room[],
    stats?: Record<string, RoomStats>
  ) => {
    dispatch(chamberActions.setChamber(newChamber));
    dispatch(chamberActions.setRooms(newRooms));
    if (stats) {
      dispatch(chamberActions.setRoomStats(stats));
    }
  }, []);

  // ==========================================================================
  // ROOM CRUD
  // ==========================================================================

  const createRoomHandler = useCallback((data: {
    name: string;
    description?: string;
    templateId: TemplateId;
    subject?: string;
    colorTag?: ColorTag;
  }): Room => {
    if (!state.chamber) {
      throw new Error('No chamber loaded');
    }

    const newRoom = createRoom({
      chamberId: state.chamber.id,
      name: data.name,
      description: data.description ?? '',
      templateId: data.templateId,
      subject: data.subject,
      colorTag: data.colorTag ?? 'gold',
    });

    dispatch(chamberActions.addRoom(newRoom));
    return newRoom;
  }, [state.chamber]);

  const updateRoomHandler = useCallback((id: string, data: Partial<Room>) => {
    dispatch(chamberActions.updateRoom({ id, ...data }));
  }, []);

  const deleteRoomHandler = useCallback((id: string) => {
    dispatch(chamberActions.deleteRoom(id));
  }, []);

  // ==========================================================================
  // ROOM STATS
  // ==========================================================================

  const setRoomStats = useCallback((stats: Record<string, RoomStats>) => {
    dispatch(chamberActions.setRoomStats(stats));
  }, []);

  const updateRoomStats = useCallback((roomId: string, stats: RoomStats) => {
    dispatch(chamberActions.setRoomStats({
      ...state.roomStats,
      [roomId]: stats,
    }));
  }, [state.roomStats]);

  // ==========================================================================
  // SELECTION & NAVIGATION
  // ==========================================================================

  const selectRoom = useCallback((id: string | null) => {
    dispatch(chamberActions.selectRoom(id));
  }, []);

  // ==========================================================================
  // MODALS
  // ==========================================================================

  const openCreateModal = useCallback(() => {
    dispatch(chamberActions.openCreateModal());
  }, []);

  const openEditModal = useCallback((roomId: string) => {
    dispatch(chamberActions.selectRoom(roomId));
    dispatch(chamberActions.openEditModal());
  }, []);

  const openDeleteModal = useCallback((roomId: string) => {
    dispatch(chamberActions.selectRoom(roomId));
    dispatch(chamberActions.openDeleteModal());
  }, []);

  const closeModals = useCallback(() => {
    dispatch(chamberActions.closeAllModals());
  }, []);

  // ==========================================================================
  // LOADING & ERROR
  // ==========================================================================

  const setLoading = useCallback((loading: boolean) => {
    dispatch(chamberActions.setLoading(loading));
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch(chamberActions.setError(error));
  }, []);

  // ==========================================================================
  // RETURN
  // ==========================================================================

  return {
    // State
    state,
    
    // Derived Values
    sortedRooms,
    selectedRoom,
    totalRooms,
    totalStations,
    totalMastered,
    roomsDueForReview,
    
    // Chamber Actions
    loadChamber,
    
    // Room CRUD
    createRoom: createRoomHandler,
    updateRoom: updateRoomHandler,
    deleteRoom: deleteRoomHandler,
    
    // Room Stats
    setRoomStats,
    updateRoomStats,
    
    // Selection & Navigation
    selectRoom,
    
    // Modals
    openCreateModal,
    openEditModal,
    openDeleteModal,
    closeModals,
    
    // Loading & Error
    setLoading,
    setError,
  };
}

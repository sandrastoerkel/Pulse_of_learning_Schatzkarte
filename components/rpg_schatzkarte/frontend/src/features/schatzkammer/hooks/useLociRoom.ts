/**
 * useLociRoom Hook
 * 
 * Haupt-Hook für State-Management eines einzelnen Loci-Raums.
 * Kombiniert Reducer mit abgeleiteten Werten und Hilfsfunktionen.
 */

import { useReducer, useCallback, useMemo } from 'react';
import type {
  Station,
  Room,
  Slot,
  RecallStatus,
  RoomMode,
  CreateStation,
  JourneyResult,
} from '../types';
import {
  lociRoomReducer,
  createInitialLociRoomState,
  lociRoomActions,
} from './lociRoomReducer';
import {
  createStation,
  stationsBySlot,
  sortStationsByJourneyOrder,
  calculateRoomStats,
  calculateSuccessRate,
} from '../utils';
import {
  getTemplateSlots,
  calculateJourneyXp,
  needsReview,
} from '../constants';

// =============================================================================
// HOOK INTERFACE
// =============================================================================

export interface UseLociRoomOptions {
  room?: Room;
  stations?: Station[];
}

export interface UseLociRoomReturn {
  // State
  state: ReturnType<typeof createInitialLociRoomState>;
  
  // Derived Values
  slots: Slot[];
  stationMap: Map<string, Station>;
  orderedStations: Station[];
  stationsDueForReview: Station[];
  currentStation: Station | null;
  selectedStation: Station | null;
  journeyProgress: { current: number; total: number; percent: number };
  stats: ReturnType<typeof calculateRoomStats>;
  
  // Mode Actions
  setMode: (mode: RoomMode) => void;
  enterEditMode: () => void;
  enterViewMode: () => void;
  enterOrderMode: () => void;
  
  // Selection Actions
  selectStation: (id: string | null) => void;
  selectSlot: (slotId: string) => void;
  clearSelection: () => void;
  
  // Station CRUD
  addStation: (data: Omit<CreateStation, 'roomId'>) => void;
  updateStation: (id: string, data: Partial<Station>) => void;
  deleteStation: (id: string) => void;
  
  // Journey Order
  moveStationUp: (stationId: string) => void;
  moveStationDown: (stationId: string) => void;
  
  // Journey Mode
  startJourney: () => void;
  revealContent: () => void;
  rateRecall: (status: RecallStatus) => void;
  endJourney: () => void;
  restartJourney: () => void;
  getJourneyResult: () => JourneyResult | null;
  
  // Modal Actions
  openAddModal: () => void;
  closeModals: () => void;
  toggleOrderPanel: () => void;
  
  // Data Loading
  loadRoom: (room: Room, stations: Station[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function useLociRoom(options: UseLociRoomOptions = {}): UseLociRoomReturn {
  const { room, stations } = options;

  // Initialize reducer
  const [state, dispatch] = useReducer(
    lociRoomReducer,
    createInitialLociRoomState(room, stations)
  );

  // ==========================================================================
  // DERIVED VALUES (Memoized)
  // ==========================================================================

  /**
   * Get slots for current template
   */
  const slots = useMemo((): Slot[] => {
    if (!state.room) return [];
    return getTemplateSlots(state.room.templateId);
  }, [state.room]);

  /**
   * Map of slotId -> Station for quick lookup
   */
  const stationMap = useMemo((): Map<string, Station> => {
    return stationsBySlot(state.stations);
  }, [state.stations]);

  /**
   * Stations sorted by journey order
   */
  const orderedStations = useMemo((): Station[] => {
    if (!state.room) return state.stations;
    return sortStationsByJourneyOrder(state.stations, state.room.journeyOrder);
  }, [state.stations, state.room]);

  /**
   * Stations that need review (spaced repetition)
   */
  const stationsDueForReview = useMemo((): Station[] => {
    return state.stations.filter(s => 
      needsReview(s.lastReviewedAt, s.recallStatus)
    );
  }, [state.stations]);

  /**
   * Currently active station in journey mode
   */
  const currentStation = useMemo((): Station | null => {
    if (!state.room || !state.journey.isActive) return null;
    const currentId = state.room.journeyOrder[state.journey.currentIndex];
    if (!currentId) return null;
    return state.stations.find(s => s.id === currentId) ?? null;
  }, [state.room, state.journey, state.stations]);

  /**
   * Selected station for viewing/editing
   */
  const selectedStation = useMemo((): Station | null => {
    if (!state.selectedStationId) return null;
    return state.stations.find(s => s.id === state.selectedStationId) ?? null;
  }, [state.selectedStationId, state.stations]);

  /**
   * Journey progress
   */
  const journeyProgress = useMemo(() => {
    if (!state.room) {
      return { current: 0, total: 0, percent: 0 };
    }
    const total = state.room.journeyOrder.length;
    const current = state.journey.currentIndex + (state.journey.isActive ? 1 : 0);
    const percent = total > 0 ? Math.round((current / total) * 100) : 0;
    return { current, total, percent };
  }, [state.room, state.journey]);

  /**
   * Room statistics
   */
  const stats = useMemo(() => {
    return calculateRoomStats(state.stations);
  }, [state.stations]);

  // ==========================================================================
  // MODE ACTIONS
  // ==========================================================================

  const setMode = useCallback((mode: RoomMode) => {
    dispatch(lociRoomActions.setMode(mode));
  }, []);

  const enterEditMode = useCallback(() => {
    dispatch(lociRoomActions.setMode('edit'));
  }, []);

  const enterViewMode = useCallback(() => {
    dispatch(lociRoomActions.setMode('view'));
  }, []);

  const enterOrderMode = useCallback(() => {
    dispatch(lociRoomActions.setMode('order'));
  }, []);

  // ==========================================================================
  // SELECTION ACTIONS
  // ==========================================================================

  const selectStation = useCallback((id: string | null) => {
    dispatch(lociRoomActions.selectStation(id));
  }, []);

  const selectSlot = useCallback((slotId: string) => {
    dispatch(lociRoomActions.selectSlot(slotId));
  }, []);

  const clearSelection = useCallback(() => {
    dispatch(lociRoomActions.closeAllModals());
  }, []);

  // ==========================================================================
  // STATION CRUD
  // ==========================================================================

  const addStation = useCallback((data: Omit<CreateStation, 'roomId'>) => {
    if (!state.room || !state.selectedSlotId) return;

    const newStation = createStation({
      ...data,
      roomId: state.room.id,
      slotId: state.selectedSlotId,
    });

    dispatch(lociRoomActions.addStation(newStation));
  }, [state.room, state.selectedSlotId]);

  const updateStation = useCallback((id: string, data: Partial<Station>) => {
    dispatch(lociRoomActions.updateStation({ id, ...data }));
  }, []);

  const deleteStation = useCallback((id: string) => {
    dispatch(lociRoomActions.deleteStation(id));
  }, []);

  // ==========================================================================
  // JOURNEY ORDER
  // ==========================================================================

  const moveStationUp = useCallback((stationId: string) => {
    dispatch(lociRoomActions.moveInOrder(stationId, 'up'));
  }, []);

  const moveStationDown = useCallback((stationId: string) => {
    dispatch(lociRoomActions.moveInOrder(stationId, 'down'));
  }, []);

  // ==========================================================================
  // JOURNEY MODE
  // ==========================================================================

  const startJourney = useCallback(() => {
    dispatch(lociRoomActions.startJourney());
  }, []);

  const revealContent = useCallback(() => {
    dispatch(lociRoomActions.revealContent());
  }, []);

  const rateRecall = useCallback((status: RecallStatus) => {
    dispatch(lociRoomActions.rateRecall(status));
  }, []);

  const endJourney = useCallback(() => {
    dispatch(lociRoomActions.endJourney());
  }, []);

  const restartJourney = useCallback(() => {
    dispatch(lociRoomActions.resetJourney());
  }, []);

  /**
   * Get journey result for results modal
   */
  const getJourneyResult = useCallback((): JourneyResult | null => {
    if (!state.room || state.journey.results.length === 0) return null;

    const { total, breakdown, isPerfect } = calculateJourneyXp(state.journey.results);

    return {
      roomId: state.room.id,
      completedAt: new Date().toISOString(),
      attempts: state.journey.results,
      xpEarned: total,
      stats: {
        mastered: breakdown.mastered,
        almost: breakdown.almost,
        needsPractice: breakdown.needs_practice,
        total: state.journey.results.length,
      },
    };
  }, [state.room, state.journey.results]);

  // ==========================================================================
  // MODAL ACTIONS
  // ==========================================================================

  const openAddModal = useCallback(() => {
    dispatch(lociRoomActions.openAddModal());
  }, []);

  const closeModals = useCallback(() => {
    dispatch(lociRoomActions.closeAllModals());
  }, []);

  const toggleOrderPanel = useCallback(() => {
    dispatch(lociRoomActions.toggleOrderPanel());
  }, []);

  // ==========================================================================
  // DATA LOADING
  // ==========================================================================

  const loadRoom = useCallback((newRoom: Room, newStations: Station[]) => {
    dispatch(lociRoomActions.setRoom(newRoom));
    dispatch(lociRoomActions.setStations(newStations));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch(lociRoomActions.setLoading(loading));
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch(lociRoomActions.setError(error));
  }, []);

  // ==========================================================================
  // RETURN
  // ==========================================================================

  return {
    // State
    state,
    
    // Derived Values
    slots,
    stationMap,
    orderedStations,
    stationsDueForReview,
    currentStation,
    selectedStation,
    journeyProgress,
    stats,
    
    // Mode Actions
    setMode,
    enterEditMode,
    enterViewMode,
    enterOrderMode,
    
    // Selection Actions
    selectStation,
    selectSlot,
    clearSelection,
    
    // Station CRUD
    addStation,
    updateStation,
    deleteStation,
    
    // Journey Order
    moveStationUp,
    moveStationDown,
    
    // Journey Mode
    startJourney,
    revealContent,
    rateRecall,
    endJourney,
    restartJourney,
    getJourneyResult,
    
    // Modal Actions
    openAddModal,
    closeModals,
    toggleOrderPanel,
    
    // Data Loading
    loadRoom,
    setLoading,
    setError,
  };
}

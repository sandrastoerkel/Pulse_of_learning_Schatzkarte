/**
 * Utility Functions
 * 
 * Hilfsfunktionen für ID-Generierung, Datum-Handling, Validierung etc.
 */

import type { 
  Station, 
  Room, 
  Chamber, 
  CreateStation, 
  CreateRoom, 
  CreateChamber,
  RoomStats,
  RecallStatus,
} from '../types';
import { needsReview } from '../constants/theme';

// =============================================================================
// ID GENERATION
// =============================================================================

/**
 * Generiert eine eindeutige ID
 * Format: prefix_timestamp_random
 */
export function generateId(prefix: string = 'id'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Generiert Station-ID
 */
export function generateStationId(): string {
  return generateId('sta');
}

/**
 * Generiert Room-ID
 */
export function generateRoomId(): string {
  return generateId('room');
}

/**
 * Generiert Chamber-ID
 */
export function generateChamberId(): string {
  return generateId('chm');
}

// =============================================================================
// DATE UTILITIES
// =============================================================================

/**
 * Gibt aktuelles ISO-Datum zurück
 */
export function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Formatiert Datum für Anzeige
 */
export function formatDate(isoDate: string, locale: string = 'de-DE'): string {
  return new Date(isoDate).toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Formatiert Datum relativ (z.B. "vor 2 Tagen")
 */
export function formatRelativeDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Heute';
  if (diffDays === 1) return 'Gestern';
  if (diffDays < 7) return `Vor ${diffDays} Tagen`;
  if (diffDays < 30) return `Vor ${Math.floor(diffDays / 7)} Wochen`;
  return formatDate(isoDate);
}

/**
 * Berechnet Tage seit einem Datum
 */
export function daysSince(isoDate: string): number {
  const date = new Date(isoDate);
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

// =============================================================================
// ENTITY FACTORIES
// =============================================================================

/**
 * Erstellt eine neue Station mit Standardwerten
 */
export function createStation(data: CreateStation): Station {
  const now = nowISO();
  return {
    id: generateStationId(),
    roomId: data.roomId,
    slotId: data.slotId,
    artifactType: data.artifactType,
    icon: data.icon,
    title: data.title,
    content: data.content,
    hint: data.hint,
    quizId: data.quizId,
    recallStatus: null,
    reviewCount: 0,
    lastReviewedAt: null,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Erstellt einen neuen Raum mit Standardwerten
 */
export function createRoom(data: CreateRoom): Room {
  const now = nowISO();
  return {
    id: generateRoomId(),
    chamberId: data.chamberId,
    name: data.name,
    description: data.description,
    templateId: data.templateId,
    journeyOrder: [],
    sortOrder: 0,
    subject: data.subject,
    colorTag: data.colorTag,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Erstellt eine neue Chamber mit Standardwerten
 */
export function createChamber(data: CreateChamber): Chamber {
  const now = nowISO();
  return {
    id: generateChamberId(),
    userId: data.userId,
    name: data.name,
    totalXp: 0,
    createdAt: now,
    updatedAt: now,
  };
}

// =============================================================================
// STATISTICS
// =============================================================================

/**
 * Berechnet Statistiken für einen Raum
 */
export function calculateRoomStats(stations: Station[]): RoomStats {
  const totalStations = stations.length;
  
  if (totalStations === 0) {
    return {
      totalStations: 0,
      masteredStations: 0,
      dueForReview: 0,
      lastJourneyAt: null,
      averageRecallRate: 0,
    };
  }

  const masteredStations = stations.filter(s => s.recallStatus === 'mastered').length;
  const dueForReview = stations.filter(s => 
    needsReview(s.lastReviewedAt, s.recallStatus)
  ).length;

  // Letztes Review über alle Stationen
  const reviewDates = stations
    .filter(s => s.lastReviewedAt)
    .map(s => new Date(s.lastReviewedAt!).getTime());
  const lastJourneyAt = reviewDates.length > 0 
    ? new Date(Math.max(...reviewDates)).toISOString()
    : null;

  // Durchschnittliche Erfolgsrate
  const stationsWithStatus = stations.filter(s => s.recallStatus);
  let averageRecallRate = 0;
  if (stationsWithStatus.length > 0) {
    const scores: number[] = stationsWithStatus.map(s => {
      switch (s.recallStatus) {
        case 'mastered': return 1;
        case 'almost': return 0.5;
        case 'needs_practice': return 0;
        default: return 0;
      }
    });
    averageRecallRate = scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  return {
    totalStations,
    masteredStations,
    dueForReview,
    lastJourneyAt,
    averageRecallRate,
  };
}

/**
 * Berechnet Erfolgsrate aus Recall-Status
 */
export function calculateSuccessRate(
  results: { status: RecallStatus }[]
): number {
  if (results.length === 0) return 0;
  
  const scores: number[] = results.map(r => {
    switch (r.status) {
      case 'mastered': return 1;
      case 'almost': return 0.5;
      case 'needs_practice': return 0;
      default: return 0;
    }
  });
  
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

// =============================================================================
// SORTING & FILTERING
// =============================================================================

/**
 * Sortiert Stationen nach Journey-Order
 */
export function sortStationsByJourneyOrder(
  stations: Station[],
  journeyOrder: string[]
): Station[] {
  const orderMap = new Map(journeyOrder.map((id, index) => [id, index]));
  
  return [...stations].sort((a, b) => {
    const orderA = orderMap.get(a.id) ?? Infinity;
    const orderB = orderMap.get(b.id) ?? Infinity;
    return orderA - orderB;
  });
}

/**
 * Filtert Stationen, die wiederholt werden sollten
 */
export function getStationsDueForReview(stations: Station[]): Station[] {
  return stations.filter(s => needsReview(s.lastReviewedAt, s.recallStatus));
}

/**
 * Sortiert Räume nach sortOrder
 */
export function sortRoomsBySortOrder(rooms: Room[]): Room[] {
  return [...rooms].sort((a, b) => a.sortOrder - b.sortOrder);
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validiert Station-Daten
 */
export function validateStation(data: Partial<CreateStation>): string[] {
  const errors: string[] = [];

  if (!data.title?.trim()) {
    errors.push('Titel ist erforderlich');
  }
  if (!data.content?.trim()) {
    errors.push('Inhalt ist erforderlich');
  }
  if (!data.slotId) {
    errors.push('Slot muss ausgewählt sein');
  }
  if (!data.artifactType) {
    errors.push('Artefakt-Typ muss ausgewählt sein');
  }

  return errors;
}

/**
 * Validiert Room-Daten
 */
export function validateRoom(data: Partial<CreateRoom>): string[] {
  const errors: string[] = [];

  if (!data.name?.trim()) {
    errors.push('Name ist erforderlich');
  }
  if (!data.templateId) {
    errors.push('Template muss ausgewählt sein');
  }

  return errors;
}

// =============================================================================
// MISC UTILITIES
// =============================================================================

/**
 * Kürzt Text auf maximale Länge
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Erstellt eine Map von Stationen nach Slot-ID
 */
export function stationsBySlot(stations: Station[]): Map<string, Station> {
  return new Map(stations.map(s => [s.slotId, s]));
}

/**
 * Findet freie Slots in einem Raum
 */
export function findFreeSlots(
  allSlotIds: string[],
  occupiedSlotIds: string[]
): string[] {
  const occupied = new Set(occupiedSlotIds);
  return allSlotIds.filter(id => !occupied.has(id));
}

/**
 * Clamp-Funktion
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

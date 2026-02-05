/**
 * useSpacedRepetition Hook
 * 
 * Logik für Spaced Repetition und Review-Erinnerungen.
 * Kann unabhängig von den Haupt-State-Hooks verwendet werden.
 */

import { useMemo, useCallback } from 'react';
import type { Station, RecallStatus } from '../types';
import { 
  needsReview, 
  REVIEW_INTERVALS, 
  REVIEW_THRESHOLD_DAYS 
} from '../constants';
import { daysSince, formatRelativeDate } from '../utils';

// =============================================================================
// TYPES
// =============================================================================

export interface ReviewInfo {
  /** Station braucht Review */
  needsReview: boolean;
  /** Tage seit letztem Review */
  daysSinceReview: number | null;
  /** Tage bis zum nächsten empfohlenen Review */
  daysUntilReview: number | null;
  /** Menschenlesbarer Status */
  statusText: string;
  /** Priorität (höher = dringender) */
  priority: number;
}

export interface SpacedRepetitionStats {
  /** Anzahl Stationen, die Review brauchen */
  dueCount: number;
  /** Stationen, die bald Review brauchen (nächste 3 Tage) */
  upcomingCount: number;
  /** Stationen, die kürzlich gelernt wurden */
  recentlyReviewedCount: number;
  /** Durchschnittliche Tage seit letztem Review */
  averageDaysSinceReview: number;
  /** Längste Zeit ohne Review */
  longestWithoutReview: number;
}

export interface UseSpacedRepetitionReturn {
  /** Review-Info für eine einzelne Station */
  getReviewInfo: (station: Station) => ReviewInfo;
  
  /** Alle Stationen, die Review brauchen */
  stationsDue: Station[];
  
  /** Stationen sortiert nach Review-Priorität */
  stationsByPriority: Station[];
  
  /** Aggregierte Statistiken */
  stats: SpacedRepetitionStats;
  
  /** Optimale Review-Reihenfolge für einen Rundgang */
  getOptimalJourneyOrder: () => string[];
  
  /** Prüft ob mindestens eine Station Review braucht */
  hasStationsDue: boolean;
  
  /** Nächster empfohlener Review-Zeitpunkt */
  nextReviewDate: Date | null;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Berechnet Review-Priorität für eine Station
 * Höhere Werte = dringender
 */
function calculatePriority(station: Station): number {
  // Nie geübt = niedrige Priorität (neue Station)
  if (!station.lastReviewedAt) {
    return 0;
  }

  const days = daysSince(station.lastReviewedAt);
  
  // Basis-Priorität nach Status
  let basePriority = 0;
  switch (station.recallStatus) {
    case 'needs_practice':
      basePriority = 100; // Höchste Priorität
      break;
    case 'almost':
      basePriority = 50;
      break;
    case 'mastered':
      basePriority = 10;
      break;
    default:
      basePriority = 25;
  }

  // Multiplikator basierend auf Tagen überfällig
  const interval = station.recallStatus 
    ? REVIEW_INTERVALS[station.recallStatus] 
    : REVIEW_THRESHOLD_DAYS;
  
  const daysOverdue = Math.max(0, days - interval);
  const overdueMultiplier = 1 + (daysOverdue * 0.2);

  return basePriority * overdueMultiplier;
}

/**
 * Generiert Status-Text für eine Station
 */
function getStatusText(station: Station): string {
  if (!station.lastReviewedAt) {
    return 'Noch nicht geübt';
  }

  const days = daysSince(station.lastReviewedAt);

  if (station.recallStatus === 'mastered') {
    return days === 0 ? 'Heute gemeistert' : `Gemeistert (${formatRelativeDate(station.lastReviewedAt)})`;
  }

  if (needsReview(station.lastReviewedAt, station.recallStatus)) {
    if (days === 1) return 'Wiederholung fällig (gestern geübt)';
    return `Wiederholung fällig (vor ${days} Tagen)`;
  }

  const interval = station.recallStatus 
    ? REVIEW_INTERVALS[station.recallStatus] 
    : REVIEW_THRESHOLD_DAYS;
  const daysRemaining = interval - days;

  if (daysRemaining <= 1) {
    return 'Bald wiederholen';
  }

  return `Nächste Wiederholung in ${daysRemaining} Tagen`;
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function useSpacedRepetition(stations: Station[]): UseSpacedRepetitionReturn {
  
  /**
   * Get detailed review info for a single station
   */
  const getReviewInfo = useCallback((station: Station): ReviewInfo => {
    const needsRev = needsReview(station.lastReviewedAt, station.recallStatus);
    
    let daysSinceReview: number | null = null;
    let daysUntilReview: number | null = null;

    if (station.lastReviewedAt) {
      daysSinceReview = daysSince(station.lastReviewedAt);
      
      const interval = station.recallStatus 
        ? REVIEW_INTERVALS[station.recallStatus] 
        : REVIEW_THRESHOLD_DAYS;
      
      daysUntilReview = Math.max(0, interval - daysSinceReview);
    }

    return {
      needsReview: needsRev,
      daysSinceReview,
      daysUntilReview,
      statusText: getStatusText(station),
      priority: calculatePriority(station),
    };
  }, []);

  /**
   * Stations that need review
   */
  const stationsDue = useMemo((): Station[] => {
    return stations.filter(s => needsReview(s.lastReviewedAt, s.recallStatus));
  }, [stations]);

  /**
   * All stations sorted by review priority (most urgent first)
   */
  const stationsByPriority = useMemo((): Station[] => {
    return [...stations]
      .filter(s => s.lastReviewedAt) // Only stations that have been reviewed
      .sort((a, b) => calculatePriority(b) - calculatePriority(a));
  }, [stations]);

  /**
   * Aggregated statistics
   */
  const stats = useMemo((): SpacedRepetitionStats => {
    const reviewedStations = stations.filter(s => s.lastReviewedAt);
    
    if (reviewedStations.length === 0) {
      return {
        dueCount: 0,
        upcomingCount: 0,
        recentlyReviewedCount: 0,
        averageDaysSinceReview: 0,
        longestWithoutReview: 0,
      };
    }

    const daysArray = reviewedStations.map(s => daysSince(s.lastReviewedAt!));
    
    return {
      dueCount: stationsDue.length,
      upcomingCount: reviewedStations.filter(s => {
        const days = daysSince(s.lastReviewedAt!);
        const interval = s.recallStatus 
          ? REVIEW_INTERVALS[s.recallStatus] 
          : REVIEW_THRESHOLD_DAYS;
        const remaining = interval - days;
        return remaining > 0 && remaining <= 3;
      }).length,
      recentlyReviewedCount: reviewedStations.filter(s => 
        daysSince(s.lastReviewedAt!) <= 1
      ).length,
      averageDaysSinceReview: daysArray.reduce((a, b) => a + b, 0) / daysArray.length,
      longestWithoutReview: Math.max(...daysArray),
    };
  }, [stations, stationsDue]);

  /**
   * Get optimal journey order based on spaced repetition
   * Prioritizes stations that need review, then fills with others
   */
  const getOptimalJourneyOrder = useCallback((): string[] => {
    // First: stations due for review, sorted by priority
    const dueIds = stationsByPriority
      .filter(s => needsReview(s.lastReviewedAt, s.recallStatus))
      .map(s => s.id);

    // Then: recently reviewed stations (to maintain memory)
    const recentIds = stationsByPriority
      .filter(s => !needsReview(s.lastReviewedAt, s.recallStatus))
      .map(s => s.id);

    // Finally: new stations (never reviewed)
    const newIds = stations
      .filter(s => !s.lastReviewedAt)
      .map(s => s.id);

    return [...dueIds, ...recentIds, ...newIds];
  }, [stations, stationsByPriority]);

  /**
   * Check if any stations need review
   */
  const hasStationsDue = useMemo(() => stationsDue.length > 0, [stationsDue]);

  /**
   * Next recommended review date
   */
  const nextReviewDate = useMemo((): Date | null => {
    if (stationsDue.length > 0) {
      return new Date(); // Now, if there are due stations
    }

    // Find the next station that will be due
    const reviewedStations = stations.filter(s => s.lastReviewedAt && s.recallStatus !== 'mastered');
    
    if (reviewedStations.length === 0) return null;

    let earliestDate: Date | null = null;

    for (const station of reviewedStations) {
      const interval = station.recallStatus 
        ? REVIEW_INTERVALS[station.recallStatus] 
        : REVIEW_THRESHOLD_DAYS;
      
      const lastReview = new Date(station.lastReviewedAt!);
      const nextReview = new Date(lastReview.getTime() + interval * 24 * 60 * 60 * 1000);

      if (!earliestDate || nextReview < earliestDate) {
        earliestDate = nextReview;
      }
    }

    return earliestDate;
  }, [stations, stationsDue]);

  // ==========================================================================
  // RETURN
  // ==========================================================================

  return {
    getReviewInfo,
    stationsDue,
    stationsByPriority,
    stats,
    getOptimalJourneyOrder,
    hasStationsDue,
    nextReviewDate,
  };
}

// hooks/useMeeting.ts
// React Hook für Meeting-Zugriff und Verwaltung
// Integriert mit Streamlit-Backend über Props

import { useState, useCallback, useEffect } from 'react';

export interface Meeting {
  id: number;
  groupId: number;
  title: string;
  scheduledStart: string;
  scheduledEnd: string;
  dayOfWeek: number;
  timeOfDay: string;
  durationMinutes: number;
  recurrence: 'einmalig' | 'woechentlich';
  roomName: string;
  status: 'geplant' | 'aktiv' | 'beendet' | 'abgesagt';
}

export interface TimeStatus {
  reason: 'too_early' | 'active' | 'ended';
  minutesUntilStart?: number;
  minutesSinceEnd?: number;
}

export interface JitsiConfig {
  startWithAudioMuted: boolean;
  startWithVideoMuted: boolean;
  disableDeepLinking: boolean;
  prejoinPageEnabled: boolean;
  enableWelcomePage: boolean;
  disableModeratorIndicator: boolean;
  enableClosePage: boolean;
  toolbarButtons: string[];
}

export interface JitsiInterfaceConfig {
  TOOLBAR_BUTTONS: string[];
  SETTINGS_SECTIONS: string[];
  SHOW_JITSI_WATERMARK: boolean;
  SHOW_WATERMARK_FOR_GUESTS: boolean;
  SHOW_BRAND_WATERMARK: boolean;
  DEFAULT_BACKGROUND: string;
  DISABLE_JOIN_LEAVE_NOTIFICATIONS: boolean;
  MOBILE_APP_PROMO: boolean;
  HIDE_INVITE_MORE_HEADER: boolean;
}

export interface MeetingAccess {
  canJoin: boolean;
  reason?: string;
  meeting?: Meeting;
  roomName?: string;
  displayName: string;
  userRole: 'coach' | 'kind';
  timeStatus?: TimeStatus;
  config?: JitsiConfig;
  interfaceConfig?: JitsiInterfaceConfig;
}

export interface UseMeetingProps {
  meetingData?: Meeting | null;
  accessData?: MeetingAccess | null;
  onAction?: (action: MeetingAction) => void;
}

export interface MeetingAction {
  type: 'meeting_join' | 'meeting_leave' | 'meeting_refresh';
  meetingId?: number;
  timestamp?: string;
}

export interface UseMeetingReturn {
  meeting: Meeting | null;
  access: MeetingAccess | null;
  loading: boolean;
  error: string | null;
  refreshAccess: () => void;
  recordJoin: () => void;
  recordLeave: () => void;
}

/**
 * Hook für Meeting-Zugriff und Verwaltung
 * Verwendet Streamlit-Props für Datenaustausch
 */
export function useMeeting(
  lerngruppeId: number,
  props?: UseMeetingProps
): UseMeetingReturn {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [access, setAccess] = useState<MeetingAccess | null>(null);

  // Daten von Streamlit-Props übernehmen
  useEffect(() => {
    if (props?.meetingData !== undefined) {
      setMeeting(props.meetingData);
      setLoading(false);
    }
    if (props?.accessData !== undefined) {
      setAccess(props.accessData);
      setLoading(false);
    }
  }, [props?.meetingData, props?.accessData]);

  // Zugriff aktualisieren
  const refreshAccess = useCallback(() => {
    if (props?.onAction) {
      props.onAction({
        type: 'meeting_refresh',
        timestamp: new Date().toISOString()
      });
    }
  }, [props?.onAction]);

  // Meeting beitreten
  const recordJoin = useCallback(() => {
    if (props?.onAction && meeting?.id) {
      props.onAction({
        type: 'meeting_join',
        meetingId: meeting.id,
        timestamp: new Date().toISOString()
      });
    }
  }, [props?.onAction, meeting?.id]);

  // Meeting verlassen
  const recordLeave = useCallback(() => {
    if (props?.onAction && meeting?.id) {
      props.onAction({
        type: 'meeting_leave',
        meetingId: meeting.id,
        timestamp: new Date().toISOString()
      });
    }
  }, [props?.onAction, meeting?.id]);

  return {
    meeting,
    access,
    loading,
    error,
    refreshAccess,
    recordJoin,
    recordLeave
  };
}

// Default export für einfachen Import
export default useMeeting;

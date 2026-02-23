// components/VideoChat/FloatingJitsiWidget.tsx
// Floating Jitsi Video-Widget for the Schatzkarte
// Keeps video in the same tab so iPad Safari doesn't pause audio

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { SchatzkartAction } from '../../types';
import './floating-jitsi-widget.css';

export interface MeetingData {
  canJoin: boolean;
  roomName: string | null;
  config: Record<string, any>;
  interfaceConfig: Record<string, any>;
  displayName: string;
  meetingId: string;
  meetingTitle?: string;
  timeStatus: {
    reason?: string;
    message?: string;
    minutesUntilStart?: number;
    minutesRemaining?: number;
    canJoin?: boolean;
  };
  userRole: 'coach' | 'kind';
}

type WidgetState = 'join-button' | 'small' | 'large' | 'minimized' | 'waiting';

interface FloatingJitsiWidgetProps {
  meetingData: MeetingData;
  onAction?: (action: SchatzkartAction) => void;
}

const FloatingJitsiWidget: React.FC<FloatingJitsiWidgetProps> = ({
  meetingData,
  onAction
}) => {
  const apiRef = useRef<any>(null);
  const [widgetState, setWidgetState] = useState<WidgetState>(() => {
    if (!meetingData.canJoin && meetingData.timeStatus?.reason === 'too_early') {
      const mins = meetingData.timeStatus.minutesUntilStart ?? 999;
      return mins <= 30 ? 'waiting' : 'join-button';
    }
    return 'join-button';
  });
  const [jitsiLoaded, setJitsiLoaded] = useState(false);
  const [minutesUntil, setMinutesUntil] = useState(
    meetingData.timeStatus?.minutesUntilStart ?? 0
  );

  // Update waiting countdown
  useEffect(() => {
    if (widgetState !== 'waiting') return;

    const interval = setInterval(() => {
      setMinutesUntil(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setWidgetState('join-button');
          return 0;
        }
        return prev - 1;
      });
    }, 60_000);

    return () => clearInterval(interval);
  }, [widgetState]);

  // Join the meeting (switch to small view)
  const handleJoin = useCallback(() => {
    setWidgetState('small');
  }, []);

  // Open in a new tab
  const handleOpenInNewTab = useCallback(() => {
    if (meetingData.roomName) {
      window.open(
        `https://meet.jit.si/${meetingData.roomName}`,
        '_blank',
        'noopener,noreferrer'
      );
    }
  }, [meetingData.roomName]);

  // Toggle between small and large
  const handleToggleSize = useCallback(() => {
    setWidgetState(prev => (prev === 'small' ? 'large' : 'small'));
  }, []);

  // Minimize
  const handleMinimize = useCallback(() => {
    setWidgetState('minimized');
  }, []);

  // Restore from minimized
  const handleRestore = useCallback(() => {
    setWidgetState('small');
  }, []);

  // Leave the meeting
  const handleLeave = useCallback(() => {
    if (apiRef.current) {
      try {
        apiRef.current.executeCommand('hangup');
      } catch {
        // ignore
      }
    }
    setJitsiLoaded(false);
    setWidgetState('join-button');

    if (onAction) {
      onAction({
        action: 'meeting_leave',
        meetingId: meetingData.meetingId,
        islandId: 'jitsi_meeting'
      });
    }
  }, [meetingData.meetingId, onAction]);

  // Jitsi API ready handler
  const handleApiReady = useCallback((externalApi: any) => {
    apiRef.current = externalApi;
    setJitsiLoaded(true);

    externalApi.addListener('videoConferenceJoined', () => {
      if (onAction) {
        onAction({
          action: 'meeting_join',
          meetingId: meetingData.meetingId,
          islandId: 'jitsi_meeting'
        });
      }
    });

    externalApi.addListener('videoConferenceLeft', () => {
      setJitsiLoaded(false);
      setWidgetState('join-button');
      if (onAction) {
        onAction({
          action: 'meeting_leave',
          meetingId: meetingData.meetingId
        });
      }
    });
  }, [meetingData.meetingId, onAction]);

  // Don't render if no meeting or ended
  if (!meetingData.roomName || meetingData.timeStatus?.reason === 'ended' || meetingData.timeStatus?.reason === 'no_meeting') {
    return null;
  }

  // === WAITING STATE ===
  if (widgetState === 'waiting') {
    return (
      <div className="fjw fjw--waiting">
        <span className="fjw__waiting-icon">&#9203;</span>
        <span className="fjw__waiting-text">
          Treffen in {minutesUntil} Min
        </span>
      </div>
    );
  }

  // === JOIN BUTTON STATE ===
  if (widgetState === 'join-button') {
    if (!meetingData.canJoin && meetingData.timeStatus?.reason === 'too_early') {
      const mins = meetingData.timeStatus.minutesUntilStart ?? 0;
      return (
        <div className="fjw fjw--waiting">
          <span className="fjw__waiting-icon">&#9203;</span>
          <span className="fjw__waiting-text">
            Treffen in {mins} Min
          </span>
        </div>
      );
    }

    if (!meetingData.canJoin) return null;

    return (
      <div className="fjw fjw--join-buttons">
        <button className="fjw__join-btn" onClick={handleJoin}>
          <span className="fjw__join-icon">&#128249;</span>
          Video-Treffen beitreten
        </button>
        <button
          className="fjw__newtab-btn"
          onClick={handleOpenInNewTab}
          title="In neuem Tab oeffnen"
        >
          &#8599;
        </button>
      </div>
    );
  }

  // === MINIMIZED STATE ===
  if (widgetState === 'minimized') {
    return (
      <button className="fjw fjw--minimized" onClick={handleRestore}>
        <span className="fjw__min-icon">&#128249;</span>
        <span className="fjw__min-text">Video-Treffen</span>
        <span className="fjw__min-arrow">&#9650;</span>
      </button>
    );
  }

  // === SMALL & LARGE STATES (with Jitsi) ===
  const isLarge = widgetState === 'large';

  return (
    <div className={`fjw fjw--video ${isLarge ? 'fjw--large' : 'fjw--small'}`}>
      {/* Control bar */}
      <div className="fjw__controls">
        <span className="fjw__controls-title">
          {meetingData.meetingTitle || 'Video-Treffen'}
        </span>
        <div className="fjw__controls-buttons">
          <button
            className="fjw__ctrl-btn"
            onClick={handleToggleSize}
            title={isLarge ? 'Verkleinern' : 'Vergroessern'}
          >
            {isLarge ? '\u2199' : '\u2197'}
          </button>
          <button
            className="fjw__ctrl-btn"
            onClick={handleOpenInNewTab}
            title="In neuem Tab oeffnen"
          >
            &#8599;&#xFE0E;
          </button>
          <button
            className="fjw__ctrl-btn"
            onClick={handleMinimize}
            title="Minimieren"
          >
            &#9660;
          </button>
          <button
            className="fjw__ctrl-btn fjw__ctrl-btn--close"
            onClick={handleLeave}
            title="Treffen verlassen"
          >
            &#10005;
          </button>
        </div>
      </div>

      {/* Jitsi iframe */}
      <div className="fjw__jitsi-container">
        <JitsiMeeting
          domain="meet.jit.si"
          roomName={meetingData.roomName!}
          configOverwrite={{
            ...meetingData.config,
            desktopSharingEnabled: true
          }}
          interfaceConfigOverwrite={meetingData.interfaceConfig}
          userInfo={{
            displayName: meetingData.displayName,
            email: ''
          }}
          onApiReady={handleApiReady}
          onReadyToClose={handleLeave}
          getIFrameRef={(iframeRef) => {
            iframeRef.style.height = '100%';
            iframeRef.style.width = '100%';
            iframeRef.style.border = 'none';
            iframeRef.style.borderRadius = '0 0 12px 12px';
          }}
          spinner={() => (
            <div className="fjw__loading">
              <span className="fjw__loading-icon">&#128249;</span>
              <p>Lade Video-Treffen...</p>
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default FloatingJitsiWidget;

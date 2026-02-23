// components/VideoChat/FloatingJitsiWidget.tsx
// Floating Jitsi Video-Widget for the Schatzkarte
// Uses JaaS (8x8.vc) with JWT authentication
// Loads external_api.js directly from 8x8.vc to avoid SDK caching issues

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  jwt?: string | null;
  appId?: string;
}

type WidgetState = 'join-button' | 'small' | 'large' | 'minimized' | 'waiting';

interface FloatingJitsiWidgetProps {
  meetingData: MeetingData;
  onAction?: (action: SchatzkartAction) => void;
}

// Load 8x8.vc external API (bypasses @jitsi/react-sdk caching)
let jaasApiPromise: Promise<any> | null = null;
function loadJaaSApi(appId: string): Promise<any> {
  if (jaasApiPromise) return jaasApiPromise;

  jaasApiPromise = new Promise((resolve, reject) => {
    // Remove any cached meet.jit.si API
    if ((window as any).JitsiMeetExternalAPI) {
      delete (window as any).JitsiMeetExternalAPI;
    }
    // Remove old scripts
    document.querySelectorAll('script[src*="external_api.js"]').forEach(s => s.remove());

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://8x8.vc/${appId}/external_api.js`;
    script.onload = () => {
      if ((window as any).JitsiMeetExternalAPI) {
        resolve((window as any).JitsiMeetExternalAPI);
      } else {
        reject(new Error('JitsiMeetExternalAPI not found after loading script'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load 8x8.vc external_api.js'));
    document.head.appendChild(script);
  });

  return jaasApiPromise;
}

const FloatingJitsiWidget: React.FC<FloatingJitsiWidgetProps> = ({
  meetingData,
  onAction
}) => {
  const apiRef = useRef<any>(null);
  const hasJoinedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
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

  // Load Jitsi when widget enters video state
  useEffect(() => {
    if (widgetState !== 'small' && widgetState !== 'large') return;
    if (apiRef.current) return; // Already loaded
    if (!meetingData.appId || !meetingData.roomName) return;

    const fullRoomName = `${meetingData.appId}/${meetingData.roomName}`;

    loadJaaSApi(meetingData.appId)
      .then((JitsiMeetExternalAPI) => {
        if (!containerRef.current) return;

        const api = new JitsiMeetExternalAPI('8x8.vc', {
          roomName: fullRoomName,
          jwt: meetingData.jwt || undefined,
          configOverwrite: {
            ...meetingData.config,
            desktopSharingEnabled: true
          },
          interfaceConfigOverwrite: meetingData.interfaceConfig,
          userInfo: {
            displayName: meetingData.displayName,
            email: ''
          },
          parentNode: containerRef.current
        });

        apiRef.current = api;
        setJitsiLoaded(true);
        hasJoinedRef.current = false;

        // Style the iframe
        const iframe = containerRef.current?.querySelector('iframe');
        if (iframe) {
          iframe.style.height = '100%';
          iframe.style.width = '100%';
          iframe.style.border = 'none';
          iframe.style.borderRadius = '0 0 12px 12px';
        }

        api.addListener('videoConferenceJoined', () => {
          hasJoinedRef.current = true;
          // Style iframe again after join (it may have been recreated)
          const iframe = containerRef.current?.querySelector('iframe');
          if (iframe) {
            iframe.style.height = '100%';
            iframe.style.width = '100%';
            iframe.style.border = 'none';
            iframe.style.borderRadius = '0 0 12px 12px';
          }
          if (onAction) {
            onAction({
              action: 'meeting_join',
              meetingId: meetingData.meetingId,
              islandId: 'jitsi_meeting'
            });
          }
        });

        api.addListener('videoConferenceLeft', () => {
          if (!hasJoinedRef.current) return;
          handleLeaveInternal();
        });

        api.addListener('readyToClose', () => {
          if (hasJoinedRef.current) handleLeaveInternal();
        });
      })
      .catch((err) => {
        console.error('[JaaS] Failed to load Jitsi API:', err);
      });

    return () => {
      // Cleanup on unmount
      if (apiRef.current) {
        try { apiRef.current.dispose(); } catch {}
        apiRef.current = null;
      }
    };
  }, [widgetState]);

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

  const handleLeaveInternal = useCallback(() => {
    if (apiRef.current) {
      try { apiRef.current.dispose(); } catch {}
      apiRef.current = null;
    }
    setJitsiLoaded(false);
    setWidgetState('join-button');
    hasJoinedRef.current = false;
    if (onAction) {
      onAction({
        action: 'meeting_leave',
        meetingId: meetingData.meetingId,
        islandId: 'jitsi_meeting'
      });
    }
  }, [meetingData.meetingId, onAction]);

  // Join the meeting (switch to small view)
  const handleJoin = useCallback(() => {
    setWidgetState('small');
  }, []);

  // Open in a new tab
  const handleOpenInNewTab = useCallback(() => {
    if (meetingData.roomName && meetingData.appId) {
      const jwtParam = meetingData.jwt ? `?jwt=${meetingData.jwt}` : '';
      window.open(
        `https://8x8.vc/${meetingData.appId}/${meetingData.roomName}${jwtParam}`,
        '_blank',
        'noopener,noreferrer'
      );
    }
  }, [meetingData.roomName, meetingData.jwt, meetingData.appId]);

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
    handleLeaveInternal();
  }, [handleLeaveInternal]);

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

      {/* Jitsi container */}
      <div className="fjw__jitsi-container" ref={containerRef}>
        {!jitsiLoaded && (
          <div className="fjw__loading">
            <span className="fjw__loading-icon">&#128249;</span>
            <p>Lade Video-Treffen...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingJitsiWidget;

// components/VideoChat/FloatingJitsiWidget.tsx
// Floating Jitsi Video-Widget for the Schatzkarte
// Uses JaaS (8x8.vc) with JWT authentication
// Loads external_api.js directly from 8x8.vc to avoid SDK caching issues
//
// WICHTIG: Jitsi wird einmal geladen und bleibt aktiv (auch minimiert).
// Audio laeuft weiter, damit Kinder den Coach immer hoeren koennen.
// Nur der X-Button beendet die Verbindung.

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

type WidgetView = 'join-button' | 'small' | 'large' | 'minimized' | 'waiting';

interface FloatingJitsiWidgetProps {
  meetingData: MeetingData;
  onAction?: (action: SchatzkartAction) => void;
  forceJoin?: boolean;
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

const SMALL_DEFAULT = { width: 320, height: 280 };
const MIN_SIZE = { width: 240, height: 200 };

const FloatingJitsiWidget: React.FC<FloatingJitsiWidgetProps> = ({
  meetingData,
  onAction,
  forceJoin
}) => {
  const apiRef = useRef<any>(null);
  const hasJoinedRef = useRef(false);
  const isLeavingRef = useRef(false); // Flag: nur true wenn X-Button geklickt
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<WidgetView>(() => {
    if (!meetingData.canJoin && meetingData.timeStatus?.reason === 'too_early') {
      const mins = meetingData.timeStatus.minutesUntilStart ?? 999;
      return mins <= 30 ? 'waiting' : 'join-button';
    }
    return 'join-button';
  });
  // Jitsi ist aktiv wenn wir jemals in einen Video-State gewechselt haben
  const [jitsiActive, setJitsiActive] = useState(false);
  const [jitsiLoaded, setJitsiLoaded] = useState(false);
  const [minutesUntil, setMinutesUntil] = useState(
    meetingData.timeStatus?.minutesUntilStart ?? 0
  );

  // --- Drag & Resize state ---
  const [pos, setPos] = useState({ x: -1, y: -1 }); // -1 = not yet placed
  const [size, setSize] = useState(SMALL_DEFAULT);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; origW: number; origH: number } | null>(null);

  const isVideoView = view === 'small' || view === 'large';

  // Force join from external trigger (Header-Button)
  useEffect(() => {
    if (forceJoin && view === 'join-button' && meetingData.canJoin) {
      setView('small');
      setJitsiActive(true);
    }
  }, [forceJoin]);

  // Place widget at bottom-right on first render into video state
  useEffect(() => {
    if (isVideoView && pos.x === -1) {
      setPos({
        x: window.innerWidth - size.width - 24,
        y: window.innerHeight - size.height - 24
      });
    }
  }, [view]);

  // --- Shared drag/resize move+up listeners ---
  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (dragRef.current) {
        const dx = clientX - dragRef.current.startX;
        const dy = clientY - dragRef.current.startY;
        const newX = Math.max(0, Math.min(window.innerWidth - 100, dragRef.current.origX + dx));
        const newY = Math.max(0, Math.min(window.innerHeight - 40, dragRef.current.origY + dy));
        setPos({ x: newX, y: newY });
      }

      if (resizeRef.current) {
        const dw = clientX - resizeRef.current.startX;
        const dh = clientY - resizeRef.current.startY;
        setSize({
          width: Math.max(MIN_SIZE.width, resizeRef.current.origW + dw),
          height: Math.max(MIN_SIZE.height, resizeRef.current.origH + dh)
        });
      }
    };

    const onUp = () => {
      const wasDragging = dragRef.current !== null || resizeRef.current !== null;
      dragRef.current = null;
      resizeRef.current = null;
      if (wasDragging) setIsDragging(false);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, []);

  // --- Drag handler ---
  const onDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Don't drag when clicking buttons
    if ((e.target as HTMLElement).closest('button')) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragRef.current = { startX: clientX, startY: clientY, origX: pos.x, origY: pos.y };
    setIsDragging(true);
    e.preventDefault();
  }, [pos]);

  // --- Resize handler ---
  const onResizeStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    resizeRef.current = { startX: clientX, startY: clientY, origW: size.width, origH: size.height };
    setIsDragging(true);
    e.preventDefault();
    e.stopPropagation();
  }, [size]);

  // Load Jitsi ONCE when jitsiActive becomes true — never dispose on view changes
  useEffect(() => {
    if (!jitsiActive) return;
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

        // Nur bei echtem Leave (X-Button) reagieren, nicht bei Minimize/Resize
        api.addListener('videoConferenceLeft', () => {
          if (!hasJoinedRef.current) return;
          if (!isLeavingRef.current) return; // Ignorieren wenn nicht explizit verlassen
          doLeaveCleanup();
        });

        api.addListener('readyToClose', () => {
          if (hasJoinedRef.current && isLeavingRef.current) doLeaveCleanup();
        });
      })
      .catch((err) => {
        console.error('[JaaS] Failed to load Jitsi API:', err);
      });

    // Cleanup NUR bei Component-Unmount (nicht bei View-Wechsel!)
    return () => {
      if (apiRef.current) {
        try { apiRef.current.dispose(); } catch {}
        apiRef.current = null;
      }
    };
  }, [jitsiActive]); // Nur von jitsiActive abhaengig, NICHT von view!

  // Update waiting countdown
  useEffect(() => {
    if (view !== 'waiting') return;

    const interval = setInterval(() => {
      setMinutesUntil(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setView('join-button');
          return 0;
        }
        return prev - 1;
      });
    }, 60_000);

    return () => clearInterval(interval);
  }, [view]);

  // Cleanup nach echtem Verlassen
  const doLeaveCleanup = useCallback(() => {
    if (apiRef.current) {
      try { apiRef.current.dispose(); } catch {}
      apiRef.current = null;
    }
    setJitsiLoaded(false);
    setJitsiActive(false);
    setView('join-button');
    hasJoinedRef.current = false;
    isLeavingRef.current = false;
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
    setView('small');
    setJitsiActive(true);
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

  // Toggle between small and large — Jitsi bleibt aktiv!
  const handleToggleSize = useCallback(() => {
    setView(prev => {
      if (prev === 'small') {
        const lw = Math.round(window.innerWidth * 0.8);
        const lh = Math.round(window.innerHeight * 0.8);
        setSize({ width: lw, height: lh });
        setPos({ x: Math.round((window.innerWidth - lw) / 2), y: Math.round((window.innerHeight - lh) / 2) });
        return 'large';
      } else {
        setSize(SMALL_DEFAULT);
        setPos({ x: window.innerWidth - SMALL_DEFAULT.width - 24, y: window.innerHeight - SMALL_DEFAULT.height - 24 });
        return 'small';
      }
    });
  }, []);

  // Minimize — Jitsi bleibt aktiv, Audio laeuft weiter!
  const handleMinimize = useCallback(() => {
    setView('minimized');
  }, []);

  // Restore from minimized
  const handleRestore = useCallback(() => {
    setView('small');
    // Position neu setzen falls noetig
    if (pos.x === -1) {
      setPos({
        x: window.innerWidth - size.width - 24,
        y: window.innerHeight - size.height - 24
      });
    }
  }, [pos, size]);

  // Leave the meeting — NUR hier wird Jitsi wirklich beendet
  const handleLeave = useCallback(() => {
    isLeavingRef.current = true;
    if (apiRef.current) {
      try {
        apiRef.current.executeCommand('hangup');
      } catch {
        // hangup hat nicht geklappt → direkt aufräumen
        doLeaveCleanup();
      }
    } else {
      doLeaveCleanup();
    }
  }, [doLeaveCleanup]);

  // Don't render if no meeting or ended
  if (!meetingData.roomName || meetingData.timeStatus?.reason === 'ended' || meetingData.timeStatus?.reason === 'no_meeting') {
    return null;
  }

  // === WAITING STATE ===
  if (view === 'waiting') {
    return (
      <div className="fjw fjw--waiting">
        <span className="fjw__waiting-icon">&#9203;</span>
        <span className="fjw__waiting-text">
          Treffen in {minutesUntil} Min
        </span>
      </div>
    );
  }

  // === JOIN BUTTON STATE (Video-Start ist jetzt im Header) ===
  if (view === 'join-button') {
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

    // Kein Floating-Button mehr - Video wird ueber Header-Button gestartet
    return null;
  }

  // === MINIMIZED STATE — Jitsi Container bleibt im DOM (versteckt) ===
  if (view === 'minimized') {
    return (
      <>
        {/* Versteckter Jitsi-Container — Audio laeuft weiter! */}
        <div style={{ position: 'fixed', left: -9999, top: -9999, width: 1, height: 1, overflow: 'hidden' }}>
          <div ref={containerRef} style={{ width: 320, height: 280 }} />
        </div>

        {/* Sichtbare Minimiert-Leiste */}
        <button className="fjw fjw--minimized" onClick={handleRestore}>
          <span className="fjw__min-icon">&#128249;</span>
          <span className="fjw__min-text">Video-Treffen</span>
          <span className="fjw__min-arrow">&#9650;</span>
        </button>
      </>
    );
  }

  // === SMALL & LARGE STATES (with Jitsi) ===
  const isLarge = view === 'large';

  return (
    <div
      ref={widgetRef}
      className="fjw fjw--video"
      style={{
        left: pos.x >= 0 ? pos.x : undefined,
        top: pos.y >= 0 ? pos.y : undefined,
        width: size.width,
        height: size.height,
        bottom: 'auto',
        right: 'auto',
        transform: 'none',
      }}
    >
      {/* Control bar – draggable */}
      <div
        className="fjw__controls fjw__controls--draggable"
        onMouseDown={onDragStart}
        onTouchStart={onDragStart}
      >
        <span className="fjw__controls-title">
          {meetingData.meetingTitle || 'Video-Treffen'}
        </span>
        <div className="fjw__controls-buttons">
          <button
            className="fjw__ctrl-btn"
            onClick={handleToggleSize}
            title={isLarge ? 'Kleines Fenster' : 'Grosses Fenster'}
          >
            {isLarge ? '⧉' : '□'}
          </button>
          <button
            className="fjw__ctrl-btn"
            onClick={handleOpenInNewTab}
            title="In neuem Tab oeffnen"
          >
            ↗
          </button>
          <button
            className="fjw__ctrl-btn"
            onClick={handleMinimize}
            title="Minimieren (Audio laeuft weiter)"
          >
            ─
          </button>
          <button
            className="fjw__ctrl-btn fjw__ctrl-btn--close"
            onClick={handleLeave}
            title="Treffen verlassen"
          >
            ✕
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
        {/* Transparent overlay blocks iframe from stealing mouse events during drag/resize */}
        {isDragging && <div className="fjw__drag-overlay" />}
      </div>

      {/* Resize handle */}
      <div
        className="fjw__resize-handle"
        onMouseDown={onResizeStart}
        onTouchStart={onResizeStart}
      />
    </div>
  );
};

export default FloatingJitsiWidget;

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
  scheduledStartISO?: string;
  scheduledEndISO?: string;
  userRole: 'coach' | 'kind';
  jwt?: string | null;
  appId?: string;
  allMeetings?: MeetingGroupEntry[];
}

export interface MeetingGroupEntry {
  groupId: string;
  groupName: string;
  meetingData: MeetingData;
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

/** Berechnet Minuten bis zum Meeting-Start (5 Min Vorlauf) aus ISO-Timestamps.
 *  Faellt auf den Python-Wert zurueck wenn kein ISO vorhanden. */
function calcMinutesUntilStart(meeting: MeetingData): number {
  if (meeting.scheduledStartISO) {
    const start = new Date(meeting.scheduledStartISO).getTime();
    const accessStart = start - 5 * 60_000; // 5 Min Vorlauf
    const diff = accessStart - Date.now();
    return Math.max(0, Math.round(diff / 60_000));
  }
  return meeting.timeStatus?.minutesUntilStart ?? 0;
}

/** Berechnet verbleibende Minuten eines aktiven Meetings aus ISO-Timestamps. */
function calcMinutesRemaining(meeting: MeetingData): number {
  if (meeting.scheduledEndISO) {
    const end = new Date(meeting.scheduledEndISO).getTime();
    const diff = end - Date.now();
    return Math.max(0, Math.round(diff / 60_000));
  }
  return meeting.timeStatus?.minutesRemaining ?? 0;
}

const FloatingJitsiWidget: React.FC<FloatingJitsiWidgetProps> = ({
  meetingData,
  onAction,
  forceJoin
}) => {
  // Active meeting: fuer Coaches mit mehreren Gruppen umschaltbar
  const [activeMeeting, setActiveMeeting] = useState<MeetingData>(meetingData);
  const activeMeetingRef = useRef<MeetingData>(meetingData);
  const [activeGroupName, setActiveGroupName] = useState<string>(() => {
    const all = meetingData.allMeetings;
    if (all && all.length > 0) {
      const match = all.find(m => m.meetingData.meetingId === meetingData.meetingId);
      return match?.groupName || all[0].groupName;
    }
    return '';
  });
  const [showMeetingPicker, setShowMeetingPicker] = useState(false);

  const apiRef = useRef<any>(null);
  const hasJoinedRef = useRef(false);
  const isLeavingRef = useRef(false); // Flag: nur true wenn X-Button geklickt
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<WidgetView>(() => {
    if (!activeMeeting.canJoin && activeMeeting.timeStatus?.reason === 'too_early') {
      const mins = activeMeeting.timeStatus.minutesUntilStart ?? 999;
      return mins <= 30 ? 'waiting' : 'join-button';
    }
    return 'join-button';
  });
  // Jitsi ist aktiv wenn wir jemals in einen Video-State gewechselt haben
  const [jitsiActive, setJitsiActive] = useState(false);
  const [jitsiLoaded, setJitsiLoaded] = useState(false);
  const [minutesUntil, setMinutesUntil] = useState(() => calcMinutesUntilStart(activeMeeting));

  // --- Drag & Resize state ---
  const [pos, setPos] = useState({ x: -1, y: -1 }); // -1 = not yet placed
  const [size, setSize] = useState(SMALL_DEFAULT);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; origW: number; origH: number } | null>(null);

  const isVideoView = view === 'small' || view === 'large';

  // Keep ref in sync
  useEffect(() => {
    activeMeetingRef.current = activeMeeting;
  }, [activeMeeting]);

  // Props-Sync: Wenn Streamlit neue meetingData sendet (Rerun),
  // aktualisiere activeMeeting — aber nur wenn gleiches Meeting (gleiche ID)
  const prevMeetingIdRef = useRef(meetingData.meetingId);
  useEffect(() => {
    // Gleiches Meeting → nur timeStatus/canJoin/jwt aktualisieren (kein Reset)
    if (meetingData.meetingId === activeMeeting.meetingId) {
      setActiveMeeting(prev => ({
        ...prev,
        canJoin: meetingData.canJoin,
        timeStatus: meetingData.timeStatus,
        scheduledStartISO: meetingData.scheduledStartISO,
        scheduledEndISO: meetingData.scheduledEndISO,
        jwt: meetingData.jwt,
        allMeetings: meetingData.allMeetings,
      }));
      // View aktualisieren wenn Meeting jetzt joinbar geworden ist
      if (meetingData.canJoin && (view === 'waiting' || view === 'join-button') && !jitsiActive) {
        setView('join-button');
      }
    }
    prevMeetingIdRef.current = meetingData.meetingId;
  }, [meetingData.meetingId, meetingData.canJoin, meetingData.timeStatus?.reason]);

  // Force join from external trigger (Header-Button) — startet direkt im Large-Modus
  useEffect(() => {
    if (!forceJoin) return;
    if (view !== 'join-button' && view !== 'waiting') return;

    // Falls aktives Meeting nicht joinbar, zum ersten joinbaren wechseln
    let meetingToJoin = activeMeeting;
    if (!activeMeeting.canJoin && allMeetings) {
      const joinable = allMeetings.find(m => m.meetingData.canJoin);
      if (joinable) {
        meetingToJoin = joinable.meetingData;
        setActiveMeeting(meetingToJoin);
        activeMeetingRef.current = meetingToJoin;
        setActiveGroupName(joinable.groupName);
      }
    }

    if (meetingToJoin.canJoin) {
      const lw = Math.round(window.innerWidth * 0.6);
      const lh = Math.round(window.innerHeight * 0.7);
      setSize({ width: lw, height: lh });
      setPos({ x: Math.round((window.innerWidth - lw) / 2), y: Math.round((window.innerHeight - lh) / 2) });
      setView('large');
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

  // Load Jitsi when jitsiActive becomes true — uses ref for current activeMeeting
  useEffect(() => {
    if (!jitsiActive) return;
    if (apiRef.current) return; // Already loaded
    const m = activeMeetingRef.current;
    if (!m.appId || !m.roomName) return;

    const fullRoomName = `${m.appId}/${m.roomName}`;

    loadJaaSApi(m.appId)
      .then((JitsiMeetExternalAPI) => {
        if (!containerRef.current) return;

        const api = new JitsiMeetExternalAPI('8x8.vc', {
          roomName: fullRoomName,
          jwt: m.jwt || undefined,
          configOverwrite: {
            ...m.config,
            desktopSharingEnabled: true
          },
          interfaceConfigOverwrite: m.interfaceConfig,
          userInfo: {
            displayName: m.displayName,
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
              meetingId: activeMeetingRef.current.meetingId,
              islandId: 'jitsi_meeting'
            });
          }
        });

        api.addListener('videoConferenceLeft', () => {
          if (!hasJoinedRef.current) return;
          if (!isLeavingRef.current) return;
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

  // Update waiting countdown — berechnet echte verbleibende Minuten
  useEffect(() => {
    if (view !== 'waiting') return;

    const tick = () => {
      const mins = calcMinutesUntilStart(activeMeetingRef.current);
      setMinutesUntil(mins);
      if (mins <= 0) {
        setView('join-button');
      }
    };

    tick(); // Sofort berechnen
    const interval = setInterval(tick, 15_000); // Alle 15 Sek aktualisieren

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
        meetingId: activeMeetingRef.current.meetingId,
        islandId: 'jitsi_meeting'
      });
    }
  }, [onAction]);

  // Join the meeting (switch to small view)
  const handleJoin = useCallback(() => {
    setView('small');
    setJitsiActive(true);
  }, []);

  // Open in a new tab
  const handleOpenInNewTab = useCallback(() => {
    if (activeMeeting.roomName && activeMeeting.appId) {
      const jwtParam = activeMeeting.jwt ? `?jwt=${activeMeeting.jwt}` : '';
      window.open(
        `https://8x8.vc/${activeMeeting.appId}/${activeMeeting.roomName}${jwtParam}`,
        '_blank',
        'noopener,noreferrer'
      );
    }
  }, [activeMeeting.roomName, activeMeeting.jwt, activeMeeting.appId]);

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

  // Switch to a different meeting (dispose old Jitsi, start new)
  const handleSwitchMeeting = useCallback((entry: MeetingGroupEntry) => {
    setShowMeetingPicker(false);
    const newMeeting = entry.meetingData;

    // Altes Jitsi disposen falls aktiv
    if (apiRef.current) {
      try { apiRef.current.dispose(); } catch {}
      apiRef.current = null;
    }

    // State zuruecksetzen
    setJitsiLoaded(false);
    hasJoinedRef.current = false;
    isLeavingRef.current = false;

    // Neues Meeting setzen
    setActiveMeeting(newMeeting);
    activeMeetingRef.current = newMeeting;
    setActiveGroupName(entry.groupName);

    // Wenn Jitsi schon aktiv war, direkt neu starten
    if (jitsiActive) {
      setJitsiActive(false);
      // Kleiner Delay damit useEffect den Reset sieht
      setTimeout(() => setJitsiActive(true), 100);
    } else {
      // View + Countdown fuer neues Meeting anpassen
      if (newMeeting.canJoin) {
        setView('join-button');
      } else if (newMeeting.timeStatus?.reason === 'too_early') {
        const mins = newMeeting.timeStatus.minutesUntilStart ?? 0;
        setMinutesUntil(mins);
        setView(mins <= 30 ? 'waiting' : 'join-button');
      }
    }
  }, [jitsiActive]);

  // Close picker on outside click
  useEffect(() => {
    if (!showMeetingPicker) return;
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.fjw__meeting-picker')) {
        setShowMeetingPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMeetingPicker]);

  const allMeetings = meetingData.allMeetings;
  const hasMultipleMeetings = allMeetings && allMeetings.length > 1;

  // Meeting-Picker Dropdown: sortiert aktive zuerst, dann nach Zeit
  const renderMeetingPicker = () => {
    if (!allMeetings) return null;
    const sorted = [...allMeetings].sort((a, b) => {
      // Aktive (canJoin) zuerst
      if (a.meetingData.canJoin && !b.meetingData.canJoin) return -1;
      if (!a.meetingData.canJoin && b.meetingData.canJoin) return 1;
      // Dann nach minutesUntilStart
      const aMin = a.meetingData.timeStatus?.minutesUntilStart ?? 999;
      const bMin = b.meetingData.timeStatus?.minutesUntilStart ?? 999;
      return aMin - bMin;
    });

    return (
      <div className="fjw__meeting-picker-dropdown">
        {sorted.map(entry => {
          const isActive = entry.meetingData.meetingId === activeMeeting.meetingId;
          const isLive = entry.meetingData.canJoin;
          const mins = entry.meetingData.timeStatus?.minutesUntilStart;
          return (
            <button
              key={entry.groupId}
              className={`fjw__meeting-picker-item ${isActive ? 'fjw__meeting-picker-item--active' : ''}`}
              onClick={() => !isActive && handleSwitchMeeting(entry)}
            >
              <span className="fjw__meeting-picker-name">{entry.groupName}</span>
              {isLive && <span className="fjw__meeting-live-badge">LIVE</span>}
              {!isLive && mins != null && mins > 0 && (
                <span className="fjw__meeting-picker-time">in {mins} Min</span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  // Don't render if no meeting or ended
  if (!activeMeeting.roomName || activeMeeting.timeStatus?.reason === 'ended' || activeMeeting.timeStatus?.reason === 'no_meeting') {
    return null;
  }

  // === WAITING STATE ===
  if (view === 'waiting') {
    return (
      <div className="fjw fjw--waiting">
        {hasMultipleMeetings && (
          <div className="fjw__meeting-picker" style={{ position: 'relative' }}>
            <button
              className="fjw__meeting-picker-btn fjw__meeting-picker-btn--pill"
              onClick={() => setShowMeetingPicker(!showMeetingPicker)}
              title="Meeting wechseln"
            >
              {activeGroupName || 'Gruppe'} &#9660;
            </button>
            {showMeetingPicker && renderMeetingPicker()}
          </div>
        )}
        <span className="fjw__waiting-icon">&#9203;</span>
        <span className="fjw__waiting-text">
          {!hasMultipleMeetings && 'Treffen '}in {minutesUntil} Min
        </span>
      </div>
    );
  }

  // === JOIN BUTTON STATE (Video-Start ist jetzt im Header) ===
  if (view === 'join-button') {
    if (!activeMeeting.canJoin && activeMeeting.timeStatus?.reason === 'too_early') {
      const mins = calcMinutesUntilStart(activeMeeting);
      return (
        <div className="fjw fjw--waiting">
          {hasMultipleMeetings && (
            <div className="fjw__meeting-picker" style={{ position: 'relative' }}>
              <button
                className="fjw__meeting-picker-btn fjw__meeting-picker-btn--pill"
                onClick={() => setShowMeetingPicker(!showMeetingPicker)}
                title="Meeting wechseln"
              >
                {activeGroupName || 'Gruppe'} &#9660;
              </button>
              {showMeetingPicker && renderMeetingPicker()}
            </div>
          )}
          <span className="fjw__waiting-icon">&#9203;</span>
          <span className="fjw__waiting-text">
            {!hasMultipleMeetings && 'Treffen '}in {mins} Min
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
          {activeGroupName ? `${activeGroupName}` : (activeMeeting.meetingTitle || 'Video-Treffen')}
        </span>
        {hasMultipleMeetings && (
          <div className="fjw__meeting-picker" style={{ position: 'relative' }}>
            <button
              className="fjw__meeting-picker-btn"
              onClick={() => setShowMeetingPicker(!showMeetingPicker)}
              title="Meeting wechseln"
            >
              &#9660;
            </button>
            {showMeetingPicker && renderMeetingPicker()}
          </div>
        )}
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

// components/VideoChat/SchatzkarteMeetingWithScreenShare.jsx
// Jitsi Meeting-Komponente mit Screen-Share Helper für Schatzkarte

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import ScreenShareHelper from './ScreenShareHelper';
import { useMeeting } from '../../hooks/useMeeting';
import './screen-share-helper.css';
import './video-chat.css';

const SchatzkarteMeetingWithScreenShare = ({
  lerngruppeId,
  meetingData,
  accessData,
  onAction,
  onClose
}) => {
  // Meeting Hook mit Streamlit-Props
  const {
    meeting,
    access,
    loading,
    error,
    refreshAccess,
    recordJoin,
    recordLeave
  } = useMeeting(lerngruppeId, { meetingData, accessData, onAction });

  // Jitsi External API Referenz
  const apiRef = useRef(null);

  // Screen-Sharing Status
  const [isSharing, setIsSharing] = useState(false);
  const [sharingParticipant, setSharingParticipant] = useState(null);

  // Meeting Status
  const [meetingState, setMeetingState] = useState('loading');

  // Jitsi API Event Handlers
  const handleApiReady = useCallback((externalApi) => {
    console.log('Jitsi API ready');
    apiRef.current = externalApi;

    // ===== SCREEN SHARING EVENTS =====

    // Lokaler Benutzer startet/beendet Screen-Sharing
    externalApi.addListener('screenSharingStatusChanged', (data) => {
      const { on } = data;
      setIsSharing(on);

      if (on) {
        console.log('Du teilst jetzt deinen Bildschirm');
      } else {
        console.log('Bildschirmfreigabe beendet');
      }
    });

    // Teilnehmer Video-Track hinzugefügt (erkennt Screen-Sharing anderer)
    externalApi.addListener('videoConferenceJoined', () => {
      recordJoin();
      setMeetingState('active');
    });

    // Teilnehmer-Info für Screen-Sharing Tracking
    externalApi.addListener('participantJoined', (data) => {
      console.log('Teilnehmer beigetreten:', data.displayName);
    });

    externalApi.addListener('participantLeft', (data) => {
      console.log('Teilnehmer verlassen:', data.id);
      // Wenn der Teilende verlässt, Reset Screen-Sharing Status
      if (sharingParticipant === data.displayName) {
        setSharingParticipant(null);
      }
    });

    // Konferenz verlassen
    externalApi.addListener('videoConferenceLeft', () => {
      recordLeave();
      setMeetingState('left');
      onClose?.();
    });

    // Hand heben
    externalApi.addListener('raiseHandUpdated', (data) => {
      console.log('Hand Status:', data);
    });

  }, [recordJoin, recordLeave, onClose, sharingParticipant]);

  // Screen-Sharing starten/stoppen
  const handleStartShare = useCallback(() => {
    if (apiRef.current) {
      apiRef.current.executeCommand('toggleShareScreen');
    }
  }, []);

  const handleStopShare = useCallback(() => {
    if (apiRef.current && isSharing) {
      apiRef.current.executeCommand('toggleShareScreen');
    }
  }, [isSharing]);

  // Loading State
  useEffect(() => {
    if (loading) {
      setMeetingState('loading');
    } else if (error) {
      setMeetingState('error');
    } else if (!access?.canJoin) {
      if (access?.timeStatus?.reason === 'too_early') {
        setMeetingState('waiting');
      } else if (access?.timeStatus?.reason === 'ended') {
        setMeetingState('ended');
      }
    } else {
      setMeetingState('ready');
    }
  }, [loading, error, access]);

  // Render: Loading
  if (meetingState === 'loading') {
    return (
      <div className="schatzkarte-meeting-container">
        <div className="meeting-loading">
          <div className="treasure-chest-animation">
            <span className="chest-icon">🗺️</span>
          </div>
          <p>Lade Video-Treffen...</p>
        </div>
      </div>
    );
  }

  // Render: Error
  if (meetingState === 'error') {
    return (
      <div className="schatzkarte-meeting-container">
        <div className="meeting-error">
          <span className="error-icon">⚠️</span>
          <h3>Ups, etwas ist schiefgelaufen!</h3>
          <p>{error || 'Das Video-Treffen konnte nicht geladen werden.'}</p>
          <button className="refresh-button" onClick={refreshAccess}>
            🔄 Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  // Render: Warteraum
  if (meetingState === 'waiting') {
    const minutesUntil = access?.timeStatus?.minutesUntilStart || 0;
    return (
      <div className="schatzkarte-meeting-container">
        <div className="meeting-waiting-room">
          <div className="waiting-room-content">
            <div className="waiting-animation">
              <span className="map-icon pulse">🗺️</span>
            </div>
            <h2>Das Treffen startet bald!</h2>

            <div className="countdown-display">
              <span className="countdown-number">
                {minutesUntil < 60
                  ? minutesUntil
                  : Math.floor(minutesUntil / 60)}
              </span>
              <span className="countdown-unit">
                {minutesUntil < 60 ? 'Minuten' : 'Stunden'}
              </span>
            </div>

            {meeting && (
              <div className="meeting-info-card">
                <div className="info-row">
                  <span>📅 Treffen:</span>
                  <span>{meeting.title || 'Lerngruppen-Treffen'}</span>
                </div>
                <div className="info-row">
                  <span>⏰ Uhrzeit:</span>
                  <span>{meeting.timeOfDay} Uhr</span>
                </div>
                <div className="info-row">
                  <span>⏱️ Dauer:</span>
                  <span>{meeting.durationMinutes} Minuten</span>
                </div>
              </div>
            )}

            <div className="waiting-tips">
              <h3>💡 Bis dahin kannst du:</h3>
              <ul>
                <li>🎧 Deine Kopfhörer bereithalten</li>
                <li>🔇 Einen ruhigen Platz suchen</li>
                <li>📝 Deine Fragen aufschreiben</li>
              </ul>
            </div>

            <button className="refresh-button" onClick={refreshAccess}>
              🔄 Status aktualisieren
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render: Treffen beendet
  if (meetingState === 'ended' || meetingState === 'left') {
    return (
      <div className="schatzkarte-meeting-container">
        <div className="meeting-ended">
          <span className="end-icon">🎉</span>
          <h2>Treffen beendet!</h2>
          <p>Toll, dass du dabei warst!</p>
          <button className="schedule-button" onClick={onClose}>
            🗺️ Zurück zur Schatzkarte
          </button>
        </div>
      </div>
    );
  }

  // Render: Aktives Meeting mit Screen-Share Helper
  if (meetingState === 'active' || meetingState === 'ready') {
    return (
      <div className="schatzkarte-meeting-with-share">
        {/* Screen-Share Helper Panel */}
        <div className="meeting-sidebar">
          <ScreenShareHelper
            onStartShare={handleStartShare}
            onStopShare={handleStopShare}
            isSharing={isSharing}
            sharingParticipant={sharingParticipant}
            userRole={access?.userRole || 'kind'}
          />

          {/* Weitere Sidebar-Elemente */}
          <div className="meeting-tips-panel">
            <h4>💡 Tipps für das Treffen</h4>
            <ul>
              <li>Schalte dein Mikro stumm, wenn du nicht sprichst</li>
              <li>Hebe die Hand ✋ wenn du etwas sagen möchtest</li>
              <li>Nutze den Chat für Fragen</li>
            </ul>
          </div>
        </div>

        {/* Jitsi Meeting Hauptbereich */}
        <div className="meeting-main">
          <JitsiMeeting
            domain="meet.jit.si"
            roomName={access.roomName}

            configOverwrite={{
              ...access.config,
              // Screen-Sharing spezifische Einstellungen
              desktopSharingEnabled: true,
              desktopSharingFrameRate: {
                min: 5,
                max: 15  // Niedrigere FPS für bessere Performance
              }
            }}

            interfaceConfigOverwrite={access.interfaceConfig}

            userInfo={{
              displayName: access.displayName,
              email: ''
            }}

            onApiReady={handleApiReady}
            onReadyToClose={() => {
              recordLeave();
              onClose?.();
            }}

            getIFrameRef={(iframeRef) => {
              iframeRef.style.height = '100%';
              iframeRef.style.width = '100%';
              iframeRef.style.border = 'none';
              iframeRef.style.borderRadius = '12px';
            }}

            spinner={() => (
              <div className="meeting-loading">
                <span className="loading-icon">🗺️</span>
                <p>Lade Video-Treffen...</p>
              </div>
            )}
          />
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="schatzkarte-meeting-container">
      <div className="meeting-loading">
        <p>Meeting Status: {meetingState}</p>
      </div>
    </div>
  );
};

export default SchatzkarteMeetingWithScreenShare;

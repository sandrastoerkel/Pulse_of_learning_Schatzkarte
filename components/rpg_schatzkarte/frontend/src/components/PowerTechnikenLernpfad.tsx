// ============================================
// Power-Techniken Lernpfad - Video-Lernpfad mit Progressive Unlock
// Für Unterstufe: 4 Videos zu den 7 Power-Techniken
// ============================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface Video {
  id: number;
  title: string;
  subtitle: string;
  duration: string;
  youtubeId: string;
  xp: number;
}

interface PowerTechnikenLernpfadProps {
  completedVideos?: number[];
  onVideoComplete?: (videoId: number, xp: number) => void;
  onStartChallenge?: () => void;
  onAllVideosComplete?: () => void;
  onOpenLernkarten?: () => void;
  onOpenSchatzkammer?: () => void;
}

// Video-Daten mit YouTube IDs
const videos: Video[] = [
  {
    id: 1,
    title: "Das Fluency-Problem",
    subtitle: "Warum mehr lernen nicht hilft",
    duration: "1:00",
    youtubeId: "uZxLC7Bv-II",
    xp: 10,
  },
  {
    id: 2,
    title: "Retrieval & Spaced Repetition",
    subtitle: "Das Dream-Team",
    duration: "1:00",
    youtubeId: "_nb6vp-WDA4",
    xp: 15,
  },
  {
    id: 3,
    title: "Feynman & Interleaving",
    subtitle: "Verstehen und Üben",
    duration: "3:15",
    youtubeId: "c8gHYRXHZtY",
    xp: 15,
  },
  {
    id: 4,
    title: "Loci, Pomodoro & Lehren",
    subtitle: "Struktur und Teamwork",
    duration: "3:30",
    youtubeId: "XI00RwT3MWw",
    xp: 20,
  },
];

// SVG Icons im Schatzkarte-Stil
const PlayIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="playGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FFA500" />
      </linearGradient>
    </defs>
    <path d="M8 5v14l11-7L8 5z" fill="url(#playGold)" />
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4"
      stroke="#8B7355"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="checkGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FFA500" />
      </linearGradient>
    </defs>
    <path
      d="M20 6L9 17l-5-5"
      stroke="url(#checkGold)"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TrophyIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="trophyGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="50%" stopColor="#FFEC8B" />
        <stop offset="100%" stopColor="#FFA500" />
      </linearGradient>
    </defs>
    <path
      d="M6 9H4a2 2 0 01-2-2V5a2 2 0 012-2h2M18 9h2a2 2 0 002-2V5a2 2 0 00-2-2h-2M9 22h6M12 17v5M7 3h10v7a5 5 0 01-10 0V3z"
      stroke="url(#trophyGold)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Haupt-Komponente
export const PowerTechnikenLernpfad: React.FC<PowerTechnikenLernpfadProps> = ({
  completedVideos = [],
  onVideoComplete,
  onStartChallenge,
  onAllVideosComplete,
  onOpenLernkarten,
  onOpenSchatzkammer,
}) => {
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [localCompletedVideos, setLocalCompletedVideos] = useState<number[]>(completedVideos);

  // Berechne welche Videos freigeschaltet sind
  const isUnlocked = (videoId: number): boolean => {
    if (videoId === 1) return true; // Video 1 immer frei
    return localCompletedVideos.includes(videoId - 1);
  };

  const isCompleted = (videoId: number): boolean => {
    return localCompletedVideos.includes(videoId);
  };

  // Fortschritt berechnen
  const progress = (localCompletedVideos.length / videos.length) * 100;
  const totalXP = videos
    .filter(v => localCompletedVideos.includes(v.id))
    .reduce((sum, v) => sum + v.xp, 0);
  const maxXP = videos.reduce((sum, v) => sum + v.xp, 0);

  // Alle Videos abgeschlossen?
  const allCompleted = localCompletedVideos.length === videos.length;

  const handleVideoClick = (video: Video) => {
    if (isUnlocked(video.id)) {
      setActiveVideo(video);
    }
  };

  const handleVideoEnd = () => {
    if (activeVideo && !isCompleted(activeVideo.id)) {
      // Lokal als abgeschlossen markieren
      setLocalCompletedVideos(prev => [...prev, activeVideo.id]);

      // Callback aufrufen
      onVideoComplete?.(activeVideo.id, activeVideo.xp);

      // Zeige Unlock-Animation wenn nächstes Video freigeschaltet wird
      const nextVideo = videos.find(v => v.id === activeVideo.id + 1);
      if (nextVideo) {
        setShowUnlockAnimation(true);
        setTimeout(() => setShowUnlockAnimation(false), 2000);
      }

      // NICHT mehr automatisch onAllVideosComplete aufrufen!
      // Die Links erscheinen automatisch wenn allCompleted === true
    }
    setActiveVideo(null);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <motion.div
        style={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 style={styles.title}>Power-Techniken</h1>
        <p style={styles.subtitle}>Dein Lernpfad zu besseren Noten</p>
      </motion.div>

      {/* Fortschrittsanzeige */}
      <motion.div
        style={styles.progressSection}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div style={styles.progressHeader}>
          <span style={styles.progressLabel}>Fortschritt</span>
          <span style={styles.xpLabel}>{totalXP} / {maxXP} XP</span>
        </div>
        <div style={styles.progressBarBg}>
          <motion.div
            style={{ ...styles.progressBarFill, width: `${progress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      {/* Lernpfad */}
      <div style={styles.pathContainer}>
        {videos.map((video, index) => {
          const unlocked = isUnlocked(video.id);
          const completed = isCompleted(video.id);

          return (
            <React.Fragment key={video.id}>
              {/* Verbindungslinie */}
              {index > 0 && (
                <div style={styles.connectorContainer}>
                  <motion.div
                    style={{
                      ...styles.connector,
                      background: completed || (unlocked && isCompleted(video.id - 1))
                        ? 'linear-gradient(180deg, #FFD700, #FFA500)'
                        : '#3D3D3D',
                    }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: index * 0.1 }}
                  />
                </div>
              )}

              {/* Video-Karte */}
              <motion.div
                style={{
                  ...styles.videoCard,
                  opacity: unlocked ? 1 : 0.6,
                  cursor: unlocked ? 'pointer' : 'not-allowed',
                  border: completed
                    ? '2px solid #FFD700'
                    : unlocked
                      ? '2px solid #4A4A4A'
                      : '2px solid #2D2D2D',
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: unlocked ? 1 : 0.6, x: 0 }}
                transition={{ delay: index * 0.15 }}
                whileHover={unlocked ? { scale: 1.02, borderColor: '#FFD700' } : {}}
                whileTap={unlocked ? { scale: 0.98 } : {}}
                onClick={() => handleVideoClick(video)}
              >
                {/* Nummer / Status */}
                <div style={{
                  ...styles.videoNumber,
                  background: completed
                    ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                    : unlocked
                      ? 'linear-gradient(135deg, #4A4A4A, #3D3D3D)'
                      : '#2D2D2D',
                }}>
                  {completed ? <CheckIcon /> : unlocked ? video.id : <LockIcon />}
                </div>

                {/* Content */}
                <div style={styles.videoContent}>
                  <h3 style={styles.videoTitle}>{video.title}</h3>
                  <p style={styles.videoSubtitle}>{video.subtitle}</p>
                </div>

                {/* Meta */}
                <div style={styles.videoMeta}>
                  <span style={styles.videoDuration}>{video.duration}</span>
                  <span style={styles.videoXP}>+{video.xp} XP</span>
                </div>

                {/* Play Button */}
                {unlocked && !completed && (
                  <motion.div
                    style={styles.playButton}
                    whileHover={{ scale: 1.1 }}
                  >
                    <PlayIcon />
                  </motion.div>
                )}
              </motion.div>
            </React.Fragment>
          );
        })}

        {/* Challenge-Karte */}
        <div style={styles.connectorContainer}>
          <motion.div
            style={{
              ...styles.connector,
              background: allCompleted
                ? 'linear-gradient(180deg, #FFD700, #FFA500)'
                : '#3D3D3D',
            }}
          />
        </div>

        <motion.div
          style={{
            ...styles.challengeCard,
            opacity: allCompleted ? 1 : 0.5,
            cursor: allCompleted ? 'pointer' : 'not-allowed',
            border: allCompleted
              ? '2px solid #FFD700'
              : '2px dashed #4A4A4A',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: allCompleted ? 1 : 0.5, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={allCompleted ? { scale: 1.02 } : {}}
          onClick={() => allCompleted && onStartChallenge?.()}
        >
          <div style={styles.challengeIcon}>
            <TrophyIcon />
          </div>
          <div style={styles.challengeContent}>
            <h3 style={styles.challengeTitle}>
              {allCompleted ? 'Challenge starten!' : 'Challenge'}
            </h3>
            <p style={styles.challengeSubtitle}>
              {allCompleted
                ? 'Wende die Power-Techniken an!'
                : 'Schließe alle Videos ab'
              }
            </p>
          </div>
          {allCompleted && (
            <motion.div
              style={styles.challengeArrow}
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              →
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Werkzeuge-Links: Nur anzeigen wenn alle Videos abgeschlossen */}
      {allCompleted && (
        <motion.div
          style={styles.toolsSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 style={styles.toolsSectionTitle}>Jetzt ausprobieren!</h3>
          <div style={styles.toolsGrid}>
            {/* Lernkarten */}
            <motion.button
              style={styles.toolCard}
              onClick={onOpenLernkarten}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <span style={styles.toolIcon}>🎴</span>
              <div style={styles.toolContent}>
                <h4 style={styles.toolTitle}>Loot-Lernkarten</h4>
                <p style={styles.toolDescription}>Spaced Repetition - Vokabeln & Fakten clever lernen</p>
              </div>
              <span style={styles.toolArrow}>→</span>
            </motion.button>

            {/* Schatzkammer */}
            <motion.button
              style={styles.toolCard}
              onClick={onOpenSchatzkammer}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <span style={styles.toolIcon}>🏰</span>
              <div style={styles.toolContent}>
                <h4 style={styles.toolTitle}>Loci-Schatzkammer</h4>
                <p style={styles.toolDescription}>Gedächtnispalast - Merke dir alles mit Orten</p>
              </div>
              <span style={styles.toolArrow}>→</span>
            </motion.button>

            {/* 7 Powertechniken Challenge */}
            <motion.button
              style={styles.toolCard}
              onClick={onStartChallenge}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <span style={styles.toolIcon}>🛠️</span>
              <div style={styles.toolContent}>
                <h4 style={styles.toolTitle}>7 Powertechniken</h4>
                <p style={styles.toolDescription}>Alle Techniken interaktiv ausprobieren</p>
              </div>
              <span style={styles.toolArrow}>→</span>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Video Modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            style={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveVideo(null)}
          >
            <motion.div
              style={styles.modalContent}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>{activeVideo.title}</h2>
                <button
                  style={styles.closeButton}
                  onClick={() => setActiveVideo(null)}
                >
                  ✕
                </button>
              </div>

              <div className="video-intro-container" style={{ padding: '1rem', display: 'flex', justifyContent: 'center' }}>
                <div className="video-card" style={{ width: '100%', maxWidth: '1100px', aspectRatio: '16 / 9' }}>
                  <iframe
                    className="intro-video youtube-embed"
                    src={`https://www.youtube.com/embed/${activeVideo.youtubeId}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ width: '100%', height: '100%', border: 'none', borderRadius: '12px' }}
                  />
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button
                  style={styles.completeButton}
                  onClick={handleVideoEnd}
                >
                  Video abgeschlossen (+{activeVideo.xp} XP)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unlock Animation */}
      <AnimatePresence>
        {showUnlockAnimation && (
          <motion.div
            style={styles.unlockOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              style={styles.unlockContent}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <span style={styles.unlockEmoji}>🔓</span>
              <span style={styles.unlockText}>Nächstes Video freigeschaltet!</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Styles
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '16px',
    maxWidth: '500px',
    margin: '0 auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: '0 0 6px 0',
  },
  subtitle: {
    color: '#888',
    fontSize: '14px',
    margin: 0,
  },
  progressSection: {
    background: 'linear-gradient(135deg, #1E1E1E, #2D2D2D)',
    borderRadius: '12px',
    padding: '12px 16px',
    marginBottom: '20px',
    border: '1px solid #3D3D3D',
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  progressLabel: {
    color: '#AAA',
    fontSize: '13px',
  },
  xpLabel: {
    color: '#FFD700',
    fontSize: '13px',
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: '6px',
    background: '#3D3D3D',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #FFD700, #FFA500)',
    borderRadius: '3px',
  },
  pathContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  connectorContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '0 0 0 28px',
  },
  connector: {
    width: '3px',
    height: '20px',
    borderRadius: '2px',
  },
  videoCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: 'linear-gradient(135deg, #1E1E1E, #252525)',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
  },
  videoNumber: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#FFF',
    flexShrink: 0,
  },
  videoContent: {
    flex: 1,
    minWidth: 0,
  },
  videoTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#FFF',
    margin: '0 0 2px 0',
  },
  videoSubtitle: {
    fontSize: '12px',
    color: '#888',
    margin: 0,
  },
  videoMeta: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '2px',
  },
  videoDuration: {
    fontSize: '11px',
    color: '#666',
  },
  videoXP: {
    fontSize: '11px',
    color: '#FFD700',
    fontWeight: 'bold',
  },
  playButton: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2D2D2D, #1E1E1E)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #FFD700',
  },
  challengeCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: 'linear-gradient(135deg, #1E1E1E, #252525)',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
  },
  challengeIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,165,0,0.1))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeContent: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#FFD700',
    margin: '0 0 4px 0',
  },
  challengeSubtitle: {
    fontSize: '13px',
    color: '#888',
    margin: 0,
  },
  challengeArrow: {
    fontSize: '20px',
    color: '#FFD700',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px',
  },
  modalContent: {
    width: '95%',
    maxWidth: '1200px',
    maxHeight: '90vh',
    background: '#1E1E1E',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '2px solid #3D3D3D',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #3D3D3D',
  },
  modalTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#FFF',
    margin: 0,
  },
  closeButton: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: 'none',
    background: '#3D3D3D',
    color: '#FFF',
    fontSize: '14px',
    cursor: 'pointer',
  },
  videoWrapper: {
    position: 'relative',
    width: '100%',
    paddingTop: '56.25%', // 16:9
    background: '#000',
  },
  iframe: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    border: 'none',
    minHeight: '400px',
  },
  videoPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#252525',
    color: '#FFF',
  },
  modalFooter: {
    padding: '12px 16px',
    borderTop: '1px solid #3D3D3D',
  },
  completeButton: {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
    color: '#000',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  unlockOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1001,
  },
  unlockContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  unlockEmoji: {
    fontSize: '56px',
  },
  unlockText: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#FFD700',
  },
  // Werkzeuge-Section Styles
  toolsSection: {
    marginTop: '24px',
    padding: '16px',
    background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    borderRadius: '16px',
    border: '1px solid #3D3D3D',
  },
  toolsSectionTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#FFF',
    margin: '0 0 12px 0',
    textAlign: 'center' as const,
  },
  toolsGrid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  toolCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px',
    background: 'linear-gradient(135deg, #252525, #1E1E1E)',
    borderRadius: '12px',
    border: '2px solid #3D3D3D',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left' as const,
  },
  toolIcon: {
    fontSize: '32px',
    flexShrink: 0,
  },
  toolContent: {
    flex: 1,
    minWidth: 0,
  },
  toolTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#FFD700',
    margin: '0 0 4px 0',
  },
  toolDescription: {
    fontSize: '12px',
    color: '#AAA',
    margin: 0,
  },
  toolArrow: {
    fontSize: '18px',
    color: '#FFD700',
    flexShrink: 0,
  },
};

export default PowerTechnikenLernpfad;

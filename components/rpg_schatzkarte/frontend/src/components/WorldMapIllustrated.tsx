// ============================================
// WorldMapIllustrated.tsx
// Illustrierte Schatzkarte mit Pixabay-Hintergrund
// Alle 15 Inseln + schwimmende Schiffe
// ============================================

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Island, UserProgress, HeroData, AgeGroup, TagebuchEintrag, IslandProgress } from '../types';
import { HeroStatus, InventoryModal } from './HeroStatus';
import './illustrated-map.css';

// Karten-Hintergrund als Import (wird von Vite gebundelt)
import treasureMapBg from '../assets/treasure-map-bg.png';

interface WorldMapIllustratedProps {
  islands: Island[];
  userProgress: UserProgress;
  heroData: HeroData;
  unlockedIslands: string[];
  currentIsland: string | null;
  onIslandClick: (islandId: string) => void;
  onBanduraShipClick?: () => void;
  onHattieShipClick?: () => void;
  // Superhelden-Tagebuch Props
  ageGroup?: AgeGroup;
  tagebuchEntries?: TagebuchEintrag[];
  onTagebuchToggle?: () => void;
  // Lerntechniken-Übersicht Props
  onLerntechnikenClick?: () => void;
  lerntechnikenCompleted?: number;
  hasCertificate?: boolean;
}

// Insel-Positionen für die illustrierte Karte
// Gleichmäßig auf der Landmasse verteilt, mehr vertikaler Abstand
const ISLAND_POSITIONS: Record<string, { x: number; y: number }> = {
  // Starthafen - Küste links unten (Eingang)
  'start': { x: 28, y: 85 },
  // Woche 1-4: untere Hälfte der Landmasse
  'festung': { x: 35, y: 70 },
  'werkzeuge': { x: 32, y: 50 },
  'bruecken': { x: 42, y: 82 },
  'faeden': { x: 45, y: 58 },
  // Woche 5-9: mittlerer Bereich
  'spiegel_see': { x: 50, y: 75 },
  'vulkan': { x: 48, y: 38 },
  'ruhe_oase': { x: 55, y: 55 },
  'ausdauer_gipfel': { x: 58, y: 35 },
  'fokus_leuchtturm': { x: 62, y: 20 },
  // Woche 10-14: oberer/rechter Bereich
  'wachstum_garten': { x: 65, y: 48 },
  'lehrer_turm': { x: 68, y: 28 },
  'wohlfuehl_dorf': { x: 72, y: 62 },
  'schutz_burg': { x: 75, y: 42 },
  // Finale - Berggipfel oben
  'meister_berg': { x: 70, y: 12 }
};

// Verbindungspfade
const PATH_CONNECTIONS = [
  ['start', 'festung'],
  ['festung', 'werkzeuge'],
  ['werkzeuge', 'bruecken'],
  ['bruecken', 'faeden'],
  ['faeden', 'spiegel_see'],
  ['faeden', 'vulkan'],
  ['spiegel_see', 'vulkan'],
  ['spiegel_see', 'ruhe_oase'],
  ['vulkan', 'ausdauer_gipfel'],
  ['ruhe_oase', 'ausdauer_gipfel'],
  ['ausdauer_gipfel', 'fokus_leuchtturm'],
  ['ausdauer_gipfel', 'wachstum_garten'],
  ['fokus_leuchtturm', 'wachstum_garten'],
  ['wachstum_garten', 'lehrer_turm'],
  ['wachstum_garten', 'wohlfuehl_dorf'],
  ['lehrer_turm', 'schutz_burg'],
  ['wohlfuehl_dorf', 'schutz_burg'],
  ['schutz_burg', 'meister_berg'],
  ['lehrer_turm', 'meister_berg']
];

// Status-Farben
const statusColors = {
  completed: '#22c55e',
  in_progress: '#fbbf24',
  available: '#3b82f6',
  locked: '#6b7280',
};

type QuestStatus = 'locked' | 'available' | 'in_progress' | 'completed';

// Tutorial-Inseln haben nur 2 Schritte (Video + Erklärung), kein Quiz/Challenge
const TUTORIAL_ISLANDS = ['start'];

// Hilfsfunktionen
function getQuestStatus(progress?: IslandProgress, islandId?: string): QuestStatus {
  if (!progress) return 'available';

  // Tutorial-Inseln: nur Video + Erklärung erforderlich
  const isTutorial = islandId && TUTORIAL_ISLANDS.includes(islandId);

  const completed = isTutorial
    ? progress.video_watched && progress.explanation_read
    : progress.video_watched &&
      progress.explanation_read &&
      progress.quiz_passed &&
      progress.challenge_completed;

  if (completed) return 'completed';

  const started =
    progress.video_watched ||
    progress.explanation_read ||
    progress.quiz_passed ||
    progress.challenge_completed;
  if (started) return 'in_progress';
  return 'available';
}

function getProgressPercent(progress?: IslandProgress, islandId?: string): number {
  if (!progress) return 0;

  // Tutorial-Inseln: nur 2 Schritte (Video + Erklärung)
  const isTutorial = islandId && TUTORIAL_ISLANDS.includes(islandId);

  if (isTutorial) {
    let count = 0;
    if (progress.video_watched) count++;
    if (progress.explanation_read) count++;
    return (count / 2) * 100;
  }

  // Normale Inseln: 4 Schritte
  let count = 0;
  if (progress.video_watched) count++;
  if (progress.explanation_read) count++;
  if (progress.quiz_passed) count++;
  if (progress.challenge_completed) count++;
  return (count / 4) * 100;
}

// Organische Pfad-Generierung
const generateOrganicPath = (x1: number, y1: number, x2: number, y2: number): string => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const cx1 = x1 + dx * 0.25 + Math.sin(x1 * 0.1) * 5;
  const cy1 = y1 + dy * 0.25 - 8;
  const cx2 = x1 + dx * 0.75 - Math.cos(y1 * 0.1) * 5;
  const cy2 = y1 + dy * 0.75 + 5;
  return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
};

// Quest-Marker Komponente
interface QuestMarkerProps {
  island: Island;
  progress?: IslandProgress;
  isUnlocked: boolean;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onClick: () => void;
}

const QuestMarker: React.FC<QuestMarkerProps> = ({
  island,
  progress,
  isUnlocked,
  isHovered,
  onHover,
  onClick
}) => {
  const status = !isUnlocked ? 'locked' : getQuestStatus(progress, island.id);
  const progressPercent = getProgressPercent(progress, island.id);
  const statusColor = statusColors[status];
  const position = ISLAND_POSITIONS[island.id] || { x: 50, y: 50 };
  const isLocked = status === 'locked';

  return (
    <motion.div
      className="quest-marker-illustrated"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: Math.random() * 0.3, type: 'spring', bounce: 0.4 }}
      whileHover={!isLocked ? { scale: 1.15 } : undefined}
      whileTap={!isLocked ? { scale: 0.95 } : undefined}
      onMouseEnter={() => onHover(island.id)}
      onMouseLeave={() => onHover(null)}
      onClick={!isLocked ? onClick : undefined}
    >
      {/* Pulsierender Ring für verfügbare Inseln */}
      {status === 'available' && (
        <motion.div
          className="pulse-ring"
          style={{ borderColor: statusColor }}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.8, 0, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}

      {/* Haupt-Marker */}
      <motion.div
        className="marker-circle"
        style={{
          background: isLocked
            ? 'linear-gradient(145deg, #555, #777)'
            : `linear-gradient(145deg, ${statusColor}dd, ${statusColor})`,
          borderColor: isLocked ? '#444' : '#fff',
          opacity: isLocked ? 0.6 : 1,
          filter: isLocked ? 'grayscale(0.7)' : 'none',
          boxShadow: isHovered
            ? `0 0 25px ${statusColor}80, 0 8px 20px rgba(0,0,0,0.5)`
            : `0 4px 15px rgba(0,0,0,0.5)`,
        }}
      >
        <span className="marker-icon">
          {isLocked ? '🔒' : island.icon}
        </span>

        {/* Progress-Ring für in_progress */}
        {status === 'in_progress' && (
          <svg className="progress-ring" viewBox="0 0 64 64">
            <circle className="progress-ring-bg" cx="32" cy="32" r="28" />
            <circle
              className="progress-ring-fill"
              cx="32"
              cy="32"
              r="28"
              strokeDasharray={`${progressPercent * 1.76} 176`}
            />
          </svg>
        )}

        {/* Completion Star */}
        {status === 'completed' && (
          <motion.span
            className="completion-star"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            ⭐
          </motion.span>
        )}
      </motion.div>

      {/* Progress Badge */}
      {status === 'in_progress' && (
        <div className="progress-badge">{Math.round(progressPercent)}%</div>
      )}

      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="marker-tooltip"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{ borderColor: statusColor }}
          >
            <div className="tooltip-title">{island.name}</div>
            <div className="tooltip-status" style={{ color: statusColor }}>
              {status === 'completed' && '✓ Abgeschlossen'}
              {status === 'in_progress' && `🔥 ${Math.round(progressPercent)}% erledigt`}
              {status === 'available' && '⚔️ Bereit zum Entdecken!'}
              {status === 'locked' && '🔒 Noch gesperrt'}
            </div>
            <div className="tooltip-week">Woche {island.week}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Schwimmendes Schiff Komponente
interface FloatingShipProps {
  type: 'bandura' | 'hattie';
  onClick?: () => void;
}

const FloatingShip: React.FC<FloatingShipProps> = ({ type, onClick }) => {
  const isBandura = type === 'bandura';

  return (
    <motion.div
      className={`floating-ship ${type}-ship`}
      onClick={onClick}
      initial={{ y: 0 }}
      animate={{
        y: [0, -8, 0],
        rotate: [-2, 2, -2]
      }}
      transition={{
        duration: isBandura ? 4 : 3.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      title={isBandura
        ? 'Der goldene Schlüssel: Die 4 Quellen der Selbstwirksamkeit'
        : 'Superpower: Trainiere deine Selbsteinschätzung'
      }
    >
      <div className="ship-body">
        <span className="ship-icon">{isBandura ? '🔑' : '💪'}</span>
        <span className="ship-flag">{isBandura ? '✨' : '⭐'}</span>
      </div>
      <div className="ship-label">{isBandura ? 'Goldener Schlüssel' : 'Superpower'}</div>
      <motion.div
        className="ship-waves"
        animate={{ x: [-5, 5, -5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        〰️
      </motion.div>
    </motion.div>
  );
};

// Verbindungspfade Komponente
interface ConnectionPathsProps {
  islands: Island[];
  userProgress: UserProgress;
  unlockedIslands: string[];
}

const ConnectionPaths: React.FC<ConnectionPathsProps> = ({
  islands,
  userProgress,
  unlockedIslands
}) => {
  const getIslandById = (id: string) => islands.find(i => i.id === id);

  return (
    <svg className="connections-layer" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="path-gradient-completed" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#16a34a" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="path-gradient-active" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
        </linearGradient>
        <filter id="path-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {PATH_CONNECTIONS.map(([fromId, toId], index) => {
        const fromPos = ISLAND_POSITIONS[fromId];
        const toPos = ISLAND_POSITIONS[toId];
        if (!fromPos || !toPos) return null;

        const fromProgress = userProgress[fromId];
        const toProgress = userProgress[toId];
        const fromStatus = getQuestStatus(fromProgress, fromId);
        const toStatus = !unlockedIslands.includes(toId) ? 'locked' : getQuestStatus(toProgress, toId);

        // Pfad nur anzeigen wenn die Ausgangs-Insel abgeschlossen ist (progressives Freischalten)
        const fromCompleted = fromStatus === 'completed';
        if (!fromCompleted) return null;

        const isCompleted = fromCompleted && toStatus === 'completed';
        const isActive = fromCompleted && (toStatus === 'in_progress' || toStatus === 'available');

        const pathD = generateOrganicPath(fromPos.x, fromPos.y, toPos.x, toPos.y);

        return (
          <g key={index}>
            {(isCompleted || isActive) && (
              <path
                d={pathD}
                fill="none"
                stroke={isCompleted ? '#22c55e' : '#fbbf24'}
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.3"
                filter="url(#path-glow)"
              />
            )}
            <path
              d={pathD}
              fill="none"
              stroke={
                isCompleted
                  ? 'url(#path-gradient-completed)'
                  : 'url(#path-gradient-active)'
              }
              strokeWidth={isCompleted ? '1' : '0.8'}
              strokeLinecap="round"
              strokeDasharray={isCompleted ? 'none' : '3 2'}
              opacity={isCompleted ? 0.9 : 0.7}
            />
          </g>
        );
      })}
    </svg>
  );
};

// Legende Komponente
const MapLegend: React.FC = () => (
  <div className="map-legend">
    <div className="legend-title">Legende</div>
    <div className="legend-items">
      <div className="legend-item">
        <span className="legend-dot" style={{ background: statusColors.completed }} />
        <span>Abgeschlossen</span>
      </div>
      <div className="legend-item">
        <span className="legend-dot" style={{ background: statusColors.in_progress }} />
        <span>In Arbeit</span>
      </div>
      <div className="legend-item">
        <span className="legend-dot" style={{ background: statusColors.available }} />
        <span>Verfügbar</span>
      </div>
      <div className="legend-item">
        <span className="legend-dot" style={{ background: statusColors.locked }} />
        <span>Gesperrt</span>
      </div>
    </div>
  </div>
);

// Hauptkomponente
export function WorldMapIllustrated({
  islands,
  userProgress,
  heroData,
  unlockedIslands,
  currentIsland,
  onIslandClick,
  onBanduraShipClick,
  onHattieShipClick,
  ageGroup,
  tagebuchEntries = [],
  onTagebuchToggle,
  onLerntechnikenClick,
  lerntechnikenCompleted = 0,
  hasCertificate = false
}: WorldMapIllustratedProps) {
  const [hoveredIsland, setHoveredIsland] = useState<string | null>(null);
  const [showInventory, setShowInventory] = useState(false);

  // Berechne Gesamtfortschritt (berücksichtigt Tutorial-Inseln)
  const totalProgress = useMemo(() => {
    let completed = 0;
    islands.forEach(island => {
      const progress = userProgress[island.id];
      if (getQuestStatus(progress, island.id) === 'completed') {
        completed++;
      }
    });
    return Math.round((completed / islands.length) * 100);
  }, [islands, userProgress]);

  const completedCount = useMemo(() => {
    return islands.filter(island => {
      const progress = userProgress[island.id];
      return getQuestStatus(progress, island.id) === 'completed';
    }).length;
  }, [islands, userProgress]);

  return (
    <div className="world-map-illustrated-container">
      {/* Hero Status Panel */}
      <div className="hero-panel-illustrated">
        <HeroStatus
          hero={heroData}
          onInventoryClick={() => setShowInventory(true)}
        />

        {/* Gesamtfortschritt */}
        <div className="total-progress-illustrated">
          <div className="progress-label">
            <span>🗺️ Weltkarte erkundet</span>
            <span>{totalProgress}%</span>
          </div>
          <div className="progress-bar-illustrated">
            <motion.div
              className="progress-fill-illustrated"
              initial={{ width: 0 }}
              animate={{ width: `${totalProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <div className="progress-detail">
            {completedCount} / {islands.length} Quests abgeschlossen
          </div>
        </div>

        {/* Legende (links im Panel) */}
        <MapLegend />
      </div>

      {/* Die illustrierte Karte */}
      <div className="world-map-illustrated">
        <div className="map-frame">
          {/* Hintergrund-Karte */}
          <div className="map-background">
            <img
              src={treasureMapBg}
              alt="Schatzkarte"
              className="map-image"
              draggable={false}
            />
          </div>

          {/* Verbindungspfade */}
          <ConnectionPaths
            islands={islands}
            userProgress={userProgress}
            unlockedIslands={unlockedIslands}
          />

          {/* Quest-Marker für jede Insel */}
          {islands.map(island => (
            <QuestMarker
              key={island.id}
              island={island}
              progress={userProgress[island.id]}
              isUnlocked={unlockedIslands.includes(island.id)}
              isHovered={hoveredIsland === island.id}
              onHover={setHoveredIsland}
              onClick={() => onIslandClick(island.id)}
            />
          ))}

          {/* Schwimmende Schiffe */}
          <FloatingShip type="bandura" onClick={onBanduraShipClick} />
          <FloatingShip type="hattie" onClick={onHattieShipClick} />

          {/* Superhelden-Tagebuch Widget - NUR für Grundschule */}
          {ageGroup === 'grundschule' && onTagebuchToggle && (
            <motion.div
              className="tagebuch-widget-illustrated"
              onClick={onTagebuchToggle}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="widget-icon">📓</span>
              {tagebuchEntries.length > 0 && (
                <span className="widget-badge">{tagebuchEntries.length}</span>
              )}
            </motion.div>
          )}

          {/* Lerntechniken-Übersicht Widget */}
          {onLerntechnikenClick && (
            <motion.div
              className={`lerntechniken-widget-illustrated ${hasCertificate ? 'has-certificate' : ''}`}
              onClick={onLerntechnikenClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="lerntechniken-icon">{hasCertificate ? '🎓' : '📋'}</span>
              {lerntechnikenCompleted > 0 && (
                <span className="lerntechniken-badge">{lerntechnikenCompleted}/7</span>
              )}
              <span className="lerntechniken-label">
                {hasCertificate ? 'Zertifikat' : 'Lerntechniken'}
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Inventory Modal */}
      <InventoryModal
        hero={heroData}
        isOpen={showInventory}
        onClose={() => setShowInventory(false)}
      />
    </div>
  );
}

export { ISLAND_POSITIONS };
export default WorldMapIllustrated;

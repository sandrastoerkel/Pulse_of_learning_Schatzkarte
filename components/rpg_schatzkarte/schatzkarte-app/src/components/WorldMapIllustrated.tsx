// ============================================
// WorldMapIllustrated.tsx — Hook-driven (keine Props)
// Migriert aus: frontend/src/components/WorldMapIllustrated.tsx (833 Zeilen, 27 Props)
// ============================================
//
// Data source mapping:
//   DIRECT (hook):   heroData (useHeroData), profile (useAuth), avatar (useAvatarPersistence)
//   DIRECT (config): islands (DEFAULT_ISLANDS), routes (ISLAND_ROUTES)
//   COMPUTED:        userProgressMap (array→Record), unlockedIslands, totalProgress, completedCount
//   HOOK:            polarsternGoals (useActiveGoals), lootDueCount (useDueWords)
//   NAVIGATE:        onIslandClick, ships, widgets → useNavigate()
//   REMOVED:         Avatar (avataaars), InventoryModal, getCompanionImage, getItemById
//   HOOK:            learnstratData (useLearnstratProgress) → lerntechnikenCompleted, hasCertificate
//   TODO:            tagebuchEntries, companion (keine Datenquelle)
//

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useHeroData, useIslandProgress, useActiveGoals, useDueWords, useLearnstratProgress } from '@/hooks';
import { useAvatarPersistence } from '@/hooks/useAvatarPersistence';
import { DEFAULT_ISLANDS, getIslandRoute } from '@/config/islands';
import type { Island } from '@/types/legacy-ui';
import type { IslandProgress as IslandProgressDB } from '@/types/database';
import './illustrated-map.css';

// Karten-Hintergrund als Import (wird von Vite gebundelt)
import treasureMapBg from '@/assets/treasure-map-bg.png';

// Icons importieren — DIRECT: gleiche Icon-Namen wie im alten Code
import {
  GoldenKeyIcon,
  HattieWaageIcon,
  PolarsternIcon,
  LootIcon,
  DenkariumIcon,
  BaseCampIcon,
  FestungIcon,
  WerkzeugeIcon,
  VulkanIcon,
  MeisterBergIcon,
  BrueckenIcon,
  FaedenIcon,
  SpiegelSeeIcon,
  RuheOaseIcon,
  AusdauerGipfelIcon,
  FokusLeuchtturmIcon,
  WachstumGartenIcon,
  LehrerTurmIcon,
  WohlfuehlDorfIcon,
  SchutzBurgIcon,
  LerntechnikenIcon,
} from './icons';

// ─── Static Data (unchanged from old component) ─────────────────────────────

// Mapping: Insel-ID → Icon Komponente — DIRECT: 1:1 aus altem Code
const ISLAND_ICONS: Record<string, React.FC<{ size?: number; animated?: boolean; glowing?: boolean }>> = {
  'start': BaseCampIcon,
  'festung': FestungIcon,
  'werkzeuge': WerkzeugeIcon,
  'vulkan': VulkanIcon,
  'meister_berg': MeisterBergIcon,
  'bruecken': BrueckenIcon,
  'faeden': FaedenIcon,
  'spiegel_see': SpiegelSeeIcon,
  'ruhe_oase': RuheOaseIcon,
  'ausdauer_gipfel': AusdauerGipfelIcon,
  'fokus_leuchtturm': FokusLeuchtturmIcon,
  'wachstum_garten': WachstumGartenIcon,
  'lehrer_turm': LehrerTurmIcon,
  'wohlfuehl_dorf': WohlfuehlDorfIcon,
  'schutz_burg': SchutzBurgIcon,
};

// Insel-Positionen — DIRECT: 1:1 aus altem Code
const ISLAND_POSITIONS: Record<string, { x: number; y: number }> = {
  'start': { x: 28, y: 85 },
  'festung': { x: 35, y: 70 },
  'werkzeuge': { x: 32, y: 50 },
  'bruecken': { x: 42, y: 82 },
  'faeden': { x: 45, y: 58 },
  'spiegel_see': { x: 50, y: 75 },
  'vulkan': { x: 48, y: 38 },
  'ruhe_oase': { x: 55, y: 55 },
  'ausdauer_gipfel': { x: 58, y: 35 },
  'fokus_leuchtturm': { x: 62, y: 20 },
  'wachstum_garten': { x: 65, y: 48 },
  'lehrer_turm': { x: 68, y: 28 },
  'wohlfuehl_dorf': { x: 72, y: 62 },
  'schutz_burg': { x: 75, y: 42 },
  'meister_berg': { x: 70, y: 12 },
};

// Verbindungspfade — DIRECT: 1:1 aus altem Code
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
  ['lehrer_turm', 'meister_berg'],
];

// Status-Farben — DIRECT: 1:1 aus altem Code
const statusColors = {
  completed: '#22c55e',
  in_progress: '#fbbf24',
  available: '#3b82f6',
  locked: '#6b7280',
};

type QuestStatus = 'locked' | 'available' | 'in_progress' | 'completed';

// Tutorial-Inseln (nur Video + Erklärung) — DIRECT
const TUTORIAL_ISLANDS = ['start'];

// ─── UI-kompatibles IslandProgress (für QuestMarker) ────────────────────────
// Die DB hat IslandProgressDB (mit user_id, island_id, timestamps).
// QuestMarker braucht nur die 4 Booleans.

interface IslandProgressUI {
  video_watched: boolean;
  explanation_read: boolean;
  quiz_passed: boolean;
  challenge_completed: boolean;
}

type UserProgressMap = Record<string, IslandProgressUI>;

// ─── Hilfsfunktionen (unchanged from old component) ─────────────────────────

function getQuestStatus(progress?: IslandProgressUI, islandId?: string): QuestStatus {
  if (!progress) return 'available';

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

function getProgressPercent(progress?: IslandProgressUI, islandId?: string): number {
  if (!progress) return 0;

  const isTutorial = islandId && TUTORIAL_ISLANDS.includes(islandId);

  if (isTutorial) {
    let count = 0;
    if (progress.video_watched) count++;
    if (progress.explanation_read) count++;
    return (count / 2) * 100;
  }

  let count = 0;
  if (progress.video_watched) count++;
  if (progress.explanation_read) count++;
  if (progress.quiz_passed) count++;
  if (progress.challenge_completed) count++;
  return (count / 4) * 100;
}

// Organische Pfad-Generierung — DIRECT: 1:1 aus altem Code
const generateOrganicPath = (x1: number, y1: number, x2: number, y2: number): string => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const cx1 = x1 + dx * 0.25 + Math.sin(x1 * 0.1) * 5;
  const cy1 = y1 + dy * 0.25 - 8;
  const cx2 = x1 + dx * 0.75 - Math.cos(y1 * 0.1) * 5;
  const cy2 = y1 + dy * 0.75 + 5;
  return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
};

// ─── Sub-Components ──────────────────────────────────────────────────────────

// Quest-Marker — DIRECT: JSX 1:1 aus altem Code, nur onClick → navigate
interface QuestMarkerProps {
  island: Island;
  progress?: IslandProgressUI;
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
  onClick,
}) => {
  const status = !isUnlocked ? 'locked' : getQuestStatus(progress, island.id);
  const progressPercent = getProgressPercent(progress, island.id);
  const statusColor = statusColors[status];
  const position = ISLAND_POSITIONS[island.id] || { x: 50, y: 50 };
  const isLocked = status === 'locked';
  const hasSvgIcon = !isLocked && !!ISLAND_ICONS[island.id];

  return (
    <motion.div
      className={`quest-marker-illustrated ${hasSvgIcon ? 'has-svg-icon' : ''}`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
      data-tooltip={island.name}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: Math.random() * 0.3, type: 'spring', bounce: 0.4 }}
      whileHover={!isLocked ? { scale: 1.15 } : undefined}
      whileTap={!isLocked ? { scale: 0.95 } : undefined}
      onMouseEnter={() => onHover(island.id)}
      onMouseLeave={() => onHover(null)}
      onClick={!isLocked ? onClick : undefined}
    >
      {hasSvgIcon ? (
        <div className="svg-icon-container">
          {React.createElement(ISLAND_ICONS[island.id]!, { size: 56, animated: true, glowing: false })}
          {status === 'completed' && (
            <motion.span
              className="completion-star svg-completion-star"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              ⭐
            </motion.span>
          )}
        </div>
      ) : (
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
      )}

      {status === 'in_progress' && (
        <div className="progress-badge">{Math.round(progressPercent)}%</div>
      )}

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

// Schwimmendes Schiff — DIRECT: JSX 1:1 aus altem Code
interface FloatingShipProps {
  type: 'bandura' | 'hattie' | 'polarstern' | 'loot' | 'denkarium';
  onClick?: () => void;
  badge?: number;
}

const FloatingShip: React.FC<FloatingShipProps> = ({ type, onClick, badge }) => {
  const config = {
    bandura: {
      label: 'Goldener Schlüssel',
      title: 'Der goldene Schlüssel: Die 4 Quellen der Selbstwirksamkeit',
      duration: 4,
    },
    hattie: {
      label: 'Selbsteinschätzung',
      title: 'Selbsteinschätzung: Trainiere deine Fähigkeit, dich selbst einzuschätzen',
      duration: 3.5,
    },
    polarstern: {
      label: 'Polarstern',
      title: 'Dein Polarstern: Setze deine Ziele und Träume',
      duration: 3,
    },
    loot: {
      label: 'Lernkarten',
      title: 'Dein Loot: Lernkarten mit Spaced Repetition',
      duration: 3.2,
    },
    denkarium: {
      label: 'Denkarium',
      title: 'Denkarium: Dein Gehirn-Fitnessstudio',
      duration: 3.4,
    },
  };

  const shipConfig = config[type];

  return (
    <motion.div
      className={`floating-ship ${type}-ship`}
      onClick={onClick}
      initial={{ y: 0 }}
      animate={{
        y: [0, -8, 0],
        rotate: [-2, 2, -2],
      }}
      transition={{
        duration: shipConfig.duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
      title={shipConfig.title}
    >
      <div className="ship-icon-container">
        {type === 'bandura' && <GoldenKeyIcon size={56} animated={true} glowing={true} />}
        {type === 'hattie' && <HattieWaageIcon size={56} animated={true} glowing={true} />}
        {type === 'polarstern' && <PolarsternIcon size={64} animated={true} glowing={true} />}
        {type === 'loot' && <LootIcon size={56} animated={true} glowing={true} />}
        {type === 'denkarium' && <DenkariumIcon size={56} animated={true} glowing={true} />}
      </div>
      <div className="ship-label">{shipConfig.label}</div>
      {badge !== undefined && badge > 0 && (
        <div className="ship-badge">{badge}</div>
      )}
    </motion.div>
  );
};

// Verbindungspfade — angepasst auf UserProgressMap + string[] unlocked
interface ConnectionPathsProps {
  islands: Island[];
  userProgress: UserProgressMap;
  unlockedIslands: string[];
}

const ConnectionPaths: React.FC<ConnectionPathsProps> = ({
  islands,
  userProgress,
  unlockedIslands,
}) => {
  return (
    <svg className="connections-layer" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <clipPath id="map-clip">
          <rect x="0" y="0" width="100" height="100" />
        </clipPath>
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

      <g clipPath="url(#map-clip)">
        {PATH_CONNECTIONS.map(([fromId, toId], index) => {
          const fromPos = ISLAND_POSITIONS[fromId];
          const toPos = ISLAND_POSITIONS[toId];
          if (!fromPos || !toPos) return null;

          const fromProgress = userProgress[fromId];
          const toProgress = userProgress[toId];
          const fromStatus = getQuestStatus(fromProgress, fromId);
          const toStatus = !unlockedIslands.includes(toId)
            ? 'locked'
            : getQuestStatus(toProgress, toId);

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
      </g>
    </svg>
  );
};

// Legende — DIRECT: 1:1 aus altem Code
const MapLegend: React.FC = () => (
  <div className="map-legend">
    <div className="legend-items">
      <div className="legend-item">
        <span className="legend-icon">⭐</span>
        <span>Abgeschlossen</span>
      </div>
      <div className="legend-item">
        <span className="legend-icon">🔒</span>
        <span>Gesperrt</span>
      </div>
    </div>
  </div>
);

// ─── Hauptkomponente ─────────────────────────────────────────────────────────

export function WorldMapIllustrated() {
  const navigate = useNavigate();

  // ── Datenquellen (Hooks) ──────────────────────────────────────────────────
  const heroData = useHeroData();                              // SOURCE: useHeroData hook
  const { profile } = useAuth();                               // SOURCE: useAuth → profile.age_group
  const { data: progressArray = [] } = useIslandProgress();    // SOURCE: useIslandProgress → IslandProgressDB[]
  const { data: activeGoals = [] } = useActiveGoals();         // SOURCE: useActiveGoals → PolarsternGoal[]
  const { data: dueWords = [] } = useDueWords();               // SOURCE: useDueWords → WortschmiedeWordStat[]
  const { heroName } = useAvatarPersistence();                  // SOURCE: useAvatarPersistence
  const { data: learnstratData } = useLearnstratProgress();    // SOURCE: useLearnstratProgress
  const lerntechnikenCompleted = learnstratData?.completedCount ?? 0;
  const hasCertificate = learnstratData?.hasCertificate ?? false;

  // ── State ─────────────────────────────────────────────────────────────────
  const [hoveredIsland, setHoveredIsland] = useState<string | null>(null);

  // ── COMPUTED: IslandProgressDB[] → UserProgressMap (Record<islandId, booleans>) ──
  const userProgress = useMemo<UserProgressMap>(() => {
    const map: UserProgressMap = {};
    progressArray.forEach((p: IslandProgressDB) => {
      map[p.island_id] = {
        video_watched: p.video_watched,       // DIRECT: from DB
        explanation_read: p.explanation_read,  // DIRECT: from DB
        quiz_passed: p.quiz_passed,           // DIRECT: from DB
        challenge_completed: p.challenge_completed, // DIRECT: from DB
      };
    });
    return map;
  }, [progressArray]);

  // ── COMPUTED: Unlocked Islands ────────────────────────────────────────────
  // Logik: Start ist immer offen. Eine Insel ist offen wenn MINDESTENS eine
  // Vorgänger-Insel (via PATH_CONNECTIONS) abgeschlossen ist.
  // Sonderfall: 'start' ist immer unlocked.
  const unlockedIslands = useMemo<string[]>(() => {
    const unlocked = new Set<string>(['start']); // start ist immer offen

    // Iterativ: wenn eine Insel completed ist, werden ihre Nachfolger freigeschaltet
    let changed = true;
    while (changed) {
      changed = false;
      for (const [fromId, toId] of PATH_CONNECTIONS) {
        if (unlocked.has(fromId) && getQuestStatus(userProgress[fromId], fromId) === 'completed') {
          if (!unlocked.has(toId)) {
            unlocked.add(toId);
            changed = true;
          }
        }
      }
    }

    return Array.from(unlocked);
  }, [userProgress]);

  // ── COMPUTED: Polarstern-Badge = Anzahl aktiver Ziele ─────────────────────
  const polarsternGoals = activeGoals.length;                  // COMPUTED: from useActiveGoals

  // ── COMPUTED: Loot-Badge = Anzahl fälliger Lernkarten ─────────────────────
  const lootDueCount = dueWords.length;                        // COMPUTED: from useDueWords

  // ── COMPUTED: ageGroup from profile ───────────────────────────────────────
  const ageGroup = profile?.age_group ?? 'mittelstufe';        // DIRECT: profile.age_group, DEFAULT: mittelstufe

  // ── COMPUTED: Gesamtfortschritt ───────────────────────────────────────────
  const islands = DEFAULT_ISLANDS;                              // DIRECT: from config

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

  // ── COMPUTED: playerXP from heroData ──────────────────────────────────────
  const playerXP = heroData?.xp ?? 0;                          // DIRECT: from useHeroData

  // ── Navigation Handlers ───────────────────────────────────────────────────
  const handleIslandClick = (islandId: string) => {
    navigate(getIslandRoute(islandId));                         // NAVIGATE: island → route
  };

  return (
    <div className="world-map-illustrated-container">
      {/* Hero Status Panel */}
      <div className="hero-panel-illustrated">
        {/* TODO: Avatar-Karte entfernt — Avatar (avataaars) + getItemById nicht verfügbar.
            useAvatarPersistence hat customAvatar.visuals, aber die Avatar-Komponente aus
            'avataaars' ist kein Dependency im neuen Projekt. Wird separat integriert. */}

        {/* XP — kein Gold (Profile hat kein gold-Feld) */}
        <div className="player-stats-row">
          <div className="stat-item xp-stat">
            <span className="stat-icon">⭐</span>
            {/* DIRECT: heroData.xp from useHeroData */}
            <span className="stat-value">{playerXP} XP</span>
          </div>
          {/* TODO: Gold entfernt — Profile-Typ hat kein gold-Feld */}
        </div>

        {/* Gesamtfortschritt */}
        <div className="total-progress-illustrated">
          <div className="progress-label">
            <span>🗺️ Weltkarte erkundet</span>
            {/* COMPUTED: totalProgress from userProgress + islands */}
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
            {/* COMPUTED: completedCount from userProgress */}
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
              onClick={() => handleIslandClick(island.id)}
            />
          ))}

          {/* Roter Pfeil zum Startpunkt — DIRECT: 1:1 aus altem Code */}
          <div className="startpunkt-arrow">
            <div className="startpunkt-label">Startpunkt</div>
            <svg width="40" height="60" viewBox="0 0 40 60" className="arrow-svg">
              <defs>
                <linearGradient id="arrow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="50%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
              <path
                d="M20 0 L20 45 M10 35 L20 55 L30 35"
                stroke="url(#arrow-gradient)"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Schwimmende Schiffe — NAVIGATE: onClick → navigate */}
          <FloatingShip type="bandura" onClick={() => navigate('/karte/bandura')} />
          <FloatingShip type="hattie" onClick={() => navigate('/karte/hattie')} />
          <FloatingShip
            type="polarstern"
            onClick={() => navigate('/karte/polarstern')}
            badge={polarsternGoals}          /* COMPUTED: from useActiveGoals */
          />
          <FloatingShip
            type="loot"
            onClick={() => navigate('/karte/lernkarten')}
            badge={lootDueCount}             /* COMPUTED: from useDueWords */
          />
          <FloatingShip
            type="denkarium"
            onClick={() => navigate('/karte/denkarium')}
          />

          {/* TODO: Tagebuch-Widget entfernt — tagebuchEntries nicht in Hooks verfügbar.
              SuperheldenTagebuch war ageGroup === 'grundschule' only. */}

          {/* Lerntechniken-Widget — NAVIGATE: onClick → schatzkammer (Loci-System) */}
          <motion.div
            className="lerntechniken-widget-illustrated"
            onClick={() => navigate('/karte/schatzkammer')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="lerntechniken-icon-container">
              <LerntechnikenIcon size={56} animated={true} glowing={hasCertificate} />
            </div>
            <div className="lerntechniken-label">
              Lerntechniken {lerntechnikenCompleted > 0 && `${lerntechnikenCompleted}/7`}
            </div>
            {hasCertificate && <div className="lerntechniken-badge">🏅</div>}
          </motion.div>

          {/* Schatzkammer Widget — NAVIGATE */}
          <motion.div
            className="schatzkammer-widget-illustrated"
            onClick={() => navigate('/karte/schatzkammer')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="schatzkammer-widget-icon">🏛️</span>
            <span className="schatzkammer-widget-label">Schatzkammer</span>
          </motion.div>

          {/* TODO: Companion-Widget entfernt — companion nicht in aktuellen Hooks verfügbar
              (useHeroData hat kein companion-Feld, getCompanionImage nicht importiert) */}
        </div>
      </div>

      {/* REMOVED: InventoryModal — Item-Objekte nicht verfügbar in neuen Hooks */}
    </div>
  );
}

export { ISLAND_POSITIONS };
export default WorldMapIllustrated;

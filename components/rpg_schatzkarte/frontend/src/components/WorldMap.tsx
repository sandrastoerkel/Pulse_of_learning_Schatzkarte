// ============================================
// RPG Schatzkarte - World Map Component
// ============================================
import { useState, useMemo } from 'react';
import { Island, UserProgress, HeroData, AgeGroup, TagebuchEintrag } from '../types';
import { QuestMarker, getQuestStatus } from './QuestCard';
import { HeroStatus, InventoryModal } from './HeroStatus';

interface WorldMapProps {
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
}

// Vordefinierte Positionen für die Inseln auf der Weltkarte
// Anordnung wie eine Abenteuer-Reise von links nach rechts
const ISLAND_POSITIONS: Record<string, { x: number; y: number }> = {
  // Starthafen (links unten)
  'start': { x: 8, y: 75 },

  // Feste Inseln (Woche 1-4) - Pfad nach oben rechts
  'festung': { x: 15, y: 55 },
  'werkzeuge': { x: 22, y: 35 },
  'bruecken': { x: 30, y: 55 },
  'faeden': { x: 38, y: 40 },

  // Flexible Inseln (Woche 5-13) - Mittlerer Bereich
  'spiegel_see': { x: 45, y: 60 },
  'vulkan': { x: 52, y: 35 },
  'ruhe_oase': { x: 58, y: 70 },
  'ausdauer_gipfel': { x: 62, y: 45 },
  'fokus_leuchtturm': { x: 68, y: 25 },
  'wachstum_garten': { x: 72, y: 55 },
  'lehrer_turm': { x: 78, y: 35 },
  'wohlfuehl_dorf': { x: 82, y: 65 },
  'schutz_burg': { x: 85, y: 45 },

  // Finale - Berg der Meisterschaft (rechts oben)
  'meister_berg': { x: 92, y: 25 }
};

// Verbindungspfade zwischen den Inseln - folgt dem Abenteuer-Pfad
const PATH_CONNECTIONS = [
  // Vom Starthafen zu den festen Inseln
  ['start', 'festung'],
  ['festung', 'werkzeuge'],
  ['werkzeuge', 'bruecken'],
  ['bruecken', 'faeden'],
  // Von festen zu flexiblen Inseln
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
  // Zum Finale
  ['schutz_burg', 'meister_berg'],
  ['lehrer_turm', 'meister_berg']
];

export function WorldMap({
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
  onTagebuchToggle
}: WorldMapProps) {
  const [showInventory, setShowInventory] = useState(false);
  const [hoveredIsland, setHoveredIsland] = useState<string | null>(null);

  // Berechne Gesamtfortschritt
  const totalProgress = useMemo(() => {
    let completed = 0;
    islands.forEach(island => {
      const progress = userProgress[island.id];
      if (progress &&
          progress.video_watched &&
          progress.explanation_read &&
          progress.quiz_passed &&
          progress.challenge_completed) {
        completed++;
      }
    });
    return Math.round((completed / islands.length) * 100);
  }, [islands, userProgress]);

  // Erzeuge SVG-Pfade zwischen den Inseln
  const renderPaths = () => {
    return PATH_CONNECTIONS.map(([from, to], index) => {
      const fromPos = ISLAND_POSITIONS[from];
      const toPos = ISLAND_POSITIONS[to];

      if (!fromPos || !toPos) return null;

      // Prüfe ob beide Inseln freigeschaltet sind
      const fromUnlocked = unlockedIslands.includes(from);
      const toUnlocked = unlockedIslands.includes(to);
      const bothUnlocked = fromUnlocked && toUnlocked;

      // Prüfe ob der Pfad "aktiv" ist (beide abgeschlossen)
      const fromProgress = userProgress[from];
      const toProgress = userProgress[to];
      const fromCompleted = fromProgress &&
        fromProgress.video_watched &&
        fromProgress.explanation_read &&
        fromProgress.quiz_passed &&
        fromProgress.challenge_completed;
      const toCompleted = toProgress &&
        toProgress.video_watched &&
        toProgress.explanation_read &&
        toProgress.quiz_passed &&
        toProgress.challenge_completed;
      const pathActive = fromCompleted && toCompleted;

      return (
        <line
          key={index}
          className={`map-path ${bothUnlocked ? 'unlocked' : 'locked'} ${pathActive ? 'completed' : ''}`}
          x1={`${fromPos.x}%`}
          y1={`${fromPos.y}%`}
          x2={`${toPos.x}%`}
          y2={`${toPos.y}%`}
        />
      );
    });
  };

  return (
    <div className="world-map-container">
      {/* Hero Status Panel */}
      <div className="hero-panel">
        <HeroStatus
          hero={heroData}
          onInventoryClick={() => setShowInventory(true)}
        />

        {/* Gesamtfortschritt */}
        <div className="total-progress">
          <div className="progress-label">
            <span>🗺️ Weltkarte erkundet</span>
            <span>{totalProgress}%</span>
          </div>
          <div className="progress-bar large">
            <div
              className="progress-fill"
              style={{ width: `${totalProgress}%` }}
            ></div>
          </div>
          <div className="progress-detail">
            {islands.filter(i => {
              const p = userProgress[i.id];
              return p && p.video_watched && p.explanation_read &&
                     p.quiz_passed && p.challenge_completed;
            }).length} / {islands.length} Quests abgeschlossen
          </div>
        </div>
      </div>

      {/* Die Fantasy-Weltkarte */}
      <div className="world-map">
        {/* Hintergrund-Dekoration */}
        <div className="map-decorations">
          <div className="compass-rose">🧭</div>
          <div className="sea-monster monster-1">🐙</div>
          <div className="sea-monster monster-2">🐉</div>
          <div className="cloud cloud-1">☁️</div>
          <div className="cloud cloud-2">☁️</div>
        </div>

        {/* Challenge-Schiffe (schwimmen unabhaengig von Inseln) */}
        <div
          className="challenge-ship bandura-ship"
          onClick={onBanduraShipClick}
          title="Der goldene Schlüssel: Die 4 Quellen der Selbstwirksamkeit"
        >
          <div className="ship-body">
            <span className="ship-icon">🔑</span>
            <span className="ship-flag">✨</span>
          </div>
          <div className="ship-label">Goldener Schlüssel</div>
          <div className="ship-waves">〰️</div>
        </div>

        <div
          className="challenge-ship hattie-ship"
          onClick={onHattieShipClick}
          title="Superpower: Trainiere deine Selbsteinschätzung"
        >
          <div className="ship-body">
            <span className="ship-icon">💪</span>
            <span className="ship-flag">⭐</span>
          </div>
          <div className="ship-label">Superpower</div>
          <div className="ship-waves">〰️</div>
        </div>

        {/* Verbindungspfade */}
        <svg className="map-paths" viewBox="0 0 100 100" preserveAspectRatio="none">
          {renderPaths()}
        </svg>

        {/* Quest-Marker für jede Insel */}
        {islands.map(island => {
          const position = ISLAND_POSITIONS[island.id] || { x: 50, y: 50 };
          const isUnlocked = unlockedIslands.includes(island.id);

          return (
            <QuestMarker
              key={island.id}
              island={island}
              progress={userProgress[island.id]}
              isUnlocked={isUnlocked}
              position={position}
              onClick={() => onIslandClick(island.id)}
            />
          );
        })}

        {/* Aktuelle Quest Highlight */}
        {currentIsland && (
          <div
            className="current-quest-indicator"
            style={{
              left: `${ISLAND_POSITIONS[currentIsland]?.x || 50}%`,
              top: `${ISLAND_POSITIONS[currentIsland]?.y || 50}%`
            }}
          >
            <div className="indicator-ping"></div>
            <div className="indicator-label">Du bist hier!</div>
          </div>
        )}
      </div>

      {/* Legende */}
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-icon available">⚔️</span>
          <span>Verfügbar</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon in-progress">🔥</span>
          <span>In Arbeit</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon completed">⭐</span>
          <span>Abgeschlossen</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon locked">🔒</span>
          <span>Gesperrt</span>
        </div>
      </div>

      {/* Superhelden-Tagebuch Widget - NUR für Grundschule */}
      {ageGroup === 'grundschule' && onTagebuchToggle && (
        <div className="floating-tagebuch-widget" onClick={onTagebuchToggle}>
          <span className="tagebuch-icon">📓</span>
          {tagebuchEntries.length > 0 && (
            <span className="tagebuch-badge">{tagebuchEntries.length}</span>
          )}
          <span className="tagebuch-label">Mein Tagebuch</span>
        </div>
      )}

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

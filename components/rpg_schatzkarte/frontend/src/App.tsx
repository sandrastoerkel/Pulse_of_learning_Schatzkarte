// ============================================
// RPG Schatzkarte - Main App Component
// ============================================
import { useState, useEffect, useCallback } from 'react';
import {
  Streamlit,
  withStreamlitConnection,
  ComponentProps
} from 'streamlit-component-lib';
import { WorldMap } from './components/WorldMap';
import { QuestModal } from './components/QuestModal';
import { BanduraShipModal } from './components/BanduraShipModal';
import { HattieShipModal } from './components/HattieShipModal';
import { BanduraSourceId } from './content/banduraContent';
import {
  Island,
  UserProgress,
  HeroData,
  SchatzkartAction,
  AgeGroup
} from './types';
import './styles/rpg-theme.css';

// Standard-Held für Preview/Development
const DEFAULT_HERO: HeroData = {
  name: 'Lern-Held',
  avatar: 'warrior',
  level: 3,
  xp: 75,
  xp_to_next_level: 150,
  gold: 120,
  items: [
    { id: '1', name: 'Weisheits-Schwert', icon: '⚔️', rarity: 'rare', description: 'Ein magisches Schwert' },
    { id: '2', name: 'Lern-Schild', icon: '🛡️', rarity: 'common', description: 'Schützt vor Vergessen' }
  ],
  titles: ['Wissens-Sucher']
};

// Standard-Daten für Development - echte Inseln aus der App
const DEFAULT_ISLANDS: Island[] = [
  // Starthafen
  { id: 'start', name: 'Starthafen', icon: '🚢', color: '#4fc3f7', week: 0, treasures: [{ name: 'Kompass der Reise', icon: '🧭', xp: 20 }] },
  // Feste Inseln (Woche 1-4)
  { id: 'festung', name: 'Festung der Stärke', icon: '💪', color: '#ffb74d', week: 1, treasures: [{ name: 'Kleine Siege', icon: '💎', xp: 50 }, { name: 'Vorbilder', icon: '💎', xp: 50 }] },
  { id: 'werkzeuge', name: 'Insel der 7 Werkzeuge', icon: '🔧', color: '#81c784', week: 2, treasures: [{ name: 'Magische Tomate', icon: '🍅', xp: 50 }, { name: 'Erinnerungs-Spiegel', icon: '🔄', xp: 50 }] },
  { id: 'bruecken', name: 'Insel der Brücken', icon: '🌉', color: '#fff176', week: 3, treasures: [{ name: 'Teil weg = Minus', icon: '🌉', xp: 60 }] },
  { id: 'faeden', name: 'Insel der Fäden', icon: '🧵', color: '#ba68c8', week: 4, treasures: [{ name: 'Faden-Spule', icon: '🧵', xp: 50 }, { name: 'Netz-Karte', icon: '🕸', xp: 60 }] },
  // Flexible Inseln (Woche 5-13)
  { id: 'spiegel_see', name: 'Spiegel-See', icon: '🧠', color: '#90caf9', week: 5, treasures: [{ name: 'Spiegel der Erkenntnis', icon: '🪞', xp: 50 }] },
  { id: 'vulkan', name: 'Vulkan der Motivation', icon: '🔥', color: '#ef5350', week: 6, treasures: [{ name: 'Freiheits-Flamme', icon: '🔥', xp: 50 }] },
  { id: 'ruhe_oase', name: 'Ruhe-Oase', icon: '😌', color: '#80deea', week: 7, treasures: [{ name: 'Atem-Brunnen', icon: '🌬', xp: 50 }] },
  { id: 'ausdauer_gipfel', name: 'Ausdauer-Gipfel', icon: '🏆', color: '#ffcc80', week: 8, treasures: [{ name: 'Kletter-Seil', icon: '🧗', xp: 50 }] },
  { id: 'fokus_leuchtturm', name: 'Fokus-Leuchtturm', icon: '🎯', color: '#ffab91', week: 9, treasures: [{ name: 'Fokus-Licht', icon: '💡', xp: 50 }] },
  { id: 'wachstum_garten', name: 'Wachstums-Garten', icon: '🌱', color: '#c5e1a5', week: 10, treasures: [{ name: 'Das Wort NOCH', icon: '🌱', xp: 50 }] },
  { id: 'lehrer_turm', name: 'Lehrer-Turm', icon: '🏫', color: '#b39ddb', week: 11, treasures: [{ name: 'Frage-Schlüssel', icon: '❓', xp: 50 }] },
  { id: 'wohlfuehl_dorf', name: 'Wohlfühl-Dorf', icon: '🏠', color: '#a5d6a7', week: 12, treasures: [{ name: 'Mein Platz', icon: '🏡', xp: 50 }] },
  { id: 'schutz_burg', name: 'Schutz-Burg', icon: '🛡', color: '#f48fb1', week: 13, treasures: [{ name: 'Grenzen-Schild', icon: '🛡', xp: 50 }] },
  // Finale
  { id: 'meister_berg', name: 'Berg der Meisterschaft', icon: '⛰️', color: '#ffd700', week: 14, treasures: [{ name: 'Meister-Krone', icon: '👑', xp: 500 }] }
];

// Demo-Fortschritt
const DEFAULT_PROGRESS: UserProgress = {
  'start': { video_watched: true, explanation_read: true, quiz_passed: true, challenge_completed: true, treasures_collected: ['Kompass der Reise'] },
  'festung': { video_watched: true, explanation_read: true, quiz_passed: true, challenge_completed: true, treasures_collected: ['Kleine Siege'] },
  'werkzeuge': { video_watched: true, explanation_read: true, quiz_passed: false, challenge_completed: false, treasures_collected: [] },
  'bruecken': { video_watched: false, explanation_read: false, quiz_passed: false, challenge_completed: false, treasures_collected: [] }
};

// Prüfe ob wir im Development-Modus sind (nicht in Streamlit)
const isDevelopment = !window.frameElement;

// Die eigentliche Komponenten-Logik
function RPGSchatzkarteContent({
  islands,
  userProgress,
  heroData,
  unlockedIslands,
  currentIsland,
  ageGroup,
  onAction
}: {
  islands: Island[];
  userProgress: UserProgress;
  heroData: HeroData;
  unlockedIslands: string[];
  currentIsland: string | null;
  ageGroup: AgeGroup;
  onAction?: (action: SchatzkartAction) => void;
}) {
  const [selectedIsland, setSelectedIsland] = useState<Island | null>(null);
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [showBanduraModal, setShowBanduraModal] = useState(false);
  const [showHattieModal, setShowHattieModal] = useState(false);
  const [banduraCompletedToday, setBanduraCompletedToday] = useState<BanduraSourceId[]>([]);

  const handleIslandClick = useCallback((islandId: string) => {
    const island = islands.find(i => i.id === islandId);
    if (island) {
      setSelectedIsland(island);
      setShowQuestModal(true);
    }
  }, [islands]);

  const handleQuestComplete = useCallback((
    questType: string,
    xpEarned: number,
    goldEarned?: number,
    itemId?: string
  ) => {
    if (!selectedIsland) return;

    const action: SchatzkartAction = {
      action: 'quest_completed',
      islandId: selectedIsland.id,
      questType: questType as any,
      xpEarned,
      goldEarned,
      itemId
    };

    if (onAction) onAction(action);
    console.log('Quest completed:', action);
  }, [selectedIsland, onAction]);

  const handleTreasureCollected = useCallback((treasureId: string, xp: number) => {
    if (!selectedIsland) return;

    const action: SchatzkartAction = {
      action: 'treasure_collected',
      islandId: selectedIsland.id,
      treasureId,
      xpEarned: xp
    };

    if (onAction) onAction(action);
    console.log('Treasure collected:', action);
  }, [selectedIsland, onAction]);

  const handleCloseModal = useCallback(() => {
    setShowQuestModal(false);
    setSelectedIsland(null);
  }, []);

  // Bandura Ship Modal handlers
  const handleBanduraShipClick = useCallback(() => {
    setShowBanduraModal(true);
  }, []);

  const handleBanduraEntry = useCallback((
    sourceId: BanduraSourceId,
    description: string,
    xp: number
  ) => {
    setBanduraCompletedToday(prev => [...prev, sourceId]);
    if (onAction) {
      onAction({
        action: 'bandura_entry',
        islandId: 'bandura_ship',
        xpEarned: xp,
        banduraSource: sourceId,
        description
      });
    }
    console.log('Bandura entry:', { sourceId, description, xp });
  }, [onAction]);

  // Hattie Ship Modal handlers
  const handleHattieShipClick = useCallback(() => {
    setShowHattieModal(true);
  }, []);

  const handleHattieEntry = useCallback((
    entry: { subject: string; task: string; prediction: number; result?: number; reflection?: string },
    xp: number
  ) => {
    if (onAction) {
      onAction({
        action: 'hattie_entry',
        islandId: 'hattie_ship',
        xpEarned: xp,
        description: `${entry.task}: ${entry.prediction}% -> ${entry.result}%`
      });
    }
    console.log('Hattie entry:', { entry, xp });
  }, [onAction]);

  return (
    <div className="rpg-schatzkarte">
      <header className="app-header">
        <h1 className="app-title">
          <span className="title-icon">🗺️</span>
          Lern-Abenteuer Weltkarte
          <span className="title-decoration">⚔️</span>
        </h1>
        <p className="app-subtitle">
          Erkunde die Welt des Wissens und werde zum Lern-Meister!
        </p>
      </header>

      <WorldMap
        islands={islands}
        userProgress={userProgress}
        heroData={heroData}
        unlockedIslands={unlockedIslands}
        currentIsland={currentIsland}
        onIslandClick={handleIslandClick}
        onBanduraShipClick={handleBanduraShipClick}
        onHattieShipClick={handleHattieShipClick}
      />

      {showQuestModal && selectedIsland && (
        <QuestModal
          island={selectedIsland}
          progress={userProgress[selectedIsland.id]}
          isOpen={showQuestModal}
          ageGroup={ageGroup}
          onClose={handleCloseModal}
          onQuestComplete={handleQuestComplete}
          onTreasureCollected={handleTreasureCollected}
        />
      )}

      {/* Bandura Ship Modal */}
      <BanduraShipModal
        isOpen={showBanduraModal}
        completedToday={banduraCompletedToday}
        onClose={() => setShowBanduraModal(false)}
        onEntrySubmit={handleBanduraEntry}
      />

      {/* Hattie Ship Modal */}
      <HattieShipModal
        isOpen={showHattieModal}
        onClose={() => setShowHattieModal(false)}
        onEntrySubmit={handleHattieEntry}
      />

      <footer className="app-footer">
        <div className="tip-of-the-day">
          <span className="tip-icon">💡</span>
          <span className="tip-text">
            Tipp: Schließe alle Quests einer Insel ab, um Bonus-XP zu erhalten!
          </span>
        </div>
      </footer>
    </div>
  );
}

// Verfügbare Themes
type ThemeType = 'rpg' | 'nintendo' | 'duolingo' | 'space';

const THEMES: { id: ThemeType; name: string; icon: string }[] = [
  { id: 'rpg', name: 'RPG Fantasy', icon: '⚔️' },
  { id: 'nintendo', name: 'Nintendo Style', icon: '🎮' },
  { id: 'duolingo', name: 'Duolingo Style', icon: '🦉' },
  { id: 'space', name: 'Weltraum', icon: '🚀' }
];

// Theme aus localStorage laden
function loadSavedTheme(): ThemeType {
  try {
    const saved = localStorage.getItem('schatzkarte_theme');
    if (saved && THEMES.some(t => t.id === saved)) {
      return saved as ThemeType;
    }
  } catch (e) {
    // localStorage nicht verfügbar
  }
  return 'rpg';
}

// Theme in localStorage speichern
function saveTheme(theme: ThemeType) {
  try {
    localStorage.setItem('schatzkarte_theme', theme);
  } catch (e) {
    // localStorage nicht verfügbar
  }
}

// Theme-Switcher Komponente
function ThemeSwitcher({
  currentTheme,
  onThemeChange
}: {
  currentTheme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="theme-switcher-container">
      <button
        className="theme-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Design ändern"
      >
        🎨
      </button>

      {isOpen && (
        <div className="theme-dropdown">
          <div className="theme-dropdown-header">Design wählen</div>
          {THEMES.map(theme => (
            <button
              key={theme.id}
              className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
              onClick={() => {
                onThemeChange(theme.id);
                saveTheme(theme.id);
                setIsOpen(false);
              }}
            >
              <span className="theme-icon">{theme.icon}</span>
              <span className="theme-name">{theme.name}</span>
              {currentTheme === theme.id && <span className="theme-check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Streamlit-Wrapper Komponente
function RPGSchatzkarteStreamlit({ args }: ComponentProps) {
  const islands: Island[] = args?.islands || DEFAULT_ISLANDS;
  const userProgress: UserProgress = args?.userProgress || {};
  const heroData: HeroData = args?.heroData || DEFAULT_HERO;
  const unlockedIslands: string[] = args?.unlockedIslands || ['motivation'];
  const currentIsland: string | null = args?.currentIsland || null;
  const ageGroup: AgeGroup = args?.ageGroup || 'unterstufe';
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(loadSavedTheme);

  useEffect(() => {
    Streamlit.setFrameHeight(700);
  }, []);

  const handleAction = useCallback((action: SchatzkartAction) => {
    Streamlit.setComponentValue(action);
  }, []);

  return (
    <div className={`theme-${currentTheme}`}>
      <ThemeSwitcher
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
      />
      <RPGSchatzkarteContent
        islands={islands}
        userProgress={userProgress}
        heroData={heroData}
        unlockedIslands={unlockedIslands}
        currentIsland={currentIsland}
        ageGroup={ageGroup}
        onAction={handleAction}
      />
    </div>
  );
}

// Development-Modus Komponente (ohne Streamlit)
function RPGSchatzkarteDev() {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(loadSavedTheme);
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('unterstufe');

  // Mehr Inseln freigeschaltet für Demo
  const unlockedIslands = ['start', 'festung', 'werkzeuge', 'bruecken', 'faeden', 'spiegel_see', 'vulkan', 'ruhe_oase'];

  return (
    <div className={`theme-${currentTheme}`}>
      <ThemeSwitcher
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
      />

      {/* Altersstufen-Auswahl für Dev */}
      <div className="dev-age-selector">
        <label>Altersstufe: </label>
        <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}>
          <option value="grundschule">Grundschule</option>
          <option value="unterstufe">Unterstufe</option>
          <option value="mittelstufe">Mittelstufe</option>
        </select>
      </div>

      <RPGSchatzkarteContent
        islands={DEFAULT_ISLANDS}
        userProgress={DEFAULT_PROGRESS}
        heroData={DEFAULT_HERO}
        unlockedIslands={unlockedIslands}
        currentIsland="werkzeuge"
        ageGroup={ageGroup}
      />
    </div>
  );
}

// Export: Streamlit-Version oder Dev-Version je nach Umgebung
const StreamlitComponent = withStreamlitConnection(RPGSchatzkarteStreamlit);

export default function App() {
  if (isDevelopment) {
    return <RPGSchatzkarteDev />;
  }
  return <StreamlitComponent />;
}

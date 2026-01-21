// ============================================
// RPG Schatzkarte - Main App Component
// ============================================
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Streamlit,
  withStreamlitConnection,
  ComponentProps
} from 'streamlit-component-lib';
import { WorldMapIllustrated } from './components/WorldMapIllustrated';
import { QuestModal } from './components/QuestModal';
import { BanduraShipModal } from './components/BanduraShipModal';
import { HattieShipModal } from './components/HattieShipModal';
import { SuperheldenTagebuch, TagebuchEintrag } from './components/SuperheldenTagebuch';
import { UebersichtModal } from './components/LerntechnikenUebersicht';
import { ZertifikatStandalone } from './components/LerntechnikenZertifikat';
import { PowertechnikenProgress, TechniqueKey } from './components/powertechnikenTypes';
import { BanduraSourceId } from './content/banduraContent';
import { BanduraEntry, BanduraStats, DEFAULT_BANDURA_STATS } from './banduraTypes';
import { HattieEntry, HattieStats } from './hattieTypes';
import {
  Island,
  UserProgress,
  HeroData,
  SchatzkartAction,
  AgeGroup,
  CompanionType
} from './types';
import { CompanionSelector } from './components/CompanionSelector';
import { Lernbegleiter, LernkonText } from './components/Lernbegleiter';
import { AvatarCreator } from './components/AvatarCreator';
import { AvatarDisplay } from './components/AvatarDisplay';
import { AvatarShop } from './components/AvatarShop';
import { CustomAvatar, ShopItem, ItemSlot } from './types';
import { DEFAULT_AVATAR_VISUALS } from './components/AvatarParts';
import './styles/rpg-theme.css';
import './styles/avatar.css';
import './styles/bandura-challenge.css';
import './styles/hattie-challenge.css';
import './styles/superhelden-tagebuch.css';
import './styles/brainy.css';
import { Brainy } from './components/Brainy';
import { LandingPageV5 } from './components/LandingPageV5';
import { MemoryGame, RewardModal, MiniGameSelector } from './components/MiniGames';
import { RunnerGame } from './components/MiniGames/Runner/RunnerGame';
import { TestPanel } from './components/TestPanel';
import type { GameResult } from './types/games';
import type { GameResult as RunnerGameResult } from './components/MiniGames/Runner/RunnerEngine';

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
  // Base Camp
  { id: 'start', name: 'Base Camp', icon: '🏕️', color: '#4fc3f7', week: 0, treasures: [{ name: 'Kompass der Reise', icon: '🧭', xp: 20 }] },
  // Feste Inseln (Woche 1-4)
  { id: 'festung', name: 'Mental stark', icon: '💪', color: '#ffb74d', week: 1, treasures: [{ name: 'Kleine Siege', icon: '💎', xp: 50 }, { name: 'Vorbilder', icon: '💎', xp: 50 }] },
  { id: 'werkzeuge', name: 'Cleverer lernen', icon: '📚', color: '#81c784', week: 2, treasures: [{ name: 'Magische Tomate', icon: '🍅', xp: 50 }, { name: 'Erinnerungs-Spiegel', icon: '🔄', xp: 50 }] },
  { id: 'bruecken', name: 'Transferlernen', icon: '🌉', color: '#fff176', week: 3, treasures: [{ name: 'Teil weg = Minus', icon: '🌉', xp: 60 }] },
  { id: 'faeden', name: 'Station der Fäden', icon: '🧵', color: '#ba68c8', week: 4, treasures: [{ name: 'Faden-Spule', icon: '🧵', xp: 50 }, { name: 'Netz-Karte', icon: '🕸', xp: 60 }] },
  // Flexible Inseln (Woche 5-13)
  { id: 'spiegel_see', name: 'Über dein Lernen nachdenken', icon: '🧠', color: '#90caf9', week: 5, treasures: [{ name: 'Spiegel der Erkenntnis', icon: '🪞', xp: 50 }] },
  { id: 'vulkan', name: 'Was dich antreibt', icon: '🔥', color: '#ef5350', week: 6, treasures: [{ name: 'Freiheits-Flamme', icon: '🔥', xp: 50 }] },
  { id: 'ruhe_oase', name: 'Weniger Stress beim Lernen', icon: '😌', color: '#80deea', week: 7, treasures: [{ name: 'Atem-Brunnen', icon: '🌬', xp: 50 }] },
  { id: 'ausdauer_gipfel', name: 'Länger dranbleiben können', icon: '🏆', color: '#ffcc80', week: 8, treasures: [{ name: 'Kletter-Seil', icon: '🧗', xp: 50 }] },
  { id: 'fokus_leuchtturm', name: 'Fokus halten', icon: '🎯', color: '#ffab91', week: 9, treasures: [{ name: 'Fokus-Licht', icon: '💡', xp: 50 }] },
  { id: 'wachstum_garten', name: 'Glauben, dass du wachsen kannst', icon: '🌱', color: '#c5e1a5', week: 10, treasures: [{ name: 'Das Wort NOCH', icon: '🌱', xp: 50 }] },
  { id: 'lehrer_turm', name: 'Besser mit Lehrern klarkommen', icon: '🏫', color: '#b39ddb', week: 11, treasures: [{ name: 'Frage-Schlüssel', icon: '❓', xp: 50 }] },
  { id: 'wohlfuehl_dorf', name: 'Dich in der Schule wohlfühlen', icon: '🏠', color: '#a5d6a7', week: 12, treasures: [{ name: 'Mein Platz', icon: '🏡', xp: 50 }] },
  { id: 'schutz_burg', name: 'Wenn andere dich fertig machen', icon: '🛡', color: '#f48fb1', week: 13, treasures: [{ name: 'Grenzen-Schild', icon: '🛡', xp: 50 }] },
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

// Reward Types für TestPanel
type RewardType = 'game_won' | 'game_lost' | 'achievement' | 'level_up' | 'island_complete';

// Die eigentliche Komponenten-Logik
function RPGSchatzkarteContent({
  islands,
  userProgress: initialProgress,
  heroData,
  unlockedIslands: initialUnlockedIslands,
  currentIsland,
  ageGroup: initialAgeGroup,
  isAdmin = false,
  onAction,
  onProgressChange,
  onUnlockedIslandsChange,
  autoOpenIsland,
  autoOpenPhase
}: {
  islands: Island[];
  userProgress: UserProgress;
  heroData: HeroData;
  unlockedIslands: string[];
  currentIsland: string | null;
  ageGroup: AgeGroup;
  isAdmin?: boolean;
  onAction?: (action: SchatzkartAction) => void;
  onProgressChange?: (progress: UserProgress) => void;
  onUnlockedIslandsChange?: (islands: string[]) => void;
  autoOpenIsland?: string | null;
  autoOpenPhase?: string | null;
}) {
  // Lokaler State für TestPanel-Manipulationen
  const [userProgress, setUserProgress] = useState<UserProgress>(initialProgress);
  const [unlockedIslands, setUnlockedIslands] = useState<string[]>(initialUnlockedIslands);
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(initialAgeGroup);
  const [playerLevel, setPlayerLevel] = useState(heroData.level);
  const [selectedIsland, setSelectedIsland] = useState<Island | null>(null);
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [initialIslandPhase, setInitialIslandPhase] = useState<string | null>(null);  // Phase für Auto-Open
  const [showBanduraModal, setShowBanduraModal] = useState(false);
  const [showHattieModal, setShowHattieModal] = useState(false);
  const [banduraCompletedToday, setBanduraCompletedToday] = useState<BanduraSourceId[]>([]);

  // Bandura Challenge State
  const [banduraEntries, setBanduraEntries] = useState<BanduraEntry[]>([]);
  const [banduraStats, setBanduraStats] = useState<BanduraStats>(DEFAULT_BANDURA_STATS);

  // Hattie Challenge State
  const [hattieEntries, setHattieEntries] = useState<HattieEntry[]>([]);
  const [hattieStats, setHattieStats] = useState<HattieStats>({
    total_entries: 0,
    pending_entries: 0,
    completed_entries: 0,
    exceeded_count: 0,
    exact_count: 0,
    success_rate: 0,
    accuracy_rate: 0,
    avg_difference: 0,
    current_streak: 0,
    longest_streak: 0,
    best_subject: null,
    entries_per_subject: {},
    total_xp: 0,
    level: 1
  });

  // Superhelden-Tagebuch State (nur Grundschule)
  const [tagebuchEntries, setTagebuchEntries] = useState<TagebuchEintrag[]>([]);
  const [showTagebuch, setShowTagebuch] = useState(false);

  // Lerntechniken-Übersicht State
  const [showLerntechnikenModal, setShowLerntechnikenModal] = useState(false);
  const [showZertifikat, setShowZertifikat] = useState(false);

  // Polarstern Modal State
  const [showPolarsternModal, setShowPolarsternModal] = useState(false);

  // Companion Selector State
  const [showCompanionSelector, setShowCompanionSelector] = useState(false);
  const [selectedCompanion, setSelectedCompanion] = useState<CompanionType | undefined>(heroData.companion);
  const [companionMinimized, setCompanionMinimized] = useState(false);

  // Avatar Creator State
  const [showAvatarCreator, setShowAvatarCreator] = useState(false);
  const [customAvatar, setCustomAvatar] = useState<CustomAvatar | null>(() => {
    // Lade gespeicherten Avatar aus localStorage
    try {
      const saved = localStorage.getItem('schatzkarte_custom_avatar');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [heroNameFromAvatar, setHeroNameFromAvatar] = useState<string>(() => {
    try {
      return localStorage.getItem('schatzkarte_hero_name') || '';
    } catch {
      return '';
    }
  });

  // Memory Game State
  const [showMemoryGame, setShowMemoryGame] = useState(false);
  // Runner Game State
  const [showRunnerGame, setShowRunnerGame] = useState(false);
  const [playerXP, setPlayerXP] = useState(heroData.xp);
  const [playerGold, setPlayerGold] = useState(heroData.gold);

  // RewardModal State
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardType, setRewardType] = useState<RewardType>('game_won');
  const [currentGameResult, setCurrentGameResult] = useState<GameResult | null>(null);

  // MiniGameSelector State
  const [showMiniGameSelector, setShowMiniGameSelector] = useState(false);

  // Avatar Shop State
  const [showAvatarShop, setShowAvatarShop] = useState(false);
  const [ownedItems, setOwnedItems] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('schatzkarte_owned_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });


  // Zeige Avatar Creator automatisch beim ersten Besuch (kein Avatar vorhanden)
  useEffect(() => {
    // Prüfe ob Avatar existiert
    const hasAvatar = customAvatar !== null;
    console.log('Avatar Check:', { hasAvatar, customAvatar, showAvatarCreator });

    if (!hasAvatar && !showAvatarCreator) {
      // Kleiner Delay für bessere UX
      const timer = setTimeout(() => {
        console.log('Opening Avatar Creator automatically...');
        setShowAvatarCreator(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [customAvatar, showAvatarCreator]);

  // Auto-Open Island (z.B. nach Rückkehr von Polarstern)
  useEffect(() => {
    if (autoOpenIsland) {
      const island = islands.find(i => i.id === autoOpenIsland);
      if (island) {
        console.log('Auto-opening island:', autoOpenIsland, 'with phase:', autoOpenPhase);
        setSelectedIsland(island);
        setInitialIslandPhase(autoOpenPhase || null);  // Phase setzen (z.B. 'ready' für Base Camp)
        setShowQuestModal(true);
        // Bestätigung an Streamlit senden, dass die Insel geöffnet wurde
        if (onAction) {
          onAction({
            action: 'auto_open_handled',
            islandId: autoOpenIsland
          });
        }
      }
    }
  }, [autoOpenIsland, autoOpenPhase, islands, onAction]);

  // Kontext für Lernbegleiter-Tipps ermitteln
  const currentLernkontext: LernkonText = useMemo(() => {
    if (showBanduraModal) return 'bandura';
    if (showHattieModal) return 'hattie';
    if (showTagebuch) return 'success';
    if (selectedIsland) {
      return `island_${selectedIsland.id}` as LernkonText;
    }
    return 'map';
  }, [showBanduraModal, showHattieModal, showTagebuch, selectedIsland]);
  const [powertechnikenProgress, setPowertechnikenProgress] = useState<PowertechnikenProgress>({
    completedTechniques: [],
    applications: {} as Record<TechniqueKey, string>
  });
  // Direkt zur Challenge springen wenn über Lerntechniken-Widget geöffnet
  const [startWerkzeugeWithChallenge, setStartWerkzeugeWithChallenge] = useState(false);

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

    // XP und Gold lokal aktualisieren
    if (xpEarned > 0) {
      setPlayerXP(prev => prev + xpEarned);
    }
    if (goldEarned && goldEarned > 0) {
      setPlayerGold(prev => prev + goldEarned);
    }

    // Lokalen Progress basierend auf questType aktualisieren
    const questTypeToProgressKey: Record<string, keyof typeof userProgress[string]> = {
      'wisdom': 'video_watched',
      'scroll': 'explanation_read',
      'battle': 'quiz_passed',
      'challenge': 'challenge_completed'
    };

    const progressKey = questTypeToProgressKey[questType];
    if (progressKey) {
      setUserProgress(prev => {
        const currentProgress = prev[selectedIsland.id] || {
          video_watched: false,
          explanation_read: false,
          quiz_passed: false,
          challenge_completed: false,
          treasures_collected: []
        };
        const newProgress = {
          ...prev,
          [selectedIsland.id]: {
            ...currentProgress,
            [progressKey]: true
          }
        };
        onProgressChange?.(newProgress);
        return newProgress;
      });
    }

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
  }, [selectedIsland, onAction, onProgressChange]);

  const handleTreasureCollected = useCallback((treasureId: string, xp: number) => {
    if (!selectedIsland) return;

    // XP lokal aktualisieren
    if (xp > 0) {
      setPlayerXP(prev => prev + xp);
    }

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
    setStartWerkzeugeWithChallenge(false); // Reset Challenge-Start-Flag
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

    // Neuen Eintrag erstellen und zu State hinzufügen
    const newEntry: BanduraEntry = {
      id: `bandura-${Date.now()}`,
      source_type: sourceId,
      description,
      created_at: new Date().toISOString(),
      xp_earned: xp
    };
    setBanduraEntries(prev => [newEntry, ...prev]);

    // Stats aktualisieren
    setBanduraStats(prev => {
      const newEntriesPerSource = { ...prev.entries_per_source };
      newEntriesPerSource[sourceId] = (newEntriesPerSource[sourceId] || 0) + 1;
      const newTotalXp = prev.total_xp + xp;
      const newLevel = Math.floor(newTotalXp / 100) + 1;

      return {
        ...prev,
        total_entries: prev.total_entries + 1,
        entries_per_source: newEntriesPerSource,
        total_xp: newTotalXp,
        level: newLevel,
        current_streak: prev.current_streak + 1
      };
    });

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

  // Polarstern Click Handler - sendet Action an Streamlit
  const handlePolarsternClick = useCallback(() => {
    if (onAction) {
      onAction({
        action: 'polarstern_clicked',
        islandId: 'polarstern',
        sourceIsland: selectedIsland?.id || null  // Merken woher der User kam
      });
    } else {
      // Dev-Modus ohne Streamlit: Placeholder anzeigen
      setShowPolarsternModal(true);
    }
    console.log('Polarstern clicked from:', selectedIsland?.id);
  }, [onAction, selectedIsland]);

  // Neue Vorhersage anlegen (pending)
  const handleNewPrediction = useCallback((
    entry: Omit<HattieEntry, 'id' | 'created_at'>
  ) => {
    const newEntry: HattieEntry = {
      ...entry,
      id: `hattie-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setHattieEntries(prev => [newEntry, ...prev]);

    // Stats für pending aktualisieren
    setHattieStats(prev => ({
      ...prev,
      total_entries: prev.total_entries + 1,
      pending_entries: prev.pending_entries + 1
    }));

    if (onAction) {
      onAction({
        action: 'hattie_prediction',
        islandId: 'hattie_ship',
        description: `Neue Vorhersage: ${entry.task} - ${entry.prediction}`
      });
    }
    console.log('New Hattie prediction:', entry);
  }, [onAction]);

  // Ergebnis für offene Vorhersage eintragen
  const handleCompleteEntry = useCallback((
    entryId: string,
    result: number,
    reflection?: string
  ) => {
    setHattieEntries(prev => prev.map(entry => {
      if (entry.id !== entryId) return entry;

      // Berechne ob übertroffen
      let exceeded = false;
      if (entry.predictionType === 'note') {
        exceeded = result < entry.prediction;
      } else {
        exceeded = result > entry.prediction;
      }

      const difference = entry.predictionType === 'note'
        ? entry.prediction - result
        : result - entry.prediction;

      // XP berechnen
      let xp = 15; // base
      if (exceeded) xp += 25;
      if (result === entry.prediction) xp += 15;
      if (entry.task.length > 50) xp += 5;
      if (reflection && reflection.length > 20) xp += 5;

      return {
        ...entry,
        status: 'completed' as const,
        result,
        exceeded,
        difference,
        reflection,
        xp_earned: xp,
        completed_at: new Date().toISOString()
      };
    }));

    // Stats aktualisieren
    setHattieStats(prev => {
      const completedEntry = hattieEntries.find(e => e.id === entryId);
      if (!completedEntry) return prev;

      let exceeded = false;
      if (completedEntry.predictionType === 'note') {
        exceeded = result < completedEntry.prediction;
      } else {
        exceeded = result > completedEntry.prediction;
      }

      let xp = 15;
      if (exceeded) xp += 25;
      if (result === completedEntry.prediction) xp += 15;

      const newTotalXp = prev.total_xp + xp;
      const newLevel = Math.floor(newTotalXp / 100) + 1;
      const newExceededCount = exceeded ? prev.exceeded_count + 1 : prev.exceeded_count;
      const newCompletedEntries = prev.completed_entries + 1;

      return {
        ...prev,
        pending_entries: prev.pending_entries - 1,
        completed_entries: newCompletedEntries,
        exceeded_count: newExceededCount,
        success_rate: newCompletedEntries > 0 ? (newExceededCount / newCompletedEntries) * 100 : 0,
        total_xp: newTotalXp,
        level: newLevel,
        current_streak: exceeded ? prev.current_streak + 1 : 0,
        longest_streak: exceeded
          ? Math.max(prev.longest_streak, prev.current_streak + 1)
          : prev.longest_streak
      };
    });

    if (onAction) {
      const entry = hattieEntries.find(e => e.id === entryId);
      onAction({
        action: 'hattie_complete',
        islandId: 'hattie_ship',
        xpEarned: 15, // Wird oben genauer berechnet
        description: entry ? `${entry.task}: ${entry.prediction} -> ${result}` : 'Hattie abgeschlossen'
      });
    }
    console.log('Hattie entry completed:', { entryId, result, reflection });
  }, [onAction, hattieEntries]);

  // Superhelden-Tagebuch Handler
  const handleTagebuchEntry = useCallback((entry: TagebuchEintrag) => {
    setTagebuchEntries(prev => [entry, ...prev]);

    if (onAction) {
      onAction({
        action: 'tagebuch_entry',
        tagebuchEntry: entry,
        xpEarned: entry.warEsSchwer === 'schwer' ? 20 : entry.warEsSchwer === 'mittel' ? 15 : 10
      });
    }
    console.log('Tagebuch entry:', entry);
  }, [onAction]);

  const handleTagebuchToggle = useCallback(() => {
    setShowTagebuch(prev => !prev);
  }, []);

  // Lerntechniken-Übersicht Handler - Direkt zur Challenge der 7 Werkzeuge
  const handleLerntechnikenClick = useCallback(() => {
    // Wenn alle 7 Techniken abgeschlossen und Zertifikat verdient, zeige Zertifikat
    if (powertechnikenProgress.completedTechniques.length === 7) {
      setShowZertifikat(true);
    } else {
      // Direkt zur Challenge "Cleverer lernen" navigieren
      setStartWerkzeugeWithChallenge(true);
      handleIslandClick('werkzeuge');
    }
  }, [powertechnikenProgress.completedTechniques.length, handleIslandClick]);

  // Companion Selection Handler
  const handleCompanionSelect = useCallback((companionId: CompanionType) => {
    setSelectedCompanion(companionId);
    if (onAction) {
      onAction({
        action: 'companion_selected',
        companionId
      });
    }
    console.log('Companion selected:', companionId);
  }, [onAction]);

  // Avatar Creator Handler
  const handleAvatarSave = useCallback((avatar: CustomAvatar, name: string) => {
    setCustomAvatar(avatar);
    setHeroNameFromAvatar(name);
    setShowAvatarCreator(false);

    // Speichere in localStorage
    try {
      localStorage.setItem('schatzkarte_custom_avatar', JSON.stringify(avatar));
      localStorage.setItem('schatzkarte_hero_name', name);
    } catch (e) {
      console.warn('Could not save avatar to localStorage:', e);
    }

    console.log('Avatar saved:', { avatar, name });
  }, []);

  // Memory Game Handler
  const handleMemoryGameEnd = useCallback((result: GameResult) => {
    console.log('Memory Game Result:', result);

    // XP aktualisieren
    setPlayerXP(prev => Math.max(0, prev + result.xpWon));

    // Gold aktualisieren (bei Perfekt-Bonus)
    if (result.goldWon > 0) {
      setPlayerGold(prev => prev + result.goldWon);
    }

    // Schließe das Spiel
    setShowMemoryGame(false);

    // Optional: Action an Streamlit senden
    if (onAction) {
      onAction({
        action: 'minigame_completed',
        islandId: 'memory_game',
        xpEarned: result.xpWon,
        goldEarned: result.goldWon,
        description: result.won
          ? `Memory gewonnen! +${result.xpWon} XP`
          : `Memory verloren. -${result.xpBet} XP`
      });
    }
  }, [onAction]);

  // Runner Game Handler
  const handleRunnerGameEnd = useCallback((result: RunnerGameResult) => {
    console.log('Runner Game Result:', result);

    // XP aktualisieren
    setPlayerXP(prev => Math.max(0, prev + result.xpWon));

    // Gold aktualisieren
    if (result.goldWon > 0) {
      setPlayerGold(prev => prev + result.goldWon);
    }

    // Schließe das Spiel
    setShowRunnerGame(false);

    // Optional: Action an Streamlit senden
    if (onAction) {
      onAction({
        action: 'minigame_completed',
        islandId: 'runner_game',
        xpEarned: result.xpWon,
        goldEarned: result.goldWon,
        description: result.won
          ? `Runner gewonnen! +${result.xpWon} XP, ${result.distance}m gelaufen`
          : `Runner verloren. -${result.xpBet} XP`
      });
    }
  }, [onAction]);

  // Avatar Shop Handlers
  const handleShopPurchase = useCallback((item: ShopItem) => {
    if (playerGold < item.price) return;

    setPlayerGold(prev => prev - item.price);
    setOwnedItems(prev => {
      const newOwned = [...prev, item.id];
      // Speichere in localStorage
      try {
        localStorage.setItem('schatzkarte_owned_items', JSON.stringify(newOwned));
      } catch (e) {
        console.warn('Could not save owned items to localStorage:', e);
      }
      return newOwned;
    });
    console.log('Item purchased:', item);
  }, [playerGold]);

  const handleShopEquip = useCallback((itemId: string, slot: ItemSlot) => {
    if (!customAvatar) return;

    setCustomAvatar(prev => {
      if (!prev) return prev;
      const updated: CustomAvatar = {
        ...prev,
        equipped: {
          ...prev.equipped,
          [slot]: itemId
        },
        updatedAt: new Date().toISOString()
      };
      // Speichere in localStorage
      try {
        localStorage.setItem('schatzkarte_custom_avatar', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save avatar to localStorage:', e);
      }
      return updated;
    });
    console.log('Item equipped:', itemId, slot);
  }, [customAvatar]);

  const handleShopUnequip = useCallback((slot: ItemSlot) => {
    if (!customAvatar) return;

    setCustomAvatar(prev => {
      if (!prev) return prev;
      const updated: CustomAvatar = {
        ...prev,
        equipped: {
          ...prev.equipped,
          [slot]: null
        },
        updatedAt: new Date().toISOString()
      };
      // Speichere in localStorage
      try {
        localStorage.setItem('schatzkarte_custom_avatar', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save avatar to localStorage:', e);
      }
      return updated;
    });
    console.log('Item unequipped:', slot);
  }, [customAvatar]);

  // Handler für Powertechniken-Fortschritt (wird von QuestModal aufgerufen)
  const handlePowertechnikenComplete = useCallback((techniqueKey: TechniqueKey, application?: string) => {
    setPowertechnikenProgress(prev => {
      const newCompleted = prev.completedTechniques.includes(techniqueKey)
        ? prev.completedTechniques
        : [...prev.completedTechniques, techniqueKey];

      const newApplications = application
        ? { ...prev.applications, [techniqueKey]: application }
        : prev.applications;

      return {
        ...prev,
        completedTechniques: newCompleted,
        applications: newApplications
      };
    });
  }, []);

  // ═══════════════════════════════════════
  // TEST PANEL HANDLERS
  // ═══════════════════════════════════════

  // Insel freischalten
  const handleIslandUnlock = useCallback((islandId: string) => {
    setUnlockedIslands(prev => {
      if (prev.includes(islandId)) return prev;
      const newUnlocked = [...prev, islandId];
      onUnlockedIslandsChange?.(newUnlocked);
      return newUnlocked;
    });
  }, [onUnlockedIslandsChange]);

  // Insel als abgeschlossen markieren
  const handleIslandComplete = useCallback((islandId: string) => {
    // Erst freischalten falls noch nicht
    handleIslandUnlock(islandId);

    // Progress setzen
    setUserProgress(prev => {
      const newProgress = {
        ...prev,
        [islandId]: {
          video_watched: true,
          explanation_read: true,
          quiz_passed: true,
          challenge_completed: true,
          treasures_collected: islands.find(i => i.id === islandId)?.treasures.map(t => t.name) || []
        }
      };
      onProgressChange?.(newProgress);
      return newProgress;
    });

    // Nächste Insel freischalten (basierend auf week)
    const currentIsland = islands.find(i => i.id === islandId);
    if (currentIsland) {
      const nextIsland = islands.find(i => i.week === currentIsland.week + 1);
      if (nextIsland) {
        handleIslandUnlock(nextIsland.id);
      }
    }
  }, [islands, handleIslandUnlock, onProgressChange]);

  // Insel zurücksetzen
  const handleIslandReset = useCallback((islandId: string) => {
    // Aus freigeschalteten entfernen (außer Start)
    if (islandId !== 'start') {
      setUnlockedIslands(prev => {
        const newUnlocked = prev.filter(id => id !== islandId);
        onUnlockedIslandsChange?.(newUnlocked);
        return newUnlocked;
      });
    }

    // Progress zurücksetzen
    setUserProgress(prev => {
      const newProgress = {
        ...prev,
        [islandId]: {
          video_watched: false,
          explanation_read: false,
          quiz_passed: false,
          challenge_completed: false,
          treasures_collected: []
        }
      };
      onProgressChange?.(newProgress);
      return newProgress;
    });
  }, [onProgressChange, onUnlockedIslandsChange]);

  // Alle Inseln freischalten
  const handleUnlockAllIslands = useCallback(() => {
    const allIds = islands.map(i => i.id);
    setUnlockedIslands(allIds);
    onUnlockedIslandsChange?.(allIds);
  }, [islands, onUnlockedIslandsChange]);

  // Alle Inseln zurücksetzen
  const handleResetAllIslands = useCallback(() => {
    // Nur Start freigeschaltet
    setUnlockedIslands(['start']);
    onUnlockedIslandsChange?.(['start']);

    // Alle Progress zurücksetzen
    const emptyProgress: UserProgress = {};
    islands.forEach(island => {
      emptyProgress[island.id] = {
        video_watched: false,
        explanation_read: false,
        quiz_passed: false,
        challenge_completed: false,
        treasures_collected: []
      };
    });
    setUserProgress(emptyProgress);
    onProgressChange?.(emptyProgress);
  }, [islands, onProgressChange, onUnlockedIslandsChange]);

  // Reward-Modal triggern
  const handleTriggerReward = useCallback((type: RewardType) => {
    setRewardType(type);

    // Demo-Daten für verschiedene Reward-Typen
    if (type === 'game_won') {
      setCurrentGameResult({
        game: 'memory',
        won: true,
        xpBet: 50,
        xpWon: 150,
        goldWon: 25,
        stats: {
          moves: 12,
          timeUsed: 45
        }
      });
    } else if (type === 'game_lost') {
      setCurrentGameResult({
        game: 'memory',
        won: false,
        xpBet: 50,
        xpWon: -50,
        goldWon: 0,
        stats: {
          moves: 20,
          timeUsed: 60
        }
      });
    }

    setShowRewardModal(true);
  }, []);

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

      <WorldMapIllustrated
        islands={islands}
        userProgress={userProgress}
        heroData={{ ...heroData, companion: selectedCompanion }}
        unlockedIslands={unlockedIslands}
        currentIsland={currentIsland}
        onIslandClick={handleIslandClick}
        onBanduraShipClick={handleBanduraShipClick}
        onHattieShipClick={handleHattieShipClick}
        onPolarsternClick={handlePolarsternClick}
        polarsternGoals={0}
        ageGroup={ageGroup}
        tagebuchEntries={tagebuchEntries}
        onTagebuchToggle={handleTagebuchToggle}
        onLerntechnikenClick={handleLerntechnikenClick}
        lerntechnikenCompleted={powertechnikenProgress.completedTechniques.length}
        hasCertificate={powertechnikenProgress.completedTechniques.length === 7}
        onCompanionClick={() => setShowCompanionSelector(true)}
        customAvatar={customAvatar}
        heroName={heroNameFromAvatar}
        onAvatarEdit={() => setShowAvatarCreator(true)}
        playerGold={playerGold}
        playerXP={playerXP}
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
          onOpenTagebuch={handleTagebuchToggle}
          onOpenBandura={handleBanduraShipClick}
          onOpenHattie={handleHattieShipClick}
          startWerkzeugeWithChallenge={startWerkzeugeWithChallenge}
          onPolarsternClick={handlePolarsternClick}
          onOpenCompanionSelector={() => setShowCompanionSelector(true)}
          selectedCompanion={selectedCompanion}
          initialPhase={initialIslandPhase || undefined}
        />
      )}

      {/* Superhelden-Tagebuch Modal (nur Grundschule) */}
      {ageGroup === 'grundschule' && (
        <SuperheldenTagebuch
          isOpen={showTagebuch}
          entries={tagebuchEntries}
          onNewEntry={handleTagebuchEntry}
          onToggle={handleTagebuchToggle}
        />
      )}

      {/* Bandura Ship Modal - mit WOW-Effekten */}
      <BanduraShipModal
        isOpen={showBanduraModal}
        completedToday={banduraCompletedToday}
        onClose={() => setShowBanduraModal(false)}
        onEntrySubmit={handleBanduraEntry}
        banduraEntries={banduraEntries}
        banduraStats={banduraStats}
        userName={heroData.name}
      />

      {/* Hattie Ship Modal */}
      <HattieShipModal
        isOpen={showHattieModal}
        onClose={() => setShowHattieModal(false)}
        onNewPrediction={handleNewPrediction}
        onCompleteEntry={handleCompleteEntry}
        hattieEntries={hattieEntries}
        hattieStats={hattieStats}
        userName={heroData.name}
      />

      {/* Lerntechniken-Übersicht Modal */}
      <UebersichtModal
        isOpen={showLerntechnikenModal}
        progress={powertechnikenProgress}
        onClose={() => setShowLerntechnikenModal(false)}
        onGoToChallenge={() => handleIslandClick('werkzeuge')}
      />

      {/* Zertifikat Modal (nur wenn alle 7 Techniken abgeschlossen) */}
      {showZertifikat && (
        <ZertifikatStandalone
          progress={powertechnikenProgress}
          onClose={() => setShowZertifikat(false)}
        />
      )}

      {/* Polarstern Modal - Ziele setzen */}
      {showPolarsternModal && (
        <div className="modal-overlay" onClick={() => setShowPolarsternModal(false)}>
          <div className="polarstern-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowPolarsternModal(false)}>×</button>
            <div className="polarstern-modal__header">
              <span className="polarstern-modal__icon">⭐</span>
              <h2>Dein Polarstern</h2>
            </div>
            <div className="polarstern-modal__content">
              <p className="polarstern-intro">
                Der Polarstern zeigt dir den Weg! Setze hier deine Lernziele und Träume.
              </p>
              <div className="polarstern-coming-soon">
                <span className="coming-soon-icon">🚧</span>
                <h3>Bald verfügbar!</h3>
                <p>
                  Hier kannst du bald deine persönlichen Lernziele setzen und verfolgen.
                  Der Polarstern hilft dir, deinen Weg nicht aus den Augen zu verlieren!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Companion Selector Modal */}
      <CompanionSelector
        currentCompanion={selectedCompanion}
        onSelect={handleCompanionSelect}
        isOpen={showCompanionSelector}
        onClose={() => setShowCompanionSelector(false)}
      />

      {/* Avatar Creator Modal */}
      {showAvatarCreator && (
        <div className="avatar-creator-modal">
          <AvatarCreator
            initialAvatar={customAvatar || undefined}
            initialName={heroNameFromAvatar}
            onSave={handleAvatarSave}
            onCancel={customAvatar ? () => setShowAvatarCreator(false) : undefined}
          />
        </div>
      )}

      {/* Memory Game Modal */}
      {showMemoryGame && (
        <div className="memory-game-modal">
          <MemoryGame
            playerXP={playerXP}
            playerGold={playerGold}
            playerAvatar={customAvatar || undefined}
            onGameEnd={handleMemoryGameEnd}
            onClose={() => setShowMemoryGame(false)}
          />
        </div>
      )}

      {/* Runner Game Modal */}
      {showRunnerGame && customAvatar && (
        <div className="runner-game-modal">
          <RunnerGame
            playerXP={playerXP}
            playerGold={playerGold}
            playerAvatar={customAvatar}
            playerAgeGroup={ageGroup === 'oberstufe' || ageGroup === 'paedagoge' ? 'mittelstufe' : ageGroup}
            onGameEnd={handleRunnerGameEnd}
            onClose={() => setShowRunnerGame(false)}
          />
        </div>
      )}

      {/* Avatar Shop Modal */}
      {showAvatarShop && customAvatar && (
        <div className="avatar-shop-modal">
          <AvatarShop
            playerGold={playerGold}
            playerAvatar={customAvatar}
            ownedItems={ownedItems}
            onPurchase={handleShopPurchase}
            onEquip={handleShopEquip}
            onUnequip={handleShopUnequip}
            onClose={() => setShowAvatarShop(false)}
          />
        </div>
      )}

      {/* RewardModal - Belohnungs-Anzeige */}
      <RewardModal
        isOpen={showRewardModal}
        type={rewardType}
        gameResult={currentGameResult || undefined}
        achievement={rewardType === 'achievement' ? {
          id: 'demo-achievement',
          name: 'Erster Erfolg!',
          description: 'Du hast dein erstes Achievement freigeschaltet!',
          icon: '🏆',
          bonusXP: 50
        } : undefined}
        levelUp={rewardType === 'level_up' ? {
          oldLevel: playerLevel,
          newLevel: playerLevel + 1,
          newTitle: 'Wissens-Entdecker',
          goldBonus: 100
        } : undefined}
        islandReward={rewardType === 'island_complete' ? {
          islandName: 'Demo-Station',
          xpEarned: 200,
          goldEarned: 50
        } : undefined}
        onPlayAgain={() => {
          setShowRewardModal(false);
          setShowMemoryGame(true);
        }}
        onClose={() => setShowRewardModal(false)}
      />

      {/* MiniGameSelector - Spiel-Auswahl nach Erfolgen */}
      <MiniGameSelector
        isOpen={showMiniGameSelector}
        trigger="bandura_complete"
        availableGames={['memory', 'runner']}
        bonusMultiplier={1.5}
        onSelectGame={(game) => {
          setShowMiniGameSelector(false);
          if (game === 'memory') {
            setShowMemoryGame(true);
          } else {
            setShowRunnerGame(true);
          }
        }}
        onSelectShop={() => {
          setShowMiniGameSelector(false);
          setShowAvatarShop(true);
        }}
        onClose={() => setShowMiniGameSelector(false)}
      />

      {/* Admin Test-Panel - nur für Admins sichtbar */}
      {isAdmin && (
        <TestPanel
          playerXP={playerXP}
          playerGold={playerGold}
          playerLevel={playerLevel}
          islands={islands}
          userProgress={userProgress}
          unlockedIslands={unlockedIslands}
          onXPChange={setPlayerXP}
          onGoldChange={setPlayerGold}
          onLevelChange={setPlayerLevel}
          onIslandUnlock={handleIslandUnlock}
          onIslandComplete={handleIslandComplete}
          onIslandReset={handleIslandReset}
          onUnlockAllIslands={handleUnlockAllIslands}
          onResetAllIslands={handleResetAllIslands}
          onTriggerReward={handleTriggerReward}
          onOpenMiniGameSelector={() => setShowMiniGameSelector(true)}
          onOpenMemory={() => setShowMemoryGame(true)}
          onOpenRunner={() => setShowRunnerGame(true)}
          onOpenAvatarShop={() => setShowAvatarShop(true)}
          ageGroup={ageGroup}
          onAgeGroupChange={setAgeGroup}
        />
      )}

      {/* Lernbegleiter - erscheint wenn ein Begleiter ausgewählt wurde */}
      {selectedCompanion && !showCompanionSelector && (
        <Lernbegleiter
          companion={selectedCompanion}
          context={currentLernkontext}
          userName={heroData.name}
          minimized={companionMinimized}
          onToggleMinimize={() => setCompanionMinimized(!companionMinimized)}
        />
      )}

      {/* Zurück zur Schatzkarte Button - erscheint wenn ein Modal offen ist */}
      {(showQuestModal || showBanduraModal || showHattieModal || showTagebuch || showLerntechnikenModal || showZertifikat || showCompanionSelector || showAvatarCreator || showMemoryGame || showRunnerGame || showAvatarShop || showPolarsternModal) && (
        <button
          className="back-to-map-button"
          onClick={() => {
            // Alle Modals schließen
            setShowQuestModal(false);
            setSelectedIsland(null);
            setShowBanduraModal(false);
            setShowHattieModal(false);
            setShowTagebuch(false);
            setShowLerntechnikenModal(false);
            setShowZertifikat(false);
            setShowCompanionSelector(false);
            setShowAvatarCreator(false);
            setShowMemoryGame(false);
            setShowRunnerGame(false);
            setShowAvatarShop(false);
            setShowPolarsternModal(false);
          }}
        >
          <span className="back-icon">🗺️</span>
          <span className="back-text">Zurück zur Schatzkarte</span>
        </button>
      )}

      {/* Avatar Edit Widget - jetzt im linken Panel integriert */}

      {/* Memory Game Button - erscheint wenn kein Modal offen */}
      {!showQuestModal && !showBanduraModal && !showHattieModal && !showMemoryGame && !showRunnerGame && !showAvatarShop && !showAvatarCreator && (
        <button
          className="memory-game-widget"
          onClick={() => setShowMemoryGame(true)}
          title="Memory spielen"
        >
          <span className="memory-game-widget__icon">🧠</span>
          <div className="memory-game-widget__info">
            <span className="memory-game-widget__title">Memory</span>
            <span className="memory-game-widget__xp">{playerXP} XP</span>
          </div>
        </button>
      )}

      {/* Runner Game Button - erscheint wenn kein Modal offen UND Avatar vorhanden */}
      {customAvatar && !showQuestModal && !showBanduraModal && !showHattieModal && !showMemoryGame && !showRunnerGame && !showAvatarShop && !showAvatarCreator && (
        <button
          className="runner-game-widget"
          onClick={() => setShowRunnerGame(true)}
          title="Runner spielen"
        >
          <span className="runner-game-widget__icon">🏃</span>
          <div className="runner-game-widget__info">
            <span className="runner-game-widget__title">Runner</span>
            <span className="runner-game-widget__xp">{playerXP} XP</span>
          </div>
        </button>
      )}

      {/* Avatar Shop Button - erscheint wenn kein Modal offen UND Avatar vorhanden */}
      {customAvatar && !showQuestModal && !showBanduraModal && !showHattieModal && !showMemoryGame && !showRunnerGame && !showAvatarShop && !showAvatarCreator && (
        <button
          className="avatar-shop-widget"
          onClick={() => setShowAvatarShop(true)}
          title="Avatar Shop öffnen"
        >
          <span className="avatar-shop-widget__icon">🛒</span>
          <div className="avatar-shop-widget__info">
            <span className="avatar-shop-widget__title">Shop</span>
            <span className="avatar-shop-widget__gold">{playerGold} 💰</span>
          </div>
        </button>
      )}

      <footer className="app-footer">
        <div className="tip-of-the-day">
          <span className="tip-icon">💡</span>
          <span className="tip-text">
            Tipp: Schließe alle Quests einer Station ab, um Bonus-XP zu erhalten!
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
  return 'nintendo';
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
  const view: string = args?.view || 'map'; // 'landing' oder 'map'
  const islands: Island[] = args?.islands || DEFAULT_ISLANDS;
  const userProgress: UserProgress = args?.userProgress || {};
  const heroData: HeroData = args?.heroData || DEFAULT_HERO;
  const unlockedIslands: string[] = args?.unlockedIslands || ['motivation'];
  const currentIsland: string | null = args?.currentIsland || null;
  const ageGroup: AgeGroup = args?.ageGroup || 'grundschule';
  // Admin-Modus: wird von Streamlit übergeben (z.B. für Pädagogen/Admins)
  const isAdmin: boolean = args?.isAdmin || args?.ageGroup === 'paedagoge' || false;
  // Auto-Open: Öffnet automatisch eine Insel (z.B. nach Rückkehr von Polarstern)
  const autoOpenIsland: string | null = args?.autoOpenIsland || null;
  const autoOpenPhase: string | null = args?.autoOpenPhase || null;
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(loadSavedTheme);

  // Streamlit-Höhe setzen - WICHTIG: muss immer aufgerufen werden
  useEffect(() => {
    // Landing Page braucht mehr Höhe (mit neuem 3-Bausteine-Konzept)
    const height = view === 'landing' ? 5500 : 700;
    Streamlit.setFrameHeight(height);

    // Regelmäßig Höhe aktualisieren für Landing Page
    if (view === 'landing') {
      const interval = setInterval(() => {
        // Dynamisch die echte Höhe ermitteln
        const body = document.body;
        const html = document.documentElement;
        const contentHeight = Math.max(
          body.scrollHeight,
          body.offsetHeight,
          html.clientHeight,
          html.scrollHeight,
          html.offsetHeight
        );
        // Mindestens 5500, aber mehr wenn nötig
        Streamlit.setFrameHeight(Math.max(5500, contentHeight + 100));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [view]);

  const handleAction = useCallback((action: SchatzkartAction) => {
    Streamlit.setComponentValue(action);
  }, []);

  // Landing Page anzeigen
  if (view === 'landing') {
    return (
      <LandingPageV5
        onClose={() => {
          Streamlit.setComponentValue({ action: 'go_to_map' });
        }}
      />
    );
  }

  // Schatzkarte anzeigen (default)
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
        isAdmin={isAdmin}
        onAction={handleAction}
        autoOpenIsland={autoOpenIsland}
        autoOpenPhase={autoOpenPhase}
      />
    </div>
  );
}

// Development-Modus Komponente (ohne Streamlit)
function RPGSchatzkarteDev() {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(loadSavedTheme);
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('grundschule');
  const [showLanding, setShowLanding] = useState(true); // Starte mit Landing Page

  // Mehr Inseln freigeschaltet für Demo
  const unlockedIslands = ['start', 'festung', 'werkzeuge', 'bruecken', 'faeden', 'spiegel_see', 'vulkan', 'ruhe_oase'];

  // Landing Page anzeigen
  if (showLanding) {
    return (
      <LandingPageV5
        onClose={() => setShowLanding(false)}
      />
    );
  }

  return (
    <div className={`theme-${currentTheme}`}>
      <ThemeSwitcher
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
      />

      {/* Button um zurück zur Landing Page zu gehen */}
      <button
        onClick={() => setShowLanding(true)}
        style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          zIndex: 1000,
          padding: '8px 16px',
          background: '#16a34a',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        ← Landing Page
      </button>

      <RPGSchatzkarteContent
        islands={DEFAULT_ISLANDS}
        userProgress={DEFAULT_PROGRESS}
        heroData={DEFAULT_HERO}
        unlockedIslands={unlockedIslands}
        currentIsland="werkzeuge"
        ageGroup={ageGroup}
        isAdmin={true}  // Im Dev-Modus immer Admin
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

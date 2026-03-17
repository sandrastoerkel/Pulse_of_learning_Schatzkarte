// ============================================
// Einmaleins-Arena - Multiplikations-Trainer
// TT Rock Stars Upgrade: 6 Modi, Speed-Rang, Division, Adaptive
// ============================================
import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// ============================================
// TYPES & DATA
// ============================================

interface ArenaData {
  userId: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  isCoach: boolean;
  groupIds: string[];
}

interface ArenaProps {
  isOpen: boolean;
  onClose: () => void;
  onXPEarned?: (xp: number) => void;
  onCoinsEarned?: (coins: number) => void;
  arenaData?: ArenaData | null;
}

type Screen = 'home' | 'setup' | 'quiz' | 'heatmap' | 'shop' | 'battle' | 'studioResult' | 'coach';
type QuizMode = 'studio' | 'training' | 'turnier' | 'jamming' | 'soundcheck';
type QuestionType = 'mult' | 'div' | 'both';
type BattleType = 'ai' | '2player';

interface HeatmapEntry {
  correct: number;
  wrong: number;
  times: number[];
  avgTime: number | null;
}

interface ScoreEntry {
  date: string;
  correct: number;
  wrong: number;
  mode: string;
  avgSpeed?: number;
}

interface AvatarState {
  hair: string;
  outfit: string;
  instrument: string;
  accessory: string;
}

interface ArenaState {
  playerName: string;
  avatar: AvatarState;
  coins: number;
  totalCorrect: number;
  arenaXP: number;
  arenaLevel: number;
  heatmap: Record<string, HeatmapEntry>;
  scores: ScoreEntry[];
  ownedItems: string[];
  studioSpeeds: number[];
  studioSpeed: number | null;
  questionType: QuestionType;
}

interface AvatarItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  color: string;
}

interface Question {
  a: number;
  b: number;
  answer: number;
  displayText: string;
  heatmapKey: string;
  isDivision: boolean;
}

// --- Konstanten ---

const STORAGE_KEY = 'einmaleins_arena';

const AVATAR_ITEMS: Record<string, AvatarItem[]> = {
  hair: [
    { id: 'hair_basic', name: 'Basic', emoji: '👱', price: 0, color: '#f5c842' },
    { id: 'hair_mohawk', name: 'Irokese', emoji: '🤘', price: 50, color: '#ef4444' },
    { id: 'hair_afro', name: 'Afro', emoji: '💇', price: 80, color: '#8b5cf6' },
    { id: 'hair_wild', name: 'Wilde Maehne', emoji: '🦁', price: 120, color: '#f97316' },
  ],
  outfit: [
    { id: 'outfit_basic', name: 'Basic', emoji: '👕', price: 0, color: '#6c3fc5' },
    { id: 'outfit_leather', name: 'Ruestung', emoji: '🧥', price: 60, color: '#1f2937' },
    { id: 'outfit_stars', name: 'Sternenanzug', emoji: '⭐', price: 100, color: '#f5c842' },
    { id: 'outfit_flames', name: 'Flammen-Shirt', emoji: '🔥', price: 150, color: '#ef4444' },
  ],
  instrument: [
    { id: 'inst_sword', name: 'Schwert', emoji: '⚔️', price: 0, color: '#f5c842' },
    { id: 'inst_shield', name: 'Schild', emoji: '🛡️', price: 70, color: '#ef4444' },
    { id: 'inst_wand', name: 'Zauberstab', emoji: '🪄', price: 90, color: '#00e5ff' },
    { id: 'inst_bow', name: 'Bogen', emoji: '🏹', price: 130, color: '#8b5cf6' },
  ],
  accessory: [
    { id: 'acc_none', name: 'Keins', emoji: '✨', price: 0, color: '#6c3fc5' },
    { id: 'acc_shades', name: 'Sonnenbrille', emoji: '😎', price: 40, color: '#1f2937' },
    { id: 'acc_crown', name: 'Krone', emoji: '👑', price: 200, color: '#f5c842' },
    { id: 'acc_lightning', name: 'Blitz-Tattoo', emoji: '⚡', price: 80, color: '#f5c842' },
  ],
};

const SPEED_RANKS = [
  { name: 'Rockgott', maxTime: 1, color: '#22c55e', emoji: '🏆' },
  { name: 'Musiklegende', maxTime: 2, color: '#4ade80', emoji: '⭐' },
  { name: 'Buehnenstar', maxTime: 3, color: '#86efac', emoji: '🎸' },
  { name: 'Hauptact', maxTime: 4, color: '#eab308', emoji: '🎤' },
  { name: 'Vorband', maxTime: 5, color: '#f59e0b', emoji: '🎵' },
  { name: 'Newcomer', maxTime: 6, color: '#f97316', emoji: '🎶' },
  { name: 'Freier Kuenstler', maxTime: 7, color: '#fb923c', emoji: '📋' },
  { name: 'Hobbyrocker', maxTime: 8, color: '#ef4444', emoji: '🎺' },
  { name: 'Pflasterstein-Barde', maxTime: 9, color: '#dc2626', emoji: '🎷' },
  { name: 'Kellerrocker', maxTime: 10, color: '#b91c1c', emoji: '🏚️' },
  { name: 'Dusch-Rocker', maxTime: Infinity, color: '#991b1b', emoji: '😅' },
];

const MIN_GAMES_FOR_RANK = 10;
const FRISCHLING = { name: 'Frischling', maxTime: Infinity, color: '#64748b', emoji: '🆕' };

function getSpeedRank(avgTime: number | null, gamesPlayed?: number): typeof SPEED_RANKS[number] {
  if (gamesPlayed !== undefined && gamesPlayed < MIN_GAMES_FOR_RANK) return FRISCHLING as typeof SPEED_RANKS[number];
  if (avgTime === null) return SPEED_RANKS[SPEED_RANKS.length - 1];
  for (const rank of SPEED_RANKS) {
    if (avgTime <= rank.maxTime) return rank;
  }
  return SPEED_RANKS[SPEED_RANKS.length - 1];
}

const QUIZ_MODES: Record<QuizMode, { label: string; duration: number; questionCount: number; perQuestionTime: number; desc: string; coinMult: number; color: string; icon: string }> = {
  studio: { label: 'Studio', duration: 60, questionCount: 0, perQuestionTime: 0, desc: 'Alle Tabellen – bestimmt deinen Rang', coinMult: 1, color: '#f5c842', icon: '🎸' },
  training: { label: 'Training', duration: 60, questionCount: 0, perQuestionTime: 0, desc: 'Adaptive Fragen aus deinen Schwaechen', coinMult: 1, color: '#8b5cf6', icon: '⚔️' },
  turnier: { label: 'Turnier', duration: 60, questionCount: 0, perQuestionTime: 0, desc: 'Doppelte Coins!', coinMult: 2, color: '#00e5ff', icon: '🏆' },
  jamming: { label: 'Jamming', duration: 0, questionCount: 0, perQuestionTime: 0, desc: 'Kein Timer – stressfrei ueben', coinMult: 0.4, color: '#6ee7b7', icon: '🎵' },
  soundcheck: { label: 'Soundcheck', duration: 0, questionCount: 25, perQuestionTime: 6, desc: '25 Fragen, 6 Sek pro Frage', coinMult: 0.5, color: '#f97316', icon: '🎤' },
};

const CATEGORY_LABELS: Record<string, string> = {
  hair: '💇 Frisur',
  outfit: '👕 Outfit',
  instrument: '⚔️ Waffe',
  accessory: '✨ Accessoire',
};

const BATTLE_ROUNDS = 10;
const BATTLE_TIME = 8;
const SOUNDCHECK_QUESTIONS = 25;
const SOUNDCHECK_TIME = 6;

// --- Level-System ---

function xpForLevel(level: number): number {
  return Math.floor(30 + (level - 1) * 15);
}

function totalXPForLevel(level: number): number {
  let total = 0;
  for (let l = 1; l < level; l++) total += xpForLevel(l);
  return total;
}

function getLevelFromXP(totalXP: number): { level: number; xpInLevel: number; xpNeeded: number } {
  let level = 1;
  let remaining = totalXP;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
  }
  return { level, xpInLevel: remaining, xpNeeded: xpForLevel(level) };
}

function getRankForLevel(level: number): { name: string; color: string } {
  if (level >= 30) return { name: 'Legende', color: '#ff4da6' };
  if (level >= 20) return { name: 'Meister', color: '#f5c842' };
  if (level >= 15) return { name: 'Arena-Held', color: '#f97316' };
  if (level >= 10) return { name: 'Champion', color: '#8b5cf6' };
  if (level >= 6) return { name: 'Ritter', color: '#00e5ff' };
  if (level >= 3) return { name: 'Kaempfer', color: '#6ee7b7' };
  return { name: 'Knappe', color: '#8892b0' };
}

function calcAnswerXP(speed: number, combo: number, mode: string): number {
  const base = 5;
  const speedBonus = Math.min(5, Math.floor(speed / 3));
  const comboBonus = combo >= 8 ? 7 : combo >= 5 ? 4 : combo >= 3 ? 2 : 0;
  let modeMult = 1.0;
  if (mode === 'turnier' || mode === 'gig') modeMult = 1.5;
  else if (mode === 'battle') modeMult = 1.3;
  else if (mode === 'jamming') modeMult = 0.5;
  else if (mode === 'soundcheck') modeMult = 0.8;
  return Math.floor((base + speedBonus + comboBonus) * modeMult);
}

// --- Fragen-Generierung ---

function generateQuestion(focusTable: number | null, questionType: QuestionType): Question {
  const type = questionType === 'both' ? (Math.random() < 0.5 ? 'mult' : 'div') : questionType;
  const a = focusTable || Math.floor(Math.random() * 12) + 1;
  const b = Math.floor(Math.random() * 12) + 1;

  if (type === 'div') {
    const product = a * b;
    return {
      a, b, answer: a,
      displayText: `${product} ÷ ${b}`,
      heatmapKey: `${product}:${b}`,
      isDivision: true,
    };
  }
  return {
    a, b, answer: a * b,
    displayText: `${a} × ${b}`,
    heatmapKey: `${a}x${b}`,
    isDivision: false,
  };
}

function generateAdaptiveQuestion(heatmap: Record<string, HeatmapEntry>, questionType: QuestionType): Question {
  interface WeightedQ { a: number; b: number; isDivision: boolean; weight: number; }
  const candidates: WeightedQ[] = [];

  for (let a = 1; a <= 12; a++) {
    for (let b = 1; b <= 12; b++) {
      if (questionType !== 'div') {
        const key = `${a}x${b}`;
        const entry = heatmap[key];
        let weight = 10;
        if (entry) {
          const total = entry.correct + entry.wrong;
          if (total > 0) {
            const errorRate = entry.wrong / total;
            const avgTime = entry.avgTime || 10;
            weight = 2 + errorRate * 8 + Math.min(avgTime / 2, 5);
          }
        }
        candidates.push({ a, b, isDivision: false, weight });
      }
      if (questionType !== 'mult') {
        const product = a * b;
        const key = `${product}:${b}`;
        const entry = heatmap[key];
        let weight = 10;
        if (entry) {
          const total = entry.correct + entry.wrong;
          if (total > 0) {
            const errorRate = entry.wrong / total;
            const avgTime = entry.avgTime || 10;
            weight = 2 + errorRate * 8 + Math.min(avgTime / 2, 5);
          }
        }
        candidates.push({ a, b, isDivision: true, weight });
      }
    }
  }

  const totalWeight = candidates.reduce((s, c) => s + c.weight, 0);
  let r = Math.random() * totalWeight;
  for (const c of candidates) {
    r -= c.weight;
    if (r <= 0) {
      if (c.isDivision) {
        const product = c.a * c.b;
        return {
          a: c.a, b: c.b, answer: c.a,
          displayText: `${product} ÷ ${c.b}`,
          heatmapKey: `${product}:${c.b}`,
          isDivision: true,
        };
      }
      return {
        a: c.a, b: c.b, answer: c.a * c.b,
        displayText: `${c.a} × ${c.b}`,
        heatmapKey: `${c.a}x${c.b}`,
        isDivision: false,
      };
    }
  }
  return generateQuestion(null, questionType);
}

// --- Heatmap ---

function doUpdateHeatmap(
  heatmap: Record<string, HeatmapEntry>,
  key: string,
  correct: boolean,
  time: number | null = null,
): Record<string, HeatmapEntry> {
  const entry = heatmap[key] || { correct: 0, wrong: 0, times: [], avgTime: null };
  const newTimes = time !== null ? [...entry.times.slice(-9), time] : entry.times;
  const newAvgTime = newTimes.length > 0 ? newTimes.reduce((a, b) => a + b, 0) / newTimes.length : null;
  return {
    ...heatmap,
    [key]: {
      correct: entry.correct + (correct ? 1 : 0),
      wrong: entry.wrong + (correct ? 0 : 1),
      times: newTimes,
      avgTime: newAvgTime,
    },
  };
}

function getHeatmapColor(entry: HeatmapEntry | null): string {
  if (!entry) return 'rgba(255,255,255,0.05)';
  const total = entry.correct + entry.wrong;
  if (total === 0) return 'rgba(255,255,255,0.05)';
  if (entry.avgTime !== null) {
    const t = entry.avgTime;
    if (t <= 2) return 'rgba(34,197,94,0.7)';
    if (t <= 4) return 'rgba(163,230,53,0.6)';
    if (t <= 6) return 'rgba(234,179,8,0.6)';
    if (t <= 8) return 'rgba(249,115,22,0.6)';
    if (t <= 10) return 'rgba(239,68,68,0.7)';
    return 'rgba(153,27,27,0.7)';
  }
  const rate = entry.correct / total;
  if (rate >= 0.9) return 'rgba(34,197,94,0.7)';
  if (rate >= 0.7) return 'rgba(163,230,53,0.6)';
  if (rate >= 0.5) return 'rgba(234,179,8,0.6)';
  if (rate >= 0.3) return 'rgba(249,115,22,0.6)';
  return 'rgba(239,68,68,0.7)';
}

// --- State ---

function createInitialState(): ArenaState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration: alte States ohne Level-System
      if (parsed.arenaXP === undefined) {
        parsed.arenaXP = (parsed.totalCorrect || 0) * 5;
        parsed.arenaLevel = getLevelFromXP(parsed.arenaXP).level;
      }
      // Migration: neue Felder fuer TT Rock Stars Upgrade
      if (!parsed.studioSpeeds) parsed.studioSpeeds = [];
      if (parsed.studioSpeed === undefined) parsed.studioSpeed = null;
      if (!parsed.questionType) parsed.questionType = 'both';
      // Migration: Heatmap-Eintraege um times/avgTime erweitern
      if (parsed.heatmap) {
        for (const key of Object.keys(parsed.heatmap)) {
          const e = parsed.heatmap[key];
          if (!e.times) { e.times = []; e.avgTime = null; }
        }
      }
      return parsed;
    }
  } catch { /* ignore */ }
  return {
    playerName: '',
    avatar: { hair: 'hair_basic', outfit: 'outfit_basic', instrument: 'inst_sword', accessory: 'acc_none' },
    coins: 0,
    totalCorrect: 0,
    arenaXP: 0,
    arenaLevel: 1,
    heatmap: {},
    scores: [],
    ownedItems: ['hair_basic', 'outfit_basic', 'inst_sword', 'acc_none'],
    studioSpeeds: [],
    studioSpeed: null,
    questionType: 'both',
  };
}

function saveState(state: ArenaState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

function getItemEmoji(cat: string, id: string): string {
  const items = AVATAR_ITEMS[cat];
  if (!items) return '?';
  return items.find(i => i.id === id)?.emoji || '?';
}

// ============================================
// STYLES
// ============================================

const S = {
  navy: '#0a0e2a', navy2: '#111538',
  purple: '#6c3fc5', purpleLight: '#8b5cf6',
  cyan: '#00e5ff', gold: '#f5c842', goldDim: '#c49a10',
  pink: '#ff4da6', green: '#22c55e', red: '#ef4444',
  text: '#e8eaf6', textDim: '#8892b0',
  card: 'rgba(17, 21, 56, 0.85)', border: 'rgba(108, 63, 197, 0.4)',
};

const modalOverlay: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 10000,
  background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const modalContent: React.CSSProperties = {
  position: 'relative', width: '100%', maxWidth: 520, maxHeight: '95vh',
  overflowY: 'auto', overflowX: 'hidden',
  background: `linear-gradient(135deg, ${S.navy}, ${S.navy2})`,
  borderRadius: 20, border: `1px solid ${S.border}`,
  padding: '1.5rem', color: S.text,
  fontFamily: "'Nunito', sans-serif",
  boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
};

const rockFont: React.CSSProperties = { fontFamily: "'Bangers', cursive", letterSpacing: 2 };

const cardStyle: React.CSSProperties = {
  background: S.card, border: `1px solid ${S.border}`,
  borderRadius: 16, backdropFilter: 'blur(12px)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
};

const btnBase: React.CSSProperties = {
  ...rockFont, fontSize: '1.05rem', padding: '0.55rem 1.4rem',
  border: 'none', borderRadius: 12, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
  transition: 'all 0.15s ease', fontFamily: "'Bangers', cursive", letterSpacing: 2,
};

const btnPrimary: React.CSSProperties = {
  ...btnBase, background: `linear-gradient(135deg, ${S.purple}, ${S.purpleLight})`,
  color: 'white', boxShadow: '0 4px 20px rgba(108,63,197,0.5)',
};

const btnGold: React.CSSProperties = {
  ...btnBase, background: `linear-gradient(135deg, ${S.goldDim}, ${S.gold})`,
  color: S.navy, boxShadow: '0 4px 20px rgba(245,200,66,0.4)',
};

const btnCyan: React.CSSProperties = {
  ...btnBase, background: `linear-gradient(135deg, #0891b2, ${S.cyan})`,
  color: S.navy, boxShadow: '0 4px 20px rgba(0,229,255,0.3)',
};

const btnPink: React.CSSProperties = {
  ...btnBase, background: `linear-gradient(135deg, #be185d, ${S.pink})`,
  color: 'white', boxShadow: '0 4px 20px rgba(255,77,166,0.4)',
};

const btnGhost: React.CSSProperties = {
  ...btnBase, background: 'transparent', color: S.textDim,
  border: `1px solid ${S.border}`,
};

const btnGreen: React.CSSProperties = {
  ...btnBase, background: `linear-gradient(135deg, #15803d, ${S.green})`,
  color: 'white',
};

const coinBadge: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
  background: 'rgba(245,200,66,0.15)', border: '1px solid rgba(245,200,66,0.4)',
  borderRadius: 20, padding: '0.25rem 0.75rem', fontWeight: 800,
  color: S.gold, fontSize: '0.95rem',
};

// ============================================
// MAIN COMPONENT
// ============================================

interface ScreenParams {
  mode?: QuizMode;
  studioResult?: {
    correct: number;
    wrong: number;
    avgSpeed: number;
    sessionXP: number;
    coinsEarned: number;
    mode: string;
  };
}

export function EinmaleinsArena({ isOpen, onClose, onXPEarned, onCoinsEarned, arenaData }: ArenaProps) {
  const [state, setState] = useState<ArenaState>(() => createInitialState());
  const [screen, setScreen] = useState<Screen>(() => {
    const s = createInitialState();
    return s.playerName ? 'home' : 'setup';
  });
  const [screenParams, setScreenParams] = useState<ScreenParams>({});
  const [supabaseLoaded, setSupabaseLoaded] = useState(false);

  // --- Supabase Client (wie Chat) ---
  const supabaseRef = useRef<any>(null);
  const stateRef = useRef<ArenaState>(state);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  stateRef.current = state;

  useEffect(() => {
    if (arenaData?.supabaseUrl && arenaData?.supabaseAnonKey && !supabaseRef.current) {
      supabaseRef.current = createClient(arenaData.supabaseUrl, arenaData.supabaseAnonKey);
    }
  }, [arenaData]);

  // --- Supabase laden: localStorage sofort, dann Supabase async ---
  useEffect(() => {
    if (!supabaseRef.current || !arenaData?.userId || supabaseLoaded) return;

    const loadFromSupabase = async () => {
      try {
        const sb = supabaseRef.current;
        const { data, error } = await sb
          .from('arena_progress')
          .select('*')
          .eq('user_id', arenaData.userId)
          .maybeSingle();

        if (error) { console.error('Arena: Supabase load error', error); return; }

        if (data) {
          // Server-Daten vorhanden → uebernehmen
          const serverState = dbRowToArenaState(data);
          setState(serverState);
          saveState(serverState); // localStorage aktualisieren
          setScreen(serverState.playerName ? 'home' : 'setup');
        } else {
          // Kein Server-Eintrag → localStorage-Daten migrieren (einmalig)
          const localState = stateRef.current;
          if (localState.playerName || localState.totalCorrect > 0) {
            await saveToSupabase(sb, arenaData.userId, localState);
          }
        }
      } catch (e) {
        console.error('Arena: Supabase load failed', e);
      }
      setSupabaseLoaded(true);
    };

    loadFromSupabase();
  }, [arenaData, supabaseLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Speichern: Dual-Write ---
  const debouncedSaveToSupabase = useCallback((nextState: ArenaState) => {
    if (!supabaseRef.current || !arenaData?.userId) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveToSupabase(supabaseRef.current, arenaData.userId, nextState);
    }, 2000);
  }, [arenaData]);

  const flushSaveToSupabase = useCallback(() => {
    if (!supabaseRef.current || !arenaData?.userId) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveToSupabase(supabaseRef.current, arenaData.userId, stateRef.current);
  }, [arenaData]);

  const updateState = useCallback((updates: Partial<ArenaState>) => {
    setState(prev => {
      const next = { ...prev, ...updates };
      saveState(next);
      debouncedSaveToSupabase(next);
      return next;
    });
  }, [debouncedSaveToSupabase]);

  const navigate = useCallback((target: Screen, params: ScreenParams = {}) => {
    setScreen(target);
    setScreenParams(params);
  }, []);

  const handleSetupDone = useCallback((name: string) => {
    updateState({ playerName: name });
    setScreen('home');
  }, [updateState]);

  // Modi die in die Rang-Wertung (letzte 10 Spiele) einfliessen
  const RANKED_MODES = ['studio', 'training', 'turnier', 'soundcheck'];

  const handleQuizComplete = useCallback(({ correct, wrong, coinsEarned, xpEarned, heatmap, mode, avgSpeed }: {
    correct: number; wrong: number; coinsEarned: number; xpEarned: number;
    heatmap: Record<string, HeatmapEntry>; mode: string; avgSpeed?: number;
  }) => {
    const isRanked = RANKED_MODES.includes(mode) && avgSpeed !== undefined && avgSpeed > 0;

    setState(prev => {
      const newArenaXP = prev.arenaXP + xpEarned;
      const newLevelInfo = getLevelFromXP(newArenaXP);

      let newStudioSpeeds = prev.studioSpeeds;
      let newStudioSpeed = prev.studioSpeed;

      if (isRanked) {
        newStudioSpeeds = [...prev.studioSpeeds.slice(-9), avgSpeed!];
        newStudioSpeed = newStudioSpeeds.reduce((a, b) => a + b, 0) / newStudioSpeeds.length;
      }

      const next: ArenaState = {
        ...prev,
        coins: prev.coins + coinsEarned,
        totalCorrect: prev.totalCorrect + correct,
        arenaXP: newArenaXP,
        arenaLevel: newLevelInfo.level,
        heatmap,
        scores: [...prev.scores, { date: new Date().toISOString(), correct, wrong, mode, avgSpeed }],
        studioSpeeds: newStudioSpeeds,
        studioSpeed: newStudioSpeed,
      };
      saveState(next);
      // Sofort nach Supabase schreiben (wichtiges Event)
      if (supabaseRef.current && arenaData?.userId) {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveToSupabase(supabaseRef.current, arenaData.userId, next);
      }
      return next;
    });

    if (xpEarned > 0 && onXPEarned) {
      onXPEarned(Math.floor(xpEarned / 3));
    }
    if (coinsEarned > 0 && onCoinsEarned) {
      onCoinsEarned(coinsEarned);
    }

    if (isRanked) {
      setScreen('studioResult');
      setScreenParams({
        studioResult: { correct, wrong, avgSpeed: avgSpeed!, sessionXP: xpEarned, coinsEarned, mode },
      });
    } else {
      setScreen('home');
    }
  }, [onXPEarned, onCoinsEarned]);

  if (!isOpen) return null;

  const handleClose = () => {
    flushSaveToSupabase();
    onClose();
  };

  return (
    <div style={modalOverlay} onClick={handleClose}>
      <div style={modalContent} onClick={e => e.stopPropagation()}>
        <button
          onClick={handleClose}
          style={{
            position: 'absolute', top: 12, right: 12, width: 36, height: 36,
            borderRadius: '50%', border: `1px solid ${S.border}`, background: 'rgba(0,0,0,0.3)',
            color: S.textDim, fontSize: '1.2rem', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 10,
          }}
        >
          ✕
        </button>

        {screen === 'setup' && <SetupScreen state={state} onDone={handleSetupDone} />}
        {screen === 'home' && <HomeScreen state={state} onNavigate={navigate} onUpdate={updateState} isCoach={arenaData?.isCoach} />}
        {screen === 'quiz' && (
          <QuizGame
            state={state}
            mode={screenParams.mode || 'studio'}
            onBack={() => setScreen('home')}
            onComplete={handleQuizComplete}
          />
        )}
        {screen === 'studioResult' && screenParams.studioResult && (
          <StudioResultScreen
            state={state}
            result={screenParams.studioResult}
            onDone={() => setScreen('home')}
          />
        )}
        {screen === 'heatmap' && <HeatmapScreen state={state} onBack={() => setScreen('home')} />}
        {screen === 'shop' && <ShopScreen state={state} onBack={() => setScreen('home')} onUpdate={updateState} />}
        {screen === 'battle' && (
          <BattleScreen state={state} onBack={() => setScreen('home')} onComplete={handleQuizComplete} />
        )}
        {screen === 'coach' && arenaData && (
          <CoachScreen arenaData={arenaData} supabaseRef={supabaseRef} onBack={() => setScreen('home')} />
        )}
      </div>

      <style>{`
        @keyframes arena-pop { 0% { transform: scale(0.5); opacity: 0; } 70% { transform: scale(1.05); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes arena-shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
        @keyframes arena-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes arena-slide { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes arena-flyUp { 0% { transform: translateX(-50%) translateY(0); opacity: 1; } 100% { transform: translateX(-50%) translateY(-60px); opacity: 0; } }
        @keyframes arena-glow { 0%,100% { box-shadow: 0 0 8px rgba(245,200,66,0.3); } 50% { box-shadow: 0 0 20px rgba(245,200,66,0.6); } }
        @keyframes rankShimmer { 0% { transform: translateX(-100%); } 50% { transform: translateX(100%); } 100% { transform: translateX(100%); } }
        @keyframes rankPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.85; } }
      `}</style>
    </div>
  );
}

// ============================================
// SETUP SCREEN
// ============================================

function SetupScreen({ state, onDone }: { state: ArenaState; onDone: (name: string) => void }) {
  const [name, setName] = useState(state.playerName || '');

  return (
    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
      <div style={{ ...cardStyle, padding: '2.5rem 2rem', animation: 'arena-pop 0.3s ease forwards' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: 'arena-float 3s ease-in-out infinite' }}>⚔️</div>
        <h1 style={{ ...rockFont, fontSize: '2.5rem', color: S.gold, marginBottom: '0.3rem' }}>EINMALEINS</h1>
        <h2 style={{ ...rockFont, fontSize: '1.5rem', color: S.cyan, marginBottom: '1.5rem', letterSpacing: 4 }}>ARENA</h2>
        <p style={{ color: S.textDim, marginBottom: '1.5rem', lineHeight: 1.5 }}>
          Werde zum Einmaleins-Champion! Trainiere, kaempfe und sammle Coins fuer deinen Avatar.
        </p>
        <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: S.textDim, marginBottom: '0.5rem' }}>Dein Arena-Name:</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && name.trim() && onDone(name.trim())}
            placeholder="z.B. Zahlen-Ritter..."
            autoFocus
            style={{
              width: '100%', padding: '0.75rem 1rem', fontSize: '1.1rem',
              background: 'rgba(255,255,255,0.05)', border: `2px solid ${S.purple}`,
              borderRadius: 12, color: S.text, fontFamily: 'Nunito', outline: 'none',
            }}
          />
        </div>
        <button
          style={{ ...btnGold, fontSize: '1.3rem', padding: '0.8rem 2.5rem', width: '100%', justifyContent: 'center' }}
          onClick={() => name.trim() && onDone(name.trim())}
        >
          ⚔️ AB IN DIE ARENA!
        </button>
      </div>
    </div>
  );
}

// ============================================
// HOME SCREEN
// ============================================

function HomeScreen({ state, onNavigate, onUpdate, isCoach }: {
  state: ArenaState;
  onNavigate: (s: Screen, p?: ScreenParams) => void;
  onUpdate: (u: Partial<ArenaState>) => void;
  isCoach?: boolean;
}) {
  const [showHelp, setShowHelp] = useState(false);
  const levelInfo = getLevelFromXP(state.arenaXP);
  const levelRank = getRankForLevel(levelInfo.level);
  const levelProgress = (levelInfo.xpInLevel / levelInfo.xpNeeded) * 100;
  const speedRank = getSpeedRank(state.studioSpeed, state.studioSpeeds.length);
  const av = state.avatar;

  return (
    <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
      {/* Header */}
      <div style={{ marginBottom: '1rem' }}>
        <h1 style={{ ...rockFont, fontSize: 'clamp(2rem, 7vw, 3.5rem)', color: S.gold, textShadow: '0 0 20px rgba(245,200,66,0.4), 0 3px 0 rgba(0,0,0,0.5)', lineHeight: 1 }}>
          ⚔️ EINMALEINS ⚔️
        </h1>
        <h2 style={{ ...rockFont, fontSize: 'clamp(1rem, 3.5vw, 1.5rem)', color: S.cyan, letterSpacing: 6, textShadow: '0 0 10px rgba(0,229,255,0.4)' }}>
          ARENA
        </h2>
      </div>

      {/* Player Card */}
      <div style={{ ...cardStyle, padding: '1.2rem', marginBottom: '1rem', animation: 'arena-slide 0.4s ease forwards' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '2.5rem', lineHeight: 1, animation: 'arena-float 3s ease-in-out infinite' }}>
            {getItemEmoji('hair', av.hair)}{getItemEmoji('accessory', av.accessory)}
            <br/>
            {getItemEmoji('outfit', av.outfit)}{getItemEmoji('instrument', av.instrument)}
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ ...rockFont, fontSize: '1.3rem', color: S.text }}>{state.playerName || 'Kaempfer'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.15rem' }}>
              <span style={{
                ...rockFont, fontSize: '0.85rem',
                background: `linear-gradient(135deg, ${S.purple}, ${S.cyan})`,
                color: 'white', padding: '0.1rem 0.5rem', borderRadius: 6,
              }}>
                Lv. {levelInfo.level}
              </span>
              <span style={{ ...rockFont, fontSize: '0.85rem', color: levelRank.color }}>
                ★ {levelRank.name}
              </span>
            </div>
            {/* XP-Leiste */}
            <div style={{ marginTop: '0.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: S.textDim }}>
                <span>Lv.{levelInfo.level}</span>
                <span>{levelInfo.xpInLevel}/{levelInfo.xpNeeded} XP</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 999, height: 6, overflow: 'hidden' }}>
                <div style={{ width: `${levelProgress}%`, height: '100%', background: `linear-gradient(90deg, ${S.purple}, ${S.cyan})`, borderRadius: 999, transition: 'width 1s ease' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
              <span style={{ ...coinBadge, fontSize: '0.8rem', padding: '0.15rem 0.5rem' }}>🪙 {state.coins}</span>
              <span style={{ ...coinBadge, fontSize: '0.8rem', padding: '0.15rem 0.5rem', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.4)', color: S.purpleLight }}>⚡ {state.arenaXP}</span>
            </div>
          </div>
        </div>
      </div>

      {/* STUDIO Card - volle Breite, gold */}
      <button
        onClick={() => onNavigate('quiz', { mode: 'studio' })}
        style={{
          width: '100%', textAlign: 'center', padding: '1rem', marginBottom: '0.75rem',
          background: `linear-gradient(135deg, rgba(196,154,16,0.2), rgba(245,200,66,0.15))`,
          border: `2px solid ${S.gold}60`, borderRadius: 16, cursor: 'pointer',
          color: S.text, transition: 'all 0.2s ease',
          animation: 'arena-glow 3s ease-in-out infinite',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = S.gold; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = `${S.gold}60`; e.currentTarget.style.transform = ''; }}
      >
        <div style={{ ...rockFont, fontSize: '1.4rem', color: S.gold, marginBottom: '0.2rem' }}>
          🎸 STUDIO
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.2rem' }}>{speedRank.emoji}</span>
          <span style={{ ...rockFont, color: speedRank.color, fontSize: '1rem' }}>{speedRank.name}</span>
          {state.studioSpeeds.length >= MIN_GAMES_FOR_RANK && state.studioSpeed !== null && (
            <span style={{ fontSize: '0.8rem', color: S.textDim }}>
              ⏱️ {state.studioSpeed.toFixed(1)}s
            </span>
          )}
        </div>
        <div style={{ fontSize: '0.72rem', color: S.textDim, marginTop: '0.15rem' }}>
          {state.studioSpeeds.length < MIN_GAMES_FOR_RANK
            ? `Noch ${MIN_GAMES_FOR_RANK - state.studioSpeeds.length} Spiele bis zum Rang (${state.studioSpeeds.length}/${MIN_GAMES_FOR_RANK})`
            : `60 Sek – Rang-Messung (∅ letzten ${state.studioSpeeds.length} Spiele)`}
        </div>
      </button>

      {/* Mode Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.6rem' }}>
        <ModeCard icon="⚔️" title="Training" subtitle="Adaptive Fragen" color={S.purpleLight} onClick={() => onNavigate('quiz', { mode: 'training' })} />
        <ModeCard icon="🏆" title="Turnier" subtitle="2x Coins!" color={S.cyan} onClick={() => onNavigate('quiz', { mode: 'turnier' })} />
        <ModeCard icon="🎵" title="Jamming" subtitle="Kein Timer" color={'#6ee7b7'} onClick={() => onNavigate('quiz', { mode: 'jamming' })} />
        <ModeCard icon="🎤" title="Soundcheck" subtitle="6s pro Frage" color={'#f97316'} onClick={() => onNavigate('quiz', { mode: 'soundcheck' })} />
        <ModeCard icon="🤺" title="Duell" subtitle="vs. KI / Freund" color={S.pink} onClick={() => onNavigate('battle')} />
        <ModeCard icon="🗺️" title="Heatmap" subtitle="Deine Staerken" color={S.gold} onClick={() => onNavigate('heatmap')} />
      </div>

      {/* Division Toggle */}
      <div style={{ marginBottom: '0.6rem' }}>
        <div style={{ fontSize: '0.75rem', color: S.textDim, marginBottom: '0.3rem' }}>Rechenart:</div>
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
          {([['mult', '× Mal'], ['div', '÷ Geteilt'], ['both', '×÷ Beides']] as [QuestionType, string][]).map(([type, label]) => (
            <button
              key={type}
              onClick={() => onUpdate({ questionType: type })}
              style={{
                padding: '0.3rem 0.75rem', borderRadius: 10, cursor: 'pointer',
                fontFamily: 'Nunito', fontWeight: 800, fontSize: '0.82rem',
                background: state.questionType === type ? S.purple : 'transparent',
                border: `1px solid ${state.questionType === type ? S.purple : S.border}`,
                color: state.questionType === type ? 'white' : S.textDim,
                transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Utility Buttons */}
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button style={btnGhost} onClick={() => onNavigate('shop')}>🛒 Avatar-Shop</button>
        <button style={btnGhost} onClick={() => onNavigate('setup')}>✏️ Name aendern</button>
        {isCoach && (
          <button style={btnGhost} onClick={() => onNavigate('coach')}>📊 Schueler-Fortschritt</button>
        )}
      </div>

      {/* Help */}
      <div style={{ marginTop: '0.75rem' }}>
        <button
          onClick={() => setShowHelp(h => !h)}
          style={{
            background: 'none', border: 'none', color: S.textDim,
            cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Nunito',
            display: 'flex', alignItems: 'center', gap: '0.3rem', margin: '0 auto',
          }}
        >
          <span style={{ transition: 'transform 0.2s', transform: showHelp ? 'rotate(90deg)' : 'rotate(0deg)', display: 'inline-block' }}>▶</span>
          So funktioniert's
        </button>
        {showHelp && (
          <div style={{ ...cardStyle, padding: '1rem 1.25rem', marginTop: '0.5rem', textAlign: 'left', fontSize: '0.82rem', lineHeight: 1.6, color: S.textDim, animation: 'arena-slide 0.3s ease forwards' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ color: S.gold, fontWeight: 800 }}>🎸 Studio</span><br/>
              60 Sekunden, alle Tabellen. Dein Durchschnitt der letzten 10 Spiele bestimmt deinen Rang (Neuling bis Legende). Je schneller du antwortest, desto hoeher dein Rang!
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ color: S.purpleLight, fontWeight: 800 }}>⚔️ Training</span><br/>
              60 Sekunden, adaptive Fragen. Die Arena erkennt deine Schwaechen und stellt dir gezielt die Aufgaben, die du noch ueben musst.
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ color: S.cyan, fontWeight: 800 }}>🏆 Turnier</span><br/>
              60 Sekunden, doppelte Coins! Perfekt, wenn du dich schon sicher fuehlst.
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ color: '#6ee7b7', fontWeight: 800 }}>🎵 Jamming</span><br/>
              Kein Timer, kein Stress. Uebe in deinem eigenen Tempo. Du kannst eine bestimmte Reihe auswaehlen.
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ color: '#f97316', fontWeight: 800 }}>🎤 Soundcheck</span><br/>
              25 Fragen mit je 6 Sekunden Zeit. Zeigt dir, wie sicher du bei jeder Aufgabe bist.
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ color: S.pink, fontWeight: 800 }}>🤺 Duell</span><br/>
              10 Runden, 8 Sekunden pro Frage. Tritt gegen die KI an oder spiele zu zweit!
            </div>
            <div>
              <span style={{ color: S.purpleLight, fontWeight: 800 }}>⚡ Level & Rang</span><br/>
              XP gibt es in jedem Modus. Level und Titel (Knappe → Legende) basieren auf gesammelten XP. Der Studio-Rang basiert auf deiner Geschwindigkeit!
            </div>
          </div>
        )}
      </div>

      {state.scores.length > 0 && (
        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1.5rem', justifyContent: 'center', color: S.textDim, fontSize: '0.82rem' }}>
          <span>🎯 {state.totalCorrect} gesamt</span>
          <span>🎮 {state.scores.length} Sessions</span>
        </div>
      )}
    </div>
  );
}

function ModeCard({ icon, title, subtitle, color, onClick }: {
  icon: string; title: string; subtitle: string; color: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: S.card, border: `1px solid ${color}40`, borderRadius: 16,
        padding: '0.75rem 0.5rem', cursor: 'pointer', textAlign: 'center',
        backdropFilter: 'blur(12px)', transition: 'all 0.2s ease', color: S.text,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${color}30`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      <div style={{ fontSize: '1.6rem', marginBottom: '0.1rem' }}>{icon}</div>
      <div style={{ ...rockFont, color, fontSize: '0.95rem', letterSpacing: 1 }}>{title}</div>
      <div style={{ fontSize: '0.68rem', color: S.textDim, marginTop: '0.05rem' }}>{subtitle}</div>
    </button>
  );
}

// ============================================
// QUIZ GAME
// ============================================

function QuizGame({ state, mode, onBack, onComplete }: {
  state: ArenaState; mode: QuizMode; onBack: () => void;
  onComplete: (r: { correct: number; wrong: number; coinsEarned: number; xpEarned: number; heatmap: Record<string, HeatmapEntry>; mode: string; avgSpeed?: number }) => void;
}) {
  const cfg = QUIZ_MODES[mode];
  const hasGlobalTimer = cfg.duration > 0;
  const isSoundcheck = mode === 'soundcheck';
  const isJamming = mode === 'jamming';
  const isStudio = mode === 'studio';
  const isTraining = mode === 'training';
  const showTableSelect = mode === 'turnier' || mode === 'jamming';

  const [phase, setPhase] = useState<'ready' | 'playing' | 'done'>('ready');
  const [question, setQuestion] = useState<Question | null>(null);
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(cfg.duration);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(isSoundcheck ? SOUNDCHECK_TIME : 0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [feedback, setFeedback] = useState<'ok' | 'bad' | null>(null);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [focusTable, setFocusTable] = useState<number | null>(null);
  const [heatmap, setHeatmap] = useState(state.heatmap);
  const [floats, setFloats] = useState<{ id: number; text: string }[]>([]);
  const [shakeKey, setShakeKey] = useState(0);
  const [sessionXP, setSessionXP] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [questionTimes, setQuestionTimes] = useState<number[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const perQuestionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const questionStartRef = useRef<number>(0);
  const questionRef = useRef<Question | null>(null);

  // Keep questionRef in sync
  useEffect(() => { questionRef.current = question; }, [question]);

  const genQuestion = useCallback(() => {
    if (isTraining) {
      return generateAdaptiveQuestion(heatmap, state.questionType);
    }
    if (isStudio) {
      return generateQuestion(null, state.questionType);
    }
    return generateQuestion(focusTable, state.questionType);
  }, [isTraining, isStudio, focusTable, state.questionType, heatmap]);

  const nextQuestion = useCallback(() => {
    const q = genQuestion();
    setQuestion(q);
    setInput('');
    setFeedback(null);
    questionStartRef.current = Date.now();
    if (isSoundcheck) {
      setQuestionTimeLeft(SOUNDCHECK_TIME);
    }
  }, [genQuestion, isSoundcheck]);

  const startGame = () => {
    setPhase('playing');
    setCorrect(0); setWrong(0); setCombo(0); setMaxCombo(0);
    setSessionXP(0); setQuestionsAnswered(0); setQuestionTimes([]);
    setTimeLeft(cfg.duration);
    questionStartRef.current = Date.now();
    nextQuestion();
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Global timer (studio, training, turnier)
  useEffect(() => {
    if (phase !== 'playing' || !hasGlobalTimer) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setPhase('done');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, hasGlobalTimer]);

  // Per-question timer (soundcheck) - restart on each new question
  useEffect(() => {
    if (phase !== 'playing' || !isSoundcheck) return;
    if (perQuestionTimerRef.current) clearInterval(perQuestionTimerRef.current);
    setQuestionTimeLeft(SOUNDCHECK_TIME);

    perQuestionTimerRef.current = setInterval(() => {
      setQuestionTimeLeft(t => {
        if (t <= 1) {
          if (perQuestionTimerRef.current) clearInterval(perQuestionTimerRef.current);
          // Timeout: zaehlt als falsch
          const q = questionRef.current;
          if (q) {
            setWrong(w => w + 1);
            setCombo(0);
            setFeedback('bad');
            setQuestionTimes(prev => [...prev, SOUNDCHECK_TIME]);
            setHeatmap(h => doUpdateHeatmap(h, q.heatmapKey, false, SOUNDCHECK_TIME));
            setQuestionsAnswered(n => {
              const next = n + 1;
              if (next >= SOUNDCHECK_QUESTIONS) {
                setTimeout(() => setPhase('done'), 500);
              } else {
                setTimeout(() => nextQuestion(), 500);
              }
              return next;
            });
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (perQuestionTimerRef.current) clearInterval(perQuestionTimerRef.current); };
  }, [phase, isSoundcheck, question]); // eslint-disable-line react-hooks/exhaustive-deps

  const submitAnswer = useCallback(() => {
    if (!question || feedback) return;
    const userAns = parseInt(input, 10);
    const isCorrect = userAns === question.answer;
    const answerTime = (Date.now() - questionStartRef.current) / 1000;
    const trackTime = !isJamming; // Jamming schreibt keine Zeiten

    const newHeat = doUpdateHeatmap(heatmap, question.heatmapKey, isCorrect, trackTime ? answerTime : null);
    setHeatmap(newHeat);
    setQuestionTimes(prev => [...prev, answerTime]);

    if (isCorrect) {
      const newCombo = combo + 1;
      setCorrect(c => c + 1);
      setCombo(newCombo);
      setMaxCombo(m => Math.max(m, newCombo));
      setFeedback('ok');

      // XP basiert auf Antwortgeschwindigkeit: schneller = mehr Bonus (max 15 Punkte → speedBonus max 5)
      const speedForXP = Math.max(0, 15 - answerTime * 2);
      const answerXP = calcAnswerXP(speedForXP, newCombo, mode);
      setSessionXP(x => x + answerXP);

      const id = Date.now();
      const pts = `+${answerXP} XP` + (newCombo >= 3 ? ' 🔥' : '');
      setFloats(f => [...f, { id, text: pts }]);
      setTimeout(() => setFloats(f => f.filter(x => x.id !== id)), 900);

      if (isSoundcheck) {
        if (perQuestionTimerRef.current) clearInterval(perQuestionTimerRef.current);
        setQuestionsAnswered(n => {
          const next = n + 1;
          if (next >= SOUNDCHECK_QUESTIONS) {
            setTimeout(() => setPhase('done'), 400);
          } else {
            setTimeout(() => nextQuestion(), 300);
          }
          return next;
        });
      } else {
        setTimeout(() => nextQuestion(), 300);
      }
    } else {
      setWrong(w => w + 1);
      setCombo(0);
      setFeedback('bad');
      setShakeKey(k => k + 1);
      if (isSoundcheck) {
        if (perQuestionTimerRef.current) clearInterval(perQuestionTimerRef.current);
        setQuestionsAnswered(n => {
          const next = n + 1;
          if (next >= SOUNDCHECK_QUESTIONS) {
            setTimeout(() => setPhase('done'), 600);
          } else {
            setTimeout(() => nextQuestion(), 700);
          }
          return next;
        });
      } else {
        setTimeout(() => nextQuestion(), 700);
      }
    }
  }, [question, input, feedback, heatmap, combo, timeLeft, questionTimeLeft, mode, hasGlobalTimer, isSoundcheck, isJamming, nextQuestion]);

  const finishJamming = useCallback(() => {
    setPhase('done');
  }, []);

  const coinsEarned = Math.floor((correct + Math.floor(maxCombo / 3)) * cfg.coinMult);
  const accuracy = correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0;
  // Durchschnitt: Bei zeitbasierten Modi (Studio etc.) = Gesamtzeit / Anzahl Antworten
  const totalAnswered = correct + wrong;
  const avgSpeed = hasGlobalTimer && cfg.duration > 0 && totalAnswered > 0
    ? cfg.duration / totalAnswered
    : questionTimes.length > 0 ? questionTimes.reduce((a, b) => a + b, 0) / questionTimes.length : 0;

  // Ready Phase
  if (phase === 'ready') return (
    <div style={{ padding: '0.5rem 0' }}>
      <button style={btnGhost} onClick={onBack}>← Zurueck</button>
      <div style={{ ...cardStyle, padding: '2rem', textAlign: 'center', marginTop: '0.75rem', animation: 'arena-slide 0.4s ease forwards' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{cfg.icon}</div>
        <h2 style={{ ...rockFont, fontSize: '1.8rem', color: cfg.color, marginBottom: '0.3rem' }}>{cfg.label}</h2>
        <p style={{ color: S.textDim, marginBottom: '1rem', fontSize: '0.9rem' }}>{cfg.desc}</p>

        {isStudio && state.studioSpeed !== null && (
          <div style={{ marginBottom: '1rem', padding: '0.5rem', background: `${S.gold}15`, borderRadius: 10, border: `1px solid ${S.gold}30` }}>
            <div style={{ fontSize: '0.8rem', color: S.textDim }}>Aktueller Rang</div>
            {state.studioSpeeds.length < MIN_GAMES_FOR_RANK ? (
              <div style={{ ...rockFont, color: FRISCHLING.color, fontSize: '1.1rem' }}>
                {FRISCHLING.emoji} {FRISCHLING.name} ({state.studioSpeeds.length}/{MIN_GAMES_FOR_RANK} Spiele)
              </div>
            ) : (
              <div style={{ ...rockFont, color: getSpeedRank(state.studioSpeed).color, fontSize: '1.1rem' }}>
                {getSpeedRank(state.studioSpeed).emoji} {getSpeedRank(state.studioSpeed).name} ({state.studioSpeed.toFixed(1)}s)
              </div>
            )}
          </div>
        )}

        {showTableSelect && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', color: S.textDim, marginBottom: '0.4rem' }}>
              Tabelle fokussieren (optional):
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', justifyContent: 'center' }}>
              {[null, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                <button
                  key={n ?? 'all'}
                  onClick={() => setFocusTable(n)}
                  style={{
                    padding: '0.2rem 0.5rem', borderRadius: 8,
                    border: `1px solid ${focusTable === n ? cfg.color : S.border}`,
                    background: focusTable === n ? `${cfg.color}30` : 'transparent',
                    color: focusTable === n ? cfg.color : S.textDim,
                    cursor: 'pointer', fontFamily: 'Nunito', fontWeight: 700, fontSize: '0.82rem',
                  }}
                >
                  {n ?? 'Alle'}
                </button>
              ))}
            </div>
          </div>
        )}

        {isSoundcheck && (
          <div style={{ fontSize: '0.82rem', color: S.textDim, marginBottom: '1rem' }}>
            {SOUNDCHECK_QUESTIONS} Fragen · {SOUNDCHECK_TIME} Sek. pro Frage
          </div>
        )}

        {isJamming && (
          <div style={{ fontSize: '0.82rem', color: S.textDim, marginBottom: '1rem' }}>
            Kein Zeitlimit – druecke "Fertig" wenn du aufhoeren willst
          </div>
        )}

        <button style={{ ...btnPrimary, fontSize: '1.2rem', padding: '0.7rem 1.8rem', background: `linear-gradient(135deg, ${cfg.color}cc, ${cfg.color})`, color: cfg.color === S.gold || cfg.color === '#6ee7b7' || cfg.color === '#f97316' ? S.navy : 'white' }} onClick={startGame}>
          {cfg.icon} LOS GEHT'S!
        </button>
      </div>
    </div>
  );

  // Done Phase
  const previewLevel = getLevelFromXP(state.arenaXP + sessionXP);
  const currentLevel = getLevelFromXP(state.arenaXP);
  const leveledUp = previewLevel.level > currentLevel.level;
  const levelsGained = previewLevel.level - currentLevel.level;

  if (phase === 'done') return (
    <div style={{ padding: '0.5rem 0' }}>
      <button style={btnGhost} onClick={onBack}>← Zurueck</button>
      <div style={{ ...cardStyle, padding: '2rem', textAlign: 'center', marginTop: '0.75rem', animation: 'arena-pop 0.3s ease forwards' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.4rem' }}>{leveledUp ? '🎉' : accuracy >= 80 ? '🏆' : accuracy >= 50 ? '😅' : '💪'}</div>
        <h2 style={{ ...rockFont, fontSize: '2rem', color: S.gold, marginBottom: '0.5rem' }}>Session vorbei!</h2>

        {/* Geschwindigkeit anzeigen */}
        {questionTimes.length > 0 && (
          <div style={{ marginBottom: '0.75rem', padding: '0.5rem', background: `${cfg.color}15`, borderRadius: 10, border: `1px solid ${cfg.color}30` }}>
            <div style={{ fontSize: '0.8rem', color: S.textDim }}>⏱️ Durchschnitt</div>
            <div style={{ ...rockFont, fontSize: '1.3rem', color: cfg.color }}>{avgSpeed.toFixed(1)}s / Antwort</div>
            {isStudio && (
              <div style={{ fontSize: '0.75rem', color: getSpeedRank(avgSpeed).color, marginTop: '0.15rem' }}>
                {getSpeedRank(avgSpeed).emoji} {getSpeedRank(avgSpeed).name}
              </div>
            )}
          </div>
        )}

        {/* Level-Up */}
        {leveledUp && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(245,200,66,0.2), rgba(139,92,246,0.2))',
            border: '2px solid rgba(245,200,66,0.6)',
            borderRadius: 14, padding: '0.75rem', marginBottom: '0.75rem',
            animation: 'arena-pop 0.4s ease forwards',
          }}>
            <div style={{ ...rockFont, fontSize: '1.4rem', color: S.gold }}>⬆️ LEVEL UP! ⬆️</div>
            <div style={{ ...rockFont, fontSize: '1.1rem', color: S.text, marginTop: '0.2rem' }}>
              Level {currentLevel.level} → Level {previewLevel.level}
            </div>
            {levelsGained > 1 && (
              <div style={{ fontSize: '0.8rem', color: S.gold, marginTop: '0.15rem' }}>
                {levelsGained} Level auf einmal! 🔥
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.75rem' }}>
          <StatBox label="Richtig" value={String(correct)} color={S.green} />
          <StatBox label="Falsch" value={String(wrong)} color={S.red} />
          <StatBox label="Arena-XP" value={`+${sessionXP}`} color={S.purpleLight} />
          <StatBox label="Coins" value={`🪙 ${coinsEarned}`} color={S.gold} />
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: S.textDim, marginBottom: '0.2rem' }}>
            <span>Level {previewLevel.level}</span>
            <span>{previewLevel.xpInLevel} / {previewLevel.xpNeeded} XP</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 999, height: 8, overflow: 'hidden' }}>
            <div style={{ width: `${(previewLevel.xpInLevel / previewLevel.xpNeeded) * 100}%`, height: '100%', background: `linear-gradient(90deg, ${S.purple}, ${S.cyan})`, borderRadius: 999, transition: 'width 0.5s ease' }} />
          </div>
        </div>

        {maxCombo >= 3 && <p style={{ color: S.gold, marginBottom: '0.75rem', fontWeight: 800 }}>🔥 Max Combo: {maxCombo}x!</p>}

        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
          <button style={btnPrimary} onClick={() => onComplete({ correct, wrong, coinsEarned, xpEarned: sessionXP, heatmap, mode, avgSpeed: questionTimes.length > 0 ? avgSpeed : undefined })}>
            ✅ Speichern
          </button>
          <button style={btnGhost} onClick={startGame}>🔄 Nochmal</button>
        </div>
      </div>
    </div>
  );

  // Playing Phase
  const timerPct = hasGlobalTimer ? (timeLeft / cfg.duration) * 100 : 0;
  const timerColor = hasGlobalTimer ? (timeLeft > 10 ? cfg.color : S.red) : cfg.color;
  const scTimerPct = isSoundcheck ? (questionTimeLeft / SOUNDCHECK_TIME) * 100 : 0;
  const scTimerColor = isSoundcheck ? (questionTimeLeft > 2 ? cfg.color : S.red) : cfg.color;

  return (
    <div style={{ padding: '0.5rem 0', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button style={btnGhost} onClick={onBack}>← Zurueck</button>
        {isJamming && (
          <button style={{ ...btnGreen, fontSize: '0.9rem', padding: '0.35rem 0.8rem' }} onClick={finishJamming}>✅ Fertig</button>
        )}
      </div>

      {/* Timer / Status */}
      <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
        {hasGlobalTimer && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem', fontSize: '0.82rem' }}>
              <span style={{ color: timerColor, fontWeight: 800, ...rockFont }}>⏱ {timeLeft}s</span>
              <span style={{ color: S.textDim }}>✅{correct} ❌{wrong}</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 999, height: 10, overflow: 'hidden' }}>
              <div style={{ width: `${timerPct}%`, height: '100%', background: timerColor, borderRadius: 999, transition: 'width 1s linear, background 0.3s' }} />
            </div>
          </>
        )}

        {isSoundcheck && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem', fontSize: '0.82rem' }}>
              <span style={{ color: scTimerColor, fontWeight: 800, ...rockFont }}>⏱ {questionTimeLeft}s</span>
              <span style={{ color: S.textDim }}>Frage {questionsAnswered + 1}/{SOUNDCHECK_QUESTIONS} · ✅{correct} ❌{wrong}</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 999, height: 10, overflow: 'hidden' }}>
              <div style={{ width: `${scTimerPct}%`, height: '100%', background: scTimerColor, borderRadius: 999, transition: 'width 1s linear, background 0.3s' }} />
            </div>
          </>
        )}

        {isJamming && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
            <span style={{ color: cfg.color, fontWeight: 800, ...rockFont }}>🎵 Jamming</span>
            <span style={{ color: S.textDim }}>✅{correct} ❌{wrong}</span>
          </div>
        )}
      </div>

      {/* Combo */}
      {combo >= 2 && (
        <div style={{ textAlign: 'center', marginBottom: '0.3rem', color: S.gold, ...rockFont, fontSize: '1.05rem' }}>
          🔥 {combo}x COMBO!
        </div>
      )}

      {/* Question Card */}
      <div
        key={shakeKey}
        style={{
          ...cardStyle, padding: '1.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden',
          animation: feedback === 'bad' ? 'arena-shake 0.3s ease' : undefined,
        }}
      >
        {feedback === 'ok' && <div style={{ position: 'absolute', inset: 0, background: 'rgba(34,197,94,0.08)', borderRadius: 16, pointerEvents: 'none' }} />}
        {feedback === 'bad' && <div style={{ position: 'absolute', inset: 0, background: 'rgba(239,68,68,0.1)', borderRadius: 16, pointerEvents: 'none' }} />}

        {question && (
          <>
            <div style={{ ...rockFont, fontSize: 'clamp(2rem, 9vw, 3.5rem)', color: S.text, marginBottom: '0.4rem' }}>
              {question.displayText} = ?
            </div>
            <input
              ref={inputRef}
              type="text"
              inputMode="none"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitAnswer()}
              style={{
                width: 180, textAlign: 'center', fontSize: '2.4rem', fontFamily: 'Nunito, sans-serif', fontWeight: 700,
                background: 'rgba(255,255,255,0.05)',
                border: `2px solid ${feedback === 'ok' ? S.green : feedback === 'bad' ? S.red : cfg.color}`,
                borderRadius: 12, color: S.text, padding: '0.6rem', outline: 'none',
              }}
              placeholder="..."
              autoFocus
            />
            <div style={{ marginTop: '0.6rem' }}>
              <button style={btnPrimary} onClick={submitAnswer}>✓ Enter</button>
            </div>
          </>
        )}
      </div>

      {/* Floating points */}
      {floats.map(f => (
        <div key={f.id} style={{
          position: 'absolute', top: '40%', left: '50%', transform: 'translateX(-50%)',
          color: S.gold, ...rockFont, fontSize: '1.4rem', pointerEvents: 'none',
          animation: 'arena-flyUp 0.9s ease forwards', zIndex: 10,
        }}>
          {f.text}
        </div>
      ))}

      {/* Number pad */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem', marginTop: '0.6rem' }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, '✓'].map(k => (
          <button
            key={k}
            onClick={() => {
              if (k === '⌫') setInput(i => i.slice(0, -1));
              else if (k === '✓') submitAnswer();
              else setInput(i => i + k);
            }}
            style={{
              padding: '0.9rem', fontSize: '1.4rem', ...rockFont,
              background: k === '✓' ? cfg.color + '30' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${k === '✓' ? cfg.color : S.border}`,
              borderRadius: 10, color: k === '✓' ? cfg.color : S.text, cursor: 'pointer',
            }}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================
// STUDIO RESULT SCREEN
// ============================================

// ============================================
// RANG-UEBERSICHT (alle Raenge + Position)
// ============================================

function RankOverview({ currentSpeed, gamesPlayed }: { currentSpeed: number | null; gamesPlayed: number }) {
  const isFrischling = gamesPlayed < MIN_GAMES_FOR_RANK;
  const currentRank = isFrischling ? FRISCHLING as typeof SPEED_RANKS[number] : getSpeedRank(currentSpeed);
  // visibleRanks: Rockgott(0) ... Kellerrocker(9) — schnellster zuerst
  const visibleRanks = SPEED_RANKS.filter(r => r.maxTime !== Infinity);
  const currentIdx = isFrischling ? -1 : visibleRanks.findIndex(r => r.name === currentRank.name);
  // Fuellung: von unten (Kellerrocker) bis zum erreichten Rang, 0 bei Frischling
  const reachedFromBottom = currentIdx === -1 ? 0 : visibleRanks.length - currentIdx;
  const fillPct = (reachedFromBottom / visibleRanks.length) * 100;

  // Render-Reihenfolge: Legende oben, Neuling unten (= visibleRanks direkt)
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ fontSize: '0.78rem', color: S.textDim, marginBottom: '0.6rem', fontWeight: 700 }}>
        {isFrischling
          ? `🆕 Frischling – noch ${MIN_GAMES_FOR_RANK - gamesPlayed} Studio-Spiele bis zum Rang (${gamesPlayed}/${MIN_GAMES_FOR_RANK})`
          : `Dein Rang (∅ letzten ${gamesPlayed} Spiele):`}
      </div>
      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'stretch' }}>
        {/* Thermometer-Balken */}
        <div style={{ width: 28, flexShrink: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden',
          }}>
            {/* Gefuellter Bereich von unten bis zum erreichten Rang */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: `${fillPct}%`,
              background: 'linear-gradient(to top, #dc2626 0%, #ef4444 20%, #f97316 40%, #f59e0b 60%, #eab308 70%, #86efac 80%, #4ade80 90%, #22c55e 100%)',
              borderRadius: '0 0 13px 13px',
              transition: 'height 1s ease',
              boxShadow: `0 0 12px ${currentRank.color}50`,
            }} />
          </div>
        </div>

        {/* Rang-Labels: Legende oben, Neuling unten */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {visibleRanks.map((rank, idx) => {
            const isCurrent = rank.name === currentRank.name;
            // Erreicht = idx >= currentIdx (aktueller und alle darunter/langsamer)
            const isReached = currentIdx !== -1 && idx >= currentIdx;

            return (
              <div key={rank.name} style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.2rem 0.5rem',
                borderRadius: 8,
                ...(isCurrent ? {
                  background: `${rank.color}18`,
                  boxShadow: `0 0 10px ${rank.color}30`,
                } : {}),
              }}>
                <span style={{
                  fontSize: isCurrent ? '1.15rem' : '0.85rem',
                  filter: isReached ? 'none' : 'grayscale(0.8)',
                  opacity: isReached ? 1 : 0.4,
                }}>
                  {rank.emoji}
                </span>
                <span style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: isCurrent ? 800 : 600,
                  fontSize: isCurrent ? '0.88rem' : '0.75rem',
                  color: isCurrent ? rank.color : isReached ? S.text : S.textDim,
                  opacity: isReached ? 1 : 0.45,
                }}>
                  {rank.name}
                </span>
                <span style={{
                  fontSize: '0.6rem',
                  color: isCurrent ? `${rank.color}bb` : S.textDim,
                  opacity: isReached ? 0.8 : 0.35,
                }}>
                  ≤{rank.maxTime}s
                </span>
                {isCurrent && (
                  <span style={{
                    marginLeft: 'auto', fontSize: '0.6rem', fontWeight: 800,
                    color: '#0d1117', background: rank.color,
                    padding: '0.1rem 0.4rem', borderRadius: 6,
                  }}>
                    DU
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StudioResultScreen({ state, result, onDone }: {
  state: ArenaState;
  result: { correct: number; wrong: number; avgSpeed: number; sessionXP: number; coinsEarned: number; mode: string };
  onDone: () => void;
}) {
  const overallRank = getSpeedRank(state.studioSpeed, state.studioSpeeds.length);
  const sessionRank = getSpeedRank(result.avgSpeed);
  const totalAnswered = result.correct + result.wrong;
  const modeLabel = (QUIZ_MODES as Record<string, { label: string; duration: number; icon: string }>)[result.mode];
  const modeName = modeLabel?.label || result.mode;
  const modeIcon = modeLabel?.icon || '⚔️';
  const duration = modeLabel?.duration || 60;

  return (
    <div style={{ padding: '0.5rem 0', textAlign: 'center' }}>
      <div style={{ ...cardStyle, padding: '2rem', animation: 'arena-pop 0.3s ease forwards' }}>
        {/* Modus-Header */}
        <div style={{ fontSize: '0.82rem', color: S.textDim, marginBottom: '0.3rem' }}>{modeIcon} {modeName}</div>
        <div style={{ fontSize: '4rem', marginBottom: '0.3rem', animation: 'arena-float 3s ease-in-out infinite' }}>{overallRank.emoji}</div>
        <h2 style={{ ...rockFont, fontSize: '2.2rem', color: overallRank.color, marginBottom: '0.2rem' }}>{overallRank.name}</h2>
        {state.studioSpeeds.length < MIN_GAMES_FOR_RANK ? (
          <p style={{ color: S.textDim, fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            Noch {MIN_GAMES_FOR_RANK - state.studioSpeeds.length} Studio-Spiele bis zur Rang-Vergabe ({state.studioSpeeds.length}/{MIN_GAMES_FOR_RANK})
          </p>
        ) : (
          <p style={{ color: S.textDim, fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            ⏱️ {state.studioSpeed?.toFixed(1)}s pro Antwort (∅ letzten {state.studioSpeeds.length} Spiele)
          </p>
        )}

        {/* Diese Session: Aufgaben + Zeit */}
        <div style={{ ...cardStyle, padding: '0.75rem', marginBottom: '0.75rem', background: `${sessionRank.color}10`, border: `1px solid ${sessionRank.color}30` }}>
          <div style={{ ...rockFont, fontSize: '1.6rem', color: S.text, marginBottom: '0.2rem' }}>
            {totalAnswered} Aufgaben in {duration}s
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
            <span style={{ color: S.green, fontWeight: 800 }}>✅ {result.correct} richtig</span>
            <span style={{ color: S.red, fontWeight: 800 }}>❌ {result.wrong} falsch</span>
          </div>
          <div style={{ ...rockFont, fontSize: '1.2rem', color: sessionRank.color }}>
            {sessionRank.emoji} {result.avgSpeed.toFixed(1)}s / Antwort → {sessionRank.name}
          </div>
        </div>

        {/* Rang-Uebersicht */}
        <RankOverview currentSpeed={state.studioSpeed} gamesPlayed={state.studioSpeeds.length} />

        {/* XP + Coins */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
          <StatBox label="Arena-XP" value={`+${result.sessionXP}`} color={S.purpleLight} />
          <StatBox label="Coins" value={`🪙 ${result.coinsEarned}`} color={S.gold} />
        </div>

        <button style={{ ...btnGold, fontSize: '1.2rem', padding: '0.7rem 2rem' }} onClick={onDone}>
          ⚔️ Weiter
        </button>
      </div>
    </div>
  );
}

// ============================================
// BATTLE MODE
// ============================================

function BattleScreen({ state, onBack, onComplete }: {
  state: ArenaState; onBack: () => void;
  onComplete: (r: { correct: number; wrong: number; coinsEarned: number; xpEarned: number; heatmap: Record<string, HeatmapEntry>; mode: string }) => void;
}) {
  const [setup, setSetup] = useState(true);
  const [mode, setMode] = useState<BattleType>('ai');
  const [player2Name, setPlayer2Name] = useState('');
  const [phase, setPhase] = useState<'question' | 'result' | 'done'>('question');
  const [round, setRound] = useState(1);
  const [question, setQuestion] = useState<Question | null>(null);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [timeLeft, setTimeLeft] = useState(BATTLE_TIME);
  const [p1Input, setP1Input] = useState('');
  const [p2Input, setP2Input] = useState('');
  const [p1Locked, setP1Locked] = useState(false);
  const [p2Locked, setP2Locked] = useState(false);
  const [roundResult, setRoundResult] = useState<{ p1Correct: boolean; p2Correct: boolean } | null>(null);
  const [heatmap, setHeatmap] = useState(state.heatmap);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const p1Ref = useRef<HTMLInputElement>(null);
  const p1InputRef = useRef('');
  const p2InputRef = useRef('');
  const [aiThinking, setAiThinking] = useState(false);

  const nextQuestion = useCallback(() => {
    const q = generateQuestion(null, state.questionType);
    setQuestion(q);
    setP1Input(''); setP2Input('');
    p1InputRef.current = ''; p2InputRef.current = '';
    setP1Locked(false); setP2Locked(false);
    setTimeLeft(BATTLE_TIME);
    setPhase('question');
    setRoundResult(null);
    setTimeout(() => p1Ref.current?.focus(), 100);

    if (mode === 'ai') {
      const difficulty = Math.min(0.85, 0.5 + round * 0.03);
      const delay = (1 + Math.random() * 4) * 1000;
      setAiThinking(true);
      setTimeout(() => {
        const correct = Math.random() < difficulty;
        const aiAnswer = correct ? q.answer : q.answer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
        setP2Input(String(aiAnswer));
        p2InputRef.current = String(aiAnswer);
        setP2Locked(true);
        setAiThinking(false);
      }, delay);
    }
  }, [mode, round, state.questionType]);

  const startBattle = () => {
    setSetup(false);
    setRound(1);
    setScores({ p1: 0, p2: 0 });
    nextQuestion();
  };

  const evaluateRound = useCallback((q: Question, a1: string, a2: string) => {
    const c1 = parseInt(a1) === q.answer;
    const c2 = parseInt(a2) === q.answer;

    const newScores = { p1: scores.p1 + (c1 ? 1 : 0), p2: scores.p2 + (c2 ? 1 : 0) };
    setScores(newScores);
    setRoundResult({ p1Correct: c1, p2Correct: c2 });
    setPhase('result');
    setHeatmap(h => doUpdateHeatmap(h, q.heatmapKey, c1, null));
    if (timerRef.current) clearInterval(timerRef.current);

    if (round >= BATTLE_ROUNDS) {
      setTimeout(() => setPhase('done'), 1800);
    } else {
      setTimeout(() => { setRound(r => r + 1); nextQuestion(); }, 1500);
    }
  }, [scores, round, nextQuestion]);

  useEffect(() => {
    if (phase !== 'question') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (question) evaluateRound(question, p1InputRef.current || '-1', p2InputRef.current || '-1');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const lockIn = (player: 1 | 2) => {
    if (player === 1 && !p1Locked) {
      setP1Locked(true);
      if (p2Locked && question) evaluateRound(question, p1Input, p2Input);
    }
    if (player === 2 && !p2Locked) {
      setP2Locked(true);
      if (p1Locked && question) evaluateRound(question, p1Input, p2Input);
    }
  };

  useEffect(() => {
    if (mode === 'ai' && p2Locked && p1Locked && phase === 'question' && question) {
      evaluateRound(question, p1Input, p2Input);
    }
  }, [p1Locked, p2Locked]); // eslint-disable-line react-hooks/exhaustive-deps

  const p1Name = state.playerName || 'Du';
  const p2Name = mode === 'ai' ? '🤖 KI-Gegner' : (player2Name || 'Spieler 2');
  const winner = phase === 'done'
    ? scores.p1 > scores.p2 ? p1Name : scores.p2 > scores.p1 ? p2Name : 'Unentschieden!'
    : null;

  // Setup
  if (setup) return (
    <div style={{ padding: '0.5rem 0' }}>
      <button style={btnGhost} onClick={onBack}>← Zurueck</button>
      <div style={{ ...cardStyle, padding: '2rem', textAlign: 'center', marginTop: '0.75rem', animation: 'arena-slide 0.4s ease forwards' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🤺</div>
        <h2 style={{ ...rockFont, fontSize: '2rem', color: S.pink, marginBottom: '1.25rem' }}>Duell Modus</h2>

        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <button style={mode === 'ai' ? btnPink : btnGhost} onClick={() => setMode('ai')}>🤖 vs KI</button>
          <button style={mode === '2player' ? btnCyan : btnGhost} onClick={() => setMode('2player')}>👥 2 Spieler</button>
        </div>

        {mode === '2player' && (
          <input
            value={player2Name}
            onChange={e => setPlayer2Name(e.target.value)}
            placeholder="Name Spieler 2"
            style={{
              width: '100%', padding: '0.55rem 1rem', background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${S.border}`, borderRadius: 10, color: S.text,
              fontFamily: 'Nunito', fontSize: '1rem', marginBottom: '1rem', outline: 'none',
            }}
          />
        )}

        <p style={{ color: S.textDim, marginBottom: '1.25rem', fontSize: '0.88rem' }}>
          {BATTLE_ROUNDS} Runden · {BATTLE_TIME} Sek. pro Frage
          {mode === 'ai' && ' · KI wird immer staerker!'}
        </p>

        <button style={{ ...btnPink, fontSize: '1.2rem', padding: '0.7rem 1.8rem' }} onClick={startBattle}>
          🤺 DUELL STARTEN!
        </button>
      </div>
    </div>
  );

  // Done
  if (phase === 'done') return (
    <div style={{ padding: '0.5rem 0' }}>
      <button style={btnGhost} onClick={onBack}>← Zurueck</button>
      <div style={{ ...cardStyle, padding: '2rem', textAlign: 'center', marginTop: '0.75rem', animation: 'arena-pop 0.3s ease forwards' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.4rem' }}>🏆</div>
        <h2 style={{ ...rockFont, fontSize: '1.8rem', color: S.gold, marginBottom: '0.4rem' }}>Duell vorbei!</h2>
        <p style={{ ...rockFont, fontSize: '1.3rem', color: S.pink, marginBottom: '1.25rem' }}>
          {winner === 'Unentschieden!' ? '🤝 Unentschieden!' : `🎉 ${winner} gewinnt!`}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.25rem' }}>
          <ScoreBox name={p1Name} score={scores.p1} won={scores.p1 > scores.p2} />
          <ScoreBox name={p2Name} score={scores.p2} won={scores.p2 > scores.p1} />
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
          <button style={btnPrimary} onClick={() => {
            const battleXP = scores.p1 * calcAnswerXP(4, 2, 'battle');
            onComplete({ correct: scores.p1, wrong: BATTLE_ROUNDS - scores.p1, coinsEarned: scores.p1 * 2, xpEarned: battleXP, heatmap, mode: 'battle' });
          }}>
            ✅ Speichern
          </button>
          <button style={btnGhost} onClick={() => setSetup(true)}>🔄 Nochmal</button>
        </div>
      </div>
    </div>
  );

  // Playing
  const timerPct = (timeLeft / BATTLE_TIME) * 100;
  return (
    <div style={{ padding: '0.5rem 0' }}>
      <button style={btnGhost} onClick={onBack}>← Zurueck</button>

      {/* Score bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
        <div><div style={{ fontSize: '0.72rem', color: S.textDim }}>{p1Name}</div><div style={{ ...rockFont, fontSize: '1.6rem', color: S.cyan }}>{scores.p1}</div></div>
        <div style={{ textAlign: 'center' }}><div style={{ ...rockFont, color: S.textDim, fontSize: '0.8rem' }}>Runde</div><div style={{ ...rockFont, fontSize: '1.6rem', color: S.gold }}>{round}/{BATTLE_ROUNDS}</div></div>
        <div style={{ textAlign: 'right' }}><div style={{ fontSize: '0.72rem', color: S.textDim }}>{p2Name}</div><div style={{ ...rockFont, fontSize: '1.6rem', color: S.pink }}>{scores.p2}</div></div>
      </div>

      {/* Timer */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 999, height: 8, overflow: 'hidden' }}>
          <div style={{ width: `${timerPct}%`, height: '100%', background: timeLeft > 3 ? S.pink : S.red, transition: 'width 1s linear', borderRadius: 999 }} />
        </div>
        <div style={{ textAlign: 'center', fontSize: '0.75rem', color: S.textDim, marginTop: '0.15rem' }}>⏱ {timeLeft}s</div>
      </div>

      {/* Question */}
      <div style={{ ...cardStyle, padding: '1.5rem', textAlign: 'center', marginBottom: '0.75rem' }}>
        {question && (
          <div style={{ ...rockFont, fontSize: 'clamp(2rem, 9vw, 3.5rem)', color: S.text }}>
            {question.displayText} = ?
          </div>
        )}
        {roundResult && question && (
          <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '1.3rem' }}>
            <span>{roundResult.p1Correct ? '✅' : '❌'} {p1Input || '–'}</span>
            <span style={{ color: S.gold, ...rockFont }}>= {question.answer}</span>
            <span>{roundResult.p2Correct ? '✅' : '❌'} {p2Input || '–'}</span>
          </div>
        )}
      </div>

      {/* Input areas */}
      {phase === 'question' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
          <div style={{ ...cardStyle, padding: '0.75rem', textAlign: 'center', borderColor: p1Locked ? 'rgba(34,197,94,0.5)' : 'rgba(0,229,255,0.3)' }}>
            <div style={{ fontSize: '0.72rem', color: S.cyan, marginBottom: '0.4rem', fontWeight: 800 }}>{p1Name}</div>
            <input
              ref={p1Ref}
              type="number"
              value={p1Input}
              onChange={e => { setP1Input(e.target.value); p1InputRef.current = e.target.value; }}
              onKeyDown={e => e.key === 'Enter' && lockIn(1)}
              disabled={p1Locked}
              style={{
                width: '100%', textAlign: 'center', fontSize: '1.6rem', ...rockFont,
                background: 'rgba(255,255,255,0.05)', border: `2px solid ${p1Locked ? S.green : S.cyan}`,
                borderRadius: 10, color: S.text, padding: '0.5rem', outline: 'none',
              }}
              placeholder="..."
            />
            <button
              style={{ ...btnCyan, marginTop: '0.4rem', width: '100%', fontSize: '0.82rem', justifyContent: 'center', padding: '0.35rem 0.75rem' }}
              onClick={() => lockIn(1)}
              disabled={p1Locked}
            >
              {p1Locked ? '✓ Gelockt' : 'Enter ↵'}
            </button>
          </div>

          <div style={{ ...cardStyle, padding: '0.75rem', textAlign: 'center', borderColor: p2Locked ? 'rgba(34,197,94,0.5)' : 'rgba(255,77,166,0.3)' }}>
            <div style={{ fontSize: '0.72rem', color: S.pink, marginBottom: '0.4rem', fontWeight: 800 }}>{p2Name}</div>
            {mode === 'ai' ? (
              <div style={{ fontSize: '1.3rem', ...rockFont, padding: '0.45rem 0', color: p2Locked ? S.text : S.textDim }}>
                {p2Locked ? p2Input : (aiThinking ? '💭...' : '...')}
              </div>
            ) : (
              <input
                type="number"
                value={p2Input}
                onChange={e => { setP2Input(e.target.value); p2InputRef.current = e.target.value; }}
                onKeyDown={e => e.key === 'Enter' && lockIn(2)}
                disabled={p2Locked}
                style={{
                  width: '100%', textAlign: 'center', fontSize: '1.6rem', ...rockFont,
                  background: 'rgba(255,255,255,0.05)', border: `2px solid ${p2Locked ? S.green : S.pink}`,
                  borderRadius: 10, color: S.text, padding: '0.5rem', outline: 'none',
                }}
                placeholder="..."
              />
            )}
            {mode === '2player' && (
              <button
                style={{ ...btnPink, marginTop: '0.4rem', width: '100%', fontSize: '0.82rem', justifyContent: 'center', padding: '0.35rem 0.75rem' }}
                onClick={() => lockIn(2)}
                disabled={p2Locked}
              >
                {p2Locked ? '✓ Gelockt' : 'Enter ↵'}
              </button>
            )}
            {mode === 'ai' && p2Locked && <div style={{ color: S.green, fontSize: '0.75rem', marginTop: '0.35rem' }}>✓ Geantwortet</div>}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// HEATMAP
// ============================================

function HeatmapScreen({ state, onBack }: { state: ArenaState; onBack: () => void }) {
  const { heatmap } = state;
  const [tab, setTab] = useState<'mult' | 'div'>('mult');
  const isDivTab = tab === 'div';

  const getEntry = (a: number, b: number): HeatmapEntry | null => {
    if (isDivTab) {
      const key = `${a * b}:${b}`;
      return heatmap[key] || null;
    }
    return heatmap[`${a}x${b}`] || heatmap[`${b}x${a}`] || null;
  };

  const getTooltip = (a: number, b: number) => {
    const e = getEntry(a, b);
    if (isDivTab) {
      const product = a * b;
      if (!e) return `${product}÷${b} = ${a}\nNoch nicht geuebt`;
      const total = e.correct + e.wrong;
      const timeStr = e.avgTime !== null ? `⏱️ ∅ ${e.avgTime.toFixed(1)}s` : '';
      return `${product}÷${b} = ${a}\n✅ ${e.correct}  ❌ ${e.wrong}  (${Math.round((e.correct / total) * 100)}%)\n${timeStr}`;
    }
    if (!e) return `${a}×${b} = ${a * b}\nNoch nicht geuebt`;
    const total = e.correct + e.wrong;
    const timeStr = e.avgTime !== null ? `⏱️ ∅ ${e.avgTime.toFixed(1)}s` : '';
    return `${a}×${b} = ${a * b}\n✅ ${e.correct}  ❌ ${e.wrong}  (${Math.round((e.correct / total) * 100)}%)\n${timeStr}`;
  };

  // Staerken/Schwaechen
  const allEntries: { a: number; b: number; rate: number; avgTime: number | null }[] = [];
  for (let a = 1; a <= 12; a++) {
    for (let b = 1; b <= 12; b++) {
      const e = getEntry(a, b);
      if (e && e.correct + e.wrong >= 2) {
        const rate = e.correct / (e.correct + e.wrong);
        allEntries.push({ a, b, rate, avgTime: e.avgTime });
      }
    }
  }
  // Sortiere nach Geschwindigkeit (langsamste zuerst) oder Genauigkeit als Fallback
  const weakest = [...allEntries].sort((x, y) => {
    if (x.avgTime !== null && y.avgTime !== null) return y.avgTime - x.avgTime;
    return x.rate - y.rate;
  }).slice(0, 5);
  const strongest = [...allEntries].sort((x, y) => {
    if (x.avgTime !== null && y.avgTime !== null) return x.avgTime - y.avgTime;
    return y.rate - x.rate;
  }).slice(0, 5);

  let totalAttempts = 0;
  for (const e of Object.values(heatmap)) { totalAttempts += e.correct + e.wrong; }

  // Farb-Legende basiert auf Geschwindigkeit
  const hasTimeData = Object.values(heatmap).some(e => e.avgTime !== null);
  const legendItems = hasTimeData ? [
    ['rgba(34,197,94,0.7)', '≤2s'],
    ['rgba(163,230,53,0.6)', '2-4s'],
    ['rgba(234,179,8,0.6)', '4-6s'],
    ['rgba(249,115,22,0.6)', '6-8s'],
    ['rgba(239,68,68,0.7)', '8-10s'],
    ['rgba(153,27,27,0.7)', '>10s'],
    ['rgba(255,255,255,0.05)', 'Neu'],
  ] : [
    ['rgba(34,197,94,0.7)', '≥90%'],
    ['rgba(163,230,53,0.6)', '70-89%'],
    ['rgba(234,179,8,0.6)', '50-69%'],
    ['rgba(249,115,22,0.6)', '30-49%'],
    ['rgba(239,68,68,0.7)', '<30%'],
    ['rgba(255,255,255,0.05)', 'Neu'],
  ];

  return (
    <div style={{ padding: '0.5rem 0' }}>
      <button style={btnGhost} onClick={onBack}>← Zurueck</button>

      <div style={{ textAlign: 'center', margin: '0.75rem 0' }}>
        <h2 style={{ ...rockFont, fontSize: '2rem', color: S.gold }}>🗺️ Lern-Heatmap</h2>
        <p style={{ color: S.textDim, fontSize: '0.85rem' }}>{totalAttempts} Antworten gesamt</p>
      </div>

      {/* Mult / Div Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', marginBottom: '0.75rem' }}>
        <button
          onClick={() => setTab('mult')}
          style={{
            padding: '0.3rem 0.8rem', borderRadius: 10, cursor: 'pointer',
            fontFamily: 'Nunito', fontWeight: 800, fontSize: '0.85rem',
            background: tab === 'mult' ? S.purple : 'transparent',
            border: `1px solid ${tab === 'mult' ? S.purple : S.border}`,
            color: tab === 'mult' ? 'white' : S.textDim,
          }}
        >
          × Multiplikation
        </button>
        <button
          onClick={() => setTab('div')}
          style={{
            padding: '0.3rem 0.8rem', borderRadius: 10, cursor: 'pointer',
            fontFamily: 'Nunito', fontWeight: 800, fontSize: '0.85rem',
            background: tab === 'div' ? S.purple : 'transparent',
            border: `1px solid ${tab === 'div' ? S.purple : S.border}`,
            color: tab === 'div' ? 'white' : S.textDim,
          }}
        >
          ÷ Division
        </button>
      </div>

      {/* Legende */}
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '0.75rem', fontSize: '0.72rem', color: S.textDim }}>
        {legendItems.map(([c, l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: c, border: '1px solid rgba(255,255,255,0.1)' }} />
            <span>{l}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ ...cardStyle, padding: '0.75rem', overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: 2, margin: '0 auto' }}>
          <thead>
            <tr>
              <th style={{ width: 24, fontSize: '0.62rem', color: S.textDim }}>{isDivTab ? '÷' : '×'}</th>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
                <th key={n} style={{ width: 32, textAlign: 'center', fontSize: '0.62rem', color: S.purpleLight, ...rockFont }}>{n}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(a => (
              <tr key={a}>
                <td style={{ fontSize: '0.62rem', color: S.purpleLight, textAlign: 'center', ...rockFont }}>{a}</td>
                {Array.from({ length: 12 }, (_, j) => j + 1).map(b => {
                  const entry = getEntry(a, b);
                  const color = getHeatmapColor(entry);
                  const cellValue = isDivTab ? a : a * b;
                  return (
                    <td
                      key={b}
                      title={getTooltip(a, b)}
                      style={{
                        width: 32, height: 24, background: color, borderRadius: 3,
                        textAlign: 'center', fontSize: '0.58rem', color: 'rgba(255,255,255,0.7)',
                        cursor: 'pointer', transition: 'transform 0.1s', fontWeight: 700,
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.3)'}
                      onMouseLeave={e => e.currentTarget.style.transform = ''}
                    >
                      {cellValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Insights */}
      {totalAttempts > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
          <InsightCard title={hasTimeData ? '🐢 Langsamste' : '⚠️ Uebe diese noch'} items={weakest} color={S.red} isDivision={isDivTab} showTime={hasTimeData} />
          <InsightCard title={hasTimeData ? '⚡ Schnellste' : '✅ Deine Staerken'} items={strongest} color={S.green} isDivision={isDivTab} showTime={hasTimeData} />
        </div>
      )}

      {totalAttempts === 0 && (
        <div style={{ textAlign: 'center', marginTop: '1.5rem', color: S.textDim }}>
          <p>Noch keine Daten! Spiel erst ein paar Runden ⚔️</p>
        </div>
      )}
    </div>
  );
}

function InsightCard({ title, items, color, isDivision, showTime }: {
  title: string; items: { a: number; b: number; rate: number; avgTime: number | null }[];
  color: string; isDivision: boolean; showTime: boolean;
}) {
  return (
    <div style={{ ...cardStyle, padding: '0.75rem' }}>
      <h3 style={{ fontSize: '0.8rem', color, marginBottom: '0.5rem', fontWeight: 800 }}>{title}</h3>
      {items.length === 0
        ? <p style={{ color: S.textDim, fontSize: '0.75rem' }}>Noch zu wenig Daten</p>
        : items.map(({ a, b, rate, avgTime }) => (
          <div key={`${a}x${b}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
            <span style={{ ...rockFont, color: S.text, fontSize: '0.82rem' }}>
              {isDivision ? `${a * b} ÷ ${b} = ${a}` : `${a} × ${b} = ${a * b}`}
            </span>
            <span style={{ fontSize: '0.72rem', color, fontWeight: 800 }}>
              {showTime && avgTime !== null ? `${avgTime.toFixed(1)}s` : `${Math.round(rate * 100)}%`}
            </span>
          </div>
        ))
      }
    </div>
  );
}

// ============================================
// AVATAR SHOP
// ============================================

function ShopScreen({ state, onBack, onUpdate }: {
  state: ArenaState; onBack: () => void; onUpdate: (u: Partial<ArenaState>) => void;
}) {
  const [tab, setTab] = useState('hair');
  const [preview, setPreview] = useState(state.avatar);
  const items = AVATAR_ITEMS[tab];

  const canAfford = (price: number) => state.coins >= price;
  const isOwned = (id: string) => state.ownedItems.includes(id);
  const isEquipped = (id: string) => Object.values(state.avatar).includes(id);

  const handleBuy = (item: AvatarItem) => {
    if (!canAfford(item.price) || isOwned(item.id)) return;
    onUpdate({
      coins: state.coins - item.price,
      ownedItems: [...state.ownedItems, item.id],
      avatar: { ...state.avatar, [tab]: item.id },
    });
    setPreview(p => ({ ...p, [tab]: item.id }));
  };

  const handleEquip = (item: AvatarItem) => {
    if (!isOwned(item.id)) return;
    onUpdate({ avatar: { ...state.avatar, [tab]: item.id } });
    setPreview(p => ({ ...p, [tab]: item.id }));
  };

  return (
    <div style={{ padding: '0.5rem 0' }}>
      <button style={btnGhost} onClick={onBack}>← Zurueck</button>

      <div style={{ textAlign: 'center', margin: '0.75rem 0' }}>
        <h2 style={{ ...rockFont, fontSize: '2rem', color: S.cyan }}>🛒 Avatar-Shop</h2>
        <span style={coinBadge}>🪙 {state.coins} Coins</span>
      </div>

      {/* Avatar Preview */}
      <div style={{ ...cardStyle, padding: '1rem', textAlign: 'center', marginBottom: '1rem' }}>
        <div style={{ fontSize: '3.5rem', lineHeight: 1.2, animation: 'arena-float 3s ease-in-out infinite' }}>
          {getItemEmoji('hair', preview.hair)}{getItemEmoji('accessory', preview.accessory)}
          <br/>
          {getItemEmoji('outfit', preview.outfit)}{getItemEmoji('instrument', preview.instrument)}
        </div>
        <p style={{ color: S.textDim, fontSize: '0.75rem', marginTop: '0.4rem' }}>Vorschau</p>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
          <button
            key={cat}
            onClick={() => setTab(cat)}
            style={{
              padding: '0.35rem 0.75rem', borderRadius: 10, cursor: 'pointer',
              fontFamily: 'Nunito', fontWeight: 800, fontSize: '0.8rem',
              background: tab === cat ? S.purple : 'transparent',
              border: `1px solid ${tab === cat ? S.purple : S.border}`,
              color: tab === cat ? 'white' : S.textDim,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
        {items.map(item => {
          const owned = isOwned(item.id);
          const equipped = isEquipped(item.id) && Object.keys(CATEGORY_LABELS).find(c => state.avatar[c as keyof AvatarState] === item.id) === tab;
          const affordable = canAfford(item.price);
          return (
            <div key={item.id} style={{
              ...cardStyle, padding: '0.75rem', textAlign: 'center',
              border: `1px solid ${equipped ? item.color + '80' : owned ? 'rgba(34,197,94,0.4)' : S.border}`,
              opacity: !owned && !affordable ? 0.5 : 1,
            }}>
              <div style={{ fontSize: '2.2rem', marginBottom: '0.3rem' }}>{item.emoji}</div>
              <div style={{ fontWeight: 800, marginBottom: '0.2rem', fontSize: '0.88rem' }}>{item.name}</div>
              <div style={{ marginBottom: '0.6rem' }}>
                {item.price === 0
                  ? <span style={{ color: S.green, fontSize: '0.75rem', fontWeight: 700 }}>Gratis</span>
                  : <span style={{ ...coinBadge, fontSize: '0.75rem' }}>🪙 {item.price}</span>
                }
              </div>
              {equipped
                ? <div style={{ color: item.color, fontSize: '0.75rem', fontWeight: 800 }}>✓ Ausgeruestet</div>
                : owned
                  ? <button style={{ ...btnCyan, fontSize: '0.8rem', padding: '0.25rem 0.8rem' }} onClick={() => handleEquip(item)}>Anlegen</button>
                  : <button style={{ ...btnGold, fontSize: '0.8rem', padding: '0.25rem 0.8rem' }} onClick={() => handleBuy(item)} disabled={!affordable}>
                      {affordable ? '🛒 Kaufen' : '🔒 Zu teuer'}
                    </button>
              }
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// SUPABASE HELPERS
// ============================================

async function saveToSupabase(sb: any, userId: string, s: ArenaState) {
  try {
    await sb.from('arena_progress').upsert({
      user_id: userId,
      player_name: s.playerName,
      avatar: s.avatar,
      coins: s.coins,
      total_correct: s.totalCorrect,
      arena_xp: s.arenaXP,
      arena_level: s.arenaLevel,
      studio_speed: s.studioSpeed,
      studio_speeds: s.studioSpeeds,
      question_type: s.questionType,
      heatmap: s.heatmap,
      scores: s.scores.slice(-100), // Cap bei 100
      owned_items: s.ownedItems,
    }, { onConflict: 'user_id' });
  } catch (e) {
    console.error('Arena: Supabase save error', e);
  }
}

function dbRowToArenaState(row: any): ArenaState {
  return {
    playerName: row.player_name || '',
    avatar: row.avatar || { hair: 'hair_basic', outfit: 'outfit_basic', instrument: 'inst_sword', accessory: 'acc_none' },
    coins: row.coins || 0,
    totalCorrect: row.total_correct || 0,
    arenaXP: row.arena_xp || 0,
    arenaLevel: row.arena_level || 1,
    studioSpeed: row.studio_speed ?? null,
    studioSpeeds: row.studio_speeds || [],
    questionType: (row.question_type || 'both') as QuestionType,
    heatmap: row.heatmap || {},
    scores: row.scores || [],
    ownedItems: row.owned_items || ['hair_basic', 'outfit_basic', 'inst_sword', 'acc_none'],
  };
}

// ============================================
// COACH SCREEN
// ============================================

interface CoachStudentRow {
  playerName: string;
  arenaLevel: number;
  arenaXP: number;
  coins: number;
  totalCorrect: number;
  studioSpeed: number | null;
  updatedAt: string;
  heatmap: Record<string, HeatmapEntry>;
}

function CoachScreen({ arenaData, supabaseRef, onBack }: {
  arenaData: ArenaData;
  supabaseRef: React.MutableRefObject<any>;
  onBack: () => void;
}) {
  const [students, setStudents] = useState<CoachStudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<CoachStudentRow | null>(null);

  useEffect(() => {
    if (!supabaseRef.current || !arenaData.groupIds.length) {
      setLoading(false);
      return;
    }

    const loadStudents = async () => {
      try {
        const sb = supabaseRef.current;
        // Lade alle Gruppenmitglieder
        const { data: members } = await sb
          .from('group_members')
          .select('user_id')
          .in('group_id', arenaData.groupIds);

        if (!members || members.length === 0) { setLoading(false); return; }

        const userIds = members.map((m: any) => m.user_id);

        // Lade Arena-Fortschritt fuer diese User
        const { data: progress } = await sb
          .from('arena_progress')
          .select('*')
          .in('user_id', userIds)
          .order('arena_level', { ascending: false })
          .order('arena_xp', { ascending: false });

        if (progress) {
          setStudents(progress.map((row: any) => ({
            playerName: row.player_name || '(kein Name)',
            arenaLevel: row.arena_level || 1,
            arenaXP: row.arena_xp || 0,
            coins: row.coins || 0,
            totalCorrect: row.total_correct || 0,
            studioSpeed: row.studio_speed ?? null,
            updatedAt: row.updated_at || '',
            heatmap: row.heatmap || {},
          })));
        }
      } catch (e) {
        console.error('Coach: load students error', e);
      }
      setLoading(false);
    };

    loadStudents();
  }, [arenaData, supabaseRef]);

  // Detail-Ansicht: Heatmap eines Schuelers
  if (selectedStudent) {
    const fakeState: ArenaState = {
      playerName: selectedStudent.playerName,
      avatar: { hair: 'hair_basic', outfit: 'outfit_basic', instrument: 'inst_sword', accessory: 'acc_none' },
      coins: selectedStudent.coins,
      totalCorrect: selectedStudent.totalCorrect,
      arenaXP: selectedStudent.arenaXP,
      arenaLevel: selectedStudent.arenaLevel,
      heatmap: selectedStudent.heatmap,
      scores: [],
      ownedItems: [],
      studioSpeeds: [],
      studioSpeed: selectedStudent.studioSpeed,
      questionType: 'both',
    };
    return (
      <div style={{ padding: '0.5rem 0' }}>
        <button style={btnGhost} onClick={() => setSelectedStudent(null)}>← Zurueck zur Liste</button>
        <div style={{ textAlign: 'center', margin: '0.5rem 0' }}>
          <h3 style={{ ...rockFont, fontSize: '1.3rem', color: S.cyan }}>{selectedStudent.playerName}</h3>
        </div>
        <HeatmapScreen state={fakeState} onBack={() => setSelectedStudent(null)} />
      </div>
    );
  }

  return (
    <div style={{ padding: '0.5rem 0' }}>
      <button style={btnGhost} onClick={onBack}>← Zurueck</button>

      <div style={{ textAlign: 'center', margin: '0.75rem 0' }}>
        <h2 style={{ ...rockFont, fontSize: '2rem', color: S.cyan }}>📊 Schueler-Fortschritt</h2>
        <p style={{ color: S.textDim, fontSize: '0.85rem' }}>
          {students.length} Schueler mit Arena-Daten
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: S.textDim }}>Lade Daten...</div>
      ) : students.length === 0 ? (
        <div style={{ ...cardStyle, padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
          <p style={{ color: S.textDim }}>Noch keine Schueler haben die Arena benutzt.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {students.map((s, idx) => {
            const rank = getSpeedRank(s.studioSpeed);
            const levelRank = getRankForLevel(s.arenaLevel);
            const lastActive = s.updatedAt ? new Date(s.updatedAt).toLocaleDateString('de-DE') : '–';
            return (
              <div
                key={idx}
                onClick={() => setSelectedStudent(s)}
                style={{
                  ...cardStyle, padding: '0.75rem 1rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = S.cyan; e.currentTarget.style.transform = 'translateX(4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.transform = ''; }}
              >
                {/* Rang-Platz */}
                <div style={{
                  ...rockFont, fontSize: '1.1rem', width: '1.5rem', textAlign: 'center',
                  color: idx === 0 ? S.gold : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : S.textDim,
                }}>
                  {idx + 1}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ ...rockFont, fontSize: '1rem', color: S.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.playerName}
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '0.15rem' }}>
                    <span style={{
                      ...rockFont, fontSize: '0.72rem',
                      background: `linear-gradient(135deg, ${S.purple}, ${S.cyan})`,
                      color: 'white', padding: '0.05rem 0.4rem', borderRadius: 4,
                    }}>
                      Lv.{s.arenaLevel}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: levelRank.color, fontWeight: 700 }}>
                      {levelRank.name}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: rank.color }}>
                      {rank.emoji} {rank.name}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '0.72rem', color: S.gold, fontWeight: 700 }}>
                    ⚡ {s.arenaXP} XP
                  </div>
                  <div style={{ fontSize: '0.65rem', color: S.textDim }}>
                    🎯 {s.totalCorrect} · 🪙 {s.coins}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: S.textDim }}>
                    {lastActive}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================
// SHARED SUB-COMPONENTS
// ============================================

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: `${color}15`, border: `1px solid ${color}40`, borderRadius: 12, padding: '0.6rem' }}>
      <div style={{ fontSize: '0.72rem', color: S.textDim }}>{label}</div>
      <div style={{ ...rockFont, fontSize: '1.3rem', color }}>{value}</div>
    </div>
  );
}

function ScoreBox({ name, score, won }: { name: string; score: number; won: boolean }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: won ? '2.2rem' : '1.3rem' }}>{won ? '🏆' : '💪'}</div>
      <div style={{ fontWeight: 800, color: won ? S.gold : S.textDim, marginTop: '0.2rem', fontSize: '0.85rem' }}>{name}</div>
      <div style={{ ...rockFont, fontSize: '1.8rem', color: won ? S.gold : S.text }}>{score}</div>
    </div>
  );
}

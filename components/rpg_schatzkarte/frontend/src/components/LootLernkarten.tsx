import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from 'framer-motion';

// Tesseract.js wird via CDN geladen
declare const Tesseract: {
  recognize: (
    image: string,
    lang: string,
    options?: { logger?: (m: { status: string; progress: number }) => void }
  ) => Promise<{ data: { text: string } }>;
};

// Web Speech API Types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  readonly isFinal: boolean;
}
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

// ============================================================
// SCHATZKARTE LERNKARTEN – Spaced Repetition System
// ============================================================

// ─── THEME ──────────────────────────────────────────────────
const T = {
  navy: "#0B1426",
  deepNavy: "#060D1A",
  card: "#12203A",
  cardHover: "#1A2E52",
  gold: "var(--fb-reward)",
  goldDark: "#B8960F",
  goldLight: "#FFE44D",
  amber: "var(--fb-reward)",
  parchment: "#F5E6C8",
  parchmentDark: "#D4BC8A",
  success: "#4ADE80",
  danger: "#FF5252",
  warning: "#FF9800",
  info: "#4FC3F7",
  text: "#E8DCC8",
  textMuted: "#7A8BA0",
  purple: "#A78BFA",
};

// ─── FÄCHER (SUBJECTS) ─────────────────────────────────────
const SUBJECTS = [
  { id: "eng", name: "Englisch", icon: "🇬🇧", color: "#4FC3F7" },
  { id: "lat", name: "Latein", icon: "🏛️", color: "#CE93D8" },
  { id: "fra", name: "Französisch", icon: "🇫🇷", color: "#F48FB1" },
  { id: "deu", name: "Deutsch", icon: "📖", color: "#FF8A65" },
  { id: "mat", name: "Mathematik", icon: "📐", color: "#4DD0E1" },
  { id: "bio", name: "Biologie", icon: "🌿", color: "#81C784" },
  { id: "phy", name: "Physik", icon: "⚡", color: "#FFD54F" },
  { id: "che", name: "Chemie", icon: "🧪", color: "#FF8A65" },
  { id: "ges", name: "Geschichte", icon: "🏰", color: "#BCAAA4" },
  { id: "geo", name: "Geographie", icon: "🌍", color: "#A5D6A7" },
  { id: "mus", name: "Musik", icon: "🎵", color: "#B39DDB" },
  { id: "kun", name: "Kunst", icon: "🎨", color: "#F06292" },
  { id: "inf", name: "Informatik", icon: "💻", color: "#80DEEA" },
  { id: "rel", name: "Religion/Ethik", icon: "✨", color: "#FFE082" },
  { id: "spa", name: "Spanisch", icon: "🇪🇸", color: "#EF5350" },
  { id: "son", name: "Sonstiges", icon: "📝", color: "#90A4AE" },
];

// ─── TYPES ─────────────────────────────────────────────────
interface LernkartenDeck {
  id: string;
  subjectId: string;
  name: string;
  createdAt: string;
}

interface Lernkarte {
  id: string;
  deckId: string;
  front: string;
  back: string;
  interval: number;
  repetitions: number;
  easeFactor: number;
  nextReview: string;
  lastReview: string | null;
  reviewCount: number;
}

// ─── SM-2 ALGORITHMUS ───────────────────────────────────────
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function createCard(deckId: string, front: string, back: string): Lernkarte {
  return {
    id: uid(), deckId, front, back,
    interval: 0, repetitions: 0, easeFactor: 2.5,
    nextReview: new Date().toISOString(),
    lastReview: null, reviewCount: 0,
  };
}

function sm2(card: Lernkarte, quality: number): Lernkarte {
  const q = Math.max(0, Math.min(5, quality));
  let { interval, repetitions, easeFactor } = card;
  if (q >= 3) {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions++;
  } else {
    repetitions = 0;
    interval = 1;
  }
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  const next = new Date();
  next.setDate(next.getDate() + interval);
  return {
    ...card, interval, repetitions, easeFactor,
    nextReview: next.toISOString(),
    lastReview: new Date().toISOString(),
    reviewCount: card.reviewCount + 1,
  };
}

function isDue(card: Lernkarte): boolean {
  return new Date(card.nextReview) <= new Date();
}

// ─── TEXT PARSER ────────────────────────────────────────────
function parseText(text: string): { front: string; back: string }[] {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const seps = ["\t", " – ", " - ", " = ", " : ", "; "];
  let best = "\t", bestN = 0;
  for (const s of seps) {
    const n = lines.filter(l => l.includes(s)).length;
    if (n > bestN) { bestN = n; best = s; }
  }
  return lines.map(l => {
    const i = l.indexOf(best);
    if (i > 0) return { front: l.slice(0, i).trim(), back: l.slice(i + best.length).trim() };
    return null;
  }).filter((x): x is { front: string; back: string } => x !== null);
}

// ─── SAMPLE DATA ────────────────────────────────────────────
function getSampleData(): { decks: LernkartenDeck[]; cards: Lernkarte[] } {
  const decks: LernkartenDeck[] = [
    { id: "d1", subjectId: "eng", name: "Unit 3 – Vocabulary", createdAt: new Date().toISOString() },
    { id: "d2", subjectId: "lat", name: "Lektion 12 – Verben", createdAt: new Date().toISOString() },
  ];
  const cards: Lernkarte[] = [
    createCard("d1", "ubiquitous", "allgegenwärtig"),
    createCard("d1", "serendipity", "glücklicher Zufall"),
    createCard("d1", "ephemeral", "vergänglich, kurzlebig"),
    createCard("d1", "to accomplish", "erreichen, vollbringen"),
    createCard("d1", "resilient", "widerstandsfähig"),
    createCard("d2", "amare", "lieben"),
    createCard("d2", "videre", "sehen"),
    createCard("d2", "audire", "hören"),
    createCard("d2", "scribere", "schreiben"),
  ];
  return { decks, cards };
}

// ─── SVG ICONS ──────────────────────────────────────────────
const Icons: Record<string, JSX.Element> = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  folder: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  play: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  back: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  cards: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="16" height="16" rx="2" /><path d="M6 2h12a2 2 0 012 2v12" />
    </svg>
  ),
  text: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  trash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  flame: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 23c-3.6 0-8-2.4-8-8.3C4 9.4 8.3 4.3 12 1c3.7 3.3 8 8.4 8 13.7 0 5.9-4.4 8.3-8 8.3zm0-18.6C9.2 7.5 6 11.4 6 14.7 6 19 9 21 12 21s6-2 6-6.3c0-3.3-3.2-7.2-6-10.3z" />
    </svg>
  ),
  coin: (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="var(--fb-reward)" stroke="#B8960F" strokeWidth="1.5" />
      <text x="12" y="16" textAnchor="middle" fill="#7A5C00" fontSize="12" fontWeight="bold">$</text>
    </svg>
  ),
  edit: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  camera: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  mic: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
      <path d="M19 10v2a7 7 0 01-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  ),
  micOff: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" />
      <path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23" />
      <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  ),
  upload: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
};

function Icon({ name, size = 20, className = "" }: { name: string; size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center shrink-0 ${className}`} style={{ width: size, height: size }}>
      {Icons[name]}
    </span>
  );
}

// ─── SPARKLE EFFECT ─────────────────────────────────────────
function Sparkles({ count = 6 }: { count?: number }) {
  const [sparks, setSparks] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number; dur: number }>>([]);
  useEffect(() => {
    const arr = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 3,
      delay: Math.random() * 4,
      dur: 2 + Math.random() * 3,
    }));
    setSparks(arr);
  }, [count]);
  return (
    <div className="loot-sparkles" aria-hidden="true">
      {sparks.map(s => (
        <div
          key={s.id}
          className="loot-sparkle-dot"
          style={{
            left: `${s.x}%`, top: `${s.y}%`,
            width: s.size, height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.dur}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── CONFETTI ───────────────────────────────────────────────
function Confetti({ active }: { active: boolean }) {
  const [pieces, setPieces] = useState<Array<{ id: number; x: number; color: string; delay: number; rot: number; drift: number; size: number }>>([]);
  useEffect(() => {
    if (!active) return;
    const colors = [T.gold, T.success, T.info, T.purple, T.amber, "#FF6B6B"];
    const p = Array.from({ length: 60 }, (_, i) => ({
      id: i, x: Math.random() * 100,
      color: colors[i % colors.length],
      delay: Math.random() * 0.6,
      rot: Math.random() * 720 - 360,
      drift: (Math.random() - 0.5) * 200,
      size: 6 + Math.random() * 8,
    }));
    setPieces(p);
    const t = setTimeout(() => setPieces([]), 3500);
    return () => clearTimeout(t);
  }, [active]);
  if (!pieces.length) return null;
  return (
    <div className="loot-confetti-container">
      {pieces.map(p => (
        <div
          key={p.id}
          className="loot-confetti-piece"
          style={{
            left: `${p.x}%`,
            width: p.size, height: p.size * 0.6,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            // @ts-ignore
            "--drift": `${p.drift}px`,
            "--rot": `${p.rot}deg`,
          }}
        />
      ))}
    </div>
  );
}

// ─── FLOATING REWARD ────────────────────────────────────────
function FloatingReward({ text, onDone }: { text: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1200);
    return () => clearTimeout(t);
  }, [onDone]);
  return <div className="loot-floating-reward">{text}</div>;
}

// ─── GOLD BUTTON ────────────────────────────────────────────
function GoldButton({ children, onClick, disabled, small, className = "" }: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  small?: boolean;
  className?: string;
}) {
  return (
    <button onClick={onClick} disabled={disabled} className={`loot-gold-btn ${small ? "loot-gold-btn-sm" : ""} ${className}`}>
      {children}
    </button>
  );
}

function GhostButton({ children, onClick, className = "" }: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button onClick={onClick} className={`loot-ghost-btn ${className}`}>
      {children}
    </button>
  );
}

// ─── PROGRESS BAR ───────────────────────────────────────────
function ProgressBar({ value, max, color = T.gold, height = 8, showLabel = false }: {
  value: number;
  max: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="loot-progress-bar" style={{ height, background: "rgba(255,255,255,0.08)" }}>
      <div
        className="loot-progress-fill loot-shimmer-bar"
        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${T.goldLight})` }}
      />
      {showLabel && (
        <span className="loot-progress-label" style={{ color: T.navy }}>
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}

// ─── HEADER BAR ─────────────────────────────────────────────
function Header({ title, onBack, right }: { title: string; onBack?: () => void; right?: React.ReactNode }) {
  return (
    <div className="loot-header" style={{ borderBottom: `1px solid rgba(255,215,0,0.1)` }}>
      {onBack && (
        <button onClick={onBack} className="loot-ghost-btn loot-header-back" aria-label="Zurück">
          <Icon name="back" size={22} />
        </button>
      )}
      <h2 className="loot-header-title" style={{ color: T.parchment }}>{title}</h2>
      {right}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// VIEWS
// ════════════════════════════════════════════════════════════

// ─── DASHBOARD ──────────────────────────────────────────────
function Dashboard({ decks, cards, coins, streak, onSelectSubject, onStudyDue }: {
  decks: LernkartenDeck[];
  cards: Lernkarte[];
  coins: number;
  streak: number;
  onSelectSubject: (id: string) => void;
  onStudyDue: () => void;
}) {
  const dueCount = cards.filter(isDue).length;
  const totalCards = cards.length;
  const masteredCards = cards.filter(c => c.repetitions >= 4).length;

  return (
    <div className="loot-view">
      {/* Top Stats */}
      <div className="loot-dashboard-top">
        <div className="loot-dashboard-header">
          <div>
            <h1 className="loot-title" style={{ color: T.parchment }}>Lernkarten</h1>
            <p className="loot-subtitle" style={{ color: T.textMuted }}>Dein Wissens-Schatz</p>
          </div>
          <div className="loot-stats-row">
            <div className="loot-stat-item" title="Streak">
              <Icon name="flame" size={20} className={streak > 0 ? "text-orange-400" : "text-gray-600"} />
              <span className="loot-stat-value" style={{ color: streak > 0 ? T.amber : T.textMuted }}>{streak}</span>
            </div>
            <div className="loot-stat-item" title="Münzen">
              <Icon name="coin" size={20} />
              <span className="loot-stat-value" style={{ color: T.gold }}>{coins}</span>
            </div>
          </div>
        </div>

        {/* Due Card */}
        <button
          onClick={onStudyDue}
          disabled={dueCount === 0}
          className="loot-due-card"
          style={{
            background: dueCount > 0
              ? "linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,165,0,0.1))"
              : "rgba(255,255,255,0.03)",
            border: `1px solid ${dueCount > 0 ? "rgba(255,215,0,0.3)" : "rgba(255,255,255,0.06)"}`,
            cursor: dueCount > 0 ? "pointer" : "default",
          }}
        >
          {dueCount > 0 && <Sparkles count={4} />}
          <div className="loot-due-card-content">
            <div>
              <p className="loot-due-label" style={{ color: T.textMuted }}>Heute fällig</p>
              <p className="loot-due-count" style={{ color: dueCount > 0 ? T.gold : T.textMuted }}>{dueCount}</p>
              <p className="loot-due-hint" style={{ color: T.textMuted }}>
                {dueCount > 0 ? "Tippe zum Lernen" : "Alles wiederholt!"}
              </p>
            </div>
            {dueCount > 0 && (
              <div className="loot-play-button">
                <Icon name="play" size={24} className="text-gray-900 ml-0.5" />
              </div>
            )}
          </div>
        </button>

        {/* Stats Row */}
        <div className="loot-stats-grid">
          {[
            { label: "Karten", value: totalCards, color: T.info },
            { label: "Gelernt", value: masteredCards, color: T.success },
            { label: "Decks", value: decks.length, color: T.purple },
          ].map(s => (
            <div key={s.label} className="loot-stat-box" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="loot-stat-number" style={{ color: s.color }}>{s.value}</p>
              <p className="loot-stat-label" style={{ color: T.textMuted }}>{s.label}</p>
            </div>
          ))}
        </div>

        <p className="loot-section-title" style={{ color: T.textMuted }}>Fächer</p>
      </div>

      {/* Subjects Grid */}
      <div className="loot-subjects-scroll">
        <div className="loot-subjects-grid">
          {SUBJECTS.map(sub => {
            const subDecks = decks.filter(d => d.subjectId === sub.id);
            const subCards = cards.filter(c => subDecks.some(d => d.id === c.deckId));
            const subDue = subCards.filter(isDue).length;
            return (
              <button
                key={sub.id}
                onClick={() => onSelectSubject(sub.id)}
                className="loot-subject-tile"
                style={{ "--accent": sub.color } as React.CSSProperties}
              >
                <div className="loot-subject-header">
                  <span className="loot-subject-icon">{sub.icon}</span>
                  <span className="loot-subject-name" style={{ color: T.parchment }}>{sub.name}</span>
                </div>
                <div className="loot-subject-footer">
                  <span className="loot-subject-decks" style={{ color: T.textMuted }}>
                    {subDecks.length} {subDecks.length === 1 ? "Deck" : "Decks"}
                  </span>
                  {subDue > 0 && (
                    <span className="loot-due-badge">{subDue}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── SUBJECT VIEW (DECK BROWSER) ───────────────────────────
function SubjectView({ subject, decks, cards, onBack, onSelectDeck, onAddDeck }: {
  subject: string;
  decks: LernkartenDeck[];
  cards: Lernkarte[];
  onBack: () => void;
  onSelectDeck: (id: string) => void;
  onAddDeck: (name: string) => void;
}) {
  const sub = SUBJECTS.find(s => s.id === subject);
  const subDecks = decks.filter(d => d.subjectId === subject);
  const [newName, setNewName] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = () => {
    if (newName.trim()) {
      onAddDeck(newName.trim());
      setNewName("");
      setShowAdd(false);
    }
  };

  return (
    <div className="loot-view">
      <Header
        title={`${sub?.icon} ${sub?.name}`}
        onBack={onBack}
        right={
          <button onClick={() => setShowAdd(true)} className="loot-ghost-btn loot-header-action" aria-label="Deck hinzufügen">
            <Icon name="plus" size={22} />
          </button>
        }
      />

      <div className="loot-content-scroll">
        {showAdd && (
          <div className="loot-add-deck-form">
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
              placeholder="Name des neuen Decks..."
              className="loot-input"
            />
            <div className="loot-form-actions">
              <GoldButton small onClick={handleAdd}>Erstellen</GoldButton>
              <GhostButton onClick={() => { setShowAdd(false); setNewName(""); }}>Abbrechen</GhostButton>
            </div>
          </div>
        )}

        {subDecks.length === 0 && !showAdd ? (
          <div className="loot-empty-state">
            <div className="loot-empty-icon">📦</div>
            <p style={{ color: T.textMuted }}>Noch keine Decks in {sub?.name}</p>
            <GoldButton onClick={() => setShowAdd(true)}>
              <Icon name="plus" size={16} /> Erstes Deck erstellen
            </GoldButton>
          </div>
        ) : (
          <div className="loot-deck-list">
            {subDecks.map(deck => {
              const deckCards = cards.filter(c => c.deckId === deck.id);
              const dueCards = deckCards.filter(isDue);
              const mastered = deckCards.filter(c => c.repetitions >= 4).length;
              return (
                <button
                  key={deck.id}
                  onClick={() => onSelectDeck(deck.id)}
                  className="loot-deck-tile"
                >
                  <div className="loot-deck-row">
                    <div className="loot-deck-icon" style={{ background: `${sub?.color}22`, border: `1px solid ${sub?.color}44`, color: sub?.color }}>
                      <Icon name="folder" size={20} />
                    </div>
                    <div className="loot-deck-info">
                      <p className="loot-deck-name" style={{ color: T.parchment }}>{deck.name}</p>
                      <p className="loot-deck-meta" style={{ color: T.textMuted }}>
                        {deckCards.length} Karten · {mastered} gemeistert
                      </p>
                    </div>
                    {dueCards.length > 0 && <span className="loot-due-badge">{dueCards.length}</span>}
                  </div>
                  {deckCards.length > 0 && (
                    <div className="loot-deck-progress">
                      <ProgressBar value={mastered} max={deckCards.length} color={sub?.color} height={4} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DECK DETAIL VIEW ───────────────────────────────────────
function DeckDetail({ deck, cards, subject, onBack, onStudy, onAddCard, onAddCards, onDeleteCard, onDeleteDeck, onRenameDeck }: {
  deck: LernkartenDeck;
  cards: Lernkarte[];
  subject: string;
  onBack: () => void;
  onStudy: () => void;
  onAddCard: (front: string, back: string) => void;
  onAddCards: (pairs: { front: string; back: string }[]) => void;
  onDeleteCard: (id: string) => void;
  onDeleteDeck: () => void;
  onRenameDeck: (name: string) => void;
}) {
  const sub = SUBJECTS.find(s => s.id === subject);
  const deckCards = cards.filter(c => c.deckId === deck.id);
  const dueCards = deckCards.filter(isDue);
  const [view, setView] = useState<"list" | "add" | "import" | "scan">("list");
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [importText, setImportText] = useState("");
  const [parsed, setParsed] = useState<{ front: string; back: string }[]>([]);
  const [showRename, setShowRename] = useState(false);
  const [newDeckName, setNewDeckName] = useState(deck.name);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Voice input
  const voice = useSpeechRecognition();
  const [activeVoiceField, setActiveVoiceField] = useState<"front" | "back" | null>(null);

  const handleVoiceInput = (field: "front" | "back") => {
    if (voice.isListening) {
      voice.stopListening();
      setActiveVoiceField(null);
    } else {
      setActiveVoiceField(field);
      voice.startListening((text) => {
        if (field === "front") setFront(prev => prev + text);
        else setBack(prev => prev + text);
        setActiveVoiceField(null);
      });
    }
  };

  const handleAddCard = () => {
    if (front.trim() && back.trim()) {
      onAddCard(front.trim(), back.trim());
      setFront(""); setBack("");
    }
  };

  const handleParse = () => {
    const result = parseText(importText);
    setParsed(result);
  };

  const handleImportAll = () => {
    if (parsed.length > 0) {
      onAddCards(parsed);
      setImportText(""); setParsed([]);
      setView("list");
    }
  };

  const handleRename = () => {
    if (newDeckName.trim() && newDeckName.trim() !== deck.name) {
      onRenameDeck(newDeckName.trim());
    }
    setShowRename(false);
  };

  // ── Card Creator ──
  if (view === "add") {
    return (
      <div className="loot-view">
        <Header title="Karte erstellen" onBack={() => { setView("list"); setActiveVoiceField(null); voice.stopListening(); }} />
        <div className="loot-content-scroll">
          {/* Voice info banner */}
          {voice.isSupported && (
            <div style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.3)", borderRadius: 12, padding: 10, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="mic" size={16} className="text-purple-400" />
              <span style={{ color: T.purple, fontSize: 12 }}>Tippe auf das Mikrofon zum Einsprechen</span>
            </div>
          )}
          <div className="loot-form-group">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <label className="loot-label" style={{ color: T.textMuted, margin: 0 }}>Vorderseite (Frage)</label>
              {voice.isSupported && (
                <button
                  onClick={() => handleVoiceInput("front")}
                  className={`loot-mic-btn ${activeVoiceField === "front" ? "loot-mic-active" : ""}`}
                  title="Einsprechen"
                >
                  <Icon name={activeVoiceField === "front" ? "mic" : "mic"} size={18} />
                </button>
              )}
            </div>
            <textarea
              autoFocus
              value={front}
              onChange={e => setFront(e.target.value)}
              placeholder="z.B. ubiquitous"
              className="loot-textarea"
              rows={3}
              style={activeVoiceField === "front" ? { borderColor: T.purple, boxShadow: `0 0 0 3px rgba(167,139,250,0.2)` } : {}}
            />
          </div>
          <div className="loot-form-group">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <label className="loot-label" style={{ color: T.textMuted, margin: 0 }}>Rückseite (Antwort)</label>
              {voice.isSupported && (
                <button
                  onClick={() => handleVoiceInput("back")}
                  className={`loot-mic-btn ${activeVoiceField === "back" ? "loot-mic-active" : ""}`}
                  title="Einsprechen"
                >
                  <Icon name={activeVoiceField === "back" ? "mic" : "mic"} size={18} />
                </button>
              )}
            </div>
            <textarea
              value={back}
              onChange={e => setBack(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && e.metaKey) handleAddCard(); }}
              placeholder="z.B. allgegenwärtig"
              className="loot-textarea"
              rows={3}
              style={activeVoiceField === "back" ? { borderColor: T.purple, boxShadow: `0 0 0 3px rgba(167,139,250,0.2)` } : {}}
            />
          </div>
          <GoldButton onClick={handleAddCard} disabled={!front.trim() || !back.trim()} className="loot-full-width">
            <Icon name="plus" size={16} /> Karte hinzufügen
          </GoldButton>
          <p className="loot-hint">⌘+Enter zum Speichern</p>

          {/* Recently added preview */}
          {deckCards.length > 0 && (
            <div className="loot-recent-cards">
              <p className="loot-section-title" style={{ color: T.textMuted }}>
                Letzte Karten ({deckCards.length})
              </p>
              {deckCards.slice(-5).reverse().map(c => (
                <div key={c.id} className="loot-card-preview">
                  <span className="loot-card-front" style={{ color: T.text }}>{c.front}</span>
                  <span className="loot-card-arrow" style={{ color: T.textMuted }}>→</span>
                  <span className="loot-card-back" style={{ color: T.goldLight }}>{c.back}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Text Importer ──
  if (view === "import") {
    return (
      <div className="loot-view">
        <Header title="Text importieren" onBack={() => { setView("list"); setParsed([]); setImportText(""); }} />
        <div className="loot-content-scroll">
          <p className="loot-import-intro" style={{ color: T.text }}>
            Füge eine Vokabelliste ein. Unterstützte Formate:
          </p>
          <div className="loot-import-formats">
            Wort → Übersetzung (Tab)<br />
            Wort - Übersetzung<br />
            Wort = Übersetzung<br />
            Wort : Übersetzung<br />
            Wort ; Übersetzung
          </div>
          <textarea
            autoFocus
            value={importText}
            onChange={e => { setImportText(e.target.value); setParsed([]); }}
            placeholder={"ubiquitous - allgegenwärtig\nephemeral - vergänglich\nserendipity - glücklicher Zufall"}
            className="loot-textarea loot-import-area"
            rows={8}
          />
          <GoldButton onClick={handleParse} disabled={!importText.trim()} className="loot-full-width">
            Erkennen ({importText.split("\n").filter(l => l.trim()).length} Zeilen)
          </GoldButton>

          {parsed.length > 0 && (
            <div className="loot-parsed-result">
              <p className="loot-parsed-title" style={{ color: T.success }}>
                ✓ {parsed.length} Karten erkannt
              </p>
              <div className="loot-parsed-list">
                {parsed.map((p, i) => (
                  <div key={i} className="loot-parsed-item" style={{ background: i % 2 === 0 ? "rgba(74,222,128,0.05)" : "transparent" }}>
                    <span className="loot-card-front" style={{ color: T.text }}>{p.front}</span>
                    <span className="loot-card-arrow" style={{ color: T.success }}>→</span>
                    <span className="loot-card-back" style={{ color: T.goldLight }}>{p.back}</span>
                  </div>
                ))}
              </div>
              <GoldButton onClick={handleImportAll} className="loot-full-width">
                Alle {parsed.length} Karten hinzufügen
              </GoldButton>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Scan View (OCR) ──
  if (view === "scan") {
    return (
      <ScanView
        onBack={() => setView("list")}
        onImportCards={(pairs) => {
          onAddCards(pairs);
        }}
      />
    );
  }

  // ── Card List ──
  return (
    <div className="loot-view">
      <Header
        title={deck.name}
        onBack={onBack}
        right={
          <button onClick={() => setShowRename(true)} className="loot-ghost-btn loot-header-action" title="Umbenennen">
            <Icon name="edit" size={18} />
          </button>
        }
      />

      {showRename && (
        <div className="loot-rename-bar">
          <input
            autoFocus
            value={newDeckName}
            onChange={e => setNewDeckName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleRename()}
            className="loot-input loot-rename-input"
          />
          <GoldButton small onClick={handleRename}>OK</GoldButton>
          <GhostButton onClick={() => { setShowRename(false); setNewDeckName(deck.name); }}>✕</GhostButton>
        </div>
      )}

      <div className="loot-content-scroll">
        {/* Deck Stats */}
        <div className="loot-deck-stats">
          <div className="loot-stats-grid">
            <div className="loot-stat-box">
              <p className="loot-stat-number" style={{ color: T.info }}>{deckCards.length}</p>
              <p className="loot-stat-label" style={{ color: T.textMuted }}>Gesamt</p>
            </div>
            <div className="loot-stat-box">
              <p className="loot-stat-number" style={{ color: T.amber }}>{dueCards.length}</p>
              <p className="loot-stat-label" style={{ color: T.textMuted }}>Fällig</p>
            </div>
            <div className="loot-stat-box">
              <p className="loot-stat-number" style={{ color: T.success }}>{deckCards.filter(c => c.repetitions >= 4).length}</p>
              <p className="loot-stat-label" style={{ color: T.textMuted }}>Gemeistert</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="loot-action-row">
            <GoldButton onClick={onStudy} disabled={dueCards.length === 0} className="loot-flex-1">
              <Icon name="play" size={16} /> Lernen ({dueCards.length})
            </GoldButton>
          </div>
          <div className="loot-action-row">
            <GhostButton onClick={() => setView("add")} className="loot-flex-1">
              <Icon name="plus" size={16} /> Karte
            </GhostButton>
            <GhostButton onClick={() => setView("import")} className="loot-flex-1">
              <Icon name="text" size={16} /> Text
            </GhostButton>
            <GhostButton onClick={() => setView("scan")} className="loot-flex-1">
              <Icon name="camera" size={16} /> Scan
            </GhostButton>
          </div>
        </div>

        {/* Card List */}
        {deckCards.length === 0 ? (
          <div className="loot-empty-state">
            <div className="loot-empty-icon">🃏</div>
            <p style={{ color: T.textMuted }}>Noch keine Karten in diesem Deck</p>
            <GoldButton onClick={() => setView("add")}>
              <Icon name="plus" size={16} /> Erste Karte erstellen
            </GoldButton>
          </div>
        ) : (
          <div className="loot-card-list">
            <p className="loot-section-title" style={{ color: T.textMuted }}>
              Alle Karten ({deckCards.length})
            </p>
            {deckCards.map(c => {
              const due = isDue(c);
              const mastered = c.repetitions >= 4;
              return (
                <div
                  key={c.id}
                  className="loot-card-list-item"
                  style={{
                    borderLeftColor: mastered ? T.success : due ? T.amber : "rgba(255,255,255,0.1)",
                  }}
                >
                  <div className="loot-card-list-content">
                    <div className="loot-card-list-header">
                      <p className="loot-card-front-text" style={{ color: T.parchment }}>{c.front}</p>
                      {mastered && <span className="loot-tag loot-tag-success">✓</span>}
                      {due && !mastered && <span className="loot-tag loot-tag-warning">fällig</span>}
                    </div>
                    <p className="loot-card-back-text" style={{ color: T.textMuted }}>{c.back}</p>
                  </div>
                  {confirmDelete === c.id ? (
                    <div className="loot-confirm-delete">
                      <button onClick={() => { onDeleteCard(c.id); setConfirmDelete(null); }} className="loot-confirm-yes">Ja</button>
                      <button onClick={() => setConfirmDelete(null)} className="loot-confirm-no">Nein</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(c.id)} className="loot-delete-btn">
                      <Icon name="trash" size={16} />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Delete Deck */}
            <div className="loot-delete-deck-section">
              <button onClick={onDeleteDeck} className="loot-delete-deck-btn">
                Deck löschen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── STUDY SESSION ──────────────────────────────────────────
function StudySession({ deck, cards, subject, onBack, onReview, coins }: {
  deck: LernkartenDeck;
  cards: Lernkarte[];
  subject: string;
  onBack: () => void;
  onReview: (cardId: string, quality: number, coinsEarned: number) => void;
  coins: number;
}) {
  const sub = SUBJECTS.find(s => s.id === subject);
  const dueCards = useMemo(() => {
    return cards.filter(c => c.deckId === deck.id && isDue(c))
      .sort(() => Math.random() - 0.5);
  }, []);

  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [rewards, setRewards] = useState<Array<{ id: string; text: string }>>([]);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [done, setDone] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const current = dueCards[idx];

  const handleRate = (quality: number) => {
    const coinsEarned = quality >= 3 ? (quality >= 4 ? 10 : 5) : 0;
    onReview(current.id, quality, coinsEarned);

    setSessionStats(prev => ({
      correct: prev.correct + (quality >= 3 ? 1 : 0),
      total: prev.total + 1,
    }));

    if (coinsEarned > 0) {
      const rid = uid();
      setRewards(prev => [...prev, { id: rid, text: `+${coinsEarned} 🪙` }]);
    }

    setFlipped(false);
    if (idx + 1 >= dueCards.length) {
      setTimeout(() => {
        setDone(true);
        setShowConfetti(true);
      }, 300);
    } else {
      setTimeout(() => setIdx(prev => prev + 1), 300);
    }
  };

  // ── Session Complete ──
  if (done) {
    const accuracy = sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0;
    const totalCoins = sessionStats.correct * 8;
    return (
      <div className="loot-session-complete">
        <Confetti active={showConfetti} />
        <Sparkles count={10} />

        <div className="loot-trophy">🏆</div>
        <h2 className="loot-complete-title" style={{ color: T.gold }}>Geschafft!</h2>
        <p className="loot-complete-text" style={{ color: T.text }}>
          Du hast alle fälligen Karten in „{deck.name}" wiederholt.
        </p>

        <div className="loot-complete-stats">
          <div className="loot-complete-stat" style={{ background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.2)" }}>
            <p className="loot-complete-stat-value" style={{ color: T.gold }}>{sessionStats.total}</p>
            <p className="loot-complete-stat-label" style={{ color: T.textMuted }}>Karten</p>
          </div>
          <div className="loot-complete-stat" style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)" }}>
            <p className="loot-complete-stat-value" style={{ color: T.success }}>{accuracy}%</p>
            <p className="loot-complete-stat-label" style={{ color: T.textMuted }}>Richtig</p>
          </div>
          <div className="loot-complete-stat" style={{ background: "rgba(255,165,0,0.1)", border: "1px solid rgba(255,165,0,0.2)" }}>
            <p className="loot-complete-stat-value" style={{ color: T.amber }}>+{totalCoins}</p>
            <p className="loot-complete-stat-label" style={{ color: T.textMuted }}>Münzen</p>
          </div>
        </div>

        <GoldButton onClick={onBack} className="loot-full-width loot-max-w-xs">
          Zurück zum Deck
        </GoldButton>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="loot-session-complete">
        <p className="loot-trophy">✅</p>
        <p style={{ color: T.text }}>Keine Karten fällig!</p>
        <GhostButton onClick={onBack}>Zurück</GhostButton>
      </div>
    );
  }

  const ratingButtons = [
    { label: "Nochmal", quality: 1, color: T.danger, sub: "< 1 Min" },
    { label: "Schwer", quality: 3, color: T.warning, sub: "1 Tag" },
    { label: "Gut", quality: 4, color: T.info, sub: `${Math.max(1, current.interval || 1)} Tage` },
    { label: "Leicht", quality: 5, color: T.success, sub: `${Math.max(1, Math.round((current.interval || 1) * current.easeFactor))} Tage` },
  ];

  return (
    <div className="loot-study-session">
      {/* Top bar */}
      <div className="loot-study-top">
        <button onClick={onBack} className="loot-ghost-btn loot-study-back"><Icon name="back" size={20} /></button>
        <div className="loot-study-progress">
          <ProgressBar value={idx} max={dueCards.length} color={sub?.color || T.gold} height={6} />
        </div>
        <span className="loot-study-counter" style={{ color: T.textMuted }}>{idx + 1}/{dueCards.length}</span>
      </div>

      {/* Floating rewards */}
      <div className="loot-rewards-container">
        {rewards.map(r => (
          <FloatingReward key={r.id} text={r.text} onDone={() => setRewards(prev => prev.filter(x => x.id !== r.id))} />
        ))}
      </div>

      {/* Card area */}
      <div className="loot-card-area">
        <div
          className="loot-flip-container"
          onClick={() => !flipped && setFlipped(true)}
        >
          <div className={`loot-flip-inner ${flipped ? "flipped" : ""}`}>
            {/* Front */}
            <div className="loot-flip-face loot-flip-front">
              <Sparkles count={3} />
              <p className="loot-card-label" style={{ color: T.goldDark }}>Frage</p>
              <p className="loot-card-text" style={{ color: T.navy }}>
                {current.front}
              </p>
              <p className="loot-card-hint" style={{ color: T.goldDark }}>Tippe zum Umdrehen</p>
            </div>

            {/* Back */}
            <div className="loot-flip-face loot-flip-back">
              <p className="loot-card-label" style={{ color: "rgba(255,215,0,0.7)" }}>Antwort</p>
              <p className="loot-card-text" style={{ color: T.parchment }}>
                {current.back}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rating buttons */}
      <div className="loot-rating-section">
        {flipped ? (
          <div>
            <p className="loot-rating-prompt" style={{ color: T.textMuted }}>Wie gut wusstest du es?</p>
            <div className="loot-rating-grid">
              {ratingButtons.map(b => (
                <button
                  key={b.quality}
                  onClick={() => handleRate(b.quality)}
                  className="loot-rating-btn"
                  style={{ "--btn-color": b.color } as React.CSSProperties}
                >
                  <span className="loot-rating-label">{b.label}</span>
                  <span className="loot-rating-sub">{b.sub}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <GoldButton onClick={() => setFlipped(true)} className="loot-full-width">
            Antwort zeigen
          </GoldButton>
        )}
      </div>
    </div>
  );
}

// ─── SCAN VIEW (OCR) ─────────────────────────────────────────
const OCR_LANGUAGES = [
  { value: "deu", label: "Deutsch" },
  { value: "eng", label: "Englisch" },
  { value: "deu+eng", label: "Deutsch + Englisch" },
  { value: "fra", label: "Französisch" },
  { value: "lat", label: "Latein" },
  { value: "spa", label: "Spanisch" },
];

function ScanView({ onBack, onImportCards }: {
  onBack: () => void;
  onImportCards: (pairs: { front: string; back: string }[]) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ocrLang, setOcrLang] = useState("deu+eng");
  const [result, setResult] = useState<string | null>(null);
  const [parsed, setParsed] = useState<{ front: string; back: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tesseractLoaded, setTesseractLoaded] = useState(false);

  // Load Tesseract.js from CDN
  useEffect(() => {
    if (typeof Tesseract !== "undefined") {
      setTesseractLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
    script.onload = () => setTesseractLoaded(true);
    script.onerror = () => setError("Tesseract konnte nicht geladen werden");
    document.head.appendChild(script);
  }, []);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Attach stream to video element when stream changes
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      setStream(mediaStream);
    } catch {
      setError("Kamera-Zugriff nicht möglich. Bitte erlaube den Zugriff.");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0);
    setPhoto(canvas.toDataURL("image/jpeg", 0.9));
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhoto(ev.target?.result as string);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const retake = () => {
    setPhoto(null);
    setResult(null);
    setParsed([]);
    setError(null);
    startCamera();
  };

  const runOCR = async () => {
    if (!photo || !tesseractLoaded) return;
    setScanning(true);
    setProgress(0);
    setError(null);
    setResult(null);
    setParsed([]);

    try {
      const ocrResult = await Tesseract.recognize(photo, ocrLang, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        }
      });

      const text = ocrResult.data.text;
      setResult(text);

      // Parse cards
      const cards = parseText(text);
      setParsed(cards);
    } catch {
      setError("Texterkennung fehlgeschlagen. Versuche ein deutlicheres Bild.");
    } finally {
      setScanning(false);
      setProgress(0);
    }
  };

  const handleImport = () => {
    if (parsed.length > 0) {
      onImportCards(parsed);
      onBack();
    }
  };

  return (
    <div className="loot-view">
      <Header title="Scannen (OCR)" onBack={onBack} />
      <div className="loot-content-scroll">
        {/* Info */}
        <div className="loot-scan-tips" style={{ background: "rgba(79,195,247,0.1)", border: "1px solid rgba(79,195,247,0.3)", borderRadius: 12, padding: 12, marginBottom: 16 }}>
          <p style={{ color: T.info, fontSize: 13, margin: 0 }}>
            <strong>Tipps:</strong> Gute Beleuchtung, Text gerade halten. Format: "Wort - Übersetzung" pro Zeile.
          </p>
        </div>

        {/* Language Select */}
        <div className="loot-form-group">
          <label className="loot-label" style={{ color: T.textMuted }}>Sprache</label>
          <select
            value={ocrLang}
            onChange={e => setOcrLang(e.target.value)}
            className="loot-input"
            style={{ cursor: "pointer" }}
          >
            {OCR_LANGUAGES.map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        {/* Camera / Photo Preview */}
        <div className="loot-camera-container" style={{ background: "#000", borderRadius: 16, overflow: "hidden", aspectRatio: "4/3", marginBottom: 16, position: "relative" }}>
          {!photo && !stream && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12 }}>
              <Icon name="camera" size={48} className="text-gray-600" />
              <p style={{ color: T.textMuted, fontSize: 14 }}>Kamera starten oder Bild hochladen</p>
            </div>
          )}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: stream && !photo ? "block" : "none"
            }}
          />
          {photo && (
            <img src={photo} alt="Aufnahme" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          )}
          {scanning && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <p style={{ color: T.gold, marginBottom: 12 }}>Erkenne Text... {progress}%</p>
              <div style={{ width: "80%", height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${progress}%`, height: "100%", background: `linear-gradient(90deg, ${T.gold}, ${T.amber})`, transition: "width 0.3s" }} />
              </div>
            </div>
          )}
        </div>
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* Action Buttons */}
        <div className="loot-action-row">
          {!stream && !photo && (
            <>
              <GoldButton onClick={startCamera} className="loot-flex-1">
                <Icon name="camera" size={16} /> Kamera
              </GoldButton>
              <GhostButton onClick={() => fileInputRef.current?.click()} className="loot-flex-1">
                <Icon name="upload" size={16} /> Hochladen
              </GhostButton>
            </>
          )}
          {stream && !photo && (
            <GoldButton onClick={capturePhoto} className="loot-full-width">
              <Icon name="camera" size={16} /> Foto aufnehmen
            </GoldButton>
          )}
          {photo && !scanning && (
            <>
              <GhostButton onClick={retake} className="loot-flex-1">
                Neu aufnehmen
              </GhostButton>
              <GoldButton onClick={runOCR} disabled={!tesseractLoaded} className="loot-flex-1">
                Text erkennen
              </GoldButton>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />

        {/* Error */}
        {error && (
          <div style={{ background: "rgba(255,82,82,0.1)", border: "1px solid rgba(255,82,82,0.3)", borderRadius: 12, padding: 12, marginTop: 16, color: T.danger, fontSize: 13 }}>
            {error}
          </div>
        )}

        {/* OCR Result */}
        {result && (
          <div style={{ marginTop: 16 }}>
            <p className="loot-section-title" style={{ color: T.textMuted }}>Erkannter Text</p>
            <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 12, padding: 12, maxHeight: 150, overflow: "auto", fontFamily: "monospace", fontSize: 12, color: T.text, whiteSpace: "pre-wrap" }}>
              {result || "(Kein Text erkannt)"}
            </div>
          </div>
        )}

        {/* Parsed Cards */}
        {parsed.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <p className="loot-parsed-title" style={{ color: T.success }}>
              ✓ {parsed.length} Karten erkannt
            </p>
            <div className="loot-parsed-list">
              {parsed.map((p, i) => (
                <div key={i} className="loot-parsed-item" style={{ background: i % 2 === 0 ? "rgba(74,222,128,0.05)" : "transparent" }}>
                  <span className="loot-card-front" style={{ color: T.text }}>{p.front}</span>
                  <span className="loot-card-arrow" style={{ color: T.success }}>→</span>
                  <span className="loot-card-back" style={{ color: T.goldLight }}>{p.back}</span>
                </div>
              ))}
            </div>
            <GoldButton onClick={handleImport} className="loot-full-width">
              Alle {parsed.length} Karten hinzufügen
            </GoldButton>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── VOICE INPUT HOOK ────────────────────────────────────────
function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognitionAPI);
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "de-DE";
    }
  }, []);

  const startListening = useCallback((onResult: (text: string) => void) => {
    if (!recognitionRef.current) return;
    setTranscript("");
    setIsListening(true);

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results;
      let finalTranscript = "";
      for (let i = 0; i < results.length; i++) {
        if (results[i].isFinal) {
          finalTranscript += results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setTranscript(finalTranscript);
        onResult(finalTranscript);
      }
    };

    recognitionRef.current.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  return { isListening, transcript, isSupported, startListening, stopListening };
}

// ════════════════════════════════════════════════════════════
// MAIN MODAL COMPONENT
// ════════════════════════════════════════════════════════════

interface LootLernkartenProps {
  isOpen: boolean;
  onClose: () => void;
  onXPEarned?: (xp: number) => void;
  onCoinsEarned?: (coins: number) => void;
}

export function LootLernkarten({ isOpen, onClose, onXPEarned, onCoinsEarned }: LootLernkartenProps) {
  const sample = useMemo(() => getSampleData(), []);
  const [decks, setDecks] = useState<LernkartenDeck[]>(sample.decks);
  const [cards, setCards] = useState<Lernkarte[]>(sample.cards);
  const [coins, setCoins] = useState(50);
  const [streak, setStreak] = useState(1);
  const [studiedToday, setStudiedToday] = useState(false);

  // Navigation state
  const [view, setView] = useState<"dashboard" | "subject" | "deck" | "study">("dashboard");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);

  // ── Actions ──
  const addDeck = useCallback((subjectId: string, name: string) => {
    setDecks(prev => [...prev, { id: uid(), subjectId, name, createdAt: new Date().toISOString() }]);
  }, []);

  const renameDeck = useCallback((deckId: string, newName: string) => {
    setDecks(prev => prev.map(d => d.id === deckId ? { ...d, name: newName } : d));
  }, []);

  const deleteDeck = useCallback((deckId: string) => {
    setDecks(prev => prev.filter(d => d.id !== deckId));
    setCards(prev => prev.filter(c => c.deckId !== deckId));
  }, []);

  const addCard = useCallback((deckId: string, front: string, back: string) => {
    setCards(prev => [...prev, createCard(deckId, front, back)]);
  }, []);

  const addCards = useCallback((deckId: string, pairs: { front: string; back: string }[]) => {
    const newCards = pairs.map(p => createCard(deckId, p.front, p.back));
    setCards(prev => [...prev, ...newCards]);
  }, []);

  const deleteCard = useCallback((cardId: string) => {
    setCards(prev => prev.filter(c => c.id !== cardId));
  }, []);

  const reviewCard = useCallback((cardId: string, quality: number, coinsEarned: number) => {
    setCards(prev => prev.map(c => c.id === cardId ? sm2(c, quality) : c));
    if (coinsEarned > 0) {
      setCoins(prev => prev + coinsEarned);
      onCoinsEarned?.(coinsEarned);
    }
    // XP basierend auf Qualität
    const xp = quality >= 4 ? 15 : quality >= 3 ? 10 : 5;
    onXPEarned?.(xp);

    if (!studiedToday) {
      setStreak(prev => prev + 1);
      setStudiedToday(true);
    }
  }, [studiedToday, onCoinsEarned, onXPEarned]);

  // ── Study all due cards ──
  const handleStudyAllDue = () => {
    const dueCards = cards.filter(isDue);
    if (dueCards.length === 0) return;
    // Find first deck with due cards
    const firstDueDeck = decks.find(d => cards.some(c => c.deckId === d.id && isDue(c)));
    if (firstDueDeck) {
      setSelectedDeck(firstDueDeck.id);
      setSelectedSubject(firstDueDeck.subjectId);
      setView("study");
    }
  };

  // ── Render ──
  const currentDeck = decks.find(d => d.id === selectedDeck);

  // Calculate due count for badge
  const dueCount = cards.filter(isDue).length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="loot-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="loot-modal"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Close Button */}
          <button className="loot-close-btn" onClick={onClose}>
            <Icon name="close" size={24} />
          </button>

          <div className="loot-container">
            {view === "dashboard" && (
              <Dashboard
                decks={decks}
                cards={cards}
                coins={coins}
                streak={streak}
                onSelectSubject={(id) => { setSelectedSubject(id); setView("subject"); }}
                onStudyDue={handleStudyAllDue}
              />
            )}

            {view === "subject" && selectedSubject && (
              <SubjectView
                subject={selectedSubject}
                decks={decks}
                cards={cards}
                onBack={() => { setView("dashboard"); setSelectedSubject(null); }}
                onSelectDeck={(id) => { setSelectedDeck(id); setView("deck"); }}
                onAddDeck={(name) => addDeck(selectedSubject, name)}
              />
            )}

            {view === "deck" && currentDeck && (
              <DeckDetail
                deck={currentDeck}
                cards={cards}
                subject={selectedSubject || ""}
                onBack={() => { setView("subject"); setSelectedDeck(null); }}
                onStudy={() => setView("study")}
                onAddCard={(f, b) => addCard(currentDeck.id, f, b)}
                onAddCards={(pairs) => addCards(currentDeck.id, pairs)}
                onDeleteCard={deleteCard}
                onDeleteDeck={() => { deleteDeck(currentDeck.id); setView("subject"); setSelectedDeck(null); }}
                onRenameDeck={(name) => renameDeck(currentDeck.id, name)}
              />
            )}

            {view === "study" && currentDeck && (
              <StudySession
                deck={currentDeck}
                cards={cards}
                subject={selectedSubject || ""}
                coins={coins}
                onBack={() => setView("deck")}
                onReview={reviewCard}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Export due count helper for WorldMap badge
export function getLernkartenDueCount(): number {
  // This would need to be hooked up to actual state
  // For now, return a sample value
  return 0;
}

export default LootLernkarten;

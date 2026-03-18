import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/transferboard.css';

// ────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────

interface TransferBoardProps {
  ageGroup: 'grundschule' | 'unterstufe' | 'mittelstufe' | 'oberstufe' | 'paedagoge';
}

interface Person {
  name: string;
  color: string;
  emoji: string;
}

interface Card {
  id: number;
  columnId: 'skills' | 'schulthemen' | 'probleme';
  text: string;
  person: Person;
}

interface Connection {
  id: number;
  strength: Card;
  target: Card;
  targetType: 'schulthemen' | 'probleme';
  note: string;
}

interface PendingConnection {
  strength: Card;
  target: Card | null;
  targetType: 'schulthemen' | 'probleme';
  pickTarget?: boolean;
  targets?: Card[];
}

interface TransferBoardData {
  cards: Card[];
  counter: number;
  step: number;
  names: string[];
  connections: Connection[];
  connCounter: number;
}

// ────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────

type StepId = 'skills' | 'schulthemen' | 'probleme' | 'connect';
const STEPS: StepId[] = ['skills', 'schulthemen', 'probleme', 'connect'];

const PERSONS_DEFAULT: Person[] = [
  { name: 'Spieler 1', color: '#2471a3', emoji: '⚔️' },
  { name: 'Spieler 2', color: '#8e44ad', emoji: '🛡️' },
  { name: 'Coach', color: '#d4ac0d', emoji: '🧭' },
];

interface ColumnDef {
  id: 'skills' | 'schulthemen' | 'probleme';
  emoji: string;
}

const COLUMNS: ColumnDef[] = [
  { id: 'skills', emoji: '🎮' },
  { id: 'schulthemen', emoji: '📚' },
  { id: 'probleme', emoji: '🤯' },
];

// ────────────────────────────────────────────────────────
// Age-Group Texts
// ────────────────────────────────────────────────────────

interface AgeTexts {
  columns: {
    skills: { title: string; subtitle: string };
    schulthemen: { title: string; subtitle: string };
    probleme: { title: string; subtitle: string };
  };
  steps: {
    skills: { title: string; subtitle: string };
    schulthemen: { title: string; subtitle: string };
    probleme: { title: string; subtitle: string };
    connect: { title: string; subtitle: string };
  };
  connectArea: {
    heading: string;
    instruction: string;
    empty: string;
  };
  modal: {
    heading: string;
    placeholder: string;
    promptHelpers: string[];
  };
  input: { placeholder: string };
}

function getTexts(ageGroup: TransferBoardProps['ageGroup']): AgeTexts {
  // Base texts (unterstufe — the core target group)
  const base: AgeTexts = {
    columns: {
      skills: { title: 'Was ich schon kann', subtitle: 'Skills aus Alltag, Hobbys, Games' },
      schulthemen: { title: 'Schulthemen', subtitle: 'Was steht gerade an?' },
      probleme: { title: 'Das check ich nicht', subtitle: 'Wo hakt es?' },
    },
    steps: {
      skills: { title: 'Was kannst du schon?', subtitle: 'Sammle Skills aus deinen Hobbys, Games und dem Alltag!' },
      schulthemen: { title: 'Was steht in der Schule an?', subtitle: 'Welche Fächer und Themen sind gerade dran?' },
      probleme: { title: 'Wo hakt es?', subtitle: 'Was verstehst du noch nicht? Was ist schwer?' },
      connect: { title: 'Bau deine Transfer-Brücken!', subtitle: 'Zieh einen Skill auf ein Schulthema oder Problem — finde das gleiche Prinzip!' },
    },
    connectArea: {
      heading: '🌉 Meine Transfer-Brücken',
      instruction: 'Zieh einen Skill 🎮 auf ein Schulthema 📚 oder Problem 🤯',
      empty: 'Noch keine Brücken — zieh einen Skill auf ein Schulthema oder Problem!',
    },
    modal: {
      heading: '🌉 Was ist das gleiche Prinzip?',
      placeholder: 'Was ist das gleiche Muster? Welche Schritte sind ähnlich? (optional)',
      promptHelpers: [
        'Das Muster ist ähnlich, weil...',
        'Die Schritte sind gleich: Erst..., dann...',
        'Beides erfordert, dass man...',
      ],
    },
    input: { placeholder: 'Eintippen...' },
  };

  if (ageGroup === 'grundschule') {
    base.columns.skills.subtitle = 'Was kannst du richtig gut?';
    base.columns.probleme = { title: 'Das ist schwer', subtitle: 'Was fällt dir schwer?' };
    base.steps.skills = { title: 'Was kannst du gut?', subtitle: 'Denk an Hobbys, Spiele und was du zuhause machst! 🌟' };
    base.steps.schulthemen.subtitle = 'Was lernt ihr gerade in der Schule?';
    base.steps.probleme = { title: 'Was fällt dir schwer?', subtitle: 'Das ist OK — wir finden einen Weg!' };
    base.steps.connect.subtitle = 'Zieh etwas, was du kannst, auf ein Schulthema oder Problem!';
    base.modal.placeholder = 'Was ist gleich? (optional)';
    base.modal.promptHelpers = [
      'Das ist ähnlich, weil...',
      'Erst mache ich..., dann...',
      'Bei beidem muss man...',
    ];
    base.connectArea.empty = 'Noch keine Brücken — zieh etwas, was du kannst, auf ein Schulthema oder Problem!';
  }

  if (ageGroup === 'mittelstufe' || ageGroup === 'oberstufe') {
    base.columns.skills = { title: 'Vorhandene Kompetenzen', subtitle: 'Skills aus Alltag, Hobbys, Sport, Games' };
    base.columns.schulthemen = { title: 'Schulische Themen', subtitle: 'Aktuelle Fächer und Inhalte' };
    base.columns.probleme = { title: 'Herausforderungen', subtitle: 'Was ist noch unklar?' };
    base.steps.skills = { title: 'Welche Kompetenzen hast du schon?', subtitle: 'Sammle Fähigkeiten aus allen Lebensbereichen.' };
    base.steps.connect = { title: 'Baue Transfer-Brücken!', subtitle: 'Verbinde eine Kompetenz mit einem Schulthema oder Problem — erkenne das gemeinsame Prinzip.' };
    base.modal.placeholder = 'Was ist das gemeinsame Prinzip? Welche Struktur oder Strategie ist übertragbar? (optional)';
    base.modal.promptHelpers = [
      'Das zugrunde liegende Prinzip ist...',
      'Die Struktur ist analog: Zuerst..., dann...',
      'Beide Situationen erfordern...',
    ];
  }

  if (ageGroup === 'paedagoge') {
    base.columns.skills = { title: 'Vorhandene Kompetenzen', subtitle: 'Identifizierte Stärken & Ressourcen' };
    base.columns.schulthemen = { title: 'Schulische Anforderungen', subtitle: 'Curriculare Inhalte & Lernziele' };
    base.columns.probleme = { title: 'Lernhürden', subtitle: 'Identifizierte Schwierigkeiten' };
    base.steps.skills = { title: 'Kompetenzen erfassen', subtitle: 'Dokumentiere vorhandene Stärken und Ressourcen.' };
    base.steps.schulthemen = { title: 'Schulische Anforderungen', subtitle: 'Aktuelle curriculare Themen und Lernziele.' };
    base.steps.probleme = { title: 'Lernhürden identifizieren', subtitle: 'Wo liegen Verständnislücken oder Motivationsbarrieren?' };
    base.steps.connect = { title: 'Transfer-Brücken konstruieren', subtitle: 'Verbinde Kompetenzen mit Anforderungen oder Hürden — identifiziere übertragbare Prinzipien.' };
    base.modal.placeholder = 'Welches übertragbare Prinzip liegt zugrunde? (optional)';
    base.modal.promptHelpers = [
      'Das transferierbare Prinzip ist...',
      'Die kognitive Struktur ist analog:...',
      'Beide Domänen erfordern die Fähigkeit,...',
    ];
  }

  return base;
}

// ────────────────────────────────────────────────────────
// Example Data
// ────────────────────────────────────────────────────────

function getExampleData(persons: Person[]): { cards: Card[]; connections: Connection[] } {
  const p1 = persons[0];
  const p2 = persons[1];
  const coach = persons[2];

  const cards: Card[] = [
    { id: 901, columnId: 'skills', text: 'In Games teile ich Ressourcen klug ein', person: p1 },
    { id: 902, columnId: 'skills', text: 'In Minecraft erkunde ich erst, dann plane ich, dann baue ich', person: p1 },
    { id: 903, columnId: 'skills', text: 'Beim Boss-Fight probiere ich verschiedene Strategien', person: p2 },
    { id: 904, columnId: 'schulthemen', text: 'Mathe: Gleichungen lösen', person: coach },
    { id: 905, columnId: 'schulthemen', text: 'Erdkunde: Karte analysieren', person: coach },
    { id: 906, columnId: 'schulthemen', text: 'Physik: Formeln umstellen', person: coach },
    { id: 907, columnId: 'probleme', text: 'Textaufgaben — weiß nie, wo ich anfangen soll', person: p2 },
  ];

  const connections: Connection[] = [
    {
      id: 801,
      strength: cards[0], // Ressourcen einteilen
      target: cards[6],   // Textaufgaben
      targetType: 'probleme',
      note: 'Beides erfordert, dass man erst sortiert, was man hat, und dann Schritt für Schritt vorgeht.',
    },
    {
      id: 802,
      strength: cards[1], // Erkunden → Planen → Bauen
      target: cards[4],   // Karte analysieren
      targetType: 'schulthemen',
      note: 'Die Schritte sind gleich: Erst alles anschauen, dann ordnen, dann aufschreiben.',
    },
  ];

  return { cards, connections };
}

// ────────────────────────────────────────────────────────
// Animations
// ────────────────────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.93 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 350, damping: 22 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

const connVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

const modalOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 28 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

// ────────────────────────────────────────────────────────
// Default Data
// ────────────────────────────────────────────────────────

const DEFAULT_DATA: TransferBoardData = {
  cards: [],
  counter: 0,
  step: 0,
  names: ['Spieler 1', 'Spieler 2', 'Coach'],
  connections: [],
  connCounter: 0,
};

// ────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────

export function TransferBoard({ ageGroup }: TransferBoardProps): JSX.Element {
  const LS_KEY = `transferboard_${ageGroup}`;
  const texts = getTexts(ageGroup);

  // ── State ──────────────────────────────────────────────
  const [cards, setCards] = useState<Card[]>([]);
  const [counter, setCounter] = useState(0);
  const [step, setStep] = useState(0);
  const [names, setNames] = useState<string[]>(['Spieler 1', 'Spieler 2', 'Coach']);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connCounter, setConnCounter] = useState(0);

  const [editNames, setEditNames] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(0);
  const [draggingCard, setDraggingCard] = useState<Card | null>(null);
  const [pendingConn, setPendingConn] = useState<PendingConnection | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [saveFlash, setSaveFlash] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmExamples, setConfirmExamples] = useState(false);

  // ── localStorage: Load on mount ────────────────────────
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const data: TransferBoardData = JSON.parse(saved);
        if (data.cards) setCards(data.cards);
        if (data.counter) setCounter(data.counter);
        if (data.step != null) setStep(data.step);
        if (data.names) setNames(data.names);
        if (data.connections) setConnections(data.connections);
        if (data.connCounter) setConnCounter(data.connCounter);
      }
    } catch (e) {
      console.warn('TransferBoard: localStorage load failed', e);
    }
    setLoaded(true);
  }, [LS_KEY]);

  // ── localStorage: Auto-save on every change ────────────
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ cards, counter, step, names, connections, connCounter }));
    } catch (e) {
      console.warn('TransferBoard: localStorage save failed', e);
    }
  }, [cards, counter, step, names, connections, connCounter, LS_KEY, loaded]);

  // ── Derived ────────────────────────────────────────────
  const currentStepId = STEPS[step];
  const isConnect = step === 3;

  const persons: Person[] = PERSONS_DEFAULT.map((p, i) => ({ ...p, name: names[i] || p.name }));

  // Sync person names into cards
  const updatedCards: Card[] = cards.map((c) => ({
    ...c,
    person: persons.find((p) => p.emoji === c.person.emoji) || c.person,
  }));

  const hasCardsInCurrent = updatedCards.some((c) => c.columnId === currentStepId);

  // ── Handlers ───────────────────────────────────────────

  const handleAdd = useCallback(
    (columnId: Card['columnId'], text: string, person: Person) => {
      const actualPerson = persons.find((p) => p.emoji === person.emoji) || person;
      setCards((prev) => [...prev, { id: counter, columnId, text, person: actualPerson }]);
      setCounter((c) => c + 1);
    },
    [counter, persons]
  );

  const handleDelete = useCallback((id: number) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    setConnections((prev) => prev.filter((conn) => conn.strength.id !== id && conn.target.id !== id));
  }, []);

  const handleDragStart = useCallback((card: Card) => {
    setDraggingCard(card);
  }, []);

  const handleDrop = useCallback(
    (targetColumnId: Card['columnId']) => {
      if (!draggingCard || draggingCard.columnId !== 'skills' || targetColumnId === 'skills') {
        setDraggingCard(null);
        return;
      }
      const targets = updatedCards.filter((c) => c.columnId === targetColumnId);
      if (targets.length === 1) {
        setPendingConn({ strength: draggingCard, target: targets[0], targetType: targetColumnId as 'schulthemen' | 'probleme' });
      } else if (targets.length > 1) {
        setPendingConn({ strength: draggingCard, target: null, targetType: targetColumnId as 'schulthemen' | 'probleme', pickTarget: true, targets });
      }
      setDraggingCard(null);
    },
    [draggingCard, updatedCards]
  );

  const handlePickTarget = useCallback(
    (card: Card) => {
      if (!pendingConn) return;
      setPendingConn({ strength: pendingConn.strength, target: card, targetType: pendingConn.targetType });
    },
    [pendingConn]
  );

  const finalizeConnection = useCallback(
    (withNote: boolean) => {
      if (!pendingConn?.strength || !pendingConn?.target) return;
      const target = pendingConn.target;
      setConnections((prev) => [
        ...prev,
        {
          id: connCounter,
          strength: pendingConn.strength,
          target,
          targetType: pendingConn.targetType,
          note: withNote ? noteInput.trim() : '',
        },
      ]);
      setConnCounter((c) => c + 1);
      setPendingConn(null);
      setNoteInput('');
    },
    [pendingConn, connCounter, noteInput]
  );

  const deleteConnection = useCallback((id: number) => {
    setConnections((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const handleClearAll = useCallback(() => {
    setCards([]);
    setCounter(0);
    setStep(0);
    setNames(['Spieler 1', 'Spieler 2', 'Coach']);
    setConnections([]);
    setConnCounter(0);
    localStorage.removeItem(LS_KEY);
    setConfirmClear(false);
  }, [LS_KEY]);

  const handleManualSave = useCallback(() => {
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 1500);
  }, []);

  const handleLoadExamples = useCallback(() => {
    if (cards.length > 0) {
      setConfirmExamples(true);
      return;
    }
    applyExamples();
  }, [cards.length]);

  const applyExamples = useCallback(() => {
    const { cards: exCards, connections: exConns } = getExampleData(persons);
    setCards(exCards);
    setCounter(910);
    setConnections(exConns);
    setConnCounter(810);
    setStep(3);
    setConfirmExamples(false);
  }, [persons]);

  const handlePromptHelper = useCallback(
    (text: string) => {
      setNoteInput((prev) => {
        if (prev.trim().length === 0) return text;
        return prev + ' ' + text;
      });
    },
    []
  );

  // ── Step info ──────────────────────────────────────────
  const stepInfo = texts.steps[currentStepId as keyof typeof texts.steps] ?? texts.steps.connect;
  const stepLabels = ['Schritt 1', 'Schritt 2', 'Schritt 3', 'Schritt 4'];

  // ── Render ─────────────────────────────────────────────
  return (
    <div className="transferboard">
      {/* ── Header ────────────────────────────────────── */}
      <div className="tb-header">
        <div className="tb-badge">✦ SCHATZKARTE ✦</div>
        <h1 className="tb-title">Transfer-Board</h1>

        {/* Squad names */}
        <div className="tb-squad">
          {editNames ? (
            <>
              {PERSONS_DEFAULT.map((p, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '13px' }}>{p.emoji}</span>
                  <input
                    className="tb-squad-input"
                    value={names[i]}
                    onChange={(e) => {
                      const n = [...names];
                      n[i] = e.target.value;
                      setNames(n);
                    }}
                    style={{ borderColor: `${p.color}60`, background: `${p.color}08`, color: p.color }}
                  />
                </span>
              ))}
              <button className="tb-squad-confirm" onClick={() => setEditNames(false)}>
                ✓
              </button>
            </>
          ) : (
            <>
              <span className="tb-squad-label">Squad:</span>
              {persons.map((p, i) => (
                <span key={i}>
                  <span className="tb-squad-member" style={{ color: PERSONS_DEFAULT[i].color }}>
                    {PERSONS_DEFAULT[i].emoji} {names[i]}
                  </span>
                  {i < 2 && <span className="tb-squad-dot">·</span>}
                </span>
              ))}
              <button className="tb-squad-edit-btn" onClick={() => setEditNames(true)}>
                ✏️
              </button>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="tb-actions">
          <button className={`tb-btn tb-btn-save ${saveFlash ? 'flash' : ''}`} onClick={handleManualSave}>
            {saveFlash ? '✓ Gespeichert!' : '💾 Speichern'}
          </button>
          <button className="tb-btn tb-btn-examples" onClick={handleLoadExamples}>
            📋 Beispiele laden
          </button>
          <button className="tb-btn tb-btn-delete" onClick={() => setConfirmClear(true)}>
            🗑 Alles löschen
          </button>
        </div>
      </div>

      {/* ── Stepper ───────────────────────────────────── */}
      <div className="tb-stepper">
        <div className="tb-progress">
          {STEPS.map((_, i) => (
            <div key={i} className={`tb-progress-bar ${i <= step ? 'active' : ''}`} />
          ))}
        </div>
        <div className="tb-step-info">
          <div className="tb-step-label">{stepLabels[step]} von 4</div>
          <h2 className="tb-step-title">{stepInfo.title}</h2>
          <p className="tb-step-subtitle">{stepInfo.subtitle}</p>
        </div>
        <div className="tb-step-nav">
          {step > 0 && (
            <button className="tb-btn-back" onClick={() => setStep(step - 1)}>
              ← Zurück
            </button>
          )}
          {step < 3 && (
            <button
              className={`tb-btn-next ${hasCardsInCurrent ? 'enabled' : 'disabled'}`}
              onClick={() => hasCardsInCurrent && setStep(step + 1)}
            >
              Weiter →
            </button>
          )}
        </div>
      </div>

      {/* ── Columns ───────────────────────────────────── */}
      <div className="tb-columns">
        {COLUMNS.map((col) => {
          const colStepIndex = STEPS.indexOf(col.id);
          const visible = isConnect || colStepIndex <= step;
          const active = !isConnect && col.id === STEPS[step];

          if (!visible) return null;

          return (
            <ColumnComponent
              key={col.id}
              column={col}
              cards={updatedCards}
              texts={texts}
              persons={persons}
              selectedPerson={selectedPerson}
              setSelectedPerson={setSelectedPerson}
              onAdd={!isConnect ? handleAdd : undefined}
              onDelete={!isConnect ? handleDelete : undefined}
              compact={isConnect}
              active={active}
              draggable={isConnect && col.id === 'skills'}
              onDragStart={handleDragStart}
              draggingId={draggingCard?.id ?? null}
              onDrop={handleDrop}
              isDropTarget={isConnect && !!draggingCard && draggingCard.columnId === 'skills' && col.id !== 'skills'}
            />
          );
        })}
      </div>

      {/* ── Connections Area ──────────────────────────── */}
      <AnimatePresence>
        {isConnect && (
          <motion.div
            className="tb-connections"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.35 }}
          >
            <div className="tb-connections-box">
              <h3 className="tb-connections-title">{texts.connectArea.heading}</h3>
              <p className="tb-connections-subtitle">{texts.connectArea.instruction}</p>

              {connections.length === 0 && !pendingConn && (
                <div className="tb-connections-empty">{texts.connectArea.empty}</div>
              )}

              <div className="tb-connections-list">
                <AnimatePresence>
                  {connections.map((conn) => (
                    <ConnectionComponent key={conn.id} conn={conn} onDelete={deleteConnection} texts={texts} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal: Connection ─────────────────────────── */}
      <AnimatePresence>
        {pendingConn && (
          <motion.div
            className="tb-modal-overlay"
            variants={modalOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setPendingConn(null)}
          >
            <motion.div
              className="tb-modal"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Phase 1: Pick target */}
              {pendingConn.pickTarget && !pendingConn.target && (
                <>
                  <h3
                    className="tb-modal-title"
                    style={{ color: pendingConn.targetType === 'schulthemen' ? '#2471a3' : '#c0392b' }}
                  >
                    {pendingConn.targetType === 'schulthemen' ? '📚 Welches Schulthema?' : '🤯 Welches Problem?'}
                  </h3>
                  <div className="tb-target-list">
                    {pendingConn.targets?.map((card) => (
                      <button key={card.id} className="tb-target-option" onClick={() => handlePickTarget(card)}>
                        {card.text}
                        <span className="tb-target-option-person" style={{ color: card.person.color }}>
                          {card.person.emoji} {card.person.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Phase 2: Note */}
              {pendingConn.strength && pendingConn.target && (
                <>
                  <h3 className="tb-modal-title gradient">{texts.modal.heading}</h3>

                  <div className="tb-modal-pair">
                    <div className="tb-modal-pair-side">
                      <div className="tb-modal-pair-label" style={{ color: '#1e8449' }}>
                        🎮 Skill
                      </div>
                      <MiniCard card={pendingConn.strength} accentColor="#27ae60" />
                    </div>
                    <div className="tb-modal-pair-arrow">→</div>
                    <div className="tb-modal-pair-side">
                      <div
                        className="tb-modal-pair-label"
                        style={{ color: pendingConn.targetType === 'schulthemen' ? '#2471a3' : '#c0392b' }}
                      >
                        {pendingConn.targetType === 'schulthemen' ? '📚 Schulthema' : '🤯 Problem'}
                      </div>
                      <MiniCard
                        card={pendingConn.target}
                        accentColor={pendingConn.targetType === 'schulthemen' ? '#3498db' : '#e74c3c'}
                      />
                    </div>
                  </div>

                  <textarea
                    className="tb-modal-textarea"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder={texts.modal.placeholder}
                    rows={3}
                    autoFocus
                  />

                  {/* Prompt helpers */}
                  <div className="tb-prompt-helpers">
                    {texts.modal.promptHelpers.map((prompt, i) => (
                      <button key={i} className="tb-prompt-btn" onClick={() => handlePromptHelper(prompt)}>
                        💡 {prompt}
                      </button>
                    ))}
                  </div>

                  <div className="tb-modal-actions">
                    <button className="tb-modal-btn tb-modal-btn-cancel" onClick={() => setPendingConn(null)}>
                      Abbrechen
                    </button>
                    <button className="tb-modal-btn tb-modal-btn-secondary" onClick={() => finalizeConnection(false)}>
                      Ohne Text
                    </button>
                    <button
                      className={`tb-modal-btn tb-modal-btn-primary ${!noteInput.trim() ? 'disabled' : ''}`}
                      onClick={() => noteInput.trim() && finalizeConnection(true)}
                    >
                      ✓ Verbinden
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal: Clear confirmation ─────────────────── */}
      <AnimatePresence>
        {confirmClear && (
          <motion.div
            className="tb-modal-overlay"
            variants={modalOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setConfirmClear(false)}
          >
            <motion.div
              className="tb-modal danger"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="tb-modal-icon">⚠️</div>
              <h3 className="tb-modal-title" style={{ color: 'var(--danger)', textAlign: 'center' }}>
                Alles löschen?
              </h3>
              <p className="tb-modal-desc" style={{ textAlign: 'center' }}>
                Alle Karten, Verbindungen und Namen werden unwiderruflich gelöscht.
              </p>
              <div className="tb-modal-actions" style={{ justifyContent: 'center' }}>
                <button className="tb-modal-btn tb-modal-btn-cancel" onClick={() => setConfirmClear(false)}>
                  Abbrechen
                </button>
                <button className="tb-modal-btn tb-modal-btn-danger" onClick={handleClearAll}>
                  Ja, alles löschen
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal: Examples confirmation ──────────────── */}
      <AnimatePresence>
        {confirmExamples && (
          <motion.div
            className="tb-modal-overlay"
            variants={modalOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setConfirmExamples(false)}
          >
            <motion.div
              className="tb-modal"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="tb-modal-icon">📋</div>
              <h3 className="tb-modal-title" style={{ color: 'var(--primary)', textAlign: 'center' }}>
                Beispiele laden?
              </h3>
              <p className="tb-modal-desc" style={{ textAlign: 'center' }}>
                Du hast schon eigene Karten. Wenn du Beispiele lädst, werden deine Karten durch die Beispiele ersetzt.
              </p>
              <div className="tb-modal-actions" style={{ justifyContent: 'center' }}>
                <button className="tb-modal-btn tb-modal-btn-cancel" onClick={() => setConfirmExamples(false)}>
                  Abbrechen
                </button>
                <button className="tb-modal-btn tb-modal-btn-primary" onClick={applyExamples}>
                  Ja, Beispiele laden
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ────────────────────────────────────────────────────────
// Sub-Components
// ────────────────────────────────────────────────────────

function MiniCard({ card, accentColor }: { card: Card; accentColor: string }) {
  return (
    <div
      className="tb-minicard"
      style={{
        borderColor: `${accentColor}25`,
        borderLeftColor: card.person.color,
        background: `${accentColor}06`,
      }}
    >
      <span className="tb-minicard-text">{card.text}</span>
      <span className="tb-minicard-person" style={{ color: card.person.color }}>
        {card.person.emoji}
      </span>
    </div>
  );
}

interface ColumnComponentProps {
  column: ColumnDef;
  cards: Card[];
  texts: AgeTexts;
  persons: Person[];
  selectedPerson: number;
  setSelectedPerson: (i: number) => void;
  onAdd?: (columnId: Card['columnId'], text: string, person: Person) => void;
  onDelete?: (id: number) => void;
  compact: boolean;
  active: boolean;
  draggable: boolean;
  onDragStart: (card: Card) => void;
  draggingId: number | null;
  onDrop: (targetColumnId: Card['columnId']) => void;
  isDropTarget: boolean;
}

function ColumnComponent({
  column,
  cards,
  texts,
  persons,
  selectedPerson,
  setSelectedPerson,
  onAdd,
  onDelete,
  compact,
  active,
  draggable,
  onDragStart,
  draggingId,
  onDrop,
  isDropTarget,
}: ColumnComponentProps) {
  const [text, setText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const columnCards = cards.filter((c) => c.columnId === column.id);
  const colTexts = texts.columns[column.id];

  const handleAdd = () => {
    if (text.trim() && onAdd) {
      onAdd(column.id, text.trim(), persons[selectedPerson]);
      setText('');
      inputRef.current?.focus();
    }
  };

  const classNames = [
    'tb-column',
    `tb-col-${column.id}`,
    compact ? 'compact' : '',
    !active && !compact ? 'inactive' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classNames}
      onDragOver={
        isDropTarget
          ? (e) => {
              e.preventDefault();
              setDragOver(true);
            }
          : undefined
      }
      onDragLeave={isDropTarget ? () => setDragOver(false) : undefined}
      onDrop={
        isDropTarget
          ? (e) => {
              e.preventDefault();
              setDragOver(false);
              onDrop(column.id);
            }
          : undefined
      }
    >
      {/* Column Header */}
      <div className="tb-col-header">
        <div className="tb-col-emoji">{column.emoji}</div>
        <h2 className="tb-col-title">{colTexts.title}</h2>
        <p className="tb-col-subtitle">{colTexts.subtitle}</p>
      </div>

      {/* Card List */}
      <div className={`tb-col-body ${dragOver ? 'drag-over' : ''}`}>
        {columnCards.length === 0 && (
          <div className="tb-col-empty">
            {isDropTarget && dragOver ? '⬇️ Hier ablegen!' : 'Noch leer...'}
          </div>
        )}
        <AnimatePresence>
          {columnCards.map((card) => (
            <motion.div
              key={card.id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
            >
              <div
                className={[
                  'tb-card',
                  compact ? 'compact' : '',
                  draggable ? 'draggable' : '',
                  draggingId === card.id ? 'dragging' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                draggable={draggable}
                onDragStart={draggable ? () => onDragStart(card) : undefined}
              >
                {onDelete && (
                  <button className="tb-card-delete" onClick={() => onDelete(card.id)}>
                    ✕
                  </button>
                )}
                <p className="tb-card-text">{card.text}</p>
                <div className="tb-card-person">
                  <span className="tb-card-person-emoji">{card.person.emoji}</span>
                  <span className="tb-card-person-name" style={{ color: card.person.color }}>
                    {card.person.name}
                  </span>
                  {draggable && <span className="tb-card-drag-tag">DRAG</span>}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer: Input or Count */}
      {onAdd && active ? (
        <div className="tb-col-footer">
          <div className="tb-person-toggles">
            {persons.map((person, idx) => (
              <button
                key={idx}
                className={`tb-person-toggle ${selectedPerson === idx ? 'selected' : ''}`}
                onClick={() => setSelectedPerson(idx)}
                style={
                  selectedPerson === idx
                    ? { borderColor: `${person.color}50`, background: `${person.color}0a`, color: person.color }
                    : {}
                }
              >
                {person.emoji} {person.name}
              </button>
            ))}
          </div>
          <div className="tb-input-row">
            <input
              ref={inputRef}
              className="tb-card-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
              }}
              placeholder={texts.input.placeholder}
            />
            <button
              className={`tb-add-btn ${text.trim() ? 'enabled' : 'disabled'}`}
              onClick={handleAdd}
              disabled={!text.trim()}
              style={
                text.trim()
                  ? {}
                  : {}
              }
            >
              +
            </button>
          </div>
        </div>
      ) : (
        <div className="tb-col-footer-inactive">
          <span>
            {columnCards.length} {columnCards.length === 1 ? 'Karte' : 'Karten'}
          </span>
        </div>
      )}
    </div>
  );
}

function ConnectionComponent({
  conn,
  onDelete,
  texts,
}: {
  conn: Connection;
  onDelete: (id: number) => void;
  texts: AgeTexts;
}) {
  const targetColor = conn.targetType === 'schulthemen' ? '#3498db' : '#e74c3c';
  const targetLabel = conn.targetType === 'schulthemen' ? '📚 Schulthema' : '🤯 Problem';

  return (
    <motion.div
      className="tb-connection"
      variants={connVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
    >
      <button className="tb-connection-delete" onClick={() => onDelete(conn.id)}>
        ✕
      </button>
      <div className="tb-connection-pair">
        <div className="tb-connection-side">
          <div className="tb-connection-label" style={{ color: targetColor }}>
            {targetLabel}
          </div>
          <MiniCard card={conn.target} accentColor={targetColor} />
        </div>
        <div className="tb-connection-arrow">←</div>
        <div className="tb-connection-side">
          <div className="tb-connection-label" style={{ color: '#1e8449' }}>
            🎮 Skill
          </div>
          <MiniCard card={conn.strength} accentColor="#27ae60" />
        </div>
      </div>
      {conn.note && (
        <div className="tb-connection-note">
          <div className="tb-connection-note-label">🌉 Transfer-Brücke</div>
          <p className="tb-connection-note-text">{conn.note}</p>
        </div>
      )}
    </motion.div>
  );
}

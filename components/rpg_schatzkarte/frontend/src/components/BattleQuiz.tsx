// ============================================
// RPG Schatzkarte - Battle Quiz Component
// Quiz als epischer Monster-Kampf mit Leben-System!
// Unterstützt: single, multi-select, matching, ordering
// ============================================
import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Quiz, QuizQuestion, BattleState, AnimationState,
  ExtendedQuizQuestion, MultiSelectQuestion, MatchingQuestion, OrderingQuestion,
  ExtendedQuiz
} from '../types';
import { QUIZ_WORLDS, POINTS_PER_TYPE, getWorldInfo } from '../content/festungQuizContent';

interface BattleQuizProps {
  quiz: Quiz | ExtendedQuiz;
  islandName: string;
  onComplete: (victory: boolean, score: number, streak: number) => void;
  onClose: () => void;
  enableLives?: boolean;  // Aktiviert das Leben-System (Standard: true)
  maxLives?: number;      // Anzahl der Leben (Standard: 3)
}

// Matching State Interface
interface MatchingState {
  selected: number | null;
  matches: Record<number, number>;
}

// Monster-Typen basierend auf Schwierigkeit
// HP wird dynamisch basierend auf Fragenanzahl berechnet
const MONSTERS = [
  { name: 'Wissens-Kobold', icon: '👹', baseHp: 3, xpBonus: 20 },
  { name: 'Rätsel-Wolf', icon: '🐺', baseHp: 5, xpBonus: 30 },
  { name: 'Quiz-Drache', icon: '🐉', baseHp: 8, xpBonus: 50 },
  { name: 'Lern-Titan', icon: '🗿', baseHp: 12, xpBonus: 75 }
];

// Kampf-Nachrichten
const ATTACK_MESSAGES = [
  'Kritischer Treffer!',
  'Ausgezeichnet!',
  'Perfekt!',
  'Volltreffer!',
  'Super Attacke!'
];

const MISS_MESSAGES = [
  'Daneben!',
  'Verfehlt!',
  'Das Monster weicht aus!',
  'Kein Schaden!'
];

const COMBO_MESSAGES: Record<number, string> = {
  2: 'Doppel-Kombo!',
  3: 'Dreifach-Kombo!',
  4: 'MEGA-KOMBO!',
  5: 'ULTRA-KOMBO!!',
  6: 'LEGENDÄRE KOMBO!!!'
};

export function BattleQuiz({
  quiz,
  islandName,
  onComplete,
  onClose,
  enableLives = true,
  maxLives = 3
}: BattleQuizProps) {
  // Wähle Monster basierend auf Fragenanzahl
  const monsterIndex = Math.min(
    Math.floor(quiz.questions.length / 4),
    MONSTERS.length - 1
  );
  const baseMonster = MONSTERS[monsterIndex];

  // Dynamische HP: Skaliert mit Fragenanzahl, damit alle Fragen gespielt werden
  // Bei 15 Fragen mit Combo-Schaden (~1.5 avg) brauchen wir ca. 20 HP
  const dynamicHp = Math.max(
    baseMonster.baseHp,
    Math.ceil(quiz.questions.length * 1.3) // 1.3x Fragen = HP (berücksichtigt Combo-Schaden)
  );
  const monster = { ...baseMonster, hp: dynamicHp };

  // Battle State mit Spieler-Leben
  const [battleState, setBattleState] = useState<BattleState>({
    currentQuestion: 0,
    correctAnswers: 0,
    streak: 0,
    monsterHp: monster.hp,
    maxMonsterHp: monster.hp,
    playerDamage: 1,
    isFinished: false,
    isVictory: false,
    playerLives: maxLives,
    maxPlayerLives: maxLives,
    isGameOver: false
  });

  // Score für Punkte-basiertes System
  const [score, setScore] = useState(0);

  // States für neue Fragetypen
  const [selectedMultiAnswers, setSelectedMultiAnswers] = useState<string[]>([]);
  const [matchingState, setMatchingState] = useState<MatchingState>({ selected: null, matches: {} });
  const [orderingState, setOrderingState] = useState<string[]>([]);

  // Animation States
  const [playerAnimation, setPlayerAnimation] = useState<AnimationState>('idle');
  const [monsterAnimation, setMonsterAnimation] = useState<AnimationState>('idle');
  const [showDamage, setShowDamage] = useState<{ value: number; type: 'hit' | 'miss' } | null>(null);
  const [comboMessage, setComboMessage] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = quiz.questions[battleState.currentQuestion] as ExtendedQuizQuestion;
  const questionType = currentQuestion.type || 'single';

  // Shuffle-Funktion für Arrays
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Gemischte Ordering-Items (wird bei Fragenwechsel neu berechnet)
  const [shuffledOrderingItems, setShuffledOrderingItems] = useState<OrderingQuestion['items']>([]);

  // Shuffle Ordering-Items wenn sich die Frage ändert
  useEffect(() => {
    if (questionType === 'ordering') {
      const items = (currentQuestion as OrderingQuestion).items;
      setShuffledOrderingItems(shuffleArray(items));
    }
  }, [battleState.currentQuestion, questionType]);

  // Helper: Punkte für aktuellen Fragetyp
  const getPointsForQuestion = () => {
    return POINTS_PER_TYPE[questionType] || 100;
  };

  // Antwort verarbeiten - für Single-Choice
  const handleAnswer = useCallback((answerIndex: number) => {
    if (selectedAnswer !== null || battleState.isFinished || battleState.isGameOver) return;

    setSelectedAnswer(answerIndex);
    const q = currentQuestion as QuizQuestion;
    const isCorrect = answerIndex === q.correct;

    processAnswer(isCorrect, getPointsForQuestion());
  }, [selectedAnswer, battleState, currentQuestion]);

  // Multi-Select Handler
  const handleMultiSelect = useCallback((optionId: string) => {
    if (selectedAnswer !== null || battleState.isFinished || battleState.isGameOver) return;
    setSelectedMultiAnswers(prev =>
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  }, [selectedAnswer, battleState]);

  const checkMultiSelect = useCallback(() => {
    const q = currentQuestion as MultiSelectQuestion;
    const correctIds = q.options.filter(o => o.correct).map(o => o.id);
    const isCorrect =
      selectedMultiAnswers.length === correctIds.length &&
      selectedMultiAnswers.every(id => correctIds.includes(id));

    setSelectedAnswer(isCorrect ? 1 : 0); // Marker für "beantwortet"
    processAnswer(isCorrect, getPointsForQuestion());
  }, [currentQuestion, selectedMultiAnswers, battleState]);

  // Matching Handler
  const handleMatchingSelect = useCallback((type: 'powerUp' | 'match', index: number) => {
    if (selectedAnswer !== null || battleState.isFinished || battleState.isGameOver) return;

    if (type === 'powerUp') {
      setMatchingState(prev => ({ ...prev, selected: index }));
    } else if (matchingState.selected !== null) {
      setMatchingState(prev => ({
        selected: null,
        matches: { ...prev.matches, [prev.selected!]: index }
      }));
    }
  }, [matchingState.selected, selectedAnswer, battleState]);

  const checkMatching = useCallback(() => {
    const q = currentQuestion as MatchingQuestion;
    const isCorrect = q.powerUps.every((powerUp) =>
      matchingState.matches[powerUp.id] === powerUp.correctMatch
    );

    setSelectedAnswer(isCorrect ? 1 : 0);
    processAnswer(isCorrect, getPointsForQuestion());
  }, [currentQuestion, matchingState, battleState]);

  // Ordering Handler
  const handleOrdering = useCallback((itemId: string) => {
    if (selectedAnswer !== null || battleState.isFinished || battleState.isGameOver) return;
    setOrderingState(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      }
      return [...prev, itemId];
    });
  }, [selectedAnswer, battleState]);

  const checkOrdering = useCallback(() => {
    const q = currentQuestion as OrderingQuestion;
    const correctOrder = [...q.items]
      .sort((a, b) => a.order - b.order)
      .map(item => item.id);
    const isCorrect = orderingState.join(',') === correctOrder.join(',');

    setSelectedAnswer(isCorrect ? 1 : 0);
    processAnswer(isCorrect, getPointsForQuestion());
  }, [currentQuestion, orderingState, battleState]);

  // Zentrale Antwort-Verarbeitung
  const processAnswer = useCallback((isCorrect: boolean, points: number) => {
    if (isCorrect) {
      // Treffer!
      setPlayerAnimation('attack');
      setTimeout(() => setMonsterAnimation('damage'), 200);

      // Combo berechnen
      const newStreak = battleState.streak + 1;
      const comboDamage = Math.min(1 + Math.floor(newStreak / 2), 3);

      setShowDamage({ value: comboDamage, type: 'hit' });
      setScore(prev => prev + points);

      // Combo-Nachricht
      if (newStreak >= 2 && COMBO_MESSAGES[newStreak]) {
        setComboMessage(COMBO_MESSAGES[newStreak]);
      }

      // State aktualisieren
      const newMonsterHp = Math.max(0, battleState.monsterHp - comboDamage);

      setBattleState(prev => ({
        ...prev,
        correctAnswers: prev.correctAnswers + 1,
        streak: newStreak,
        monsterHp: newMonsterHp,
        playerDamage: comboDamage
      }));

      // Monster besiegt?
      if (newMonsterHp <= 0) {
        setTimeout(() => {
          setMonsterAnimation('defeat');
          setBattleState(prev => ({
            ...prev,
            isFinished: true,
            isVictory: true
          }));
        }, 800);
      }
    } else {
      // Verfehlt! - Leben verlieren wenn aktiviert
      setPlayerAnimation('damage');
      setShowDamage({ value: 0, type: 'miss' });

      const newLives = enableLives ? battleState.playerLives - 1 : battleState.playerLives;

      setBattleState(prev => ({
        ...prev,
        streak: 0,
        playerDamage: 1,
        playerLives: newLives,
        isGameOver: enableLives && newLives <= 0
      }));

      // Game Over Check
      if (enableLives && newLives <= 0) {
        setTimeout(() => {
          setBattleState(prev => ({
            ...prev,
            isFinished: true,
            isVictory: false,
            isGameOver: true
          }));
        }, 800);
      }
    }

    // Erklärung anzeigen wenn vorhanden
    if (currentQuestion.explanation) {
      setTimeout(() => setShowExplanation(true), 500);
    }

    // Animationen zurücksetzen
    setTimeout(() => {
      setPlayerAnimation('idle');
      setMonsterAnimation('idle');
      setShowDamage(null);
      setComboMessage(null);
    }, 1000);
  }, [battleState, currentQuestion, enableLives]);

  // Nächste Frage
  const handleNextQuestion = useCallback(() => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    // Reset states für neue Fragetypen
    setSelectedMultiAnswers([]);
    setMatchingState({ selected: null, matches: {} });
    setOrderingState([]);

    if (battleState.currentQuestion >= quiz.questions.length - 1) {
      // Quiz beendet (ohne Monster zu besiegen)
      const victory = battleState.correctAnswers >= Math.ceil(quiz.questions.length / 2);
      setBattleState(prev => ({
        ...prev,
        isFinished: true,
        isVictory: victory
      }));
    } else {
      setBattleState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1
      }));
    }
  }, [battleState, quiz.questions.length]);

  // Game Over Screen (wenn Leben = 0)
  if (battleState.isGameOver) {
    return (
      <div className="battle-arena">
        <div className="battle-result game-over">
          <div className="result-icon">😢</div>
          <h2>GAME OVER</h2>

          <div className="battle-stats">
            <div className="stat">
              <span className="stat-label">Punkte</span>
              <span className="stat-value score-display">⭐ {score}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Geschafft</span>
              <span className="stat-value">
                {battleState.correctAnswers} / {quiz.questions.length}
              </span>
            </div>
          </div>

          <div className="game-over-message">
            <p>🤔 "Was kann ich beim nächsten Mal anders machen?"</p>
            <span>– Das ist der Superhelden-Weg!</span>
          </div>

          <button
            className="continue-btn retry-btn"
            onClick={() => onComplete(false, battleState.correctAnswers, battleState.streak)}
          >
            🔄 NOCHMAL VERSUCHEN
          </button>
        </div>
      </div>
    );
  }

  // Victory/Defeat Screen
  if (battleState.isFinished) {
    return (
      <div className="battle-arena">
        <div className={`battle-result ${battleState.isVictory ? 'victory' : 'defeat'}`}>
          <div className="result-icon">
            {battleState.isVictory ? '🏆' : '💀'}
          </div>
          <h2>{battleState.isVictory ? 'GEWONNEN!' : 'Niedergelage...'}</h2>

          <div className="battle-stats">
            <div className="stat">
              <span className="stat-label">Punkte</span>
              <span className="stat-value score-display">⭐ {score}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Richtige Antworten</span>
              <span className="stat-value">
                {battleState.correctAnswers} / {quiz.questions.length}
              </span>
            </div>
            {enableLives && (
              <div className="stat">
                <span className="stat-label">Leben übrig</span>
                <span className="stat-value hearts-display">
                  {[...Array(battleState.playerLives)].map((_, i) => (
                    <span key={i}>❤️</span>
                  ))}
                </span>
              </div>
            )}
            <div className="stat">
              <span className="stat-label">Beste Kombo</span>
              <span className="stat-value">{battleState.streak}x</span>
            </div>
          </div>

          {battleState.isVictory && (
            <div className="loot-drop">
              <h3>🎁 Beute erhalten!</h3>
              <div className="loot-items">
                <div className="loot-item">
                  <span>🪙</span>
                  <span>{score} Gold</span>
                </div>
                {battleState.streak >= 3 && (
                  <div className="loot-item special">
                    <span>⚡</span>
                    <span>Kombo-Meister Bonus!</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {battleState.isVictory && (
            <div className="victory-message">
              <p>Du kennst jetzt die <strong>4 Power-Ups</strong> und die <strong>Hattie-Challenge</strong>!</p>
              <span style={{ fontSize: '24px' }}>🏆👀💬😌</span>
            </div>
          )}

          <button
            className="continue-btn"
            onClick={() => onComplete(
              battleState.isVictory,
              battleState.correctAnswers,
              battleState.streak
            )}
          >
            {battleState.isVictory ? 'Weiter →' : 'Erneut versuchen'}
          </button>
        </div>
      </div>
    );
  }

  // HP Bar Prozent
  const hpPercent = (battleState.monsterHp / battleState.maxMonsterHp) * 100;
  const hpColor = hpPercent > 50 ? '#22c55e' : hpPercent > 25 ? '#eab308' : '#dc2626';

  // Welt-Info für aktuelle Frage
  const worldInfo = currentQuestion.world ? getWorldInfo(currentQuestion.world) : null;

  return (
    <div className="battle-arena">
      {/* Battle Header mit Leben und Punkten */}
      <div className="battle-header">
        <div className="battle-header-left">
          {enableLives && (
            <div className="player-lives">
              {[...Array(battleState.maxPlayerLives)].map((_, i) => (
                <span
                  key={i}
                  className={`heart ${i >= battleState.playerLives ? 'lost' : ''}`}
                >
                  ❤️
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="battle-header-center">
          <div className="battle-title">
            <span className="battle-icon">⚔️</span>
            <span>Quiz-Kampf: {islandName}</span>
          </div>
        </div>
        <div className="battle-header-right">
          <div className="score-counter">⭐ {score}</div>
        </div>
      </div>

      {/* Welt-Indikator */}
      {worldInfo && (
        <div className="world-indicator" style={{ backgroundColor: worldInfo.color }}>
          {worldInfo.name}
        </div>
      )}

      {/* Frage-Counter */}
      <div className="question-counter">
        {currentQuestion.level && (
          <span className="level-badge">⭐ LEVEL {currentQuestion.level}</span>
        )}
        {currentQuestion.title && (
          <span className="question-title">{currentQuestion.title}</span>
        )}
        <span className="question-number">
          Frage {battleState.currentQuestion + 1} / {quiz.questions.length}
        </span>
      </div>

      {/* Monster Section */}
      <div className="monster-section">
        {/* Monster HP */}
        <div className="monster-hp-bar">
          <div className="hp-label">
            <span className="monster-name">{monster.name}</span>
            <span className="hp-text">
              {battleState.monsterHp} / {battleState.maxMonsterHp} HP
            </span>
          </div>
          <div className="hp-bar">
            <div
              className="hp-fill"
              style={{
                width: `${hpPercent}%`,
                backgroundColor: hpColor
              }}
            ></div>
          </div>
        </div>

        {/* Monster */}
        <div className={`monster-display animation-${monsterAnimation}`}>
          <span className="monster-sprite">{monster.icon}</span>

          {/* Schadens-Anzeige */}
          {showDamage && (
            <div className={`damage-popup ${showDamage.type}`}>
              {showDamage.type === 'hit' ? (
                <>-{showDamage.value} HP!</>
              ) : (
                <>MISS!</>
              )}
            </div>
          )}
        </div>

        {/* Combo-Nachricht */}
        {comboMessage && (
          <div className="combo-message">{comboMessage}</div>
        )}
      </div>

      {/* Streak & Player */}
      <div className="player-section">
        <div className={`player-display animation-${playerAnimation}`}>
          <span className="player-sprite">⚔️</span>
        </div>

        {/* Streak-Anzeige */}
        <div className="streak-display">
          <span className="streak-label">Kombo</span>
          <div className="streak-flames">
            {[...Array(Math.min(battleState.streak, 5))].map((_, i) => (
              <span key={i} className="flame">🔥</span>
            ))}
          </div>
          <span className="streak-count">{battleState.streak}x</span>
        </div>
      </div>

      {/* Question Box */}
      <div className="question-box">
        <h3 className="question-text">{currentQuestion.question}</h3>

        {/* ========== SINGLE SELECT ========== */}
        {questionType === 'single' && (
          <div className="answers-grid">
            {(currentQuestion as QuizQuestion).options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === (currentQuestion as QuizQuestion).correct;
              const showResult = selectedAnswer !== null;

              let answerClass = 'answer-btn';
              if (showResult) {
                if (isCorrect) answerClass += ' correct';
                else if (isSelected) answerClass += ' wrong';
              }

              return (
                <button
                  key={index}
                  className={answerClass}
                  onClick={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                >
                  <span className="answer-letter">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="answer-text">{option}</span>
                  {showResult && isCorrect && <span className="result-icon">✓</span>}
                  {showResult && isSelected && !isCorrect && (
                    <span className="result-icon">✗</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* ========== MULTI-SELECT ========== */}
        {questionType === 'multi-select' && (
          <div className="multi-select-container">
            {(currentQuestion as MultiSelectQuestion).instruction && (
              <p className="multi-select-instruction">
                {(currentQuestion as MultiSelectQuestion).instruction}
              </p>
            )}
            <div className="answers-grid multi-select">
              {(currentQuestion as MultiSelectQuestion).options.map((option) => {
                const isSelected = selectedMultiAnswers.includes(option.id);
                const showResult = selectedAnswer !== null;

                let answerClass = 'answer-btn multi';
                if (isSelected) answerClass += ' selected';
                if (showResult && option.correct) answerClass += ' correct';
                if (showResult && isSelected && !option.correct) answerClass += ' wrong';

                return (
                  <button
                    key={option.id}
                    className={answerClass}
                    onClick={() => handleMultiSelect(option.id)}
                    disabled={selectedAnswer !== null}
                  >
                    <span className="checkbox">{isSelected ? '✅' : '⬜'}</span>
                    <span className="answer-text">{option.text}</span>
                  </button>
                );
              })}
            </div>
            {selectedAnswer === null && (
              <button
                className="check-btn"
                onClick={checkMultiSelect}
                disabled={selectedMultiAnswers.length !== (currentQuestion as MultiSelectQuestion).correctCount}
              >
                ✓ PRÜFEN ({selectedMultiAnswers.length}/{(currentQuestion as MultiSelectQuestion).correctCount})
              </button>
            )}
          </div>
        )}

        {/* ========== MATCHING ========== */}
        {questionType === 'matching' && (
          <div className="matching-container">
            <div className="matching-grid">
              <div className="matching-column">
                <p className="matching-label">Power-Ups:</p>
                {(currentQuestion as MatchingQuestion).powerUps.map((powerUp) => {
                  const isMatched = matchingState.matches[powerUp.id] !== undefined;
                  const isSelected = matchingState.selected === powerUp.id;

                  return (
                    <div
                      key={`power-${powerUp.id}`}
                      className={`matching-item powerup ${isSelected ? 'selected' : ''} ${isMatched ? 'matched' : ''}`}
                      onClick={() => handleMatchingSelect('powerUp', powerUp.id)}
                    >
                      {powerUp.text}
                      {isMatched && (
                        <span className="match-arrow">
                          → {String.fromCharCode(65 + matchingState.matches[powerUp.id])}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="matching-column">
                <p className="matching-label">Beispiele:</p>
                {(currentQuestion as MatchingQuestion).matches.map((match) => (
                  <div
                    key={`match-${match.id}`}
                    className="matching-item target"
                    onClick={() => handleMatchingSelect('match', match.id)}
                  >
                    <span className="match-letter">{String.fromCharCode(65 + match.id)}</span>
                    {match.text}
                  </div>
                ))}
              </div>
            </div>
            {selectedAnswer === null && (
              <button
                className="check-btn"
                onClick={checkMatching}
                disabled={Object.keys(matchingState.matches).length !== (currentQuestion as MatchingQuestion).powerUps.length}
              >
                ✓ PRÜFEN
              </button>
            )}
          </div>
        )}

        {/* ========== ORDERING ========== */}
        {questionType === 'ordering' && (
          <div className="ordering-container">
            <p className="ordering-instruction">Tippe in der richtigen Reihenfolge!</p>
            {orderingState.length > 0 && (
              <div className="ordering-preview">
                <p>Deine Reihenfolge:</p>
                {orderingState.map((id, idx) => (
                  <span key={id} className="order-preview-item">
                    {idx + 1}. {shuffledOrderingItems.find(i => i.id === id)?.text.slice(0, 3)}
                    {idx < orderingState.length - 1 ? ' → ' : ''}
                  </span>
                ))}
              </div>
            )}
            <div className="ordering-items">
              {shuffledOrderingItems.map((item) => {
                const isSelected = orderingState.includes(item.id);
                const orderNum = orderingState.indexOf(item.id) + 1;

                return (
                  <button
                    key={item.id}
                    className={`ordering-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleOrdering(item.id)}
                    disabled={selectedAnswer !== null}
                  >
                    {isSelected && <span className="order-number">{orderNum}</span>}
                    <span className="order-text">{item.text}</span>
                  </button>
                );
              })}
            </div>
            {selectedAnswer === null && shuffledOrderingItems.length > 0 && (
              <button
                className="check-btn"
                onClick={checkOrdering}
                disabled={orderingState.length !== shuffledOrderingItems.length}
              >
                ✓ PRÜFEN
              </button>
            )}
          </div>
        )}

        {/* Erklärung */}
        {showExplanation && currentQuestion.explanation && (
          <div className={`explanation-box ${selectedAnswer === 1 || (questionType === 'single' && selectedAnswer === (currentQuestion as QuizQuestion).correct) ? 'correct' : 'wrong'}`}>
            <p className="explanation-result">
              {(selectedAnswer === 1 || (questionType === 'single' && selectedAnswer === (currentQuestion as QuizQuestion).correct))
                ? '🎉 RICHTIG!'
                : '❌ NICHT GANZ...'}
            </p>
            <p className="explanation-text">{currentQuestion.explanation}</p>
          </div>
        )}

        {/* Weiter-Button */}
        {selectedAnswer !== null && !battleState.isGameOver && (
          <button className="next-btn" onClick={handleNextQuestion}>
            {battleState.currentQuestion < quiz.questions.length - 1
              ? 'WEITER →'
              : '🏆 ERGEBNIS'
            }
          </button>
        )}
      </div>

      {/* Zurück-Button */}
      <button className="escape-btn" onClick={onClose}>
        🏃 Fliehen
      </button>
    </div>
  );
}

// ============================================
// RPG Schatzkarte - Battle Quiz Component
// Quiz als epischer Monster-Kampf!
// ============================================
import { useState, useEffect, useCallback } from 'react';
import { Quiz, QuizQuestion, BattleState, AnimationState } from '../types';

interface BattleQuizProps {
  quiz: Quiz;
  islandName: string;
  onComplete: (victory: boolean, score: number, streak: number) => void;
  onClose: () => void;
}

// Monster-Typen basierend auf Schwierigkeit
const MONSTERS = [
  { name: 'Wissens-Kobold', icon: '👹', hp: 3, xpBonus: 20 },
  { name: 'Rätsel-Wolf', icon: '🐺', hp: 4, xpBonus: 30 },
  { name: 'Quiz-Drache', icon: '🐉', hp: 5, xpBonus: 50 },
  { name: 'Lern-Titan', icon: '🗿', hp: 6, xpBonus: 75 }
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
  onClose
}: BattleQuizProps) {
  // Wähle Monster basierend auf Fragenanzahl
  const monsterIndex = Math.min(
    Math.floor(quiz.questions.length / 3),
    MONSTERS.length - 1
  );
  const monster = MONSTERS[monsterIndex];

  // Battle State
  const [battleState, setBattleState] = useState<BattleState>({
    currentQuestion: 0,
    correctAnswers: 0,
    streak: 0,
    monsterHp: monster.hp,
    maxMonsterHp: monster.hp,
    playerDamage: 1,
    isFinished: false,
    isVictory: false
  });

  // Animation States
  const [playerAnimation, setPlayerAnimation] = useState<AnimationState>('idle');
  const [monsterAnimation, setMonsterAnimation] = useState<AnimationState>('idle');
  const [showDamage, setShowDamage] = useState<{ value: number; type: 'hit' | 'miss' } | null>(null);
  const [comboMessage, setComboMessage] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = quiz.questions[battleState.currentQuestion];

  // Antwort verarbeiten
  const handleAnswer = useCallback((answerIndex: number) => {
    if (selectedAnswer !== null || battleState.isFinished) return;

    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === currentQuestion.correct;

    if (isCorrect) {
      // Treffer!
      setPlayerAnimation('attack');
      setTimeout(() => setMonsterAnimation('damage'), 200);

      // Combo berechnen
      const newStreak = battleState.streak + 1;
      const comboDamage = Math.min(1 + Math.floor(newStreak / 2), 3);

      setShowDamage({ value: comboDamage, type: 'hit' });

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
      // Verfehlt!
      setPlayerAnimation('damage');
      setShowDamage({ value: 0, type: 'miss' });

      setBattleState(prev => ({
        ...prev,
        streak: 0,
        playerDamage: 1
      }));
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
  }, [selectedAnswer, battleState, currentQuestion]);

  // Nächste Frage
  const handleNextQuestion = useCallback(() => {
    setSelectedAnswer(null);
    setShowExplanation(false);

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

  // Victory/Defeat Screen
  if (battleState.isFinished) {
    return (
      <div className="battle-arena">
        <div className={`battle-result ${battleState.isVictory ? 'victory' : 'defeat'}`}>
          <div className="result-icon">
            {battleState.isVictory ? '🏆' : '💀'}
          </div>
          <h2>{battleState.isVictory ? 'SIEG!' : 'Niedergelage...'}</h2>

          <div className="battle-stats">
            <div className="stat">
              <span className="stat-label">Richtige Antworten</span>
              <span className="stat-value">
                {battleState.correctAnswers} / {quiz.questions.length}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Beste Kombo</span>
              <span className="stat-value">{battleState.streak}x</span>
            </div>
            <div className="stat">
              <span className="stat-label">Bonus XP</span>
              <span className="stat-value">
                +{battleState.isVictory ? monster.xpBonus : Math.floor(monster.xpBonus / 3)}
              </span>
            </div>
          </div>

          {battleState.isVictory && (
            <div className="loot-drop">
              <h3>🎁 Beute erhalten!</h3>
              <div className="loot-items">
                <div className="loot-item">
                  <span>🪙</span>
                  <span>{battleState.correctAnswers * 5} Gold</span>
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

  return (
    <div className="battle-arena">
      {/* Battle Header */}
      <div className="battle-header">
        <div className="battle-title">
          <span className="battle-icon">⚔️</span>
          <span>Quiz-Kampf: {islandName}</span>
        </div>
        <div className="question-counter">
          Frage {battleState.currentQuestion + 1} / {quiz.questions.length}
        </div>
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

        <div className="answers-grid">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === currentQuestion.correct;
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

        {/* Erklärung */}
        {showExplanation && currentQuestion.explanation && (
          <div className="explanation-box">
            <span className="explanation-icon">💡</span>
            <p>{currentQuestion.explanation}</p>
          </div>
        )}

        {/* Weiter-Button */}
        {selectedAnswer !== null && (
          <button className="next-btn" onClick={handleNextQuestion}>
            {battleState.currentQuestion < quiz.questions.length - 1
              ? 'Nächste Frage →'
              : 'Ergebnis anzeigen'
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

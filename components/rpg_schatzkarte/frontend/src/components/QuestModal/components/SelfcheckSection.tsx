// ============================================
// QuestModal - SelfcheckSection Component
// Pfad: src/components/QuestModal/components/SelfcheckSection.tsx
// ============================================

import type { ContentSection } from '../../../content/festungContent';

interface SelfcheckSectionProps {
  section: ContentSection;
  sectionIndex: number;
  answers: Record<number, number>;
  showResult: boolean;
  onAnswerChange: (statementIndex: number, rating: number) => void;
  onShowResult: () => void;
}

/**
 * Selfcheck-Komponente für interaktive Selbsteinschätzung
 */
export function SelfcheckSection({
  section,
  sectionIndex,
  answers,
  showResult,
  onAnswerChange,
  onShowResult
}: SelfcheckSectionProps) {
  if (!section.selfcheck) return null;

  const { statements, results, conclusion } = section.selfcheck;
  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
  const allAnswered = Object.keys(answers).length === statements.length;

  const getResult = () => {
    if (totalScore >= 16) return results[0];
    if (totalScore >= 11) return results[1];
    return results[2];
  };

  return (
    <div className="content-section section-selfcheck">
      <h4>{section.title}</h4>
      <p className="selfcheck-intro">{section.content}</p>

      <div className="selfcheck-statements">
        {statements.map((statement, sIdx) => (
          <div key={sIdx} className="selfcheck-row">
            <span className="statement-text">{statement}</span>
            <div className="rating-buttons">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  className={`rating-btn ${answers[sIdx] === rating ? 'selected' : ''}`}
                  onClick={() => onAnswerChange(sIdx, rating)}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        className={`selfcheck-submit ${allAnswered ? 'ready' : 'disabled'}`}
        onClick={() => allAnswered && onShowResult()}
        disabled={!allAnswered}
      >
        {allAnswered
          ? '🎮 Auswertung anzeigen!'
          : `Noch ${statements.length - Object.keys(answers).length} Fragen offen`}
      </button>

      {showResult && allAnswered && (
        <div className="selfcheck-result">
          <div className="result-score">
            <span className="score-number">{totalScore}</span>
            <span className="score-max">/ 20 Punkte</span>
          </div>
          <div className={`result-message ${totalScore >= 16 ? 'excellent' : totalScore >= 11 ? 'good' : 'starter'}`}>
            <span className="result-emoji">{getResult().emoji}</span>
            <span className="result-text">{getResult().message}</span>
          </div>
          <p className="result-conclusion">💡 {conclusion}</p>
        </div>
      )}
    </div>
  );
}

export default SelfcheckSection;

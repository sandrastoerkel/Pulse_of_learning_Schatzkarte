// ============================================
// QuestModal - useSelfcheck Hook
// Pfad: src/components/QuestModal/hooks/useSelfcheck.ts
// ============================================

import { useState, useCallback, useMemo } from 'react';

interface SelfcheckResult {
  range: string;
  message: string;
  emoji: string;
}

interface UseSelfcheckReturn {
  answers: Record<number, number>;
  showResult: boolean;
  setAnswer: (index: number, rating: number) => void;
  showResults: () => void;
  resetResults: () => void;
  totalScore: number;
  allAnswered: (statementCount: number) => boolean;
  getResult: (results: SelfcheckResult[]) => SelfcheckResult;
}

/**
 * Hook für die Verwaltung des Selfcheck-Zustands
 */
export function useSelfcheck(): UseSelfcheckReturn {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);

  // Antwort setzen
  const setAnswer = useCallback((index: number, rating: number) => {
    setAnswers(prev => ({ ...prev, [index]: rating }));
    setShowResult(false);
  }, []);

  // Ergebnisse anzeigen
  const showResults = useCallback(() => {
    setShowResult(true);
  }, []);

  // Ergebnisse zurücksetzen
  const resetResults = useCallback(() => {
    setShowResult(false);
  }, []);

  // Gesamtpunktzahl berechnen
  const totalScore = useMemo(() => {
    return Object.values(answers).reduce((a, b) => a + b, 0);
  }, [answers]);

  // Prüfen ob alle Fragen beantwortet
  const allAnswered = useCallback((statementCount: number) => {
    return Object.keys(answers).length === statementCount;
  }, [answers]);

  // Ergebnis basierend auf Punktzahl ermitteln
  const getResult = useCallback((results: SelfcheckResult[]): SelfcheckResult => {
    if (totalScore >= 16) return results[0];
    if (totalScore >= 11) return results[1];
    return results[2];
  }, [totalScore]);

  return {
    answers,
    showResult,
    setAnswer,
    showResults,
    resetResults,
    totalScore,
    allAnswered,
    getResult
  };
}

export default useSelfcheck;

// ============================================
// QuestModal - useExpandableSections Hook
// Pfad: src/components/QuestModal/hooks/useExpandableSections.ts
// ============================================

import { useState, useCallback, useEffect } from 'react';
import type { ContentSection } from '../../../content/festungContent';

interface UseExpandableSectionsReturn {
  expandedSections: Set<number>;
  toggleExpander: (idx: number) => void;
  initializeFromSections: (sections: ContentSection[]) => void;
}

/**
 * Hook für die Verwaltung von aufklappbaren Content-Sektionen
 */
export function useExpandableSections(): UseExpandableSectionsReturn {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [initialized, setInitialized] = useState(false);

  // Toggle einer einzelnen Section
  const toggleExpander = useCallback((idx: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  }, []);

  // Initialisiere expanded Sections basierend auf Content
  const initializeFromSections = useCallback((sections: ContentSection[]) => {
    if (initialized) return;

    const initialExpanded = new Set<number>();
    sections.forEach((section, idx) => {
      if (section.type === 'expander' && section.expanded) {
        initialExpanded.add(idx);
      }
    });

    if (initialExpanded.size > 0) {
      setExpandedSections(initialExpanded);
    }
    setInitialized(true);
  }, [initialized]);

  return {
    expandedSections,
    toggleExpander,
    initializeFromSections
  };
}

export default useExpandableSections;

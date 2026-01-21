// ============================================
// QuestModal - ScrollContent Component
// Pfad: src/components/QuestModal/components/ScrollContent.tsx
// ============================================

import { useEffect } from 'react';
import type { ContentSection } from '../../../content/festungContent';
import type { AgeGroup } from '../../../types';
import { markdownToHtml } from '../utils';
import { SelfcheckSection } from './SelfcheckSection';
import { TagebuchStartButton } from '../../SuperheldenTagebuch';

interface IslandContent {
  title: string;
  video: {
    url: string;
    placeholder: boolean;
  };
  explanation: {
    intro: string;
    sections: ContentSection[];
  };
  summary?: string;
}

interface ScrollContentProps {
  islandContent: IslandContent | null;
  islandId: string;
  ageGroup: AgeGroup;
  expandedSections: Set<number>;
  selfcheckAnswers: Record<number, number>;
  showSelfcheckResult: boolean;
  onToggleExpander: (idx: number) => void;
  onInitExpandedSections: (sections: ContentSection[]) => void;
  onSelfcheckAnswer: (idx: number, rating: number) => void;
  onShowSelfcheckResult: () => void;
  onCompleteQuest: () => void;
  onOpenTagebuch?: () => void;
  onClose: () => void;
}

/**
 * Scroll-Quest Inhalt (Erklärungen lesen)
 */
export function ScrollContent({
  islandContent,
  islandId,
  ageGroup,
  expandedSections,
  selfcheckAnswers,
  showSelfcheckResult,
  onToggleExpander,
  onInitExpandedSections,
  onSelfcheckAnswer,
  onShowSelfcheckResult,
  onCompleteQuest,
  onOpenTagebuch,
  onClose
}: ScrollContentProps) {
  // Initialisiere expanded Sections bei Mount
  useEffect(() => {
    if (islandContent?.explanation.sections) {
      onInitExpandedSections(islandContent.explanation.sections);
    }
  }, [islandContent, onInitExpandedSections]);

  return (
    <div className="scroll-content">
      <div className="parchment">
        {islandContent ? (
          <>
            <h3 className="content-title">{islandContent.title}</h3>
            <div
              className="content-intro"
              dangerouslySetInnerHTML={{
                __html: markdownToHtml(islandContent.explanation.intro)
              }}
            />

            {islandContent.explanation.sections.map((section: ContentSection, idx: number) => {
              const sectionType = section.type || 'default';
              const isExpander = sectionType === 'expander';
              const isExpanded = expandedSections.has(idx);
              const isSelfcheck = sectionType === 'selfcheck';

              // Selfcheck Komponente
              if (isSelfcheck && section.selfcheck) {
                return (
                  <SelfcheckSection
                    key={idx}
                    section={section}
                    sectionIndex={idx}
                    answers={selfcheckAnswers}
                    showResult={showSelfcheckResult}
                    onAnswerChange={onSelfcheckAnswer}
                    onShowResult={onShowSelfcheckResult}
                  />
                );
              }

              const isTagebuchSection = section.title.includes('Superhelden-Tagebuch');

              return (
                <div key={idx}>
                  <div
                    className={`content-section section-${sectionType} ${isExpander && isExpanded ? 'expanded' : ''}`}
                  >
                    <h4 onClick={isExpander ? () => onToggleExpander(idx) : undefined}>
                      {section.title}
                      {isExpander && (
                        <span className={`expander-icon ${isExpanded ? 'expanded' : ''}`}>
                          ▼
                        </span>
                      )}
                    </h4>
                    <div
                      className="section-content"
                      dangerouslySetInnerHTML={{
                        __html: markdownToHtml(section.content)
                      }}
                    />
                  </div>

                  {/* Superhelden-Tagebuch Button - direkt nach dem Tagebuch-Abschnitt */}
                  {isTagebuchSection && islandId === 'festung' && ageGroup === 'grundschule' && onOpenTagebuch && (
                    <div className="tagebuch-promo-section">
                      <div className="tagebuch-promo-card">
                        <span className="promo-emoji">🦸</span>
                        <h4>Starte dein Superhelden-Tagebuch!</h4>
                        <p>Schreibe jeden Tag auf, was du geschafft hast. So wirst du immer stärker!</p>
                        <TagebuchStartButton onClick={() => {
                          onOpenTagebuch();
                          onClose();
                        }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        ) : (
          <>
            <p>📜 Hier steht die Erklärung zum Thema...</p>
            <p>Die Inhalte werden von Python geladen.</p>
          </>
        )}
      </div>
      <button
        className="complete-btn"
        onClick={onCompleteQuest}
      >
        Gelesen ✓
      </button>
    </div>
  );
}

export default ScrollContent;

// ============================================
// RPG Schatzkarte - Quest Modal Component
// ============================================
import { useState } from 'react';
import { Island, IslandProgress, QuestType, AgeGroup, ExtendedQuiz } from '../types';
import { FESTUNG_CONTENT, ContentSection } from '../content/festungContent';
import { FAEDEN_CONTENT } from '../content/faedenContent';
import { BRUECKEN_CONTENT } from '../content/brueckenContent';
import { WERKZEUGE_CONTENT } from '../content/werkzeugeContent';
import { BANDURA_SOURCES, BANDURA_INFO, BanduraSourceId } from '../content/banduraContent';
import { HATTIE_CHALLENGE_INFO, HATTIE_SUBJECTS } from '../content/hattieContent';
import { SUPERHELDEN_QUIZ_QUESTIONS } from '../content/festungQuizContent';
import { BattleQuiz } from './BattleQuiz';

interface QuestModalProps {
  island: Island & {
    type?: string;
    tutorial_steps?: TutorialStep[];
    has_quiz?: boolean;
    has_challenge?: boolean;
  };
  progress?: IslandProgress;
  isOpen: boolean;
  ageGroup: AgeGroup;
  onClose: () => void;
  onQuestComplete: (questType: string, xp: number, gold?: number, itemId?: string) => void;
  onTreasureCollected: (treasureId: string, xp: number) => void;
  onChallengeEntry?: (challengeType: 'bandura' | 'hattie', data: any, xp: number) => void;
}

// Challenge Types
type ChallengeSelection = 'select' | 'bandura' | 'hattie';
type HattieStep = 'subject' | 'task' | 'prediction' | 'result' | 'reflection' | 'complete';

interface HattieEntry {
  subject: string;
  task: string;
  prediction: number;
  result?: number;
  reflection?: string;
}

interface TutorialStep {
  id: string;
  title: string;
  type: 'video' | 'explanation' | 'link';
  description?: string;
  content?: string;
  placeholder?: boolean;
}

// Insel-Untertitel und Beschreibungen
const ISLAND_SUBTITLES: Record<string, { subtitle: string; description: string }> = {
  festung: {
    subtitle: '(Selbstwirksamkeit)',
    description: 'Selbstwirksamkeit ist das Vertrauen, eine bestimmte Aufgabe erfolgreich bewältigen zu können. Nicht allgemeines Selbstvertrauen, sondern aufgabenbezogen: "Ich kann diese Matheaufgabe lösen" oder "Ich kann dieses Referat halten". Kernbotschaft: Du kannst mehr, als du denkst - und jeder Erfolg beweist es dir!'
  }
};

// Quest-Typen mit ihren Details
const QUEST_TYPES = {
  wisdom: {
    icon: '📜',
    name: 'Weisheit erlangen',
    description: 'Schau dir das Lernvideo an und entdecke neues Wissen!',
    action: 'Video ansehen',
    xp: 25,
    gold: 5,
    progressKey: 'video_watched'
  },
  scroll: {
    icon: '📖',
    name: 'Schriftrolle studieren',
    description: 'Lies die Erklärung und verstehe die Zusammenhänge.',
    action: 'Erklärung lesen',
    xp: 20,
    gold: 3,
    progressKey: 'explanation_read'
  },
  battle: {
    icon: '⚔️',
    name: 'Monster besiegen',
    description: 'Teste dein Wissen im Quiz-Kampf!',
    action: 'Quiz starten',
    xp: 50,
    gold: 15,
    progressKey: 'quiz_passed'
  },
  challenge: {
    icon: '🏆',
    name: 'Quest abschließen',
    description: 'Meistere die finale Herausforderung!',
    action: 'Challenge starten',
    xp: 40,
    gold: 10,
    progressKey: 'challenge_completed'
  }
};

// Markdown zu HTML konvertieren (inkl. Tabellen)
function markdownToHtml(text: string): string {
  // HTML-Blöcke temporär extrahieren
  const htmlBlocks: string[] = [];
  let processedText = text.replace(/<div[\s\S]*?<\/div>/g, (match) => {
    htmlBlocks.push(match);
    return `__HTML_BLOCK_${htmlBlocks.length - 1}__`;
  });

  let html = processedText
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Blockquotes
    .replace(/^>\s*(.*)$/gm, '<blockquote>$1</blockquote>')
    // Line breaks
    .replace(/\n/g, '<br/>');

  // HTML-Blöcke wieder einfügen
  htmlBlocks.forEach((block, idx) => {
    html = html.replace(`__HTML_BLOCK_${idx}__`, block);
  });

  // Tabellen parsen
  const tableRegex = /\|(.+)\|[\r\n]+\|[-:\s|]+\|[\r\n]+((?:\|.+\|[\r\n]*)+)/g;
  html = html.replace(tableRegex, (match, headerRow, bodyRows) => {
    const headers = headerRow.split('|').map((h: string) => h.trim()).filter((h: string) => h);
    const rows = bodyRows.trim().split('<br/>').filter((r: string) => r.includes('|'));

    let table = '<table><thead><tr>';
    headers.forEach((h: string) => { table += `<th>${h}</th>`; });
    table += '</tr></thead><tbody>';

    rows.forEach((row: string) => {
      const cells = row.split('|').map((c: string) => c.trim()).filter((c: string) => c);
      table += '<tr>';
      cells.forEach((c: string) => { table += `<td>${c}</td>`; });
      table += '</tr>';
    });

    table += '</tbody></table>';
    return table;
  });

  return html;
}

export function QuestModal({
  island,
  progress,
  isOpen,
  ageGroup,
  onClose,
  onQuestComplete,
  onTreasureCollected,
  onChallengeEntry
}: QuestModalProps) {
  const [activeQuest, setActiveQuest] = useState<QuestType | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [earnedReward, setEarnedReward] = useState({ xp: 0, gold: 0 });
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [sectionsInitialized, setSectionsInitialized] = useState(false);
  const [showHeaderInfo, setShowHeaderInfo] = useState(false);
  const [selfcheckAnswers, setSelfcheckAnswers] = useState<Record<number, number>>({});
  const [showSelfcheckResult, setShowSelfcheckResult] = useState(false);

  // Challenge State
  const [challengeSelection, setChallengeSelection] = useState<ChallengeSelection>('select');
  const [selectedBanduraSource, setSelectedBanduraSource] = useState<BanduraSourceId | null>(null);
  const [banduraDescription, setBanduraDescription] = useState('');
  const [banduraCompleted, setBanduraCompleted] = useState<BanduraSourceId[]>([]);
  const [hattieStep, setHattieStep] = useState<HattieStep>('subject');
  const [hattieEntry, setHattieEntry] = useState<HattieEntry>({ subject: '', task: '', prediction: 0 });
  const [challengeSuccess, setChallengeSuccess] = useState(false);
  const [challengeXp, setChallengeXp] = useState(0);

  // Quiz/Battle State
  const [quizActive, setQuizActive] = useState(false);

  // Toggle Expander
  const toggleExpander = (idx: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  // Initialisiere expanded Sections basierend auf Content
  const initExpandedSections = (sections: ContentSection[]) => {
    const initialExpanded = new Set<number>();
    sections.forEach((section, idx) => {
      if (section.type === 'expander' && section.expanded) {
        initialExpanded.add(idx);
      }
    });
    if (initialExpanded.size > 0 && expandedSections.size === 0) {
      setExpandedSections(initialExpanded);
    }
  };

  // Content für aktuelle Insel und Altersstufe holen
  const getIslandContent = () => {
    if (island.id === 'festung') {
      return FESTUNG_CONTENT[ageGroup] || FESTUNG_CONTENT.unterstufe;
    }
    if (island.id === 'werkzeuge') {
      return WERKZEUGE_CONTENT[ageGroup] || WERKZEUGE_CONTENT.unterstufe;
    }
    if (island.id === 'faeden') {
      return FAEDEN_CONTENT[ageGroup] || FAEDEN_CONTENT.unterstufe;
    }
    if (island.id === 'bruecken') {
      return BRUECKEN_CONTENT[ageGroup] || BRUECKEN_CONTENT.unterstufe;
    }
    return null;
  };
  const islandContent = getIslandContent();

  if (!isOpen) return null;

  // Berechne welche Quests abgeschlossen sind
  const isQuestComplete = (questType: keyof typeof QUEST_TYPES) => {
    if (!progress) return false;
    const key = QUEST_TYPES[questType].progressKey as keyof IslandProgress;
    return progress[key] === true;
  };

  // Alle Quests abgeschlossen?
  const allQuestsComplete =
    isQuestComplete('wisdom') &&
    isQuestComplete('scroll') &&
    isQuestComplete('battle') &&
    isQuestComplete('challenge');

  // Gesammelte Schätze
  const collectedTreasures = progress?.treasures_collected || [];

  // Quest starten
  const handleStartQuest = (questType: QuestType) => {
    setActiveQuest(questType);
  };

  // Quest abschließen (simuliert - echte Logik kommt später)
  const handleCompleteQuest = (questType: QuestType) => {
    const quest = QUEST_TYPES[questType];
    setEarnedReward({ xp: quest.xp, gold: quest.gold });
    setShowReward(true);
    onQuestComplete(questType, quest.xp, quest.gold);

    setTimeout(() => {
      setShowReward(false);
      setActiveQuest(null);
    }, 2000);
  };

  // Schatz einsammeln
  const handleCollectTreasure = (treasureIndex: number) => {
    const treasure = island.treasures[treasureIndex];
    if (!collectedTreasures.includes(treasure.name)) {
      onTreasureCollected(treasure.name, treasure.xp);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="quest-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-wrapper">
          <div className="modal-header" style={{ background: `linear-gradient(135deg, ${island.color}, ${island.color}99)` }}>
            <div className="island-icon-large">{island.icon}</div>
            <div className="header-content">
              <h2>{island.name}</h2>
              {ISLAND_SUBTITLES[island.id] && (
                <span className="island-subtitle">{ISLAND_SUBTITLES[island.id].subtitle}</span>
              )}
              <span className="week-badge">Woche {island.week}</span>
            </div>
            <button className="close-button" onClick={onClose}>✕</button>
          </div>
          {ISLAND_SUBTITLES[island.id] && (
            <div className="header-info-section">
              <button
                className={`header-info-toggle ${showHeaderInfo ? 'expanded' : ''}`}
                onClick={() => setShowHeaderInfo(!showHeaderInfo)}
              >
                <span className="info-icon">ℹ️</span>
                <span>Was bedeutet {ISLAND_SUBTITLES[island.id].subtitle.replace(/[()]/g, '')}?</span>
                <span className={`toggle-arrow ${showHeaderInfo ? 'expanded' : ''}`}>▼</span>
              </button>
              {showHeaderInfo && (
                <div className="header-info-content">
                  <p>{ISLAND_SUBTITLES[island.id].description}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quest Liste oder aktive Quest */}
        <div className="modal-body">
          {/* Tutorial-Insel (Starthafen) */}
          {island.type === 'tutorial' && !activeQuest ? (
            <div className="tutorial-content">
              {island.tutorial_steps?.map((step, index) => (
                <div key={step.id} className={`tutorial-step ${step.placeholder ? 'placeholder' : ''}`}>
                  <div className="step-number">{index + 1}</div>
                  <div className="step-content">
                    <h4>{step.title}</h4>
                    {step.description && <p className="step-description">{step.description}</p>}
                    {step.content && (
                      <div className="step-detail" dangerouslySetInnerHTML={{
                        __html: step.content
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                          .replace(/---/g, '<hr/>')
                          .replace(/\n/g, '<br/>')
                      }} />
                    )}
                    {step.placeholder && (
                      <div className="placeholder-badge">
                        🚧 Kommt bald!
                      </div>
                    )}
                    {step.type === 'video' && !step.placeholder && (
                      <button
                        className="tutorial-action-btn"
                        onClick={() => handleCompleteQuest('wisdom')}
                      >
                        ▶️ Video ansehen
                      </button>
                    )}
                    {step.type === 'explanation' && (
                      <button
                        className="tutorial-action-btn read"
                        onClick={() => handleCompleteQuest('scroll')}
                      >
                        ✓ Verstanden!
                      </button>
                    )}
                    {step.type === 'link' && !step.placeholder && (
                      <button className="tutorial-action-btn link">
                        👥 Zur Gruppe
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : !activeQuest ? (
            <>
              {/* Standard Quest-Karten */}
              <div className="quests-grid">
                {(Object.keys(QUEST_TYPES) as QuestType[]).filter(questType => {
                  // Filter basierend auf has_quiz und has_challenge
                  if (questType === 'battle' && island.has_quiz === false) return false;
                  if (questType === 'challenge' && island.has_challenge === false) return false;
                  return true;
                }).map(questType => {
                  const quest = QUEST_TYPES[questType];
                  const completed = isQuestComplete(questType);

                  return (
                    <div
                      key={questType}
                      className={`quest-type-card ${completed ? 'completed' : 'available'}`}
                      onClick={() => !completed && handleStartQuest(questType)}
                    >
                      <div className="quest-icon-wrapper">
                        <span className="quest-icon">{quest.icon}</span>
                        {completed && <div className="check-mark">✓</div>}
                      </div>
                      <h4>{quest.name}</h4>
                      <p>{quest.description}</p>
                      <div className="quest-rewards">
                        <span className="xp-reward">⭐ {quest.xp} XP</span>
                        <span className="gold-reward">🪙 {quest.gold}</span>
                      </div>
                      {!completed && (
                        <button className="quest-action-btn">
                          {quest.action}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Schätze */}
              <div className="treasures-section">
                <h3>💎 Verfügbare Schätze</h3>
                <div className="treasures-grid">
                  {island.treasures.map((treasure, index) => {
                    const collected = collectedTreasures.includes(treasure.name);
                    return (
                      <div
                        key={index}
                        className={`treasure-item ${collected ? 'collected' : 'available'}`}
                        onClick={() => !collected && allQuestsComplete && handleCollectTreasure(index)}
                      >
                        <span className="treasure-icon">{treasure.icon}</span>
                        <span className="treasure-name">{treasure.name}</span>
                        <span className="treasure-xp">+{treasure.xp} XP</span>
                        {collected && <div className="collected-badge">✓</div>}
                        {!collected && !allQuestsComplete && (
                          <div className="treasure-locked">
                            🔒 Schließe alle Quests ab
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* Aktive Quest Ansicht */
            <div className="active-quest">
              <div className="quest-header">
                <span className="big-icon">{QUEST_TYPES[activeQuest].icon}</span>
                <h3>{QUEST_TYPES[activeQuest].name}</h3>
              </div>

              <div className="quest-content">
                {activeQuest === 'wisdom' && (
                  <div className="video-content">
                    {islandContent?.video && !islandContent.video.placeholder ? (
                      <div className="video-embed">
                        <iframe
                          src={islandContent.video.url
                            .replace('watch?v=', 'embed/')
                            .replace('youtu.be/', 'youtube.com/embed/')}
                          title="Lernvideo"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div className="video-placeholder">
                        <div className="video-frame">
                          <span className="play-icon">▶️</span>
                          <p>Video kommt bald!</p>
                        </div>
                      </div>
                    )}
                    <button
                      className="complete-btn"
                      onClick={() => handleCompleteQuest('wisdom')}
                    >
                      Video abgeschlossen ✓
                    </button>
                  </div>
                )}

                {activeQuest === 'scroll' && (
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
                          {(() => {
                            // Initialisiere expandierte Sections nur einmal beim ersten Render
                            if (!sectionsInitialized) {
                              const initial = new Set<number>();
                              islandContent.explanation.sections.forEach((s, i) => {
                                if (s.type === 'expander' && s.expanded) initial.add(i);
                              });
                              setTimeout(() => {
                                setSectionsInitialized(true);
                                if (initial.size > 0) {
                                  setExpandedSections(initial);
                                }
                              }, 0);
                            }
                            return null;
                          })()}
                          {islandContent.explanation.sections.map((section: ContentSection, idx: number) => {
                            const sectionType = section.type || 'default';
                            const isExpander = sectionType === 'expander';
                            const isExpanded = expandedSections.has(idx);
                            const isSelfcheck = sectionType === 'selfcheck';

                            // Selfcheck Komponente
                            if (isSelfcheck && section.selfcheck) {
                              const { statements, results, conclusion } = section.selfcheck;
                              const totalScore = Object.values(selfcheckAnswers).reduce((a, b) => a + b, 0);
                              const allAnswered = Object.keys(selfcheckAnswers).length === statements.length;

                              const getResult = () => {
                                if (totalScore >= 16) return results[0];
                                if (totalScore >= 11) return results[1];
                                return results[2];
                              };

                              return (
                                <div key={idx} className="content-section section-selfcheck">
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
                                              className={`rating-btn ${selfcheckAnswers[sIdx] === rating ? 'selected' : ''}`}
                                              onClick={() => {
                                                setSelfcheckAnswers(prev => ({ ...prev, [sIdx]: rating }));
                                                setShowSelfcheckResult(false);
                                              }}
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
                                    onClick={() => allAnswered && setShowSelfcheckResult(true)}
                                    disabled={!allAnswered}
                                  >
                                    {allAnswered ? '🎮 Auswertung anzeigen!' : `Noch ${statements.length - Object.keys(selfcheckAnswers).length} Fragen offen`}
                                  </button>

                                  {showSelfcheckResult && allAnswered && (
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

                            return (
                              <div
                                key={idx}
                                className={`content-section section-${sectionType} ${isExpander && isExpanded ? 'expanded' : ''}`}
                              >
                                <h4 onClick={isExpander ? () => toggleExpander(idx) : undefined}>
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
                      onClick={() => handleCompleteQuest('scroll')}
                    >
                      Gelesen ✓
                    </button>
                  </div>
                )}

                {activeQuest === 'battle' && (
                  <>
                    {!quizActive ? (
                      <div className="battle-teaser">
                        <div className="monster-preview">
                          <span className="monster-icon">🦸‍♀️</span>
                          <p>Superhelden-Quiz wartet!</p>
                        </div>
                        <p>Teste dein Wissen über Banduras Power-Ups und die Hattie-Challenge!</p>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '10px 0' }}>
                          ❤️❤️❤️ Du hast 3 Leben - nutze sie weise!
                        </p>
                        <button
                          className="complete-btn battle-start"
                          onClick={() => setQuizActive(true)}
                        >
                          🎮 Quiz starten!
                        </button>
                      </div>
                    ) : (
                      <BattleQuiz
                        quiz={{
                          questions: island.id === 'festung'
                            ? SUPERHELDEN_QUIZ_QUESTIONS
                            : island.quiz?.questions || []
                        } as ExtendedQuiz}
                        islandName={island.name}
                        enableLives={true}
                        maxLives={3}
                        onComplete={(victory, score, streak) => {
                          setQuizActive(false);
                          if (victory) {
                            handleCompleteQuest('battle');
                          }
                        }}
                        onClose={() => setQuizActive(false)}
                      />
                    )}
                  </>
                )}

                {activeQuest === 'challenge' && island.id === 'festung' && (
                  <div className="challenge-content festung-challenges">
                    {/* Challenge Auswahl */}
                    {challengeSelection === 'select' && !challengeSuccess && (
                      <div className="challenge-select">
                        <h4>🏆 Wähle deine Challenge</h4>
                        <p style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>
                          Trainiere deine Selbstwirksamkeit mit einer der beiden Challenges:
                        </p>

                        <div className="challenge-cards">
                          {/* Bandura Challenge */}
                          <div
                            className="challenge-card bandura"
                            onClick={() => setChallengeSelection('bandura')}
                          >
                            <div className="challenge-card-icon">🌟</div>
                            <h5>{BANDURA_INFO.title}</h5>
                            <p>{BANDURA_INFO.subtitle}</p>
                            <div className="challenge-card-xp">+10-25 XP</div>
                          </div>

                          {/* Hattie Challenge */}
                          <div
                            className="challenge-card hattie"
                            onClick={() => setChallengeSelection('hattie')}
                          >
                            <div className="challenge-card-icon">🎯</div>
                            <h5>{HATTIE_CHALLENGE_INFO.title}</h5>
                            <p>{HATTIE_CHALLENGE_INFO.subtitle}</p>
                            <div className="challenge-card-xp">+15-40 XP</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bandura Challenge */}
                    {challengeSelection === 'bandura' && !challengeSuccess && (
                      <div className="bandura-challenge">
                        <h4>🌟 {BANDURA_INFO.title}</h4>
                        <p style={{ marginBottom: '15px' }}>{BANDURA_INFO.description}</p>

                        {/* Die 4 Quellen */}
                        <div className="bandura-sources">
                          {(Object.keys(BANDURA_SOURCES) as BanduraSourceId[]).map(sourceId => {
                            const source = BANDURA_SOURCES[sourceId];
                            const isCompleted = banduraCompleted.includes(sourceId);
                            const isSelected = selectedBanduraSource === sourceId;

                            return (
                              <div
                                key={sourceId}
                                className={`bandura-source-card ${isSelected ? 'selected' : ''} ${isCompleted ? 'completed' : ''}`}
                                onClick={() => !isCompleted && setSelectedBanduraSource(sourceId)}
                                style={{ borderColor: isSelected ? source.color : undefined }}
                              >
                                <div className="bandura-source-icon">{source.icon}</div>
                                <div className="bandura-source-name">{source.name_de}</div>
                                <div className="bandura-source-xp">+{source.xp} XP</div>
                                {isCompleted && <div className="check-mark">✓</div>}
                              </div>
                            );
                          })}
                        </div>

                        {/* Eingabe-Formular */}
                        {selectedBanduraSource && (
                          <div className="entry-form" style={{ marginTop: '20px' }}>
                            <div className="entry-prompt">
                              <span style={{ fontSize: '24px', marginRight: '10px' }}>
                                {BANDURA_SOURCES[selectedBanduraSource].icon}
                              </span>
                              {BANDURA_SOURCES[selectedBanduraSource].prompt}
                            </div>
                            <div className="entry-examples">
                              Beispiele: {BANDURA_SOURCES[selectedBanduraSource].examples.join(' • ')}
                            </div>
                            <textarea
                              className="entry-textarea"
                              placeholder="Beschreibe deine Erfahrung..."
                              value={banduraDescription}
                              onChange={e => setBanduraDescription(e.target.value)}
                            />
                            <button
                              className="submit-entry-btn"
                              onClick={() => {
                                if (banduraDescription.trim().length >= 10) {
                                  const source = BANDURA_SOURCES[selectedBanduraSource];
                                  let xp = source.xp;
                                  if (banduraDescription.length > 50) xp += 5;

                                  setBanduraCompleted(prev => [...prev, selectedBanduraSource]);
                                  setChallengeXp(xp);
                                  setChallengeSuccess(true);

                                  if (onChallengeEntry) {
                                    onChallengeEntry('bandura', {
                                      sourceId: selectedBanduraSource,
                                      description: banduraDescription
                                    }, xp);
                                  }

                                  setTimeout(() => {
                                    setChallengeSuccess(false);
                                    setSelectedBanduraSource(null);
                                    setBanduraDescription('');
                                    setChallengeSelection('select');
                                    handleCompleteQuest('challenge');
                                  }, 2500);
                                }
                              }}
                              disabled={banduraDescription.trim().length < 10}
                            >
                              {banduraDescription.trim().length < 10
                                ? `Mindestens ${10 - banduraDescription.trim().length} Zeichen...`
                                : '✓ Eintrag speichern'
                              }
                            </button>
                          </div>
                        )}

                        <button
                          className="back-btn"
                          onClick={() => {
                            setChallengeSelection('select');
                            setSelectedBanduraSource(null);
                            setBanduraDescription('');
                          }}
                          style={{ marginTop: '15px' }}
                        >
                          ← Andere Challenge wählen
                        </button>
                      </div>
                    )}

                    {/* Hattie Challenge */}
                    {challengeSelection === 'hattie' && !challengeSuccess && (
                      <div className="hattie-challenge">
                        <h4>🎯 {HATTIE_CHALLENGE_INFO.title}</h4>

                        {/* Schritt 1: Fach wählen */}
                        {hattieStep === 'subject' && (
                          <>
                            <p style={{ marginBottom: '15px' }}>Wähle ein Fach:</p>
                            <div className="hattie-subjects">
                              {HATTIE_SUBJECTS.map(subject => (
                                <div
                                  key={subject.id}
                                  className="hattie-subject-card"
                                  onClick={() => {
                                    setHattieEntry({ ...hattieEntry, subject: subject.id });
                                    setHattieStep('task');
                                  }}
                                >
                                  <span className="subject-icon">{subject.icon}</span>
                                  <span className="subject-name">{subject.name}</span>
                                </div>
                              ))}
                            </div>
                            <button
                              className="back-btn"
                              onClick={() => setChallengeSelection('select')}
                              style={{ marginTop: '15px' }}
                            >
                              ← Andere Challenge wählen
                            </button>
                          </>
                        )}

                        {/* Schritt 2: Aufgabe beschreiben */}
                        {hattieStep === 'task' && (
                          <>
                            <p style={{ marginBottom: '10px' }}>Beschreibe die Aufgabe:</p>
                            <textarea
                              className="entry-textarea"
                              placeholder="z.B. '10 Mathe-Aufgaben', 'Diktat', 'Vokabeltest'..."
                              value={hattieEntry.task}
                              onChange={e => setHattieEntry({ ...hattieEntry, task: e.target.value })}
                            />
                            <button
                              className="submit-entry-btn"
                              onClick={() => hattieEntry.task.trim().length >= 5 && setHattieStep('prediction')}
                              disabled={hattieEntry.task.trim().length < 5}
                            >
                              Weiter →
                            </button>
                            <button className="back-btn" onClick={() => setHattieStep('subject')} style={{ marginTop: '10px' }}>
                              ← Zurück
                            </button>
                          </>
                        )}

                        {/* Schritt 3: Vorhersage */}
                        {hattieStep === 'prediction' && (
                          <>
                            <p style={{ marginBottom: '10px' }}>
                              Aufgabe: <strong>{hattieEntry.task}</strong>
                            </p>
                            <p style={{ marginBottom: '15px' }}>Wie viele Punkte/Prozent erwartest du? (0-100)</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', justifyContent: 'center' }}>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={hattieEntry.prediction}
                                onChange={e => setHattieEntry({ ...hattieEntry, prediction: parseInt(e.target.value) })}
                                style={{ flex: 1 }}
                              />
                              <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--gold)', minWidth: '60px' }}>
                                {hattieEntry.prediction}%
                              </span>
                            </div>
                            <button
                              className="submit-entry-btn"
                              onClick={() => setHattieStep('result')}
                              style={{ marginTop: '20px' }}
                            >
                              ✓ Schätzung abgeben
                            </button>
                            <button className="back-btn" onClick={() => setHattieStep('task')} style={{ marginTop: '10px' }}>
                              ← Zurück
                            </button>
                          </>
                        )}

                        {/* Schritt 4: Ergebnis */}
                        {hattieStep === 'result' && (
                          <>
                            <p style={{ marginBottom: '10px' }}>
                              Aufgabe: <strong>{hattieEntry.task}</strong><br />
                              Deine Schätzung: <strong style={{ color: 'var(--gold)' }}>{hattieEntry.prediction}%</strong>
                            </p>
                            <p style={{ marginBottom: '15px' }}>Wie war dein echtes Ergebnis?</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', justifyContent: 'center' }}>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={hattieEntry.result || 0}
                                onChange={e => setHattieEntry({ ...hattieEntry, result: parseInt(e.target.value) })}
                                style={{ flex: 1 }}
                              />
                              <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--xp-green)', minWidth: '60px' }}>
                                {hattieEntry.result || 0}%
                              </span>
                            </div>
                            <button
                              className="submit-entry-btn"
                              onClick={() => setHattieStep('reflection')}
                              style={{ marginTop: '20px' }}
                            >
                              Weiter zur Reflexion →
                            </button>
                            <button className="back-btn" onClick={() => setHattieStep('prediction')} style={{ marginTop: '10px' }}>
                              ← Zurück
                            </button>
                          </>
                        )}

                        {/* Schritt 5: Reflexion */}
                        {hattieStep === 'reflection' && (
                          <>
                            {(() => {
                              const exceeded = hattieEntry.result && hattieEntry.result > hattieEntry.prediction;
                              return (
                                <>
                                  <div style={{
                                    background: exceeded ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 215, 0, 0.1)',
                                    border: `2px solid ${exceeded ? 'var(--xp-green)' : 'var(--gold-dark)'}`,
                                    borderRadius: '15px',
                                    padding: '15px',
                                    marginBottom: '15px',
                                    textAlign: 'center'
                                  }}>
                                    <div style={{ fontSize: '30px', marginBottom: '5px' }}>
                                      {exceeded ? '🎉' : '🤔'}
                                    </div>
                                    <div>
                                      Schätzung: <strong>{hattieEntry.prediction}%</strong>
                                      {' → '}
                                      Ergebnis: <strong style={{ color: exceeded ? 'var(--xp-green)' : 'var(--gold)' }}>{hattieEntry.result}%</strong>
                                    </div>
                                    <div style={{ marginTop: '5px', fontSize: '0.9em' }}>
                                      {exceeded
                                        ? '✨ Besser als erwartet! Dein Gehirn speichert: "Ich kann mehr als ich denke!"'
                                        : 'Das hilft dir, dich beim nächsten Mal besser einzuschätzen!'
                                      }
                                    </div>
                                  </div>
                                  <p style={{ marginBottom: '10px' }}>Was nimmst du mit? (optional)</p>
                                  <textarea
                                    className="entry-textarea"
                                    placeholder="Deine Gedanken..."
                                    value={hattieEntry.reflection || ''}
                                    onChange={e => setHattieEntry({ ...hattieEntry, reflection: e.target.value })}
                                  />
                                  <button
                                    className="submit-entry-btn"
                                    onClick={() => {
                                      let xp = HATTIE_CHALLENGE_INFO.xp.entry;
                                      if (exceeded) xp += HATTIE_CHALLENGE_INFO.xp.exceeded;

                                      setChallengeXp(xp);
                                      setChallengeSuccess(true);

                                      if (onChallengeEntry) {
                                        onChallengeEntry('hattie', hattieEntry, xp);
                                      }

                                      setTimeout(() => {
                                        setChallengeSuccess(false);
                                        setHattieStep('subject');
                                        setHattieEntry({ subject: '', task: '', prediction: 0 });
                                        setChallengeSelection('select');
                                        handleCompleteQuest('challenge');
                                      }, 2500);
                                    }}
                                  >
                                    ✓ Challenge abschließen
                                  </button>
                                </>
                              );
                            })()}
                            <button className="back-btn" onClick={() => setHattieStep('result')} style={{ marginTop: '10px' }}>
                              ← Zurück
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {/* Success Animation */}
                    {challengeSuccess && (
                      <div className="challenge-success">
                        <div className="success-content">
                          <div className="success-icon">🎊</div>
                          <h4>Challenge geschafft!</h4>
                          <div className="success-xp">+{challengeXp} XP</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Fallback für andere Inseln */}
                {activeQuest === 'challenge' && island.id !== 'festung' && (
                  <div className="challenge-content">
                    <div className="challenge-icon">🏆</div>
                    <h4>Finale Herausforderung</h4>
                    <p>Wende dein Wissen in einer praktischen Aufgabe an!</p>
                    <button
                      className="complete-btn"
                      onClick={() => handleCompleteQuest('challenge')}
                    >
                      Challenge abschließen ✓
                    </button>
                  </div>
                )}
              </div>

              <button className="back-btn" onClick={() => setActiveQuest(null)}>
                ← Zurück zur Übersicht
              </button>
            </div>
          )}
        </div>

        {/* Reward Animation */}
        {showReward && (
          <div className="reward-popup">
            <div className="reward-content">
              <h3>🎉 Quest abgeschlossen!</h3>
              <div className="reward-items">
                <div className="reward-xp">
                  <span className="reward-icon">⭐</span>
                  <span className="reward-value">+{earnedReward.xp} XP</span>
                </div>
                <div className="reward-gold">
                  <span className="reward-icon">🪙</span>
                  <span className="reward-value">+{earnedReward.gold} Gold</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fortschrittsanzeige */}
        <div className="modal-footer">
          <div className="quest-progress-summary">
            <span>Fortschritt:</span>
            <div className="progress-icons">
              <span className={isQuestComplete('wisdom') ? 'done' : ''}>📜</span>
              <span className={isQuestComplete('scroll') ? 'done' : ''}>📖</span>
              <span className={isQuestComplete('battle') ? 'done' : ''}>⚔️</span>
              <span className={isQuestComplete('challenge') ? 'done' : ''}>🏆</span>
            </div>
            {allQuestsComplete && (
              <span className="all-complete">🎊 Alle Quests abgeschlossen!</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

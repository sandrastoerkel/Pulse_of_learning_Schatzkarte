// ============================================
// RPG Schatzkarte - Quest Modal Component
// ============================================
import { useState } from 'react';
import { Island, IslandProgress, QuestType, AgeGroup, ExtendedQuiz } from '../types';
import { FESTUNG_CONTENT, ContentSection } from '../content/festungContent';
import { FAEDEN_CONTENT } from '../content/faedenContent';
import { BRUECKEN_CONTENT } from '../content/brueckenContent';
import { WERKZEUGE_CONTENT } from '../content/werkzeugeContent';
import { SUPERHELDEN_QUIZ_QUESTIONS } from '../content/festungQuizContent';
import { SUPERHELDEN_QUIZ_QUESTIONS as SUPERHELDEN_QUIZ_UNTERSTUFE } from '../content/festungQuizContent_unterstufe';
import { WERKZEUGE_QUIZ_QUESTIONS } from '../content/werkzeugeQuizContent';
import { BRUECKEN_QUIZ_QUESTIONS } from '../content/brueckenQuizContent';
import { BRUECKEN_QUIZ_QUESTIONS_UNTERSTUFE } from '../content/brueckenQuizContent_unterstufe';
import { BRUECKEN_QUIZ_QUESTIONS_MITTELSTUFE } from '../content/brueckenQuizContent_mittelstufe';
import { BattleQuiz } from './BattleQuiz';
import { TagebuchStartButton } from './SuperheldenTagebuch';
import { PowertechnikenChallenge } from './PowertechnikenChallenge';
import { TransferChallenge } from './TransferChallenge';
import { BrueckenIslandExperience } from './BrueckenIslandExperience';
import { FestungIslandExperience } from './FestungIslandExperience';
import { WerkzeugeIslandExperience } from './WerkzeugeIslandExperience';
import { StarthafenIslandExperience } from './StarthafenIslandExperience';
import { FaedenIslandExperience } from './FaedenIslandExperience';
import { SpiegelSeeIslandExperience } from './SpiegelSeeIslandExperience';
import { VulkanIslandExperience } from './VulkanIslandExperience';
import { RuheOaseIslandExperience } from './RuheOaseIslandExperience';
import { AusdauerGipfelIslandExperience } from './AusdauerGipfelIslandExperience';
import { FokusLeuchtturmIslandExperience } from './FokusLeuchtturmIslandExperience';
import { WachstumGartenIslandExperience } from './WachstumGartenIslandExperience';
import { LehrerTurmIslandExperience } from './LehrerTurmIslandExperience';
import { WohlfuehlDorfIslandExperience } from './WohlfuehlDorfIslandExperience';
import { SchutzBurgIslandExperience } from './SchutzBurgIslandExperience';
import { MeisterBergIslandExperience } from './MeisterBergIslandExperience';

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
  // Superhelden-Tagebuch öffnen (nur Grundschule)
  onOpenTagebuch?: () => void;
  // Challenge-Schiffe öffnen (statt eingebetteter Challenges)
  onOpenBandura?: () => void;
  onOpenHattie?: () => void;
  // Direkt zur Challenge der 7 Werkzeuge springen (wenn von Lerntechniken-Widget geöffnet)
  startWerkzeugeWithChallenge?: boolean;
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
  },
  werkzeuge: {
    subtitle: '(Effektstärke)',
    description: 'Effektstärke (d) misst, wie viel eine Lernmethode bringt. d = 0.40 entspricht einem Jahr Lernfortschritt. d > 0.40 bedeutet: Mehr als ein Jahr Fortschritt! d = 0.80 entspricht sogar zwei Jahren in einem! John Hattie hat über 1.800 Meta-Studien mit 300 Millionen Schülern ausgewertet, um herauszufinden, welche Methoden wirklich funktionieren.'
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
  onOpenTagebuch,
  onOpenBandura,
  onOpenHattie,
  startWerkzeugeWithChallenge = false
}: QuestModalProps) {
  const [activeQuest, setActiveQuest] = useState<QuestType | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [earnedReward, setEarnedReward] = useState({ xp: 0, gold: 0 });
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [sectionsInitialized, setSectionsInitialized] = useState(false);
  const [showHeaderInfo, setShowHeaderInfo] = useState(false);
  const [selfcheckAnswers, setSelfcheckAnswers] = useState<Record<number, number>>({});
  const [showSelfcheckResult, setShowSelfcheckResult] = useState(false);

  // Quiz/Battle State
  const [quizActive, setQuizActive] = useState(false);

  // Powertechniken Challenge State (für Werkzeuge-Insel)
  const [powertechnikenActive, setPowertechnikenActive] = useState(false);

  // Transfer Challenge State (für Brücken-Insel)
  const [transferChallengeActive, setTransferChallengeActive] = useState(false);

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
          {/* Brücken-Insel: Vollständige animierte Experience */}
          {island.id === 'bruecken' ? (
            <BrueckenIslandExperience
              ageGroup={ageGroup}
              onClose={onClose}
              onQuestComplete={onQuestComplete}
            />
          ) : /* Festung der Stärke: Vollständige animierte Experience */
          island.id === 'festung' ? (
            <FestungIslandExperience
              ageGroup={ageGroup}
              onClose={onClose}
              onQuestComplete={onQuestComplete}
              onOpenTagebuch={onOpenTagebuch}
              onOpenBandura={onOpenBandura}
              onOpenHattie={onOpenHattie}
            />
          ) : /* Insel der 7 Werkzeuge: Vollständige animierte Experience */
          island.id === 'werkzeuge' ? (
            <WerkzeugeIslandExperience
              ageGroup={ageGroup}
              onClose={onClose}
              onQuestComplete={onQuestComplete}
              startWithChallenge={startWerkzeugeWithChallenge}
            />
          ) : /* Starthafen: Tutorial & Einführung */
          island.id === 'start' ? (
            <StarthafenIslandExperience
              ageGroup={ageGroup}
              onClose={onClose}
              onQuestComplete={onQuestComplete}
            />
          ) : /* Insel der Fäden: Birkenbihl's Faden-Prinzip */
          island.id === 'faeden' ? (
            <FaedenIslandExperience
              ageGroup={ageGroup}
              onClose={onClose}
              onQuestComplete={onQuestComplete}
            />
          ) : /* Spiegel-See: Metakognition */
          island.id === 'spiegel_see' ? (
            <SpiegelSeeIslandExperience
              ageGroup={ageGroup}
              onClose={onClose}
              onQuestComplete={onQuestComplete}
            />
          ) : /* Vulkan der Motivation */
          island.id === 'vulkan' ? (
            <VulkanIslandExperience
              ageGroup={ageGroup}
              onClose={onClose}
              onQuestComplete={onQuestComplete}
            />
          ) : /* Ruhe-Oase */
          island.id === 'ruhe_oase' ? (
            <RuheOaseIslandExperience
              ageGroup={ageGroup}
              onClose={onClose}
              onQuestComplete={onQuestComplete}
            />
          ) : /* Ausdauer-Gipfel */
          island.id === 'ausdauer_gipfel' ? (
            <AusdauerGipfelIslandExperience
              ageGroup={ageGroup}
              onClose={onClose}
              onQuestComplete={onQuestComplete}
            />
          ) : /* Fokus-Leuchtturm */
          island.id === 'fokus_leuchtturm' ? (
            <FokusLeuchtturmIslandExperience
              ageGroup={ageGroup}
              onClose={onClose}
              onQuestComplete={onQuestComplete}
            />
          ) : /* Wachstums-Garten */
          island.id === 'wachstum_garten' ? (
            <WachstumGartenIslandExperience
              ageGroup={ageGroup}
              onClose={onClose}
              onQuestComplete={onQuestComplete}
            />
          ) : /* Lehrer-Turm */
          island.id === 'lehrer_turm' ? (
            <LehrerTurmIslandExperience
              ageGroup={ageGroup}
              onClose={onClose}
              onQuestComplete={onQuestComplete}
            />
          ) : /* Wohlfühl-Dorf */
          island.id === 'wohlfuehl_dorf' ? (
            <WohlfuehlDorfIslandExperience
              ageGroup={ageGroup}
              onClose={onClose}
              onQuestComplete={onQuestComplete}
            />
          ) : /* Schutz-Burg */
          island.id === 'schutz_burg' ? (
            <SchutzBurgIslandExperience
              ageGroup={ageGroup}
              onClose={onClose}
              onQuestComplete={onQuestComplete}
            />
          ) : /* Berg der Meisterschaft - Finale */
          island.id === 'meister_berg' ? (
            <MeisterBergIslandExperience
              ageGroup={ageGroup}
              onClose={onClose}
              onQuestComplete={onQuestComplete}
            />
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
                      onClick={() => handleStartQuest(questType)}
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
                      <button className="quest-action-btn">
                        {completed ? '🔄 Wiederholen' : quest.action}
                      </button>
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

                            const isTagebuchSection = section.title.includes('Superhelden-Tagebuch');

                            return (
                              <div key={idx}>
                                <div
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

                                {/* Superhelden-Tagebuch Button - direkt nach dem Tagebuch-Abschnitt */}
                                {isTagebuchSection && island.id === 'festung' && ageGroup === 'grundschule' && onOpenTagebuch && (
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
                          <span className="monster-icon">{island.id === 'werkzeuge' ? '🧠' : '🦸‍♀️'}</span>
                          <p>{island.id === 'werkzeuge' ? 'Power-Techniken Quiz wartet!' : 'Superhelden-Quiz wartet!'}</p>
                        </div>
                        <p>{island.id === 'werkzeuge'
                          ? 'Teste dein Wissen über die 7 cleveren Lerntechniken!'
                          : 'Teste dein Wissen über Banduras Power-Ups und die Hattie-Challenge!'}</p>
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
                            ? (ageGroup === 'unterstufe' ? SUPERHELDEN_QUIZ_UNTERSTUFE : SUPERHELDEN_QUIZ_QUESTIONS)
                            : island.id === 'werkzeuge'
                            ? WERKZEUGE_QUIZ_QUESTIONS
                            : island.id === 'bruecken'
                            ? (ageGroup === 'grundschule' ? BRUECKEN_QUIZ_QUESTIONS : ageGroup === 'unterstufe' ? BRUECKEN_QUIZ_QUESTIONS_UNTERSTUFE : BRUECKEN_QUIZ_QUESTIONS_MITTELSTUFE)
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
                    {/* Challenge-Links zu den schwimmenden Schiffen */}
                    <div className="challenge-ships-info">
                      <div className="ships-info-header">
                        <span className="ships-icon">🚢</span>
                        <h4>Deine Begleiter auf der Reise</h4>
                      </div>

                      <div className="ships-explanation">
                        <p>
                          <strong>Der goldene Schlüssel</strong> und die <strong>Superpower</strong> sind
                          zwei mächtige Werkzeuge, die dich auf deiner <em>gesamten Lernreise</em> begleiten werden!
                        </p>
                        <p style={{ marginTop: '10px', fontSize: '0.95em', color: 'var(--text-muted)' }}>
                          💡 Du findest sie als <strong>freischwebende Symbole</strong> auf der Schatzkarte.
                          Klicke jederzeit darauf, um neue Einträge hinzuzufügen und XP zu sammeln.
                        </p>
                      </div>

                      <div className="challenge-ship-cards">
                        {/* Bandura Ship Link */}
                        <div
                          className="challenge-ship-card bandura"
                          onClick={() => {
                            if (onOpenBandura) {
                              onClose();
                              setTimeout(() => onOpenBandura(), 100);
                            }
                          }}
                        >
                          <div className="ship-card-icon">🌟</div>
                          <div className="ship-card-content">
                            <h5>Der goldene Schlüssel</h5>
                            <p>Sammle Erfolge aus 4 Quellen der Selbstwirksamkeit</p>
                          </div>
                          <div className="ship-card-action">
                            <span>Zum Schiff →</span>
                            <span className="ship-xp">+10-25 XP pro Eintrag</span>
                          </div>
                        </div>

                        {/* Hattie Ship Link */}
                        <div
                          className="challenge-ship-card hattie"
                          onClick={() => {
                            if (onOpenHattie) {
                              onClose();
                              setTimeout(() => onOpenHattie(), 100);
                            }
                          }}
                        >
                          <div className="ship-card-icon">🎯</div>
                          <div className="ship-card-content">
                            <h5>Superpower</h5>
                            <p>Trainiere deine Selbsteinschätzung mit Vorhersagen</p>
                          </div>
                          <div className="ship-card-action">
                            <span>Zum Schiff →</span>
                            <span className="ship-xp">+15-40 XP pro Eintrag</span>
                          </div>
                        </div>
                      </div>

                      <div className="ships-tip">
                        <span className="tip-icon">🗺️</span>
                        <span>
                          Tipp: Beide Challenges kannst du immer wieder besuchen.
                          Je mehr Einträge du machst, desto stärker wirst du!
                        </span>
                      </div>

                      <button
                        className="complete-btn"
                        onClick={() => handleCompleteQuest('challenge')}
                        style={{ marginTop: '20px' }}
                      >
                        ✓ Verstanden!
                      </button>
                    </div>
                  </div>
                )}

                {/* Werkzeuge-Insel: Powertechniken Challenge */}
                {activeQuest === 'challenge' && island.id === 'werkzeuge' && (
                  <>
                    {!powertechnikenActive ? (
                      <div className="challenge-teaser">
                        <div className="challenge-preview">
                          <span className="challenge-icon">🛠️</span>
                          <h4>Die 7 Powertechniken Challenge!</h4>
                        </div>
                        <p>Entdecke 7 wissenschaftlich bewiesene Lerntechniken und probiere sie aus!</p>
                        <ul style={{ textAlign: 'left', margin: '15px auto', maxWidth: '300px' }}>
                          <li>🍅 Pomodoro - Konzentrations-Timer</li>
                          <li>🔄 Active Recall - Erinnerungs-Spiel</li>
                          <li>👶 Feynman - Teddy-Erklärer</li>
                          <li>📅 Spaced Repetition - Wissens-Kalender</li>
                          <li>👥 Lernen durch Lehren</li>
                          <li>🏰 Loci-Methode - Gedächtnispalast</li>
                          <li>🔀 Interleaving - Mathe-Mixer</li>
                        </ul>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '10px 0' }}>
                          ⭐ +15 XP pro Technik • 🏆 Zertifikat am Ende!
                        </p>
                        <button
                          className="complete-btn challenge-start"
                          onClick={() => setPowertechnikenActive(true)}
                        >
                          🚀 Challenge starten!
                        </button>
                      </div>
                    ) : (
                      <PowertechnikenChallenge
                        onComplete={(xp) => {
                          setPowertechnikenActive(false);
                          handleCompleteQuest('challenge');
                        }}
                        onClose={() => setPowertechnikenActive(false)}
                      />
                    )}
                  </>
                )}

                {/* Brücken-Insel: Transfer Challenge */}
                {activeQuest === 'challenge' && island.id === 'bruecken' && (
                  <>
                    {!transferChallengeActive ? (
                      <div className="challenge-teaser">
                        <div className="challenge-preview">
                          <span className="challenge-icon">🌉</span>
                          <h4>Das Geheimnis der Überflieger!</h4>
                        </div>
                        <p>Entdecke den mächtigsten Lerntrick: Transfer - Wissen übertragen!</p>
                        <ul style={{ textAlign: 'left', margin: '15px auto', maxWidth: '320px' }}>
                          <li>🔮 Das Transfer-Geheimnis entdecken</li>
                          <li>🎯 Near Transfer - Ähnliches verbinden</li>
                          <li>🚀 Far Transfer - Kreative Brücken bauen</li>
                          <li>🌟 Deinen eigenen Transfer-Trick finden</li>
                        </ul>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '10px 0' }}>
                          ⭐ +150 XP möglich • 🏆 Transfer-Zertifikat!
                        </p>
                        <button
                          className="complete-btn challenge-start"
                          onClick={() => setTransferChallengeActive(true)}
                        >
                          🚀 Challenge starten!
                        </button>
                      </div>
                    ) : (
                      <TransferChallenge
                        onComplete={(xp) => {
                          setTransferChallengeActive(false);
                          handleCompleteQuest('challenge');
                        }}
                        onClose={() => setTransferChallengeActive(false)}
                      />
                    )}
                  </>
                )}

                {/* Fallback für andere Inseln */}
                {activeQuest === 'challenge' && island.id !== 'festung' && island.id !== 'werkzeuge' && island.id !== 'bruecken' && (
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

// ============================================
// RPG Schatzkarte - Quest Modal Component (Refactored)
// Pfad: src/components/QuestModal/QuestModal.tsx
// ============================================

import type { QuestType, AgeGroup, ExtendedQuiz } from '../../types';
import type { QuestModalProps } from './QuestModalTypes';
import { QUEST_TYPES } from './QuestModalConstants';

// Content Imports
import { FESTUNG_CONTENT } from '../../content/festungContent';
import { FAEDEN_CONTENT } from '../../content/faedenContent';
import { BRUECKEN_CONTENT } from '../../content/brueckenContent';
import { WERKZEUGE_CONTENT } from '../../content/werkzeugeContent';

// Quiz Imports
import { SUPERHELDEN_QUIZ_QUESTIONS } from '../../content/festungQuizContent';
import { SUPERHELDEN_QUIZ_QUESTIONS as SUPERHELDEN_QUIZ_UNTERSTUFE } from '../../content/festungQuizContent_unterstufe';
import { WERKZEUGE_QUIZ_QUESTIONS } from '../../content/werkzeugeQuizContent';
import { BRUECKEN_QUIZ_QUESTIONS } from '../../content/brueckenQuizContent';
import { BRUECKEN_QUIZ_QUESTIONS_UNTERSTUFE } from '../../content/brueckenQuizContent_unterstufe';
import { BRUECKEN_QUIZ_QUESTIONS_MITTELSTUFE } from '../../content/brueckenQuizContent_mittelstufe';

// Component Imports
import { BattleQuiz } from '../BattleQuiz';
import { PowertechnikenChallenge } from '../PowertechnikenChallenge';
import { TransferChallenge } from '../TransferChallenge';
import { HattieWaageIcon } from '../icons';

// Hooks
import { useExpandableSections, useSelfcheck, useQuestProgress } from './hooks';

// Sub-Components
import {
  QuestHeader,
  QuestGrid,
  TreasureSection,
  RewardPopup,
  ProgressFooter,
  ScrollContent,
  IslandRouter,
  hasIslandExperience
} from './components';

/**
 * Helper: Quiz-Fragen basierend auf Insel und Altersstufe holen
 */
function getQuizQuestions(islandId: string, ageGroup: AgeGroup, quiz?: { questions: unknown[] }) {
  if (islandId === 'festung') {
    return ageGroup === 'unterstufe' ? SUPERHELDEN_QUIZ_UNTERSTUFE : SUPERHELDEN_QUIZ_QUESTIONS;
  }
  if (islandId === 'werkzeuge') {
    return WERKZEUGE_QUIZ_QUESTIONS;
  }
  if (islandId === 'bruecken') {
    if (ageGroup === 'grundschule') return BRUECKEN_QUIZ_QUESTIONS;
    if (ageGroup === 'unterstufe') return BRUECKEN_QUIZ_QUESTIONS_UNTERSTUFE;
    return BRUECKEN_QUIZ_QUESTIONS_MITTELSTUFE;
  }
  return quiz?.questions || [];
}

/**
 * Helper: Insel-Content basierend auf ID und Altersstufe holen
 */
function getIslandContent(islandId: string, ageGroup: AgeGroup) {
  const contentMap: Record<string, Record<AgeGroup, unknown>> = {
    festung: FESTUNG_CONTENT,
    werkzeuge: WERKZEUGE_CONTENT,
    faeden: FAEDEN_CONTENT,
    bruecken: BRUECKEN_CONTENT
  };

  const content = contentMap[islandId];
  if (!content) return null;
  return (content[ageGroup] || content.unterstufe) as {
    title: string;
    video: { url: string; placeholder: boolean };
    explanation: { intro: string; sections: unknown[] };
    summary?: string;
  };
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
  startWerkzeugeWithChallenge = false,
  onPolarsternClick,
  onOpenCompanionSelector,
  selectedCompanion,
  initialPhase
}: QuestModalProps) {
  // Hooks
  const {
    activeQuest,
    showReward,
    earnedReward,
    quizActive,
    powertechnikenActive,
    transferChallengeActive,
    showHeaderInfo,
    setActiveQuest,
    setQuizActive,
    setPowertechnikenActive,
    setTransferChallengeActive,
    setShowHeaderInfo,
    handleStartQuest,
    handleCompleteQuest,
    isQuestComplete,
    allQuestsComplete,
    collectedTreasures
  } = useQuestProgress({ progress, onQuestComplete });

  const {
    expandedSections,
    toggleExpander,
    initializeFromSections
  } = useExpandableSections();

  const {
    answers: selfcheckAnswers,
    showResult: showSelfcheckResult,
    setAnswer: setSelfcheckAnswer,
    showResults: setShowSelfcheckResult
  } = useSelfcheck();

  // Content
  const islandContent = getIslandContent(island.id, ageGroup);

  if (!isOpen) return null;

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
        <QuestHeader
          island={island}
          showHeaderInfo={showHeaderInfo}
          onToggleHeaderInfo={() => setShowHeaderInfo(!showHeaderInfo)}
          onClose={onClose}
        />

        {/* Quest Liste oder aktive Quest */}
        <div className="modal-body">
          {/* Prüfe ob Insel eine spezielle Experience hat */}
          {hasIslandExperience(island.id) ? (
            <IslandRouter
              islandId={island.id}
              ageGroup={ageGroup}
              onClose={onClose}
              onQuestComplete={onQuestComplete}
              onOpenTagebuch={onOpenTagebuch}
              onOpenBandura={onOpenBandura}
              onOpenHattie={onOpenHattie}
              startWerkzeugeWithChallenge={startWerkzeugeWithChallenge}
              onPolarsternClick={onPolarsternClick}
              onOpenCompanionSelector={onOpenCompanionSelector}
              selectedCompanion={selectedCompanion}
              initialPhase={initialPhase}
            />
          ) : !activeQuest ? (
            <>
              {/* Standard Quest-Karten */}
              <QuestGrid
                island={island}
                isQuestComplete={isQuestComplete}
                onStartQuest={handleStartQuest}
              />

              {/* Schätze */}
              <TreasureSection
                treasures={island.treasures}
                collectedTreasures={collectedTreasures}
                allQuestsComplete={allQuestsComplete}
                onCollect={handleCollectTreasure}
              />
            </>
          ) : (
            /* Aktive Quest Ansicht */
            <div className="active-quest">
              <div className="quest-header">
                <span className="big-icon">{QUEST_TYPES[activeQuest].icon}</span>
                <h3>{QUEST_TYPES[activeQuest].name}</h3>
              </div>

              <div className="quest-content">
                {/* Wisdom Quest - Video */}
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

                {/* Scroll Quest - Erklärung lesen */}
                {activeQuest === 'scroll' && (
                  <ScrollContent
                    islandContent={islandContent as Parameters<typeof ScrollContent>[0]['islandContent']}
                    islandId={island.id}
                    ageGroup={ageGroup}
                    expandedSections={expandedSections}
                    selfcheckAnswers={selfcheckAnswers}
                    showSelfcheckResult={showSelfcheckResult}
                    onToggleExpander={toggleExpander}
                    onInitExpandedSections={initializeFromSections}
                    onSelfcheckAnswer={setSelfcheckAnswer}
                    onShowSelfcheckResult={setShowSelfcheckResult}
                    onCompleteQuest={() => handleCompleteQuest('scroll')}
                    onOpenTagebuch={onOpenTagebuch}
                    onClose={onClose}
                  />
                )}

                {/* Battle Quest - Quiz */}
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
                          questions: getQuizQuestions(island.id, ageGroup, island.quiz)
                        } as ExtendedQuiz}
                        islandName={island.name}
                        enableLives={true}
                        maxLives={3}
                        onComplete={(victory) => {
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

                {/* Challenge Quest - Festung */}
                {activeQuest === 'challenge' && island.id === 'festung' && (
                  <div className="challenge-content festung-challenges">
                    <div className="challenge-ships-info">
                      <div className="ships-info-header">
                        <span className="ships-icon">🚢</span>
                        <h4>Deine Begleiter auf der Reise</h4>
                      </div>

                      <div className="ships-explanation">
                        <p>
                          <strong>Der goldene Schlüssel</strong> und die <strong>Selbsteinschätzung</strong> sind
                          zwei mächtige Werkzeuge, die dich auf deiner <em>gesamten Lernreise</em> begleiten werden!
                        </p>
                        <p style={{ marginTop: '10px', fontSize: '0.95em', color: 'var(--text-muted)' }}>
                          💡 Du findest sie als <strong>freischwebende Symbole</strong> auf der Schatzkarte.
                          Klicke jederzeit darauf, um neue Einträge hinzuzufügen und XP zu sammeln.
                        </p>
                      </div>

                      <div className="challenge-ship-cards">
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

                        <div
                          className="challenge-ship-card hattie"
                          onClick={() => {
                            if (onOpenHattie) {
                              onClose();
                              setTimeout(() => onOpenHattie(), 100);
                            }
                          }}
                        >
                          <div className="ship-card-icon"><HattieWaageIcon size={28} /></div>
                          <div className="ship-card-content">
                            <h5>Selbsteinschätzung</h5>
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

                {/* Challenge Quest - Werkzeuge */}
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
                        onComplete={() => {
                          setPowertechnikenActive(false);
                          handleCompleteQuest('challenge');
                        }}
                        onClose={() => setPowertechnikenActive(false)}
                      />
                    )}
                  </>
                )}

                {/* Challenge Quest - Brücken */}
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
                        onComplete={() => {
                          setTransferChallengeActive(false);
                          handleCompleteQuest('challenge');
                        }}
                        onClose={() => setTransferChallengeActive(false)}
                      />
                    )}
                  </>
                )}

                {/* Challenge Quest - Fallback für andere Inseln */}
                {activeQuest === 'challenge' && !['festung', 'werkzeuge', 'bruecken'].includes(island.id) && (
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
        <RewardPopup show={showReward} reward={earnedReward} />

        {/* Fortschrittsanzeige */}
        <ProgressFooter
          isQuestComplete={isQuestComplete}
          allQuestsComplete={allQuestsComplete}
        />
      </div>
    </div>
  );
}

export default QuestModal;

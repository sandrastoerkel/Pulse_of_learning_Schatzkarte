// ============================================
// RPG Schatzkarte - Quest Modal Component
// ============================================
import { useState } from 'react';
import { Island, IslandProgress, QuestType, AgeGroup } from '../types';
import { FESTUNG_CONTENT, ContentSection } from '../content/festungContent';

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
}

interface TutorialStep {
  id: string;
  title: string;
  type: 'video' | 'explanation' | 'link';
  description?: string;
  content?: string;
  placeholder?: boolean;
}

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

export function QuestModal({
  island,
  progress,
  isOpen,
  ageGroup,
  onClose,
  onQuestComplete,
  onTreasureCollected
}: QuestModalProps) {
  const [activeQuest, setActiveQuest] = useState<QuestType | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [earnedReward, setEarnedReward] = useState({ xp: 0, gold: 0 });

  // Content für aktuelle Insel und Altersstufe holen
  const getIslandContent = () => {
    if (island.id === 'festung') {
      return FESTUNG_CONTENT[ageGroup] || FESTUNG_CONTENT.unterstufe;
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
        <div className="modal-header" style={{ background: `linear-gradient(135deg, ${island.color}, ${island.color}99)` }}>
          <div className="island-icon-large">{island.icon}</div>
          <div className="header-content">
            <h2>{island.name}</h2>
            <span className="week-badge">Woche {island.week}</span>
          </div>
          <button className="close-button" onClick={onClose}>✕</button>
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
                  <div className="video-placeholder">
                    <div className="video-frame">
                      <span className="play-icon">▶️</span>
                      <p>Video würde hier geladen werden</p>
                    </div>
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
                          <p className="content-intro">{islandContent.explanation.intro}</p>
                          {islandContent.explanation.sections.map((section: ContentSection, idx: number) => (
                            <div key={idx} className="content-section">
                              <h4>{section.title}</h4>
                              <div
                                className="section-content"
                                dangerouslySetInnerHTML={{
                                  __html: section.content
                                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                    .replace(/\n/g, '<br/>')
                                }}
                              />
                            </div>
                          ))}
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
                  <div className="battle-teaser">
                    <div className="monster-preview">
                      <span className="monster-icon">🐉</span>
                      <p>Ein Wissens-Drache wartet!</p>
                    </div>
                    <p>Besiege den Drachen, indem du die Quiz-Fragen richtig beantwortest!</p>
                    <button
                      className="complete-btn battle-start"
                      onClick={() => handleCompleteQuest('battle')}
                    >
                      ⚔️ Kampf beginnen!
                    </button>
                  </div>
                )}

                {activeQuest === 'challenge' && (
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

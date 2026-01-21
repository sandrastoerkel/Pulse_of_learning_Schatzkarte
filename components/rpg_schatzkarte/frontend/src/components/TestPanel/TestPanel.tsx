// ============================================
// TestPanel.tsx - Admin Test & Demo Panel
// Nur sichtbar für Admins/Pädagogen
// ============================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Island, UserProgress, AgeGroup } from '../../types';
import './test-panel.css';

// ═══════════════════════════════════════
// TYPES
// ═══════════════════════════════════════

type RewardType = 'game_won' | 'game_lost' | 'achievement' | 'level_up' | 'island_complete';

interface TestPanelProps {
  // Spieler-Werte
  playerXP: number;
  playerGold: number;
  playerLevel: number;

  // Inseln
  islands: Island[];
  userProgress: UserProgress;
  unlockedIslands: string[];

  // Callbacks für Werte-Änderungen
  onXPChange: (newXP: number) => void;
  onGoldChange: (newGold: number) => void;
  onLevelChange: (newLevel: number) => void;

  // Callbacks für Inseln
  onIslandUnlock: (islandId: string) => void;
  onIslandComplete: (islandId: string) => void;
  onIslandReset: (islandId: string) => void;
  onUnlockAllIslands: () => void;
  onResetAllIslands: () => void;

  // Callbacks für Rewards/Modals
  onTriggerReward: (type: RewardType) => void;
  onOpenMiniGameSelector: () => void;
  onOpenMemory: () => void;
  onOpenRunner: () => void;
  onOpenAvatarShop: () => void;

  // Aktueller Zustand
  ageGroup: AgeGroup;
  onAgeGroupChange: (ageGroup: AgeGroup) => void;
}

// ═══════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════

export const TestPanel: React.FC<TestPanelProps> = ({
  playerXP,
  playerGold,
  playerLevel,
  islands,
  userProgress,
  unlockedIslands,
  onXPChange,
  onGoldChange,
  onLevelChange,
  onIslandUnlock,
  onIslandComplete,
  onIslandReset,
  onUnlockAllIslands,
  onResetAllIslands,
  onTriggerReward,
  onOpenMiniGameSelector,
  onOpenMemory,
  onOpenRunner,
  onOpenAvatarShop,
  ageGroup,
  onAgeGroupChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'player' | 'islands' | 'rewards' | 'games'>('player');

  // Prüfe ob Insel abgeschlossen ist
  const isIslandComplete = (islandId: string): boolean => {
    const progress = userProgress[islandId];
    if (!progress) return false;
    return progress.video_watched &&
           progress.explanation_read &&
           progress.quiz_passed &&
           progress.challenge_completed;
  };

  // Tastenkürzel: Shift+T öffnet/schließt Panel
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'T') {
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        className="test-panel-toggle"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Test-Panel öffnen (Shift+T)"
      >
        🔧
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="test-panel"
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            {/* Header */}
            <div className="test-panel__header">
              <h2>🔧 Admin Test-Panel</h2>
              <button
                className="test-panel__close"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="test-panel__tabs">
              <button
                className={`tab ${activeTab === 'player' ? 'active' : ''}`}
                onClick={() => setActiveTab('player')}
              >
                📊 Spieler
              </button>
              <button
                className={`tab ${activeTab === 'islands' ? 'active' : ''}`}
                onClick={() => setActiveTab('islands')}
              >
                📍 Stationen
              </button>
              <button
                className={`tab ${activeTab === 'rewards' ? 'active' : ''}`}
                onClick={() => setActiveTab('rewards')}
              >
                🎁 Rewards
              </button>
              <button
                className={`tab ${activeTab === 'games' ? 'active' : ''}`}
                onClick={() => setActiveTab('games')}
              >
                🎮 Spiele
              </button>
            </div>

            {/* Content */}
            <div className="test-panel__content">
              {/* === SPIELER TAB === */}
              {activeTab === 'player' && (
                <div className="tab-content">
                  <h3>Spieler-Werte</h3>

                  {/* XP */}
                  <div className="value-control">
                    <label>⭐ XP</label>
                    <div className="value-row">
                      <input
                        type="number"
                        value={playerXP}
                        onChange={(e) => onXPChange(parseInt(e.target.value) || 0)}
                      />
                      <button onClick={() => onXPChange(playerXP + 100)}>+100</button>
                      <button onClick={() => onXPChange(playerXP + 500)}>+500</button>
                      <button onClick={() => onXPChange(0)}>Reset</button>
                    </div>
                  </div>

                  {/* Gold */}
                  <div className="value-control">
                    <label>💰 Gold</label>
                    <div className="value-row">
                      <input
                        type="number"
                        value={playerGold}
                        onChange={(e) => onGoldChange(parseInt(e.target.value) || 0)}
                      />
                      <button onClick={() => onGoldChange(playerGold + 50)}>+50</button>
                      <button onClick={() => onGoldChange(playerGold + 200)}>+200</button>
                      <button onClick={() => onGoldChange(0)}>Reset</button>
                    </div>
                  </div>

                  {/* Level */}
                  <div className="value-control">
                    <label>📈 Level</label>
                    <div className="value-row">
                      <input
                        type="number"
                        value={playerLevel}
                        min={1}
                        max={99}
                        onChange={(e) => onLevelChange(parseInt(e.target.value) || 1)}
                      />
                      <button onClick={() => onLevelChange(playerLevel + 1)}>+1</button>
                      <button onClick={() => onLevelChange(playerLevel + 5)}>+5</button>
                      <button onClick={() => onLevelChange(1)}>Reset</button>
                    </div>
                  </div>

                  {/* Altersstufe */}
                  <div className="value-control">
                    <label>👤 Altersstufe</label>
                    <select
                      value={ageGroup}
                      onChange={(e) => onAgeGroupChange(e.target.value as AgeGroup)}
                    >
                      <option value="grundschule">Grundschule</option>
                      <option value="unterstufe">Unterstufe</option>
                      <option value="mittelstufe">Mittelstufe</option>
                      <option value="oberstufe">Oberstufe</option>
                      <option value="paedagoge">Pädagoge</option>
                    </select>
                  </div>
                </div>
              )}

              {/* === INSELN TAB === */}
              {activeTab === 'islands' && (
                <div className="tab-content">
                  <h3>Stationen & Pfade</h3>

                  {/* Schnell-Aktionen */}
                  <div className="quick-actions">
                    <button
                      className="btn-action btn-unlock-all"
                      onClick={onUnlockAllIslands}
                    >
                      🔓 Alle freischalten
                    </button>
                    <button
                      className="btn-action btn-reset-all"
                      onClick={onResetAllIslands}
                    >
                      🔄 Alle zurücksetzen
                    </button>
                  </div>

                  {/* Inseln-Liste */}
                  <div className="islands-list">
                    {islands.map((island) => {
                      const isUnlocked = unlockedIslands.includes(island.id);
                      const isComplete = isIslandComplete(island.id);

                      return (
                        <div
                          key={island.id}
                          className={`island-item ${isUnlocked ? 'unlocked' : 'locked'} ${isComplete ? 'complete' : ''}`}
                        >
                          <div className="island-info">
                            <span className="island-icon">{island.icon}</span>
                            <span className="island-name">{island.name}</span>
                            <span className="island-status">
                              {isComplete ? '✅' : isUnlocked ? '🔓' : '🔒'}
                            </span>
                          </div>
                          <div className="island-actions">
                            {!isUnlocked && (
                              <button
                                className="btn-small btn-unlock"
                                onClick={() => onIslandUnlock(island.id)}
                                title="Freischalten"
                              >
                                🔓
                              </button>
                            )}
                            {isUnlocked && !isComplete && (
                              <button
                                className="btn-small btn-complete"
                                onClick={() => onIslandComplete(island.id)}
                                title="Als abgeschlossen markieren"
                              >
                                ✅
                              </button>
                            )}
                            {(isUnlocked || isComplete) && (
                              <button
                                className="btn-small btn-reset"
                                onClick={() => onIslandReset(island.id)}
                                title="Zurücksetzen"
                              >
                                🔄
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p className="hint">
                    💡 Tipp: Markiere Stationen als abgeschlossen um zu sehen, ob die Pfade zur nächsten Station erscheinen.
                  </p>
                </div>
              )}

              {/* === REWARDS TAB === */}
              {activeTab === 'rewards' && (
                <div className="tab-content">
                  <h3>Belohnungen testen</h3>

                  <div className="rewards-grid">
                    <button
                      className="reward-btn reward-won"
                      onClick={() => onTriggerReward('game_won')}
                    >
                      <span className="reward-icon">🎉</span>
                      <span className="reward-label">Spiel gewonnen</span>
                    </button>

                    <button
                      className="reward-btn reward-lost"
                      onClick={() => onTriggerReward('game_lost')}
                    >
                      <span className="reward-icon">💔</span>
                      <span className="reward-label">Spiel verloren</span>
                    </button>

                    <button
                      className="reward-btn reward-achievement"
                      onClick={() => onTriggerReward('achievement')}
                    >
                      <span className="reward-icon">🏆</span>
                      <span className="reward-label">Achievement</span>
                    </button>

                    <button
                      className="reward-btn reward-levelup"
                      onClick={() => onTriggerReward('level_up')}
                    >
                      <span className="reward-icon">⬆️</span>
                      <span className="reward-label">Level-Up</span>
                    </button>

                    <button
                      className="reward-btn reward-island"
                      onClick={() => onTriggerReward('island_complete')}
                    >
                      <span className="reward-icon">📍</span>
                      <span className="reward-label">Station komplett</span>
                    </button>

                    <button
                      className="reward-btn reward-selector"
                      onClick={onOpenMiniGameSelector}
                    >
                      <span className="reward-icon">🎮</span>
                      <span className="reward-label">MiniGame-Auswahl</span>
                    </button>
                  </div>

                  <h3 style={{ marginTop: '20px' }}>Belohnungs-Konfiguration</h3>
                  <p className="hint">
                    🚧 Hier können später die Belohnungs-Trigger konfiguriert werden (z.B. bei welcher Aktion welche Belohnung erscheint).
                  </p>
                </div>
              )}

              {/* === SPIELE TAB === */}
              {activeTab === 'games' && (
                <div className="tab-content">
                  <h3>Spiele direkt starten</h3>

                  <div className="games-grid">
                    <button
                      className="game-btn"
                      onClick={onOpenMemory}
                    >
                      <span className="game-icon">🧠</span>
                      <span className="game-name">Memory</span>
                      <span className="game-desc">Finde alle Paare</span>
                    </button>

                    <button
                      className="game-btn"
                      onClick={onOpenRunner}
                    >
                      <span className="game-icon">🏃</span>
                      <span className="game-name">Runner</span>
                      <span className="game-desc">Endless Runner</span>
                    </button>

                    <button
                      className="game-btn"
                      onClick={onOpenAvatarShop}
                    >
                      <span className="game-icon">🛒</span>
                      <span className="game-name">Avatar Shop</span>
                      <span className="game-desc">Items kaufen</span>
                    </button>
                  </div>

                  <h3 style={{ marginTop: '20px' }}>Weitere Aktionen</h3>
                  <div className="extra-actions">
                    <button
                      className="btn-action"
                      onClick={() => {
                        localStorage.clear();
                        window.location.reload();
                      }}
                    >
                      🗑️ LocalStorage löschen & neu laden
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="test-panel__footer">
              <span className="shortcut-hint">Shift+T zum Öffnen/Schließen</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TestPanel;

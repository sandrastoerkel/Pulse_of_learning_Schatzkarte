// ============================================
// Brücken Island Experience
// Videos 1–5 als Serie unter "Weisheit erlangen"
// Refactored: Props → useAuth + useNavigate + useCompleteIslandAction
// ============================================

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useCompleteIslandAction } from '@/hooks';
import type { AgeGroup, ExtendedQuiz } from '@/types/legacy-ui';
import type { IslandAction } from '@/types/database';
import { BRUECKEN_CONTENT, ContentSection, IslandContent, VideoEntry } from '@/content/brueckenContent';
import { TransferBoard } from '@/components/TransferBoard';
import { BRUECKEN_QUIZ_QUESTIONS } from '@/content/brueckenQuizContent';
import { BRUECKEN_QUIZ_QUESTIONS_UNTERSTUFE } from '@/content/brueckenQuizContent_unterstufe';
import { BRUECKEN_QUIZ_QUESTIONS_MITTELSTUFE } from '@/content/brueckenQuizContent_mittelstufe';
import { BattleQuiz } from '@/components/BattleQuiz';
import { TransferChallenge } from '@/components/TransferChallenge';
import { BrueckenIcon } from '@/components/icons';
import '@/styles/bruecken-island.css';

// ============================================
// TYPES
// ============================================

type QuestKey = 'video' | 'scroll' | 'quiz' | 'challenge';

interface BrueckenProgress {
  completedQuests: QuestKey[];
  totalXP: number;
}

const ISLAND_ID = 'bruecken';

const QUEST_TO_ACTION: Record<QuestKey, IslandAction> = {
  video: 'video_watched',
  scroll: 'explanation_read',
  quiz: 'quiz_passed',
  challenge: 'challenge_completed',
};

// ============================================
// QUEST INFO
// ============================================

const QUEST_INFO: Record<QuestKey, {
  name: string;
  icon: string;
  color: string;
  description: string;
  xp: number;
}> = {
  video: {
    name: "Weisheit erlangen",
    icon: "📜",
    color: "#667eea",
    description: "Schau dir die 5 Lernvideos an!",
    xp: 25,
  },
  scroll: {
    name: "Schriftrolle studieren",
    icon: "📖",
    color: "#764ba2",
    description: "Lies die Erklärung zum Thema Transfer.",
    xp: 20,
  },
  quiz: {
    name: "Wissen testen",
    icon: "⚔️",
    color: "#e74c3c",
    description: "Teste dein Wissen im Quiz!",
    xp: 50,
  },
  challenge: {
    name: "Transfer-Challenge",
    icon: "🏆",
    color: "#f39c12",
    description: "Werde zum Transfer-Meister!",
    xp: 150,
  },
};

const INDIGO = '#667eea';

// ============================================
// HAUPT-KOMPONENTE
// ============================================

export function BrueckenIslandExperience() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const ageGroup = profile?.age_group ?? 'grundschule';
  const completeAction = useCompleteIslandAction();

  const [currentView, setCurrentView] = useState<'overview' | QuestKey>('overview');
  const [progress, setProgress] = useState<BrueckenProgress>({
    completedQuests: [],
    totalXP: 0,
  });
  const [showXPReward, setShowXPReward] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const content = BRUECKEN_CONTENT[ageGroup] || BRUECKEN_CONTENT.unterstufe;
  const allQuestsComplete = progress.completedQuests.length === 4;
  const hasVideos = !!(content.videos && content.videos.length > 0);

  // Quest abschließen
  const completeQuest = (quest: QuestKey, xp: number) => {
    if (!progress.completedQuests.includes(quest)) {
      setProgress(prev => ({
        completedQuests: [...prev.completedQuests, quest],
        totalXP: prev.totalXP + xp,
      }));

      setShowXPReward(xp);
      setTimeout(() => setShowXPReward(null), 2500);

      completeAction.mutate({ islandId: ISLAND_ID, action: QUEST_TO_ACTION[quest] });

      // Alle fertig? Konfetti!
      if (progress.completedQuests.length === 3) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    }
    setCurrentView('overview');
  };

  const displayTitle = content.islandTitle || 'Transferlernen';

  return (
    <div className="bruecken-island">
      {/* Header */}
      <div className="island-header">
        <button className="back-btn" onClick={() => navigate('/karte')}>
          ← Zurück
        </button>
        <h1 className="island-title">
          <motion.div
            className="title-icon"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <BrueckenIcon size={40} animated={true} />
          </motion.div>
          {displayTitle}
        </h1>
        <div className="xp-badge">
          <motion.span
            className="xp-icon"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            ⭐
          </motion.span>
          <span className="xp-amount">{progress.totalXP} XP</span>
        </div>
      </div>

      {/* Subtitle */}
      <motion.div
        className="island-subtitle-bar"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="subtitle-text">(Transfer - Das Geheimnis der Überflieger)</span>
        <span className="effect-badge">d=0.86</span>
      </motion.div>

      {/* Fortschrittsbalken */}
      <div className="progress-container">
        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${(progress.completedQuests.length / 4) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <span className="progress-text">
          {progress.completedQuests.length}/4 Quests abgeschlossen
        </span>
      </div>

      {/* XP Belohnung Animation */}
      <AnimatePresence>
        {showXPReward && (
          <motion.div
            className="xp-reward-popup"
            initial={{ scale: 0, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0, y: -50, opacity: 0 }}
          >
            <motion.span
              className="xp-reward-amount"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: 2, duration: 0.3 }}
            >
              +{showXPReward} XP!
            </motion.span>
            <motion.span
              className="xp-reward-stars"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 1 }}
            >
              ⭐✨⭐
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Konfetti */}
      {showConfetti && <ConfettiEffect />}

      {/* Hauptinhalt */}
      <AnimatePresence mode="wait">
        {currentView === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="quest-overview"
          >
            <p className="overview-intro">
              Entdecke das Transfer-Geheimnis und werde zum Überflieger!
            </p>

            <div className="quests-grid">
              {(Object.keys(QUEST_INFO) as QuestKey[]).map((questKey, index) => (
                <QuestCard
                  key={questKey}
                  questKey={questKey}
                  info={QUEST_INFO[questKey]}
                  isCompleted={progress.completedQuests.includes(questKey)}
                  onClick={() => setCurrentView(questKey)}
                  delay={index * 0.1}
                />
              ))}
            </div>

            {/* Alle fertig Banner */}
            {allQuestsComplete && (
              <motion.div
                className="all-complete-banner"
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", bounce: 0.5 }}
              >
                <motion.span
                  className="banner-icon"
                  animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  🎊
                </motion.span>
                <span className="banner-text">
                  SUPER! Alle Quests abgeschlossen!
                </span>
              </motion.div>
            )}
          </motion.div>
        )}

        {currentView === 'video' && (
          <motion.div
            key="video"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {hasVideos ? (
              <VideoSeriesPhase
                content={content}
                ageGroup={ageGroup}
                onComplete={() => completeQuest('video', QUEST_INFO.video.xp)}
                onBack={() => setCurrentView('overview')}
              />
            ) : (
              <VideoPhaseFallback
                content={content}
                ageGroup={ageGroup}
                onComplete={() => completeQuest('video', QUEST_INFO.video.xp)}
                onBack={() => setCurrentView('overview')}
              />
            )}
          </motion.div>
        )}

        {currentView === 'scroll' && (
          <motion.div
            key="scroll"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {hasVideos ? (
              <GroupedScrollPhase
                content={content}
                onComplete={() => completeQuest('scroll', QUEST_INFO.scroll.xp)}
                onBack={() => setCurrentView('overview')}
              />
            ) : (
              <ScrollPhaseFallback
                content={content}
                onComplete={() => completeQuest('scroll', QUEST_INFO.scroll.xp)}
                onBack={() => setCurrentView('overview')}
              />
            )}
          </motion.div>
        )}

        {currentView === 'quiz' && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <QuizPhase
              ageGroup={ageGroup}
              onComplete={(victory) => {
                if (victory) {
                  completeQuest('quiz', QUEST_INFO.quiz.xp);
                } else {
                  setCurrentView('overview');
                }
              }}
              onBack={() => setCurrentView('overview')}
            />
          </motion.div>
        )}

        {currentView === 'challenge' && (
          <motion.div
            key="challenge"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <TransferChallenge
              onComplete={(xp) => {
                completeQuest('challenge', xp);
              }}
              onClose={() => setCurrentView('overview')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// VIDEO SERIES PHASE (5 Videos als Stepper)
// ============================================

interface VideoSeriesPhaseProps {
  content: IslandContent;
  ageGroup: AgeGroup;
  onComplete: () => void;
  onBack: () => void;
}

function VideoSeriesPhase({ content, ageGroup, onComplete, onBack }: VideoSeriesPhaseProps) {
  const videos = content.videos!;
  const [currentVideoIdx, setCurrentVideoIdx] = useState(0);
  const [watchedVideos, setWatchedVideos] = useState<Set<number>>(new Set());
  const totalVideos = videos.length;
  const currentVideo = videos[currentVideoIdx];

  const markWatched = () => {
    setWatchedVideos(prev => new Set([...prev, currentVideoIdx]));
  };

  const goNext = () => {
    markWatched();
    if (currentVideoIdx < totalVideos - 1) {
      setCurrentVideoIdx(i => i + 1);
    } else {
      onComplete();
    }
  };

  const goPrev = () => {
    if (currentVideoIdx > 0) setCurrentVideoIdx(i => i - 1);
    else onBack();
  };

  const isLastVideo = currentVideoIdx === totalVideos - 1;
  const allWatched = watchedVideos.size === totalVideos;

  return (
    <div className="phase-container video-phase">
      <PhaseHeader
        icon="📜"
        title="Weisheit erlangen"
        color={INDIGO}
        onBack={onBack}
      />

      {/* Video-Stepper-Punkte */}
      <div className="video-stepper">
        {videos.map((v, i) => (
          <button
            key={v.videoNumber}
            className={`stepper-dot ${i === currentVideoIdx ? 'active' : ''} ${watchedVideos.has(i) ? 'done' : ''}`}
            onClick={() => setCurrentVideoIdx(i)}
            title={v.title}
          >
            <span className="stepper-icon">{v.icon}</span>
            <span className="stepper-label">{v.title}</span>
            {watchedVideos.has(i) && <span className="stepper-check">✓</span>}
          </button>
        ))}
      </div>

      <motion.div
        className="phase-content"
        key={currentVideoIdx}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.3 }}
      >
        {/* Canvas Animation */}
        <div className="video-canvas-wrapper">
          <VideoCanvasAnimation type={currentVideo.canvasAnimation} />
          <div className="video-canvas-label">
            <span className="canvas-icon">{currentVideo.icon}</span>
            <span className="canvas-title">{currentVideo.title}</span>
            <span className="canvas-subtitle">{currentVideo.subtitle}</span>
          </div>
        </div>

        {/* Video-Player oder Placeholder */}
        <div className="video-container">
          {currentVideo.placeholder ? (
            <motion.div
              className="video-placeholder"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
            >
              <motion.div
                className="play-icon-wrapper"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <span className="play-icon" style={{ fontSize: 40 }}>{currentVideo.icon}</span>
              </motion.div>
              <h3>{currentVideo.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                {currentVideo.subtitle}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 8 }}>
                Das Video ist in Kürze verfügbar.
              </p>
            </motion.div>
          ) : (
            <div className="video-embed">
              <iframe
                src={`https://www.youtube.com/embed/${currentVideo.videoId}`}
                title={currentVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>

        {/* Intro-Text */}
        <motion.div
          className="video-intro-box"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          dangerouslySetInnerHTML={{ __html: markdownToHtml(currentVideo.intro) }}
        />

        {/* Practice Prompt */}
        <motion.div
          className="practice-prompt"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          dangerouslySetInnerHTML={{ __html: markdownToHtml(currentVideo.practicePrompt) }}
        />

        {/* TransferBoard unter den Videos */}
        <motion.div
          className="transferboard-wrapper"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <TransferBoard ageGroup={ageGroup} />
        </motion.div>

        {/* Navigation */}
        <div className="video-nav">
          <motion.button
            className="nav-btn nav-prev"
            onClick={goPrev}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ← {currentVideoIdx === 0 ? 'Zurück' : videos[currentVideoIdx - 1].title}
          </motion.button>

          <span className="video-counter">
            {currentVideoIdx + 1} / {totalVideos}
          </span>

          <motion.button
            className="nav-btn nav-next"
            onClick={goNext}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ background: isLastVideo && allWatched ? '#27ae60' : INDIGO }}
          >
            {isLastVideo
              ? (allWatched ? 'Alle Videos ✓' : 'Abschließen ✓')
              : `${videos[currentVideoIdx + 1].title} →`}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================
// CANVAS ANIMATION WRAPPER
// ============================================

interface VideoCanvasAnimationProps {
  type: VideoEntry['canvasAnimation'];
}

function VideoCanvasAnimation({ type }: VideoCanvasAnimationProps) {
  switch (type) {
    case 'bridgeBuilder':  return <BridgeBuilderCanvas />;
    case 'puzzleConnect':  return <PuzzleConnectCanvas />;
    case 'nearFarRadar':   return <NearFarRadarCanvas />;
    case 'brainLayers':    return <BrainLayersCanvas />;
    case 'transferStar':   return <TransferStarCanvas />;
    default:               return null;
  }
}

// ============================================
// CANVAS 1 · BRIDGE BUILDER (Video 1)
// Brücke baut sich Planke für Planke, Leuchtpartikel fließen darüber
// ============================================

function BridgeBuilderCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement!;
    const dpr = window.devicePixelRatio || 1;
    const W = parent.offsetWidth || 480;
    const H = 180;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    const C = '#667eea';
    const GOLD = '#f39c12';
    const bridgeY = H * 0.6;
    const bridgeLeft = W * 0.15;
    const bridgeRight = W * 0.85;
    const planks = 12;
    const plankW = (bridgeRight - bridgeLeft) / planks;
    let builtPlanks = 0;
    const buildTimer = setInterval(() => {
      if (builtPlanks < planks) builtPlanks++;
      else clearInterval(buildTimer);
    }, 300);

    // Inseln links und rechts
    const islands = [
      { x: W * 0.08, y: bridgeY, r: 30, label: 'Mathe' },
      { x: W * 0.92, y: bridgeY, r: 30, label: 'Physik' },
    ];

    // Leuchtpartikel
    const particles: { x: number; y: number; speed: number; alpha: number }[] = [];
    const spawnParticle = () => {
      if (builtPlanks > 2) {
        particles.push({
          x: bridgeLeft,
          y: bridgeY - 3 + (Math.random() - 0.5) * 6,
          speed: 1.5 + Math.random() * 2,
          alpha: 0.8 + Math.random() * 0.2,
        });
      }
    };
    const particleTimer = setInterval(spawnParticle, 200);

    let t = 0;
    const loop = () => {
      ctx.clearRect(0, 0, W, H);

      // Wasser-Hintergrund
      for (let i = 0; i < 5; i++) {
        const wy = bridgeY + 20 + i * 12;
        const waveOff = Math.sin(t * 0.03 + i * 0.5) * 8;
        ctx.beginPath();
        ctx.moveTo(0, wy + waveOff);
        for (let x = 0; x < W; x += 20) {
          ctx.lineTo(x, wy + Math.sin(t * 0.02 + x * 0.02 + i) * 4 + waveOff);
        }
        ctx.strokeStyle = `rgba(102,126,234,${0.06 - i * 0.01})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Inseln
      islands.forEach(isl => {
        const g = ctx.createRadialGradient(isl.x, isl.y, 0, isl.x, isl.y, isl.r * 2);
        g.addColorStop(0, 'rgba(102,126,234,0.15)');
        g.addColorStop(1, 'rgba(102,126,234,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(isl.x, isl.y, isl.r * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(isl.x, isl.y, isl.r, 0, Math.PI * 2);
        ctx.fillStyle = '#0f0a18';
        ctx.strokeStyle = C;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 12;
        ctx.shadowColor = C;
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(168,184,255,0.9)';
        ctx.fillText(isl.label, isl.x, isl.y);
      });

      // Brücken-Planken
      for (let i = 0; i < builtPlanks; i++) {
        const px = bridgeLeft + i * plankW;
        const bounce = i === builtPlanks - 1 ? Math.sin(t * 0.15) * 2 : 0;
        ctx.fillStyle = `rgba(102,126,234,${0.2 + i * 0.03})`;
        ctx.strokeStyle = `rgba(102,126,234,${0.4 + i * 0.03})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(px + 1, bridgeY - 4 + bounce, plankW - 2, 8, 2);
        ctx.fill();
        ctx.stroke();
      }

      // Seile oben
      if (builtPlanks > 0) {
        const builtEnd = bridgeLeft + builtPlanks * plankW;
        ctx.beginPath();
        ctx.moveTo(bridgeLeft, bridgeY - 20);
        for (let x = bridgeLeft; x <= builtEnd; x += 10) {
          const sag = Math.sin(((x - bridgeLeft) / (bridgeRight - bridgeLeft)) * Math.PI) * 8;
          ctx.lineTo(x, bridgeY - 20 + sag + Math.sin(t * 0.03 + x * 0.02) * 1.5);
        }
        ctx.strokeStyle = 'rgba(102,126,234,0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Leuchtpartikel
      particles.forEach((p, pi) => {
        const maxX = bridgeLeft + builtPlanks * plankW;
        p.x += p.speed;
        p.alpha -= 0.003;
        if (p.x > maxX || p.alpha <= 0) {
          particles.splice(pi, 1);
          return;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(243,156,18,${p.alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = GOLD;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Schweif
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 8, p.y);
        ctx.strokeStyle = `rgba(243,156,18,${p.alpha * 0.4})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      t++;
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(buildTimer);
      clearInterval(particleTimer);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '180px' }} />;
}

// ============================================
// CANVAS 2 · PUZZLE CONNECT (Video 2)
// Puzzleteile aus verschiedenen Domänen gleiten zusammen
// ============================================

function PuzzleConnectCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement!;
    const dpr = window.devicePixelRatio || 1;
    const W = parent.offsetWidth || 480;
    const H = 180;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    const C = '#667eea';
    const pieces = [
      { label: '📐 Mathe', homeX: W * 0.5, homeY: H * 0.5, startX: W * 0.1, startY: H * 0.2, x: 0, y: 0, arriving: false, arrived: false, delay: 0 },
      { label: '⚽ Sport', homeX: W * 0.5 + 45, homeY: H * 0.5 - 25, startX: W * 0.9, startY: H * 0.1, x: 0, y: 0, arriving: false, arrived: false, delay: 40 },
      { label: '🎵 Musik', homeX: W * 0.5 - 45, homeY: H * 0.5 - 25, startX: W * 0.1, startY: H * 0.8, x: 0, y: 0, arriving: false, arrived: false, delay: 80 },
      { label: '🔬 Bio', homeX: W * 0.5 + 45, homeY: H * 0.5 + 25, startX: W * 0.9, startY: H * 0.9, x: 0, y: 0, arriving: false, arrived: false, delay: 120 },
      { label: '🎨 Kunst', homeX: W * 0.5 - 45, homeY: H * 0.5 + 25, startX: W * 0.15, startY: H * 0.5, x: 0, y: 0, arriving: false, arrived: false, delay: 160 },
      { label: '📖 Dt.', homeX: W * 0.5, homeY: H * 0.5 - 45, startX: W * 0.85, startY: H * 0.5, x: 0, y: 0, arriving: false, arrived: false, delay: 200 },
    ];

    pieces.forEach(p => { p.x = p.startX; p.y = p.startY; });

    const glowParticles: { x: number; y: number; alpha: number; vx: number; vy: number }[] = [];
    let t = 0;

    const loop = () => {
      ctx.clearRect(0, 0, W, H);

      // Hintergrund-Gitter
      ctx.strokeStyle = 'rgba(102,126,234,0.03)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      pieces.forEach(p => {
        if (t > p.delay) {
          p.arriving = true;
        }
        if (p.arriving && !p.arrived) {
          p.x += (p.homeX - p.x) * 0.03;
          p.y += (p.homeY - p.y) * 0.03;
          if (Math.abs(p.x - p.homeX) < 1 && Math.abs(p.y - p.homeY) < 1) {
            p.arrived = true;
            p.x = p.homeX;
            p.y = p.homeY;
            // Glow-Burst
            for (let i = 0; i < 6; i++) {
              const angle = (i / 6) * Math.PI * 2;
              glowParticles.push({
                x: p.homeX, y: p.homeY,
                vx: Math.cos(angle) * 1.5,
                vy: Math.sin(angle) * 1.5,
                alpha: 1,
              });
            }
          }
        }

        // Verbindungslinie zum Zentrum wenn angekommen
        if (p.arrived) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(W * 0.5, H * 0.5);
          ctx.strokeStyle = `rgba(102,126,234,${0.1 + 0.05 * Math.sin(t * 0.04)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Puzzleteil zeichnen
        const pulse = p.arrived ? Math.sin(t * 0.05) * 2 : 0;
        const size = 35 + pulse;
        ctx.beginPath();
        ctx.roundRect(p.x - size / 2, p.y - size / 2, size, size, 8);
        ctx.fillStyle = p.arrived ? 'rgba(102,126,234,0.15)' : 'rgba(102,126,234,0.06)';
        ctx.strokeStyle = p.arrived ? `rgba(102,126,234,${0.5 + 0.2 * Math.sin(t * 0.04)})` : 'rgba(102,126,234,0.2)';
        ctx.lineWidth = p.arrived ? 1.5 : 1;
        if (p.arrived) { ctx.shadowBlur = 8; ctx.shadowColor = C; }
        ctx.fill(); ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.font = `${p.arrived ? 'bold ' : ''}10px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = p.arrived ? 'rgba(168,184,255,0.9)' : 'rgba(168,184,255,0.5)';
        ctx.fillText(p.label, p.x, p.y);
      });

      // Glow-Partikel
      glowParticles.forEach((gp, gi) => {
        gp.x += gp.vx;
        gp.y += gp.vy;
        gp.alpha -= 0.02;
        if (gp.alpha <= 0) { glowParticles.splice(gi, 1); return; }
        ctx.beginPath();
        ctx.arc(gp.x, gp.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(243,156,18,${gp.alpha})`;
        ctx.fill();
      });

      // Zentrum-Beschriftung
      const allArrived = pieces.every(p => p.arrived);
      if (allArrived) {
        const hubPulse = 0.7 + 0.3 * Math.sin(t * 0.04);
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = `rgba(243,156,18,${hubPulse})`;
        ctx.fillText('TRANSFER', W * 0.5, H * 0.5);
      }

      t++;
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '180px' }} />;
}

// ============================================
// CANVAS 3 · NEAR/FAR RADAR (Video 3)
// Radar-Sweep mit konzentrischen Kreisen
// ============================================

function NearFarRadarCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement!;
    const dpr = window.devicePixelRatio || 1;
    const W = parent.offsetWidth || 480;
    const H = 180;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    const cx = W / 2, cy = H / 2;
    const maxR = Math.min(W, H) * 0.42;

    // Radar-Punkte (Near = innen grün, Far = außen gold)
    const targets = [
      { angle: 0.3, dist: 0.25, label: 'Mathe→Physik', color: '#27ae60', type: 'near' },
      { angle: 1.2, dist: 0.3, label: 'Deutsch→Engl.', color: '#27ae60', type: 'near' },
      { angle: 2.5, dist: 0.35, label: 'Bio→Chemie', color: '#27ae60', type: 'near' },
      { angle: 4.0, dist: 0.7, label: 'Gaming→Strategie', color: '#f39c12', type: 'far' },
      { angle: 5.2, dist: 0.8, label: 'Sport→Disziplin', color: '#f39c12', type: 'far' },
      { angle: 0.8, dist: 0.9, label: 'Musik→Mathe', color: '#ffd700', type: 'far' },
    ];

    let sweepAngle = 0;
    let t = 0;

    const loop = () => {
      ctx.clearRect(0, 0, W, H);

      // Konzentrische Kreise
      for (let i = 1; i <= 4; i++) {
        const r = maxR * (i / 4);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(102,126,234,${0.08 + i * 0.02})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Achsenkreuz
      ctx.beginPath();
      ctx.moveTo(cx - maxR, cy); ctx.lineTo(cx + maxR, cy);
      ctx.moveTo(cx, cy - maxR); ctx.lineTo(cx, cy + maxR);
      ctx.strokeStyle = 'rgba(102,126,234,0.06)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Near/Far Labels
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(39,174,96,0.5)';
      ctx.fillText('NEAR', cx, cy - maxR * 0.25 - 8);
      ctx.fillStyle = 'rgba(243,156,18,0.5)';
      ctx.fillText('FAR', cx, cy - maxR * 0.85 - 8);

      // Radar-Sweep
      sweepAngle += 0.02;
      const sweepLen = Math.PI * 0.35;
      const g = ctx.createConicGradient(sweepAngle - sweepLen, cx, cy);
      g.addColorStop(0, 'rgba(102,126,234,0)');
      g.addColorStop(0.5, 'rgba(102,126,234,0.12)');
      g.addColorStop(1, 'rgba(102,126,234,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxR, sweepAngle - sweepLen, sweepAngle);
      ctx.closePath();
      ctx.fill();

      // Sweep-Linie
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweepAngle) * maxR, cy + Math.sin(sweepAngle) * maxR);
      ctx.strokeStyle = 'rgba(102,126,234,0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Targets
      targets.forEach(tgt => {
        const tx = cx + Math.cos(tgt.angle) * maxR * tgt.dist;
        const ty = cy + Math.sin(tgt.angle) * maxR * tgt.dist;

        // Prüfen ob Sweep gerade über Punkt geht
        const angleDiff = ((sweepAngle - tgt.angle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        const isLit = angleDiff < 0.5;
        const brightness = isLit ? 1 : Math.max(0.3, 1 - angleDiff * 0.15);

        // Dot
        ctx.beginPath();
        ctx.arc(tx, ty, isLit ? 5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = tgt.color.replace(')', `,${brightness * 0.8})`).replace('rgb', 'rgba');
        ctx.shadowBlur = isLit ? 12 : 0;
        ctx.shadowColor = tgt.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label
        if (brightness > 0.5) {
          ctx.font = `${isLit ? 'bold ' : ''}8px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillStyle = `rgba(255,255,255,${brightness * 0.7})`;
          ctx.fillText(tgt.label, tx, ty - 9);
        }
      });

      // Zentrum
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#0f0a18';
      ctx.strokeStyle = 'rgba(102,126,234,0.6)';
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#667eea';
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.font = 'bold 5px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(168,184,255,0.9)';
      ctx.fillText('DU', cx, cy);

      t++;
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '180px' }} />;
}

// ============================================
// CANVAS 4 · BRAIN LAYERS (Video 4)
// 3 horizontale Schichten mit aufsteigenden Partikeln
// ============================================

function BrainLayersCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement!;
    const dpr = window.devicePixelRatio || 1;
    const W = parent.offsetWidth || 480;
    const H = 180;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    const layers = [
      { y: H * 0.75, h: H * 0.22, label: 'Oberfläche', sub: 'Fakten & Vokabeln', color: 'rgba(102,126,234,0.15)', borderColor: 'rgba(102,126,234,0.3)' },
      { y: H * 0.45, h: H * 0.22, label: 'Tiefe', sub: 'Zusammenhänge', color: 'rgba(118,75,162,0.15)', borderColor: 'rgba(118,75,162,0.3)' },
      { y: H * 0.15, h: H * 0.22, label: 'Transfer', sub: 'Wissen anwenden', color: 'rgba(243,156,18,0.15)', borderColor: 'rgba(243,156,18,0.3)' },
    ];

    const particles: { x: number; y: number; speed: number; alpha: number; layer: number }[] = [];
    const spawnTimer = setInterval(() => {
      const x = W * 0.2 + Math.random() * W * 0.6;
      particles.push({ x, y: H * 0.85, speed: 0.4 + Math.random() * 0.6, alpha: 0.8, layer: 0 });
    }, 400);

    let t = 0;
    const loop = () => {
      ctx.clearRect(0, 0, W, H);

      // Schichten zeichnen
      layers.forEach((l, li) => {
        const wave = Math.sin(t * 0.02 + li * 0.8) * 3;
        ctx.fillStyle = l.color;
        ctx.strokeStyle = l.borderColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(W * 0.08, l.y + wave, W * 0.84, l.h, 8);
        ctx.fill();
        ctx.stroke();

        // Pfeil zwischen Schichten
        if (li < 2) {
          const arrowY = l.y + l.h + wave + 4;
          const nextWave = Math.sin(t * 0.02 + (li + 1) * 0.8) * 3;
          const nextY = layers[li + 1].y + nextWave - 4;
          ctx.beginPath();
          ctx.moveTo(W * 0.5, arrowY);
          ctx.lineTo(W * 0.5, nextY);
          ctx.strokeStyle = 'rgba(102,126,234,0.15)';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
          // Pfeilspitze
          ctx.beginPath();
          ctx.moveTo(W * 0.5 - 4, nextY + 4);
          ctx.lineTo(W * 0.5, nextY);
          ctx.lineTo(W * 0.5 + 4, nextY + 4);
          ctx.strokeStyle = 'rgba(102,126,234,0.25)';
          ctx.stroke();
        }

        // Labels
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = li === 2 ? 'rgba(243,156,18,0.85)' : 'rgba(168,184,255,0.8)';
        ctx.fillText(l.label, W * 0.12, l.y + l.h / 2 - 6 + wave);
        ctx.font = '9px sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillText(l.sub, W * 0.12, l.y + l.h / 2 + 8 + wave);
      });

      // Aufsteigende Partikel
      particles.forEach((p, pi) => {
        p.y -= p.speed;
        p.alpha -= 0.003;

        // Schicht-Zuordnung
        if (p.y < H * 0.45) p.layer = 2;
        else if (p.y < H * 0.65) p.layer = 1;

        const colors = ['rgba(102,126,234,', 'rgba(118,75,162,', 'rgba(243,156,18,'];
        const size = 2 + p.layer;

        if (p.alpha <= 0 || p.y < 10) {
          particles.splice(pi, 1);
          return;
        }

        ctx.beginPath();
        ctx.arc(p.x + Math.sin(t * 0.05 + pi) * 2, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = colors[p.layer] + p.alpha + ')';
        ctx.shadowBlur = 6;
        ctx.shadowColor = colors[p.layer] + '0.5)';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      t++;
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(rafRef.current); clearInterval(spawnTimer); };
  }, []);

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '180px' }} />;
}

// ============================================
// CANVAS 5 · TRANSFER STAR (Video 5)
// Zentraler Knoten mit 6 Domänen-Knoten, pulsierende Verbindungslinien
// ============================================

function TransferStarCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement!;
    const dpr = window.devicePixelRatio || 1;
    const W = parent.offsetWidth || 480;
    const H = 180;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    const cx = W / 2, cy = H / 2;
    const domains = [
      { label: '📐 Mathe', angle: 0 },
      { label: '🔬 Bio', angle: Math.PI / 3 },
      { label: '📖 Deutsch', angle: 2 * Math.PI / 3 },
      { label: '🎨 Kunst', angle: Math.PI },
      { label: '⚽ Sport', angle: 4 * Math.PI / 3 },
      { label: '🎵 Musik', angle: 5 * Math.PI / 3 },
    ];
    const orbitR = Math.min(W * 0.36, H * 0.38);
    const nodeR = 16;

    const pulses: { fromIdx: number; t: number; speed: number }[] = [];
    const pulseTimer = setInterval(() => {
      pulses.push({ fromIdx: Math.floor(Math.random() * domains.length), t: 0, speed: 0.015 + Math.random() * 0.01 });
    }, 600);

    // Orbiting sparks
    const sparks = Array.from({ length: 4 }, (_, i) => ({
      angle: (i / 4) * Math.PI * 2,
      r: orbitR * 0.5 + i * 8,
      speed: 0.008 + i * 0.004,
    }));

    let t = 0;
    const loop = () => {
      ctx.clearRect(0, 0, W, H);

      // Hintergrund-Glow
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbitR * 1.3);
      bg.addColorStop(0, 'rgba(102,126,234,0.06)');
      bg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Verbindungslinien
      domains.forEach((d, i) => {
        const dx = cx + Math.cos(d.angle) * orbitR;
        const dy = cy + Math.sin(d.angle) * orbitR;

        const pulse = 0.12 + 0.06 * Math.sin(t * 0.04 + i * 1.1);
        const g = ctx.createLinearGradient(cx, cy, dx, dy);
        g.addColorStop(0, `rgba(102,126,234,${pulse + 0.15})`);
        g.addColorStop(1, `rgba(102,126,234,${pulse})`);
        ctx.beginPath();
        ctx.strokeStyle = g;
        ctx.lineWidth = 1;
        ctx.moveTo(cx, cy);
        ctx.lineTo(dx, dy);
        ctx.stroke();
      });

      // Pulse-Partikel entlang Verbindungslinien
      pulses.forEach((p, pi) => {
        p.t += p.speed;
        if (p.t > 1) { pulses.splice(pi, 1); return; }
        const d = domains[p.fromIdx];
        const dx = cx + Math.cos(d.angle) * orbitR;
        const dy = cy + Math.sin(d.angle) * orbitR;
        const px = cx + (dx - cx) * p.t;
        const py = cy + (dy - cy) * p.t;
        const alpha = p.t < 0.5 ? p.t * 2 : (1 - p.t) * 2;

        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(243,156,18,${alpha * 0.8})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#f39c12';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Domänen-Knoten
      domains.forEach((d, i) => {
        const dx = cx + Math.cos(d.angle) * orbitR;
        const dy = cy + Math.sin(d.angle) * orbitR;
        const p = Math.sin(t * 0.05 + i * 0.9);

        // Glow
        const halo = ctx.createRadialGradient(dx, dy, 0, dx, dy, nodeR * 2.5);
        halo.addColorStop(0, `rgba(102,126,234,${0.12 + 0.06 * Math.abs(p)})`);
        halo.addColorStop(1, 'rgba(102,126,234,0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(dx, dy, nodeR * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Knoten
        ctx.beginPath();
        ctx.arc(dx, dy, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = '#0e0a14';
        ctx.strokeStyle = `rgba(102,126,234,${0.4 + 0.2 * Math.abs(p)})`;
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 8 + p * 4;
        ctx.shadowColor = '#667eea';
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Label
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = `rgba(168,184,255,${0.75 + 0.2 * Math.abs(p)})`;
        ctx.fillText(d.label, dx, dy);
      });

      // Orbiting sparks
      sparks.forEach((sp, si) => {
        sp.angle += sp.speed;
        const sx = cx + Math.cos(sp.angle) * sp.r;
        const sy = cy + Math.sin(sp.angle) * sp.r;
        const sc = 0.4 + 0.4 * Math.sin(t * 0.09 + si * 1.3);
        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(243,156,18,${sc})`;
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#f39c12';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Zentraler Hub
      const hubR = 22;
      const hg = ctx.createRadialGradient(cx, cy, 0, cx, cy, hubR * 3);
      hg.addColorStop(0, 'rgba(102,126,234,0.2)');
      hg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.arc(cx, cy, hubR * 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, hubR, 0, Math.PI * 2);
      ctx.fillStyle = '#100a18';
      ctx.strokeStyle = 'rgba(102,126,234,0.7)';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 15 + 7 * Math.sin(t * 0.04);
      ctx.shadowColor = '#667eea';
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(210,195,240,0.95)';
      ctx.fillText('TRANSFER', cx, cy - 4);
      ctx.font = '7px sans-serif';
      ctx.fillStyle = 'rgba(243,156,18,0.65)';
      ctx.fillText('⭐ Dein Moment', cx, cy + 7);

      t++;
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(rafRef.current); clearInterval(pulseTimer); };
  }, []);

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '180px' }} />;
}

// ============================================
// GROUPED SCROLL PHASE (nach Videos gruppiert)
// ============================================

interface GroupedScrollPhaseProps {
  content: IslandContent;
  onComplete: () => void;
  onBack: () => void;
}

function GroupedScrollPhase({ content, onComplete, onBack }: GroupedScrollPhaseProps) {
  const videos = content.videos!;
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (key: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  return (
    <div className="phase-container scroll-phase">
      <PhaseHeader icon="📖" title="Schriftrolle studieren" color={QUEST_INFO.scroll.color} onBack={onBack} />
      <motion.div className="phase-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="scroll-container">
          <motion.h3 className="scroll-title" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            {content.islandTitle || content.title} – Alle Themen im Überblick
          </motion.h3>

          {/* Pro Video ein Abschnitt */}
          {videos.map((video, vi) => (
            <motion.div
              key={video.videoNumber}
              className="scroll-video-group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: vi * 0.1 }}
            >
              {/* Video-Gruppen-Header */}
              <div className="scroll-group-header">
                <span className="group-icon">{video.icon}</span>
                <div className="group-title-block">
                  <h4 className="group-title">{video.title}</h4>
                  <span className="group-subtitle">{video.subtitle}</span>
                </div>
              </div>

              {/* Intro als erste Section */}
              <div className="scroll-intro" dangerouslySetInnerHTML={{ __html: markdownToHtml(video.intro) }} />

              {/* Sections des Videos */}
              <div className="scroll-sections">
                {video.sections.map((section, si) => {
                  const key = `${vi}-${si}`;
                  return (
                    <ScrollSection
                      key={key}
                      section={section}
                      index={si}
                      isExpanded={expandedSections.has(key)}
                      onToggle={() => toggleSection(key)}
                    />
                  );
                })}
              </div>

              {/* Practice Prompt */}
              <div
                className="scroll-practice-prompt"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(video.practicePrompt) }}
              />
            </motion.div>
          ))}

          {/* Gesamtsummary ganz unten */}
          {content.summary && (
            <motion.div
              className="scroll-summary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              dangerouslySetInnerHTML={{ __html: markdownToHtml(content.summary) }}
            />
          )}
        </div>

        <motion.button className="complete-btn" onClick={onComplete} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          Gelesen ✓
        </motion.button>
      </motion.div>
    </div>
  );
}

// ============================================
// FALLBACK: Alte VideoPhase (ohne videos Array)
// ============================================

function VideoPhaseFallback({ content, ageGroup, onComplete, onBack }: { content: IslandContent; ageGroup: AgeGroup; onComplete: () => void; onBack: () => void }) {
  return (
    <div className="phase-container video-phase">
      <PhaseHeader icon="📜" title="Weisheit erlangen" color={QUEST_INFO.video.color} onBack={onBack} />
      <motion.div className="phase-content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="video-container">
          {content.video.placeholder ? (
            <motion.div className="video-placeholder" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
              <motion.div className="play-icon-wrapper" animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                <span className="play-icon">▶️</span>
              </motion.div>
              <h3>Video kommt bald!</h3>
              <p>Das Erklärvideo zum Thema Transfer ist in Arbeit.</p>
              <p className="placeholder-hint">Lies in der Zwischenzeit die Schriftrolle!</p>
            </motion.div>
          ) : (
            <div className="video-embed">
              <iframe
                src={content.video.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                title="Lernvideo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>

        <motion.div className="transferboard-wrapper" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <TransferBoard ageGroup={ageGroup} />
        </motion.div>

        <motion.button className="complete-btn" onClick={onComplete} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          Verstanden! ✓
        </motion.button>
      </motion.div>
    </div>
  );
}

// ============================================
// FALLBACK: Alte ScrollPhase (ohne videos Array)
// ============================================

function ScrollPhaseFallback({ content, onComplete, onBack }: { content: IslandContent; onComplete: () => void; onBack: () => void }) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(() => {
    const initial = new Set<number>();
    content.explanation.sections.forEach((s, i) => {
      if (s.type === 'expander' && s.expanded) initial.add(i);
    });
    return initial;
  });

  const toggleSection = (idx: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  return (
    <div className="phase-container scroll-phase">
      <PhaseHeader icon="📖" title="Schriftrolle studieren" color={QUEST_INFO.scroll.color} onBack={onBack} />
      <motion.div className="phase-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="scroll-container">
          <motion.h3 className="scroll-title" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            {content.title}
          </motion.h3>
          <motion.div className="scroll-intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} dangerouslySetInnerHTML={{ __html: markdownToHtml(content.explanation.intro) }} />
          <div className="scroll-sections">
            {content.explanation.sections.map((section, idx) => (
              <ScrollSection key={idx} section={section} index={idx} isExpanded={expandedSections.has(idx)} onToggle={() => toggleSection(idx)} />
            ))}
          </div>
          {content.summary && (
            <motion.div className="scroll-summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <span className="summary-icon">💡</span>
              <p>{content.summary}</p>
            </motion.div>
          )}
        </div>
        <motion.button className="complete-btn" onClick={onComplete} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          Gelesen ✓
        </motion.button>
      </motion.div>
    </div>
  );
}

// ============================================
// SCROLL SECTION
// ============================================

interface ScrollSectionProps {
  section: ContentSection;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

function ScrollSection({ section, index, isExpanded, onToggle }: ScrollSectionProps) {
  const isExpander = section.type === 'expander';
  const sectionType = section.type || 'default';

  const getTypeColor = () => {
    switch (sectionType) {
      case 'info': return '#667eea';
      case 'success': return '#27ae60';
      case 'warning': return '#f39c12';
      default: return '#764ba2';
    }
  };

  const getTypeIcon = () => {
    switch (sectionType) {
      case 'info': return '💡';
      case 'success': return '✨';
      case 'warning': return '⚠️';
      case 'expander': return isExpanded ? '📖' : '📕';
      default: return '🌉';
    }
  };

  return (
    <motion.div
      className={`scroll-section section-${sectionType} ${isExpanded ? 'expanded' : ''}`}
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      style={{ '--section-color': getTypeColor() } as React.CSSProperties}
    >
      <motion.div
        className={`section-header ${isExpander ? 'clickable' : ''}`}
        onClick={isExpander ? onToggle : undefined}
        whileHover={isExpander ? { x: 5 } : {}}
      >
        <span className="section-icon">{getTypeIcon()}</span>
        <h4>{section.title}</h4>
        {isExpander && (
          <motion.span
            className="expander-arrow"
            animate={{ rotate: isExpanded ? 180 : 0 }}
          >
            ▼
          </motion.span>
        )}
      </motion.div>

      <AnimatePresence>
        {(!isExpander || isExpanded) && (
          <motion.div
            className="section-content"
            initial={isExpander ? { height: 0, opacity: 0 } : { opacity: 1 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={isExpander ? { height: 0, opacity: 0 } : {}}
            transition={{ duration: 0.3 }}
            dangerouslySetInnerHTML={{ __html: markdownToHtml(section.content) }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================
// QUEST CARD
// ============================================

interface QuestCardProps {
  questKey: QuestKey;
  info: typeof QUEST_INFO[QuestKey];
  isCompleted: boolean;
  onClick: () => void;
  delay: number;
}

function QuestCard({ info, isCompleted, onClick, delay }: QuestCardProps) {
  return (
    <motion.button
      className={`quest-card ${isCompleted ? 'completed' : ''}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", bounce: 0.4 }}
      whileHover={{ scale: 1.05, rotate: [-1, 1, -1, 0] }}
      whileTap={{ scale: 0.95 }}
      style={{ '--quest-color': info.color } as React.CSSProperties}
    >
      <div className="card-glow" />

      <motion.span
        className="quest-icon"
        animate={isCompleted ? { rotate: [0, 360] } : {}}
        transition={{ duration: 0.5 }}
      >
        {info.icon}
      </motion.span>
      <span className="quest-name">{info.name}</span>
      <span className="quest-description">{info.description}</span>

      {isCompleted && (
        <motion.div
          className="completed-badge"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.6 }}
        >
          ✓
        </motion.div>
      )}

      <div className="xp-preview">
        <span>+{info.xp} XP</span>
      </div>
    </motion.button>
  );
}

// ============================================
// PHASE HEADER
// ============================================

interface PhaseHeaderProps {
  icon: string;
  title: string;
  color: string;
  onBack: () => void;
}

function PhaseHeader({ icon, title, color, onBack }: PhaseHeaderProps) {
  return (
    <div className="phase-header" style={{ background: color }}>
      <button className="phase-back-btn" onClick={onBack}>
        ← Zurück
      </button>
      <motion.span
        className="phase-header-icon"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        {icon}
      </motion.span>
      <h2 className="phase-header-title">{title}</h2>
    </div>
  );
}

// ============================================
// QUIZ PHASE
// ============================================

interface QuizPhaseProps {
  ageGroup: AgeGroup;
  onComplete: (victory: boolean) => void;
  onBack: () => void;
}

function QuizPhase({ ageGroup, onComplete, onBack }: QuizPhaseProps) {
  const [quizStarted, setQuizStarted] = useState(false);

  const getQuizQuestions = () => {
    switch (ageGroup) {
      case 'grundschule': return BRUECKEN_QUIZ_QUESTIONS;
      case 'unterstufe': return BRUECKEN_QUIZ_QUESTIONS_UNTERSTUFE;
      case 'mittelstufe': return BRUECKEN_QUIZ_QUESTIONS_MITTELSTUFE;
      default: return BRUECKEN_QUIZ_QUESTIONS_UNTERSTUFE;
    }
  };

  if (quizStarted) {
    return (
      <BattleQuiz
        quiz={{ questions: getQuizQuestions() } as ExtendedQuiz}
        islandName="Transferlernen"
        enableLives={true}
        maxLives={3}
        onComplete={(victory) => {
          onComplete(victory);
        }}
        onClose={onBack}
      />
    );
  }

  return (
    <div className="phase-container quiz-phase">
      <PhaseHeader
        icon="⚔️"
        title="Wissen testen"
        color={QUEST_INFO.quiz.color}
        onBack={onBack}
      />

      <motion.div
        className="phase-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="quiz-intro">
          <motion.div
            className="quiz-monster"
            animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            🌉
          </motion.div>

          <h3>Transfer-Quiz</h3>
          <p>Teste dein Wissen über das Transfer-Geheimnis!</p>

          <div className="quiz-info">
            <div className="info-item">
              <span className="info-icon">❤️</span>
              <span>3 Leben</span>
            </div>
            <div className="info-item">
              <span className="info-icon">⭐</span>
              <span>+50 XP bei Sieg</span>
            </div>
            <div className="info-item">
              <span className="info-icon">🔥</span>
              <span>Streak-Bonus!</span>
            </div>
          </div>

          <motion.button
            className="start-quiz-btn"
            onClick={() => setQuizStarted(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🎮 Quiz starten!
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================
// HELPER: Markdown to HTML
// ============================================

function markdownToHtml(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^>\s*(.*)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^- (.*)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/❌/g, '<span class="icon-bad">❌</span>')
    .replace(/✅/g, '<span class="icon-good">✅</span>')
    .replace(/\n/g, '<br/>');
}

// ============================================
// KONFETTI EFFEKT
// ============================================

function ConfettiEffect() {
  const colors = ['#667eea', '#764ba2', '#a8b8ff', '#f39c12', '#ffd700', '#38ef7d'];
  const confetti = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    size: 8 + Math.random() * 8,
  }));

  return (
    <div className="confetti-container">
      {confetti.map((c) => (
        <motion.div
          key={c.id}
          className="confetti-piece"
          style={{
            left: `${c.x}%`,
            width: c.size,
            height: c.size,
            background: c.color,
          }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{
            y: '100vh',
            opacity: 0,
            rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
          }}
          transition={{
            duration: c.duration,
            delay: c.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

export default BrueckenIslandExperience;

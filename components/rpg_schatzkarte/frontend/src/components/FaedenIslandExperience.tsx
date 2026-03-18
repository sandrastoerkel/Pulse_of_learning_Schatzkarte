// ============================================
// Fäden Island Experience
// Videos 7–10 als Serie unter "Weisheit erlangen"
// Canvas-Animationen als React-Komponenten (Lila #9b59b6)
// ============================================

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgeGroup } from '../types';
import { FAEDEN_CONTENT, ContentSection, IslandContent, VideoEntry } from '../content/faedenContent';
import { FaedenChallenge, FaedenProgress as ChallengeProgress, DEFAULT_FAEDEN_PROGRESS } from './FaedenChallenge';
import { FaedenIcon } from './icons';
import '../styles/faeden-island.css';

// ============================================
// TYPES
// ============================================

type QuestKey = 'video' | 'scroll' | 'challenge';

interface FaedenProgress {
  completedQuests: QuestKey[];
  totalXP: number;
}

interface FaedenIslandProps {
  ageGroup: AgeGroup;
  onClose: () => void;
  onQuestComplete: (questType: string, xp: number, gold?: number) => void;
  startWithChallenge?: boolean;
  previewMode?: boolean;
}

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
    name: 'Weisheit erlangen',
    icon: '📜',
    color: '#9b59b6',
    description: 'Schau dir die 4 Lernvideos an!',
    xp: 25,
  },
  scroll: {
    name: 'Schriftrolle studieren',
    icon: '📖',
    color: '#8e44ad',
    description: 'Lerne das Faden-Prinzip!',
    xp: 20,
  },
  challenge: {
    name: 'Fäden-Challenge',
    icon: '🧵',
    color: '#7b1fa2',
    description: 'Die interaktive Lernreise!',
    xp: 135,
  },
};

const PURPLE = '#9b59b6';

// ============================================
// HAUPTKOMPONENTE
// ============================================

export function FaedenIslandExperience({
  ageGroup,
  onClose,
  onQuestComplete,
  startWithChallenge = false,
  previewMode = false,
}: FaedenIslandProps) {
  const [currentView, setCurrentView] = useState<'overview' | QuestKey>(
    startWithChallenge && ageGroup === 'grundschule' ? 'challenge' : 'overview'
  );
  const [progress, setProgress] = useState<FaedenProgress>({
    completedQuests: [],
    totalXP: 0,
  });
  const [showXPReward, setShowXPReward] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [challengeProgress, setChallengeProgress] = useState<ChallengeProgress>(() => {
    try {
      const saved = localStorage.getItem(`faeden_challenge_${ageGroup}`);
      if (saved) {
        return { ...DEFAULT_FAEDEN_PROGRESS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('FaedenChallenge: localStorage load failed', e);
    }
    return DEFAULT_FAEDEN_PROGRESS;
  });

  // Challenge-Fortschritt in localStorage persistieren
  useEffect(() => {
    try {
      localStorage.setItem(`faeden_challenge_${ageGroup}`, JSON.stringify(challengeProgress));
    } catch (e) {
      console.warn('FaedenChallenge: localStorage save failed', e);
    }
  }, [challengeProgress, ageGroup]);

  const content = FAEDEN_CONTENT[ageGroup] || FAEDEN_CONTENT.unterstufe;
  const isGrundschule = ageGroup === 'grundschule';
  const isUnterstufe = ageGroup === 'unterstufe' || ageGroup === 'mittelstufe' || ageGroup === 'oberstufe';
  const hasChallengeAccess = isGrundschule || isUnterstufe;
  const questKeys: QuestKey[] = hasChallengeAccess ? ['video', 'scroll', 'challenge'] : ['video', 'scroll'];
  const allQuestsComplete = progress.completedQuests.length === questKeys.length;
  const hasVideos = !!(content.videos && content.videos.length > 0);

  const completeQuest = (quest: QuestKey, xp: number) => {
    if (!progress.completedQuests.includes(quest)) {
      setProgress(prev => ({
        completedQuests: [...prev.completedQuests, quest],
        totalXP: prev.totalXP + xp,
      }));
      setShowXPReward(xp);
      setTimeout(() => setShowXPReward(null), 2500);
      onQuestComplete(quest, xp, quest === 'challenge' ? 20 : 5);
      if (progress.completedQuests.length === questKeys.length - 1) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    }
    setCurrentView('overview');
  };

  const handleChallengeClose = () => {
    const baseStationsComplete = ['experiment', 'gedankenjagd', 'bleistift'].every(
      s => challengeProgress.completedStations.includes(s as any)
    );
    const allDaysComplete = Object.values(challengeProgress.missionDays).filter(d => d.completed).length === 5;
    if (baseStationsComplete && allDaysComplete && !progress.completedQuests.includes('challenge')) {
      completeQuest('challenge', challengeProgress.totalXP);
    } else {
      setCurrentView('overview');
    }
  };

  if (currentView === 'challenge' && hasChallengeAccess) {
    return (
      <FaedenChallenge
        onClose={handleChallengeClose}
        savedProgress={challengeProgress}
        onSaveProgress={setChallengeProgress}
        previewMode={previewMode}
        ageGroup={ageGroup}
      />
    );
  }

  const displayTitle = content.islandTitle || 'Station der Fäden';

  return (
    <div className="faeden-island">
      {/* Header */}
      <div className="island-header">
        <button className="back-btn" onClick={onClose}>← Zurück</button>
        <h1 className="island-title">
          <motion.div
            className="title-icon"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <FaedenIcon size={40} animated={true} />
          </motion.div>
          {displayTitle}
        </h1>
        <div className="xp-badge">
          <motion.span
            className="xp-icon"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >⭐</motion.span>
          <span className="xp-amount">{progress.totalXP} XP</span>
        </div>
      </div>

      <motion.div
        className="island-subtitle-bar"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="subtitle-text">(Das Faden-Prinzip nach Birkenbihl)</span>
        <span className="effect-badge">Assoziatives Lernen</span>
      </motion.div>

      <div className="progress-container">
        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${(progress.completedQuests.length / questKeys.length) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <span className="progress-text">
          {progress.completedQuests.length}/{questKeys.length} Quests abgeschlossen
        </span>
      </div>

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
            >+{showXPReward} XP!</motion.span>
            <motion.span className="xp-reward-stars" animate={{ rotate: [0, 360] }} transition={{ duration: 1 }}>
              ⭐✨⭐
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {showConfetti && <ConfettiEffect />}

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
              Entdecke das Geheimnis der Fäden – 4 Videos, eine Methodik, dein persönliches Wissensnetz!
            </p>

            <div className="quests-grid">
              {questKeys.map((questKey, index) => (
                <QuestCard
                  key={questKey}
                  questKey={questKey}
                  info={QUEST_INFO[questKey]}
                  isCompleted={progress.completedQuests.includes(questKey)}
                  onClick={() => setCurrentView(questKey)}
                  delay={index * 0.1}
                  isChallenge={questKey === 'challenge'}
                  challengeProgress={questKey === 'challenge' ? challengeProgress : undefined}
                />
              ))}
            </div>

            <motion.div
              className="birkenbihl-quote"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <span className="quote-icon">💬</span>
              <blockquote>
                "Ob Sie sich etwas leicht oder schwer merken können, hat NUR damit zu tun, ob Sie einen Faden haben!"
              </blockquote>
              <cite>— Vera F. Birkenbihl</cite>
            </motion.div>

            {allQuestsComplete && (
              <motion.div
                className="all-complete-banner"
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: 'spring', bounce: 0.5 }}
              >
                <motion.span
                  className="banner-icon"
                  animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >🕸️</motion.span>
                <span className="banner-text">Dein Wissensnetz wächst!</span>
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
                onComplete={() => completeQuest('video', QUEST_INFO.video.xp)}
                onBack={() => setCurrentView('overview')}
              />
            ) : (
              <VideoPhaseFallback
                content={content}
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
      </AnimatePresence>
    </div>
  );
}

// ============================================
// VIDEO SERIES PHASE (4 Videos als Stepper)
// ============================================

interface VideoSeriesPhaseProps {
  content: IslandContent;
  onComplete: () => void;
  onBack: () => void;
}

function VideoSeriesPhase({ content, onComplete, onBack }: VideoSeriesPhaseProps) {
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
        color={PURPLE}
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
            style={{ background: isLastVideo && allWatched ? '#27ae60' : PURPLE }}
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
    case 'fadenNetz':    return <FadenNetzCanvas />;
    case 'abcGrid':     return <AbcGridCanvas />;
    case 'ampelJaeger': return <AmpelJaegerCanvas />;
    case 'kawaRadiant': return <KawaRadiantCanvas />;
    default:            return null;
  }
}

// ============================================
// CANVAS 1 · FADEN-NETZ (Video 7)
// Wissensnetz – Knoten verbunden durch Lila-Fäden
// ============================================

function FadenNetzCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement!;
    const dpr = window.devicePixelRatio || 1;
    const W = parent.offsetWidth || 480;
    const H = 180;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    const C = '#9b59b6';
    const nodes = [
      { fx: .50, fy: .50, r: 20, lbl: 'neu',  live: true  },
      { fx: .18, fy: .28, r: 13, lbl: 'A',    live: true  },
      { fx: .80, fy: .22, r: 12, lbl: 'B',    live: true  },
      { fx: .25, fy: .75, r: 12, lbl: 'C',    live: true  },
      { fx: .76, fy: .68, r: 12, lbl: 'D',    live: true  },
      { fx: .07, fy: .55, r:  9, lbl: 'E',    live: true  },
      { fx: .56, fy: .10, r:  9, lbl: '?',    live: false },
      { fx: .92, fy: .44, r:  9, lbl: '?',    live: false },
    ];

    const edges: { a: number; b: number }[] = [];
    nodes.forEach((a, i) => nodes.forEach((b, j) => {
      if (j <= i || !a.live || !b.live) return;
      const d = Math.hypot((a.fx - b.fx) * W, (a.fy - b.fy) * H);
      if (d < W * .48) edges.push({ a: i, b: j });
    }));

    const parts = edges.map((_, ei) => ({ ei, t: Math.random(), sp: .003 + Math.random() * .003 }));
    const waves: { r: number; a: number }[] = [{ r: 20, a: .6 }];
    const waveTimer = setInterval(() => waves.push({ r: 20, a: .6 }), 2200);

    const floaters: { x: number; y: number; vx: number; vy: number; a: number; age: number }[] = [];
    const spawnFloat = () => {
      const n = nodes.find(n => !n.live);
      if (n) floaters.push({ x: n.fx * W, y: n.fy * H, vx: (Math.random() - .5) * .5, vy: -(Math.random() * .4 + .1), a: 1, age: 0 });
    };
    spawnFloat();
    const floatTimer = setInterval(spawnFloat, 1500);

    let t = 0;
    const loop = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(155,89,182,.04)'; ctx.lineWidth = .5;
      for (let x = 0; x < W; x += 44) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 44) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      edges.forEach((e, ei) => {
        const a = nodes[e.a], b = nodes[e.b];
        const ax = a.fx * W, ay = a.fy * H, bx = b.fx * W, by = b.fy * H;
        const w = .13 + .07 * Math.sin(t * .04 + ei * .9);
        const g = ctx.createLinearGradient(ax, ay, bx, by);
        g.addColorStop(0, `rgba(155,89,182,${w})`); g.addColorStop(.5, `rgba(155,89,182,${w + .12})`); g.addColorStop(1, `rgba(155,89,182,${w})`);
        ctx.beginPath(); ctx.strokeStyle = g; ctx.lineWidth = 1; ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      });
      parts.forEach(p => {
        p.t = (p.t + p.sp) % 1;
        const e = edges[p.ei], a = nodes[e.a], b = nodes[e.b];
        const px = a.fx * W + (b.fx * W - a.fx * W) * p.t;
        const py = a.fy * H + (b.fy * H - a.fy * H) * p.t;
        ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2); ctx.fillStyle = 'rgba(155,89,182,.9)'; ctx.fill();
        const t2 = Math.max(0, p.t - .06);
        const tx = a.fx * W + (b.fx * W - a.fx * W) * t2;
        const ty = a.fy * H + (b.fy * H - a.fy * H) * t2;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(tx, ty); ctx.strokeStyle = 'rgba(155,89,182,.22)'; ctx.lineWidth = 1.5; ctx.stroke();
      });
      floaters.forEach((f, fi) => {
        f.x += f.vx; f.y += f.vy; f.age++;
        f.a = Math.max(0, 1 - f.age / 100);
        if (f.a <= 0) { floaters.splice(fi, 1); return; }
        ctx.globalAlpha = f.a * .4;
        ctx.beginPath(); ctx.arc(f.x, f.y, 9, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(60,50,70,.4)'; ctx.strokeStyle = 'rgba(120,100,140,.3)'; ctx.lineWidth = 1; ctx.fill(); ctx.stroke();
        ctx.globalAlpha = f.a * .35;
        ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(180,160,200,1)'; ctx.fillText('?', f.x, f.y); ctx.globalAlpha = 1;
      });
      waves.forEach((w, wi) => {
        w.r += 1.2; w.a -= .011;
        if (w.a <= 0) { waves.splice(wi, 1); return; }
        ctx.beginPath(); ctx.arc(nodes[0].fx * W, nodes[0].fy * H, w.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(155,89,182,${w.a})`; ctx.lineWidth = 1.5; ctx.stroke();
      });
      nodes.forEach((n, i) => {
        const nx = n.fx * W, ny = n.fy * H, p = Math.sin(t * .05 + i * .8);
        if (n.live) {
          const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, n.r * 3.5);
          g.addColorStop(0, 'rgba(155,89,182,.16)'); g.addColorStop(1, 'rgba(155,89,182,0)');
          ctx.beginPath(); ctx.fillStyle = g; ctx.arc(nx, ny, n.r * 3.5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.beginPath(); ctx.arc(nx, ny, n.r + (n.live ? p * .4 : 0), 0, Math.PI * 2);
        ctx.fillStyle = n.live ? '#100a14' : '#0d0a10';
        ctx.strokeStyle = n.live ? C : 'rgba(90,70,110,.3)';
        ctx.lineWidth = n.live ? 1.8 : 1;
        ctx.shadowBlur = n.live ? 10 + p * 4 : 0; ctx.shadowColor = C;
        ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
        ctx.font = `${n.live ? 'bold ' : ''}${Math.round(n.r * .82)}px sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = n.live ? C : 'rgba(110,90,130,.5)';
        ctx.fillText(n.lbl, nx, ny);
      });
      t++;
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(waveTimer);
      clearInterval(floatTimer);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '180px' }} />;
}

// ============================================
// CANVAS 2 · ABC-GRID (Video 8)
// Alphabet-Raster füllt sich mit Assoziationen
// ============================================

function AbcGridCanvas() {
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

    const C = '#9b59b6';
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const words: Record<string, string> = { A:'Assimilation', B:'Blatt', D:'Dichte', E:'Energie', G:'Gas', K:'Kern', L:'Licht', M:'Masse', N:'Neuron', P:'Plasma', R:'Reaktion', S:'Strom', T:'Teilchen', W:'Welle' };
    const COLS = 7;
    const cW = Math.floor((W - 8) / COLS), cH = Math.floor((H - 24) / 4);
    const ox = (W - cW * COLS) / 2, oy = 22;

    const revealed = new Array(26).fill(0);
    let ri = 0;
    const revTimer = setInterval(() => { if (ri < 26) revealed[ri++] = 1; else clearInterval(revTimer); }, 80);

    let scanX = 0, t = 0;
    const loop = () => {
      ctx.clearRect(0, 0, W, H);
      scanX = (scanX + 1.8) % W;
      const sg = ctx.createLinearGradient(scanX - 40, 0, scanX + 40, 0);
      sg.addColorStop(0, 'rgba(155,89,182,0)'); sg.addColorStop(.5, 'rgba(155,89,182,.07)'); sg.addColorStop(1, 'rgba(155,89,182,0)');
      ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H);
      ctx.font = 'bold 10px monospace'; ctx.textAlign = 'right'; ctx.textBaseline = 'top';
      ctx.fillStyle = 'rgba(155,89,182,.32)'; ctx.fillText('THEMA: BIOLOGIE', W - 8, 5);

      letters.forEach((lt, i) => {
        if (!revealed[i]) return;
        const col = i % COLS, row = Math.floor(i / COLS);
        const cx = ox + col * cW + cW / 2, cy = oy + row * cH + cH / 2;
        const filled = !!words[lt], pulse = .5 + .5 * Math.sin(t * .04 + i * .7);
        ctx.beginPath();
        ctx.roundRect(ox + col * cW + 2, oy + row * cH + 2, cW - 4, cH - 4, 6);
        ctx.fillStyle = filled ? `rgba(155,89,182,${.08 + .05 * pulse})` : 'rgba(255,255,255,.018)';
        ctx.strokeStyle = filled ? `rgba(155,89,182,${.3 + .15 * pulse})` : 'rgba(255,255,255,.055)';
        ctx.lineWidth = filled ? 1.5 : 1;
        ctx.shadowBlur = filled ? 5 * pulse : 0; ctx.shadowColor = C;
        ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = `bold ${Math.round(cH * .3)}px monospace`;
        ctx.fillStyle = filled ? 'rgba(155,89,182,.72)' : 'rgba(255,255,255,.13)';
        ctx.fillText(lt, cx, cy - cH * .12);
        ctx.font = `${Math.round(cH * .2)}px sans-serif`;
        ctx.fillStyle = filled ? 'rgba(155,89,182,.5)' : 'rgba(255,255,255,.07)';
        ctx.fillText(filled ? words[lt] : '–', cx, cy + cH * .16);
      });
      t++;
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(rafRef.current); clearInterval(revTimer); };
  }, []);

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '180px' }} />;
}

// ============================================
// CANVAS 3 · AMPEL-JÄGER (Video 9)
// Ampel-Raster (grün/orange/rot), Lupe scannt
// ============================================

function AmpelJaegerCanvas() {
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

    const states = ['g','g','r','g','o','r','g','g','o','r','g','r','o','g','r','g','g','r','o','g','g','r','g','o','r','g'];
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const COLS = 7;
    const cW = Math.floor((W - 8) / COLS), cH = Math.floor((H - 24) / 4);
    const ox = (W - cW * COLS) / 2, oy = 22;

    const revealed = new Array(26).fill(0); let ri = 0;
    const revTimer = setInterval(() => { if (ri < 26) revealed[ri++] = 1; else clearInterval(revTimer); }, 90);

    const path: { x: number; y: number }[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < COLS; c++) {
        const ci = r % 2 === 0 ? c : COLS - 1 - c;
        const i = r * COLS + ci;
        if (i < 26) path.push({ x: ox + ci * cW + cW / 2, y: oy + r * cH + cH / 2 });
      }
    }
    let pi = 0, prog = 0, lx = path[0].x, ly = path[0].y;

    let t = 0;
    const loop = () => {
      ctx.clearRect(0, 0, W, H);
      prog += .012;
      if (prog >= 1) { prog = 0; pi = (pi + 1) % path.length; }
      const pA = path[pi], pB = path[(pi + 1) % path.length];
      lx = pA.x + (pB.x - pA.x) * prog;
      ly = pA.y + (pB.y - pA.y) * prog;

      const g = states.filter(s => s === 'g').length;
      const o = states.filter(s => s === 'o').length;
      const r = states.filter(s => s === 'r').length;
      ctx.font = 'bold 10px monospace'; ctx.textBaseline = 'top'; ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(100,200,100,.8)'; ctx.fillText(`✓ ${g}`, 10, 7);
      ctx.fillStyle = 'rgba(255,190,50,.8)'; ctx.fillText(`~ ${o}`, 48, 7);
      ctx.fillStyle = 'rgba(220,80,80,.8)'; ctx.fillText(`✗ ${r}`, 86, 7);
      ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(155,89,182,.4)'; ctx.fillText('ABC-Ampel', W - 8, 7);

      letters.forEach((lt, i) => {
        if (!revealed[i]) return;
        const col = i % COLS, row = Math.floor(i / COLS);
        const cx = ox + col * cW + cW / 2, cy = oy + row * cH + cH / 2;
        const s = states[i];
        const dist = Math.hypot(lx - cx, ly - cy);
        const gw = Math.max(0, 1 - dist / 50);
        let fill: string, stroke: string, tc: string;
        if (s === 'g') { fill = `rgba(80,180,80,${.1+.04*gw})`; stroke = `rgba(80,180,80,${.35+.2*gw})`; tc = 'rgba(80,200,80,.85)'; }
        else if (s === 'o') { fill = `rgba(220,160,40,${.1+.04*gw})`; stroke = `rgba(220,160,40,${.35+.2*gw})`; tc = 'rgba(240,180,50,.85)'; }
        else { fill = `rgba(200,60,60,${.12+.06*gw})`; stroke = `rgba(200,60,60,${.4+.25*gw})`; tc = 'rgba(220,80,80,.9)'; }
        ctx.beginPath();
        ctx.roundRect(ox + col * cW + 2, oy + row * cH + 2, cW - 4, cH - 4, 6);
        ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = 1 + gw * 2;
        ctx.shadowBlur = gw * 14; ctx.shadowColor = stroke; ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
        ctx.font = `bold ${Math.round(cH * .3)}px monospace`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = tc; ctx.fillText(lt, cx, cy);
      });

      const lr = 20;
      ctx.beginPath(); ctx.arc(lx, ly, lr, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(10,5,15,.4)';
      ctx.strokeStyle = 'rgba(155,89,182,.7)'; ctx.lineWidth = 2;
      ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(155,89,182,.5)';
      ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(155,89,182,.2)'; ctx.lineWidth = .8;
      ctx.beginPath(); ctx.moveTo(lx - lr + 4, ly); ctx.lineTo(lx + lr - 4, ly); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(lx, ly - lr + 4); ctx.lineTo(lx, ly + lr - 4); ctx.stroke();
      const ha = Math.PI * .75;
      ctx.beginPath();
      ctx.moveTo(lx + Math.cos(ha) * lr, ly + Math.sin(ha) * lr);
      ctx.lineTo(lx + Math.cos(ha) * (lr + 12), ly + Math.sin(ha) * (lr + 12));
      ctx.strokeStyle = 'rgba(155,89,182,.6)'; ctx.lineWidth = 2.5;
      ctx.shadowBlur = 5; ctx.shadowColor = 'rgba(155,89,182,.4)'; ctx.stroke(); ctx.shadowBlur = 0;

      t++;
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(rafRef.current); clearInterval(revTimer); };
  }, []);

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '180px' }} />;
}

// ============================================
// CANVAS 4 · KAWA-RADIANT (Video 10)
// Zentralwort mit strahlenden Buchstaben-Assoziationen
// ============================================

function KawaRadiantCanvas() {
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

    const C = '#9b59b6';
    const WORD = 'ÄGYPTEN';
    const assocMap: Record<string, string[]> = {
      'Ä':['Ära','alt'],'G':['Götter','Gold'],'Y':['Yacht'],'P':['Pyramide','Pharao'],'T':['Tempel'],'E':['Ewigkeit'],'N':['Nil','Nofretete'],
    };
    const letterArr = WORD.split('');
    const n = letterArr.length;
    const lNodes = letterArr.map((lt, i) => {
      const a = -Math.PI / 2 + (i / (n - 1) - .5) * Math.PI;
      return { lt, angle: a, x: W / 2 + Math.cos(a) * W * .36, y: H / 2 + Math.sin(a) * H * .36, assocs: assocMap[lt] || [] };
    });

    const particles: { x: number; y: number; vx: number; vy: number; label: string; alpha: number; age: number; maxAge: number }[] = [];
    const spawn = (nd: typeof lNodes[0]) => {
      if (!nd.assocs.length) return;
      const label = nd.assocs[Math.floor(Math.random() * nd.assocs.length)];
      const angle = nd.angle + (Math.random() - .5) * .8;
      particles.push({ x: nd.x, y: nd.y, vx: Math.cos(angle) * (.5 + Math.random() * .8), vy: Math.sin(angle) * (.4 + Math.random() * .6), label, alpha: 0, age: 0, maxAge: 90 + Math.random() * 40 });
    };
    lNodes.forEach(nd => spawn(nd));
    const spawnTimer = setInterval(() => spawn(lNodes[Math.floor(Math.random() * lNodes.length)]), 700);

    const sparks = Array.from({ length: 5 }, (_, i) => ({ angle: i / 5 * Math.PI * 2, r: 30 + i * 5 }));

    let t = 0;
    const loop = () => {
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * .5);
      bg.addColorStop(0, 'rgba(155,89,182,.06)'); bg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      lNodes.forEach(nd => {
        const g = ctx.createLinearGradient(W / 2, H / 2, nd.x, nd.y);
        g.addColorStop(0, 'rgba(155,89,182,.4)'); g.addColorStop(1, 'rgba(155,89,182,.06)');
        ctx.beginPath(); ctx.strokeStyle = g; ctx.lineWidth = .8;
        ctx.setLineDash([4, 8]); ctx.moveTo(W / 2, H / 2); ctx.lineTo(nd.x, nd.y); ctx.stroke();
        ctx.setLineDash([]);
      });

      particles.forEach((p, pi) => {
        p.age++; p.x += p.vx; p.y += p.vy; p.vx *= .97; p.vy *= .97;
        if (p.age < 15) p.alpha = p.age / 15;
        else if (p.age > p.maxAge * .6) p.alpha = Math.max(0, p.alpha - .018);
        if (p.alpha <= 0 && p.age > 30) { particles.splice(pi, 1); return; }
        ctx.font = `300 ${Math.round(10 + p.alpha * 3)}px sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = `rgba(155,89,182,${p.alpha * .9})`;
        ctx.shadowBlur = 5 * p.alpha; ctx.shadowColor = C;
        ctx.fillText(p.label, p.x, p.y); ctx.shadowBlur = 0;
      });

      lNodes.forEach((nd, i) => {
        const pulse = Math.sin(t * .05 + i * .9);
        const h = ctx.createRadialGradient(nd.x, nd.y, 0, nd.x, nd.y, 28);
        h.addColorStop(0, `rgba(155,89,182,${.15 + .07 * Math.abs(pulse)})`); h.addColorStop(1, 'rgba(155,89,182,0)');
        ctx.fillStyle = h; ctx.beginPath(); ctx.arc(nd.x, nd.y, 28, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(nd.x, nd.y, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#0e0a14';
        ctx.strokeStyle = `rgba(155,89,182,${.35 + .2 * Math.abs(pulse)})`;
        ctx.lineWidth = 1.5; ctx.shadowBlur = 8 + pulse * 4; ctx.shadowColor = C;
        ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
        ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = `rgba(200,170,230,${.75 + .2 * Math.abs(pulse)})`;
        ctx.fillText(nd.lt, nd.x, nd.y);
      });

      const hubR = 24;
      const hg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, hubR * 3);
      hg.addColorStop(0, 'rgba(155,89,182,.2)'); hg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(W / 2, H / 2, hubR * 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(W / 2, H / 2, hubR, 0, Math.PI * 2);
      ctx.fillStyle = '#120a1a';
      ctx.strokeStyle = 'rgba(155,89,182,.7)'; ctx.lineWidth = 2;
      ctx.shadowBlur = 15 + 7 * Math.sin(t * .04); ctx.shadowColor = C;
      ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
      ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(210,180,240,.95)'; ctx.fillText('KaWa', W / 2, H / 2 - 6);
      ctx.font = '8px sans-serif'; ctx.fillStyle = 'rgba(155,89,182,.55)';
      ctx.fillText(WORD, W / 2, H / 2 + 7);

      sparks.forEach((sp, si) => {
        sp.angle += .025 + si * .008;
        const sx = W / 2 + Math.cos(sp.angle) * sp.r;
        const sy = H / 2 + Math.sin(sp.angle) * sp.r;
        const sc = .4 + .4 * Math.sin(t * .09 + si * 1.3);
        ctx.beginPath(); ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,180,60,${sc})`; ctx.shadowBlur = 5; ctx.shadowColor = '#f5c842';
        ctx.fill(); ctx.shadowBlur = 0;
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
            {content.islandTitle || content.title} – Alle Methoden im Überblick
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

function VideoPhaseFallback({ content, onComplete, onBack }: { content: IslandContent; onComplete: () => void; onBack: () => void }) {
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
              <p>Das Erklärvideo zum Faden-Prinzip ist in Arbeit.</p>
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
        <motion.button className="complete-btn" onClick={onComplete} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          {content.video.placeholder ? 'Verstanden! ✓' : 'Video abgeschlossen ✓'}
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
            <motion.div className="scroll-summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} dangerouslySetInnerHTML={{ __html: markdownToHtml(content.summary) }} />
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
      case 'info':    return '#9b59b6';
      case 'success': return '#27ae60';
      case 'warning': return '#f39c12';
      default:        return '#ba68c8';
    }
  };
  const getTypeIcon = () => {
    switch (sectionType) {
      case 'info':     return '💡';
      case 'success':  return '✨';
      case 'warning':  return '⚠️';
      case 'expander': return isExpanded ? '📖' : '📕';
      default:         return '🧵';
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
          <motion.span className="expander-arrow" animate={{ rotate: isExpanded ? 180 : 0 }}>▼</motion.span>
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
  isChallenge?: boolean;
  challengeProgress?: ChallengeProgress;
}

function QuestCard({ questKey, info, isCompleted, onClick, delay, isChallenge, challengeProgress }: QuestCardProps) {
  const missionActive = isChallenge && challengeProgress?.missionStartDate;
  const completedDays = isChallenge && challengeProgress
    ? Object.values(challengeProgress.missionDays).filter(d => d.completed).length : 0;

  return (
    <motion.button
      className={`quest-card ${isCompleted ? 'completed' : ''} ${isChallenge ? 'challenge-card' : ''}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', bounce: 0.4 }}
      whileHover={{ scale: 1.05, rotate: [-1, 1, -1, 0] }}
      whileTap={{ scale: 0.95 }}
      style={{ '--quest-color': info.color } as React.CSSProperties}
    >
      <div className="card-glow" />
      <motion.span className="quest-icon" animate={isCompleted ? { rotate: [0, 360] } : {}} transition={{ duration: 0.5 }}>
        {info.icon}
      </motion.span>
      <span className="quest-name">{info.name}</span>
      <span className="quest-description">{info.description}</span>
      {isCompleted && (
        <motion.div className="completed-badge" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', bounce: 0.6 }}>✓</motion.div>
      )}
      {missionActive && !isCompleted && (
        <motion.div className="mission-progress-badge" initial={{ scale: 0 }} animate={{ scale: 1 }}>{completedDays}/7</motion.div>
      )}
      <div className="xp-preview"><span>+{info.xp} XP</span></div>
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
      <button className="phase-back-btn" onClick={onBack}>← Zurück</button>
      <motion.span className="phase-header-icon" animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
        {icon}
      </motion.span>
      <h2 className="phase-header-title">{title}</h2>
    </div>
  );
}

// ============================================
// HELPERS
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

function ConfettiEffect() {
  const colors = ['#ba68c8', '#9b59b6', '#8e44ad', '#ce93d8', '#e1bee7', '#7b1fa2'];
  const confetti = Array.from({ length: 50 }, (_, i) => ({
    id: i, x: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 0.5, duration: 2 + Math.random() * 2, size: 8 + Math.random() * 8,
  }));
  return (
    <div className="confetti-container">
      {confetti.map(c => (
        <motion.div
          key={c.id}
          className="confetti-piece"
          style={{ left: `${c.x}%`, width: c.size, height: c.size, background: c.color }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: '100vh', opacity: 0, rotate: 360 * (Math.random() > 0.5 ? 1 : -1) }}
          transition={{ duration: c.duration, delay: c.delay, ease: 'linear' }}
        />
      ))}
    </div>
  );
}

export default FaedenIslandExperience;

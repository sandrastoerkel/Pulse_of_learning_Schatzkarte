// ============================================
// BRICK BREAKER ENGINE
// Ersetzt RunnerEngine.ts – Interface bleibt identisch
// ============================================

import {
  AgeGroup,
  DIFFICULTY_CONFIGS,
  BRICK_ROW_CONFIGS,
  POWERUP_DEFINITIONS,
  COLLECTIBLE_DEFINITIONS,
  CANVAS_CONFIG,
  PowerUpType,
  CollectibleType,
  calculateMultiplier,
  getRandomPowerUpType,
} from './RunnerAssets';

// === GAME RESULT (DARF NICHT GEÄNDERT WERDEN) ===

export interface GameResult {
  won: boolean;
  distance: number;           // = Anzahl zerstörter Bricks (Kompatibilität)
  multiplier: number;
  xpBet: number;
  xpWon: number;
  goldWon: number;
  coinsCollected: number;
  starsCollected: number;
  diamondsCollected: number;
}

// === INTERNE TYPEN ===

interface Vec2 { x: number; y: number }

interface Ball {
  id: number;
  pos: Vec2;
  vel: Vec2;
  radius: number;
  fireball: boolean;
  trail: Vec2[];
  glowColor: string;
}

interface Paddle {
  x: number; y: number;
  w: number; h: number;
  targetX: number;
  laser: boolean;
  wide: boolean;
}

interface Brick {
  id: number;
  x: number; y: number;
  w: number; h: number;
  hp: number; maxHp: number;
  color: string; glowColor: string;
  points: number;
  alive: boolean;
  hitFlash: number;     // Countdown für Weiß-Flash
}

interface FallingItem {
  id: number;
  x: number; y: number;
  vy: number;
  type: 'powerup' | CollectibleType;
  powerupType?: PowerUpType;
  color: string;
  emoji: string;
  size: number;
  rotation: number;
}

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  r: number; maxR: number;
  color: string;
  life: number; maxLife: number;
  gravity: number;
  spark: boolean;
}

interface FloatText {
  x: number; y: number;
  text: string; color: string;
  vy: number; life: number; maxLife: number;
  alpha: number;
}

interface LaserBeam {
  x: number; y: number;
  vy: number;
  life: number; maxLife: number;
}

interface ActivePowerUp {
  type: PowerUpType;
  framesLeft: number;
}

interface Star {
  x: number; y: number;
  r: number; speed: number;
  alpha: number; twinkle: number; twinkleSpeed: number;
}

// === HAUPT-ENGINE ===

export class RunnerEngine {
  // Canvas
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dpr: number;

  // Dimensionen (logisch, nicht physisch)
  private W = 420;
  private H = 640;

  // Spielzustand
  private ageGroup: AgeGroup;
  private betAmount: number;
  private level = 1;
  private lives: number;
  private maxLives: number;
  private score = 0;
  private bricksDestroyed = 0;
  private totalBricks = 0;
  private paused = false;
  private gamePhase: 'countdown' | 'playing' | 'dying' | 'levelup' | 'gameover' | 'win' = 'countdown';
  private countdownValue = 3;
  private countdownTimer = 0;
  private dyingTimer = 0;
  private levelupTimer = 0;
  private shakeX = 0; private shakeY = 0; private shakeMag = 0;
  private flashAlpha = 0;
  private frameCount = 0;

  // Collectibles gesammelt
  private coinsCollected = 0;
  private starsCollected = 0;
  private diamondsCollected = 0;

  // Spielobjekte
  private balls: Ball[] = [];
  private paddle!: Paddle;
  private bricks: Brick[] = [];
  private fallingItems: FallingItem[] = [];
  private particles: Particle[] = [];
  private floatTexts: FloatText[] = [];
  private laserBeams: LaserBeam[] = [];
  private activePowerUps: ActivePowerUp[] = [];
  private stars: Star[] = [];

  // ID-Zähler
  private nextId = 1;

  // Input
  private mouseX = 0;
  private touchX = 0;
  private useTouch = false;
  private keyLeft = false;
  private keyRight = false;

  // Callbacks
  private onGameEnd: (result: GameResult) => void;
  private onLivesChange: (lives: number) => void;
  private onScoreChange: (score: number) => void;
  private onLevelChange: (level: number) => void;

  // Animation frame
  private rafId = 0;

  // Cached background
  private bgCanvas: HTMLCanvasElement | null = null;

  // Ball color cycling
  private ballColorIndex = 0;
  private readonly BALL_COLORS = ['#22d3ee','#c084fc','#fbbf24','#f87171','#4ade80'];

  constructor(
    canvas: HTMLCanvasElement,
    ageGroup: AgeGroup,
    betAmount: number,
    onGameEnd: (result: GameResult) => void,
    onLivesChange: (lives: number) => void,
    onScoreChange: (score: number) => void,
    onLevelChange: (level: number) => void,
  ) {
    this.canvas = canvas;
    this.ageGroup = ageGroup;
    this.betAmount = betAmount;
    this.onGameEnd = onGameEnd;
    this.onLivesChange = onLivesChange;
    this.onScoreChange = onScoreChange;
    this.onLevelChange = onLevelChange;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D not available');
    this.ctx = ctx;

    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    const config = DIFFICULTY_CONFIGS[ageGroup];
    this.lives = config.startLives;
    this.maxLives = config.startLives;

    this.setupCanvas();
    this.mkStars();
    this.initLevel();
    this.bindInput();
  }

  // ── CANVAS SETUP ────────────────────────────

  private setupCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    // Mindestens 200x300 um sicherzugehen dass Layout berechnet wurde
    const w = (rect.width  > 50 ? rect.width  : 420);
    const h = (rect.height > 50 ? rect.height : 640);
    this.canvas.width  = w * this.dpr;
    this.canvas.height = h * this.dpr;
    // getContext('2d') bleibt nach width/height-Reset gueltig, aber State wird reset
    this.ctx = this.canvas.getContext('2d')!;
    this.ctx.scale(this.dpr, this.dpr);
    this.W = w;
    this.H = h;
  }

  private get scaleX() { return this.W / CANVAS_CONFIG.designWidth; }
  private get scaleY() { return this.H / CANVAS_CONFIG.designHeight; }
  private s(v: number) { return v * Math.min(this.scaleX, this.scaleY); }

  // ── LEVEL INIT ──────────────────────────────

  private initLevel() {
    const cfg   = DIFFICULTY_CONFIGS[this.ageGroup];
    const cc    = CANVAS_CONFIG;
    const rows  = cfg.brickRows;
    const cols  = cc.brickCols;
    const padH  = this.s(cc.brickPadH);
    const gap   = this.s(cc.brickGap);
    const bh    = this.s(cc.brickHeight);
    const bw    = (this.W - padH * 2 - gap * (cols - 1)) / cols;
    const topY  = this.s(cc.brickTopOffset);

    this.bricks = [];
    let id = this.nextId;
    for (let r = 0; r < rows; r++) {
      const rowCfg = BRICK_ROW_CONFIGS[r % BRICK_ROW_CONFIGS.length];
      // Obere Reihen haben mehr HP bei höheren Levels
      const hp = r < 2 ? Math.min(this.level, cfg.brickHpMax) : 1;
      for (let c = 0; c < cols; c++) {
        this.bricks.push({
          id: id++,
          x: padH + c * (bw + gap),
          y: topY + r * (bh + gap),
          w: bw, h: bh,
          hp, maxHp: hp,
          color: rowCfg.color,
          glowColor: rowCfg.glowColor,
          points: rowCfg.basePoints * this.level,
          alive: true,
          hitFlash: 0,
        });
      }
    }
    this.nextId = id;
    this.totalBricks = this.bricks.length;

    // Paddle
    const pw = this.s(cfg.paddleWidth);
    const ph = this.s(13);
    const py = this.H * cc.paddleY;
    this.paddle = {
      x: this.W / 2 - pw / 2,
      y: py,
      w: pw, h: ph,
      targetX: this.W / 2 - pw / 2,
      laser: false,
      wide: false,
    };

    // Ball
    this.balls = [];
    this.spawnBall();

    // Clear items & effects
    this.fallingItems = [];
    this.particles = [];
    this.floatTexts = [];
    this.laserBeams = [];
    this.activePowerUps = [];

    // Countdown
    this.gamePhase = 'countdown';
    this.countdownValue = 3;
    this.countdownTimer = 80;
  }

  private spawnBall(pos?: Vec2) {
    const cfg = DIFFICULTY_CONFIGS[this.ageGroup];
    const speed = (cfg.ballSpeed + (this.level - 1) * cfg.ballSpeedIncrement)
                  * Math.min(this.scaleX, this.scaleY);
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;
    const color = this.BALL_COLORS[this.ballColorIndex % this.BALL_COLORS.length];
    this.ballColorIndex++;
    this.balls.push({
      id: this.nextId++,
      pos: pos ? {...pos} : { x: this.W / 2, y: this.paddle.y - this.s(CANVAS_CONFIG.ballRadius) - 2 },
      vel: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
      radius: this.s(CANVAS_CONFIG.ballRadius),
      fireball: false,
      trail: [],
      glowColor: color,
    });
  }

  // ── INPUT BINDING ───────────────────────────

  private boundMouseMove!: (e: MouseEvent) => void;
  private boundTouchMove!: (e: TouchEvent) => void;
  private boundClick!: (e: MouseEvent | TouchEvent) => void;
  private boundKeyDown!: (e: KeyboardEvent) => void;
  private boundKeyUp!: (e: KeyboardEvent) => void;

  private bindInput() {
    this.boundMouseMove = (e: MouseEvent) => {
      const r = this.canvas.getBoundingClientRect();
      this.mouseX = (e.clientX - r.left) * (this.W / r.width);
      this.useTouch = false;
    };
    this.boundTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const r = this.canvas.getBoundingClientRect();
      this.touchX = (e.touches[0].clientX - r.left) * (this.W / r.width);
      this.useTouch = true;
    };
    this.boundKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A') this.keyLeft  = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keyRight = true;
      if (e.key === 'Escape') this.paused = !this.paused;
    };
    this.boundKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A') this.keyLeft  = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keyRight = false;
    };

    this.canvas.addEventListener('mousemove', this.boundMouseMove);
    this.canvas.addEventListener('touchmove', this.boundTouchMove, { passive: false });
    document.addEventListener('keydown', this.boundKeyDown);
    document.addEventListener('keyup',   this.boundKeyUp);
  }

  public handleTouchLeft()  { this.keyLeft  = true;  }
  public handleTouchRight() { this.keyRight = true;  }
  public handleTouchStop()  { this.keyLeft  = false; this.keyRight = false; }

  // ── GAME LOOP ───────────────────────────────

  public start() {
    const loop = () => {
      if (!this.paused) this.update();
      this.draw();
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  public destroy() {
    cancelAnimationFrame(this.rafId);
    this.canvas.removeEventListener('mousemove', this.boundMouseMove);
    this.canvas.removeEventListener('touchmove', this.boundTouchMove);
    document.removeEventListener('keydown', this.boundKeyDown);
    document.removeEventListener('keyup',   this.boundKeyUp);
  }

  public setPaused(p: boolean) { this.paused = p; }

  // ── UPDATE ─────────────────────────────────

  private update() {
    this.frameCount++;

    // Stars always scroll
    for (const s of this.stars) {
      s.y += s.speed;
      if (s.y > this.H) { s.y = -2; s.x = Math.random() * this.W; }
      s.twinkle += s.twinkleSpeed;
    }

    // Shake decay
    if (this.shakeMag > 0.3) {
      this.shakeX = (Math.random() - 0.5) * this.shakeMag;
      this.shakeY = (Math.random() - 0.5) * this.shakeMag;
      this.shakeMag *= 0.78;
    } else { this.shakeX = 0; this.shakeY = 0; this.shakeMag = 0; }

    // Flash decay
    if (this.flashAlpha > 0) this.flashAlpha -= 0.04;

    // Bricks flash decay
    for (const bk of this.bricks) if (bk.hitFlash > 0) bk.hitFlash--;

    // Phase-specific logic
    switch (this.gamePhase) {
      case 'countdown': this.updateCountdown(); break;
      case 'playing':   this.updatePlaying();   break;
      case 'dying':     this.updateDying();      break;
      case 'levelup':   this.updateLevelUp();    break;
    }

    // Particles & floatTexts
    this.updateParticles();
    this.updateFloatTexts();
  }

  private updateCountdown() {
    this.countdownTimer--;
    if (this.countdownTimer <= 0) {
      this.countdownValue--;
      if (this.countdownValue <= 0) {
        this.gamePhase = 'playing';
      } else {
        this.countdownTimer = 75;
      }
    }
  }

  private updateLevelUp() {
    this.levelupTimer--;
    if (this.levelupTimer <= 0) {
      this.level++;
      this.onLevelChange(this.level);
      this.initLevel();
    }
  }

  private updateDying() {
    this.dyingTimer--;
    if (this.dyingTimer <= 0) {
      if (this.lives <= 0) {
        this.endGame(false);
      } else {
        // Respawn ball, keep bricks
        this.spawnBall();
        this.gamePhase = 'countdown';
        this.countdownValue = 3;
        this.countdownTimer = 75;
        this.activePowerUps = [];
        this.paddle.laser = false;
        this.paddle.wide  = false;
        const cfg = DIFFICULTY_CONFIGS[this.ageGroup];
        this.paddle.w = this.s(cfg.paddleWidth);
      }
    }
  }

  private updatePlaying() {
    // PowerUp timers
    this.activePowerUps = this.activePowerUps.filter(p => {
      p.framesLeft--;
      if (p.framesLeft <= 0) {
        this.removePowerUpEffect(p.type);
        return false;
      }
      return true;
    });

    // Paddle movement
    const pd = this.paddle;
    const speed = this.s(9);
    if (this.keyLeft)  pd.targetX -= speed;
    if (this.keyRight) pd.targetX += speed;
    if (!this.useTouch) {
      if (!this.keyLeft && !this.keyRight) {
        pd.targetX = this.mouseX - pd.w / 2;
      }
    } else {
      pd.targetX = this.touchX - pd.w / 2;
    }
    pd.targetX = Math.max(0, Math.min(this.W - pd.w, pd.targetX));
    pd.x += (pd.targetX - pd.x) * 0.22;

    // Laser beams
    for (const lb of this.laserBeams) {
      lb.y += lb.vy;
      lb.life++;
    }
    // Laser-Brick collision
    for (const lb of this.laserBeams) {
      for (const bk of this.bricks) {
        if (!bk.alive) continue;
        if (lb.x > bk.x && lb.x < bk.x+bk.w && lb.y > bk.y && lb.y < bk.y+bk.h) {
          lb.life = lb.maxLife; // mark for removal
          this.hitBrick(bk, null);
          break;
        }
      }
    }
    this.laserBeams = this.laserBeams.filter(lb => lb.life < lb.maxLife);

    // Auto-fire laser
    if (pd.laser && this.frameCount % 18 === 0) {
      this.laserBeams.push({ x: pd.x + pd.w * 0.28, y: pd.y, vy: -this.s(10), life: 0, maxLife: 80 });
      this.laserBeams.push({ x: pd.x + pd.w * 0.72, y: pd.y, vy: -this.s(10), life: 0, maxLife: 80 });
    }

    // Balls
    const deadBalls: number[] = [];
    for (const ball of this.balls) {
      this.updateBall(ball);
      if (ball.pos.y > this.H + 60) deadBalls.push(ball.id);
    }

    // Remove fallen balls
    for (const id of deadBalls) {
      this.balls = this.balls.filter(b => b.id !== id);
    }

    if (this.balls.length === 0) {
      // All balls lost
      this.lives--;
      this.onLivesChange(this.lives);
      this.shakeMag = 14;
      this.flashAlpha = 0.4;
      this.spawnDeathParticles(this.W / 2, this.H - 60);
      if (this.lives <= 0) {
        this.dyingTimer = 90;
        this.gamePhase = 'dying';
      } else {
        this.dyingTimer = 55;
        this.gamePhase = 'dying';
      }
    }

    // Falling items
    this.updateFallingItems();

    // Win check
    if (this.bricks.every(b => !b.alive)) {
      this.gamePhase = 'levelup';
      this.levelupTimer = 120;
      this.spawnLevelUpParticles();
    }
  }

  private updateBall(ball: Ball) {
    // Trail
    ball.trail.unshift({ ...ball.pos });
    if (ball.trail.length > 6) ball.trail.pop();

    ball.pos.x += ball.vel.x;
    ball.pos.y += ball.vel.y;

    const r = ball.radius;

    // Wall bounces
    if (ball.pos.x - r < 0) {
      ball.pos.x = r;
      ball.vel.x = Math.abs(ball.vel.x);
    }
    if (ball.pos.x + r > this.W) {
      ball.pos.x = this.W - r;
      ball.vel.x = -Math.abs(ball.vel.x);
    }
    if (ball.pos.y - r < 0) {
      ball.pos.y = r;
      ball.vel.y = Math.abs(ball.vel.y);
    }

    // Paddle collision
    const pd = this.paddle;
    if (ball.vel.y > 0
        && ball.pos.x > pd.x - r && ball.pos.x < pd.x + pd.w + r
        && ball.pos.y + r >= pd.y && ball.pos.y - r <= pd.y + pd.h) {
      const hitPos = Math.max(0, Math.min(1, (ball.pos.x - pd.x) / pd.w));
      const angle = Math.PI * (-5 / 6 + hitPos * 2 / 3);
      const speed = Math.hypot(ball.vel.x, ball.vel.y);
      ball.vel.x = Math.cos(angle) * speed;
      ball.vel.y = Math.sin(angle) * speed;
      ball.pos.y = pd.y - r;
      this.spawnPaddleSparks(ball.pos.x, pd.y, ball.glowColor);
    }

    // Brick collisions
    for (const bk of this.bricks) {
      if (!bk.alive) continue;
      const cx = Math.max(bk.x, Math.min(ball.pos.x, bk.x + bk.w));
      const cy = Math.max(bk.y, Math.min(ball.pos.y, bk.y + bk.h));
      const dx = ball.pos.x - cx;
      const dy = ball.pos.y - cy;
      if (dx * dx + dy * dy > r * r) continue;

      // Fireball: pass through
      if (!ball.fireball) {
        const oL = (ball.pos.x + r) - bk.x;
        const oR = (bk.x + bk.w) - (ball.pos.x - r);
        const oT = (ball.pos.y + r) - bk.y;
        const oB = (bk.y + bk.h) - (ball.pos.y - r);
        if (Math.min(oL, oR) < Math.min(oT, oB)) ball.vel.x = -ball.vel.x;
        else ball.vel.y = -ball.vel.y;
      }

      this.hitBrick(bk, ball);
      if (!ball.fireball) break; // Normal ball: one brick per frame
    }
  }

  private hitBrick(bk: Brick, ball: Ball | null) {
    bk.hp--;
    bk.hitFlash = 8;
    if (bk.hp <= 0) {
      bk.alive = false;
      this.bricksDestroyed++;
      this.score += bk.points;
      this.onScoreChange(this.score);
      ball && (ball.glowColor = bk.color);
      this.spawnBrickParticles(bk);
      this.addFloatText(`+${bk.points}`, bk.x + bk.w / 2, bk.y + bk.h / 2, bk.color);
      // Chance to drop item
      const cfg = DIFFICULTY_CONFIGS[this.ageGroup];
      if (Math.random() < cfg.powerUpRate) {
        this.spawnFallingItem(bk.x + bk.w / 2, bk.y + bk.h / 2);
      }
    }
  }

  private updateFallingItems() {
    const toRemove: number[] = [];
    for (const it of this.fallingItems) {
      it.y += it.vy;
      it.rotation += 0.04;
      // Paddle catch
      const pd = this.paddle;
      if (it.y + it.size / 2 >= pd.y && it.y - it.size / 2 <= pd.y + pd.h
          && it.x > pd.x && it.x < pd.x + pd.w) {
        this.collectItem(it);
        toRemove.push(it.id);
        continue;
      }
      if (it.y > this.H + 30) toRemove.push(it.id);
    }
    this.fallingItems = this.fallingItems.filter(it => !toRemove.includes(it.id));
  }

  private collectItem(it: FallingItem) {
    if (it.type === 'powerup' && it.powerupType) {
      this.applyPowerUp(it.powerupType);
      this.addFloatText(POWERUP_DEFINITIONS[it.powerupType].label, it.x, it.y, it.color);
    } else {
      const def = COLLECTIBLE_DEFINITIONS[it.type as CollectibleType];
      if (def.value.gold)  { /* gold tracked in GameResult */ }
      if (def.value.xp)    { /* xp tracked via score bonus */ }
      if (def.value.lives) { this.lives = Math.min(this.maxLives + 1, this.lives + 1); this.onLivesChange(this.lives); }
      switch (it.type) {
        case 'coin':    this.coinsCollected++;    break;
        case 'star':    this.starsCollected++;    break;
        case 'diamond': this.diamondsCollected++; break;
      }
      this.addFloatText(it.emoji + ' +' + (def.value.gold ?? def.value.xp ?? '❤️'), it.x, it.y - 10, it.color);
    }
    this.spawnCollectParticles(it.x, it.y, it.color);
  }

  private applyPowerUp(type: PowerUpType) {
    const def = POWERUP_DEFINITIONS[type];
    // Remove existing same type
    this.activePowerUps = this.activePowerUps.filter(p => p.type !== type);
    this.activePowerUps.push({ type, framesLeft: def.duration });

    const cfg = DIFFICULTY_CONFIGS[this.ageGroup];
    switch (type) {
      case 'wide':
        this.paddle.w = this.s(cfg.paddleWidth) * 1.7;
        this.paddle.wide = true;
        break;
      case 'multiball':
        if (this.balls.length < 4) {
          const ref = this.balls[0];
          if (ref) {
            for (let i = 0; i < 2; i++) this.spawnBall({ ...ref.pos });
          }
        }
        break;
      case 'laser':
        this.paddle.laser = true;
        break;
      case 'slow':
        for (const b of this.balls) {
          const spd = Math.hypot(b.vel.x, b.vel.y);
          const factor = 0.6;
          b.vel.x = (b.vel.x / spd) * spd * factor;
          b.vel.y = (b.vel.y / spd) * spd * factor;
        }
        break;
      case 'fireball':
        for (const b of this.balls) { b.fireball = true; b.glowColor = '#fb923c'; }
        break;
    }
  }

  private removePowerUpEffect(type: PowerUpType) {
    const cfg = DIFFICULTY_CONFIGS[this.ageGroup];
    switch (type) {
      case 'wide':
        this.paddle.w = this.s(cfg.paddleWidth);
        this.paddle.wide = false;
        break;
      case 'laser':
        this.paddle.laser = false;
        break;
      case 'slow': {
        for (const b of this.balls) {
          const spd = Math.hypot(b.vel.x, b.vel.y);
          const target = (cfg.ballSpeed + (this.level - 1) * cfg.ballSpeedIncrement)
                         * Math.min(this.scaleX, this.scaleY);
          if (spd > 0) {
            b.vel.x = (b.vel.x / spd) * target;
            b.vel.y = (b.vel.y / spd) * target;
          }
        }
        break;
      }
      case 'fireball':
        for (const b of this.balls) { b.fireball = false; }
        break;
    }
  }

  private endGame(_won: boolean) {
    const multiplier = calculateMultiplier(this.bricksDestroyed, this.ageGroup);
    // Gewonnen = Multiplikator >= 1.0 (genug Bricks zerstoert um Einsatz zurueckzubekommen)
    const won = multiplier >= 1.0;
    this.gamePhase = won ? 'win' : 'gameover';

    // XP-Berechnung:
    // multiplier 0: alles verloren → -betAmount
    // multiplier 1.0: Einsatz zurueck → 0
    // multiplier 1.5: 50% Gewinn → +0.5 * betAmount
    // multiplier 3.0: 200% Gewinn → +2 * betAmount
    const xpWon = multiplier > 0
      ? Math.floor(this.betAmount * multiplier) - this.betAmount
      : -this.betAmount;

    const goldWon = this.coinsCollected * 10
                  + this.diamondsCollected * 100
                  + this.starsCollected * 5;
    const result: GameResult = {
      won,
      distance: this.bricksDestroyed,
      multiplier,
      xpBet: this.betAmount,
      xpWon,
      goldWon,
      coinsCollected: this.coinsCollected,
      starsCollected: this.starsCollected,
      diamondsCollected: this.diamondsCollected,
    };
    setTimeout(() => this.onGameEnd(result), 1800);
  }

  // ── PARTICLES / EFFECTS ─────────────────────

  private mkStars() {
    this.stars = Array.from({ length: 40 }, () => ({
      x: Math.random() * this.W,
      y: Math.random() * this.H,
      r: Math.random() * 1.4 + 0.2,
      speed: Math.random() * 0.18 + 0.04,
      alpha: Math.random() * 0.5 + 0.12,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.024 + 0.008,
    }));
  }

  private spawnBrickParticles(bk: Brick) {
    const cx = bk.x + bk.w / 2, cy = bk.y + bk.h / 2;
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI * 2 * i / 6) + Math.random() * 0.5;
      const s = this.s(1.8 + Math.random() * 3.5);
      this.particles.push({
        x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s - this.s(0.5),
        r: this.s(2.5 + Math.random() * 2.5), maxR: this.s(3),
        color: bk.color, life: 0, maxLife: 30 + Math.random() * 15,
        gravity: this.s(0.06), spark: false,
      });
    }
    for (let i = 0; i < 2; i++) {
      this.particles.push({
        x: cx + (Math.random() - 0.5) * bk.w,
        y: cy + (Math.random() - 0.5) * bk.h,
        vx: (Math.random() - 0.5) * this.s(2),
        vy: -this.s(1.5 + Math.random() * 2),
        r: this.s(1.5), maxR: this.s(1.5),
        color: '#fff', life: 0, maxLife: 14 + Math.random() * 6,
        gravity: this.s(0.05), spark: true,
      });
    }
    this.shakeMag = Math.max(this.shakeMag, 4);
    if (this.particles.length > 120) this.particles.splice(0, this.particles.length - 80);
  }

  private spawnPaddleSparks(bx: number, py: number, color: string) {
    for (let i = 0; i < 2; i++) {
      this.particles.push({
        x: bx + (Math.random() - 0.5) * this.s(20),
        y: py,
        vx: (Math.random() - 0.5) * this.s(2),
        vy: -this.s(1.2 + Math.random() * 2),
        r: this.s(2), maxR: this.s(2),
        color, life: 0, maxLife: 14, gravity: this.s(0.08), spark: true,
      });
    }
  }

  private spawnCollectParticles(x: number, y: number, color: string) {
    for (let i = 0; i < 4; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = this.s(1.5 + Math.random() * 3);
      this.particles.push({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        r: this.s(2.5), maxR: this.s(2.5),
        color, life: 0, maxLife: 28 + Math.random() * 12, gravity: this.s(0.04), spark: false,
      });
    }
  }

  private spawnDeathParticles(x: number, y: number) {
    for (let i = 0; i < 10; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = this.s(1 + Math.random() * 4);
      this.particles.push({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - this.s(1),
        r: this.s(3 + Math.random() * 3), maxR: this.s(4),
        color: '#f87171', life: 0, maxLife: 50 + Math.random() * 20, gravity: this.s(0.06), spark: false,
      });
    }
  }

  private spawnLevelUpParticles() {
    for (let i = 0; i < 15; i++) {
      const colors = ['#fbbf24','#c084fc','#22d3ee','#4ade80','#f87171'];
      const a = Math.random() * Math.PI * 2;
      const s = this.s(1.5 + Math.random() * 5);
      this.particles.push({
        x: this.W / 2, y: this.H / 2,
        vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        r: this.s(3 + Math.random() * 3), maxR: this.s(4),
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0, maxLife: 60 + Math.random() * 40, gravity: this.s(0.04), spark: false,
      });
    }
  }

  private updateParticles() {
    this.particles = this.particles.filter(p => p.life < p.maxLife);
    for (const p of this.particles) {
      p.x += p.vx; p.y += p.vy; p.vy += p.gravity;
      p.vx *= 0.97; p.life++;
      if (!p.spark) p.r = Math.max(0.1, p.r * 0.985);
    }
  }

  private updateFloatTexts() {
    this.floatTexts = this.floatTexts.filter(t => t.life < t.maxLife);
    for (const t of this.floatTexts) {
      t.y += t.vy; t.life++;
      t.alpha = 1 - t.life / t.maxLife;
    }
  }

  private spawnFallingItem(x: number, y: number) {
    if (Math.random() < 0.35) {
      // Collectible
      const types: CollectibleType[] = ['coin','star','diamond','heart'];
      const weights = [0.55, 0.25, 0.08, 0.12];
      const total = weights.reduce((a,b) => a+b, 0);
      let r = Math.random() * total;
      let type: CollectibleType = 'coin';
      for (let i = 0; i < types.length; i++) { r -= weights[i]; if (r <= 0) { type = types[i]; break; } }
      const def = COLLECTIBLE_DEFINITIONS[type];
      this.fallingItems.push({
        id: this.nextId++, x, y,
        vy: this.s(1.8 + Math.random() * 0.8),
        type, color: def.color, emoji: def.emoji,
        size: this.s(def.size), rotation: 0,
      });
    } else {
      // PowerUp
      const ptype = getRandomPowerUpType();
      const def   = POWERUP_DEFINITIONS[ptype];
      this.fallingItems.push({
        id: this.nextId++, x, y,
        vy: this.s(1.5 + Math.random() * 0.8),
        type: 'powerup', powerupType: ptype,
        color: def.color, emoji: def.emoji,
        size: this.s(28), rotation: 0,
      });
    }
  }

  private addFloatText(text: string, x: number, y: number, color: string) {
    this.floatTexts.push({
      x, y, text, color,
      vy: -1.2, life: 0, maxLife: 55, alpha: 1,
    });
    if (this.floatTexts.length > 20) this.floatTexts.splice(0, this.floatTexts.length - 18);
  }

  // ── DRAW ────────────────────────────────────

  private draw() {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(this.shakeX, this.shakeY);

    this.drawBackground();
    this.drawStars();
    this.drawBricks();
    this.drawLasers();
    this.drawFallingItems();
    this.drawParticles();
    this.drawBalls();
    this.drawPaddle();
    this.drawFloatTexts();
    this.drawFlash();
    this.drawHUD();
    this.drawPhaseOverlay();

    ctx.restore();
  }

  private drawBackground() {
    // Hintergrund einmal rendern und cachen
    if (!this.bgCanvas) {
      this.bgCanvas = document.createElement('canvas');
      this.bgCanvas.width = this.W;
      this.bgCanvas.height = this.H;
      const bgCtx = this.bgCanvas.getContext('2d')!;

      const grad = bgCtx.createLinearGradient(0, 0, 0, this.H);
      grad.addColorStop(0, '#030316');
      grad.addColorStop(1, '#04030f');
      bgCtx.fillStyle = grad;
      bgCtx.fillRect(0, 0, this.W, this.H);

      // Nebulae
      const neb = [
        [this.W * 0.25, this.H * 0.28, this.W * 0.4, 'rgba(80,30,180,.07)'],
        [this.W * 0.8,  this.H * 0.55, this.W * 0.35, 'rgba(0,90,170,.07)'],
        [this.W * 0.5,  this.H * 0.85, this.W * 0.2,  'rgba(251,191,36,.04)'],
      ] as Array<[number,number,number,string]>;
      for (const [nx, ny, nr, nc] of neb) {
        const ng = bgCtx.createRadialGradient(nx, ny, 0, nx, ny, nr);
        ng.addColorStop(0, nc); ng.addColorStop(1, 'transparent');
        bgCtx.fillStyle = ng; bgCtx.fillRect(0, 0, this.W, this.H);
      }
    }
    this.ctx.drawImage(this.bgCanvas, 0, 0);
  }

  private drawStars() {
    const ctx = this.ctx;
    for (const s of this.stars) {
      ctx.globalAlpha = s.alpha * (0.5 + 0.5 * Math.sin(s.twinkle));
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  private drawBricks() {
    const ctx = this.ctx;

    // Debug: zeige Brick-Bereich beim ersten Frame
    if (this.frameCount <= 1 && this.bricks.length > 0) {
      const b0 = this.bricks[0];
      console.log('[BrickBreaker] Canvas:', this.W, 'x', this.H,
        '| Bricks:', this.bricks.filter(b => b.alive).length,
        '| First brick at:', Math.round(b0.x), Math.round(b0.y),
        'size:', Math.round(b0.w), 'x', Math.round(b0.h));
    }

    for (const bk of this.bricks) {
      if (!bk.alive) continue;

      const bx = bk.x + 1;
      const by = bk.y + 1;
      const bw = bk.w - 2;
      const bh = bk.h - 2;
      if (bw <= 0 || bh <= 0) continue;

      ctx.save();

      const flashing = bk.hitFlash > 0;

      // Brick-Koerper — flat color (schneller als Gradient pro Frame)
      ctx.fillStyle = flashing ? '#fff' : bk.color;

      // Rounded rect mit Canvas-nativem roundRect (besser als custom rrect)
      const rad = Math.min(this.s(4), bw / 2, bh / 2);
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(bx, by, bw, bh, rad);
      } else {
        // Fallback: normales Rect
        ctx.rect(bx, by, bw, bh);
      }
      ctx.fill();

      // Top highlight
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#fff';
      const hlH = Math.min(this.s(3), bh * 0.3);
      ctx.fillRect(bx + 2, by + 1, bw - 4, hlH);

      // Crack overlay for multi-HP bricks
      if (bk.maxHp > 1 && bk.hp < bk.maxHp) {
        ctx.globalAlpha = 0.6;
        ctx.strokeStyle = 'rgba(0,0,0,.55)';
        ctx.lineWidth = Math.max(1, this.s(1.5));
        const segments = bk.maxHp - bk.hp;
        for (let i = 0; i < segments; i++) {
          ctx.beginPath();
          ctx.moveTo(bx + bw * 0.2 + i * 8, by + 2);
          ctx.lineTo(bx + bw * 0.6 + i * 8, by + bh - 2);
          ctx.stroke();
        }
      }

      ctx.restore();
    }
  }

  private drawLasers() {
    const ctx = this.ctx;
    for (const lb of this.laserBeams) {
      const a = 1 - lb.life / lb.maxLife;
      ctx.globalAlpha = a;
      ctx.fillStyle = '#fca5a5';
      ctx.fillRect(lb.x - this.s(2), lb.y, this.s(4), this.s(14));
      ctx.fillStyle = '#fff';
      ctx.fillRect(lb.x - this.s(1), lb.y + this.s(2), this.s(2), this.s(10));
    }
    ctx.globalAlpha = 1;
  }

  private drawFallingItems() {
    const ctx = this.ctx;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const it of this.fallingItems) {
      ctx.save();
      ctx.translate(it.x, it.y);
      ctx.rotate(it.rotation);
      // Background glow circle
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = it.color;
      ctx.beginPath();
      ctx.arc(0, 0, it.size * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.font = `${it.size * 0.72}px serif`;
      ctx.fillText(it.emoji, 0, 0);
      ctx.restore();
    }
    ctx.restore();
  }

  private drawParticles() {
    const ctx = this.ctx;
    for (const p of this.particles) {
      const a = (1 - p.life / p.maxLife) * 0.88;
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.2, p.r), 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  private drawBalls() {
    const ctx = this.ctx;
    for (const ball of this.balls) {
      // Trail
      for (let i = 0; i < ball.trail.length; i++) {
        const t = ball.trail[i];
        const prog = (ball.trail.length - i) / ball.trail.length;
        ctx.globalAlpha = prog * 0.35;
        ctx.fillStyle = ball.glowColor;
        ctx.beginPath();
        ctx.arc(t.x, t.y, ball.radius * prog * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Outer glow (ohne shadowBlur — groesserer transluzenter Kreis)
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = ball.fireball ? '#fb923c' : ball.glowColor;
      ctx.beginPath();
      ctx.arc(ball.pos.x, ball.pos.y, ball.radius + this.s(8), 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Ball body
      const rg = ctx.createRadialGradient(
        ball.pos.x - ball.radius * 0.3, ball.pos.y - ball.radius * 0.3, 0,
        ball.pos.x, ball.pos.y, ball.radius,
      );
      if (ball.fireball) {
        rg.addColorStop(0, '#fff'); rg.addColorStop(0.4, '#fef3c7'); rg.addColorStop(1, '#fb923c');
      } else {
        rg.addColorStop(0, '#fff'); rg.addColorStop(0.45, '#e4f8ff'); rg.addColorStop(1, ball.glowColor);
      }
      ctx.fillStyle = rg;
      ctx.beginPath(); ctx.arc(ball.pos.x, ball.pos.y, ball.radius, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }

  private drawPaddle() {
    const ctx = this.ctx;
    const pd = this.paddle;
    ctx.save();

    const grad = ctx.createLinearGradient(pd.x, pd.y, pd.x, pd.y + pd.h);
    if (pd.laser) {
      grad.addColorStop(0, '#fecaca'); grad.addColorStop(0.38,'#f87171');
      grad.addColorStop(0.74,'#dc2626'); grad.addColorStop(1,'#7f1d1d');
    } else if (pd.wide) {
      grad.addColorStop(0,'#d1fae5'); grad.addColorStop(0.38,'#4ade80');
      grad.addColorStop(0.74,'#16a34a'); grad.addColorStop(1,'#052e16');
    } else {
      grad.addColorStop(0, '#fef3c7'); grad.addColorStop(0.38,'#fbbf24');
      grad.addColorStop(0.74,'#f59e0b'); grad.addColorStop(1,'#92400e');
    }
    ctx.fillStyle = grad;
    this.rrect(ctx, pd.x, pd.y, pd.w, pd.h, pd.h / 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 0.4; ctx.fillStyle = '#fff';
    this.rrect(ctx, pd.x + this.s(4), pd.y + this.s(2), pd.w - this.s(8), this.s(4), this.s(2));
    ctx.fill();
    ctx.restore();
  }

  private drawFloatTexts() {
    const ctx = this.ctx;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = `700 ${this.s(12)}px 'Orbitron', 'Courier New', monospace`;
    for (const t of this.floatTexts) {
      ctx.globalAlpha = t.alpha;
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.globalAlpha = 1; ctx.restore();
  }

  private drawFlash() {
    if (this.flashAlpha <= 0) return;
    this.ctx.globalAlpha = this.flashAlpha;
    this.ctx.fillStyle = '#ef4444';
    this.ctx.fillRect(0, 0, this.W, this.H);
    this.ctx.globalAlpha = 1;
  }

  private drawHUD() {
    const ctx = this.ctx;
    // PowerUp indicators at bottom
    const pus = this.activePowerUps;
    if (pus.length === 0) return;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = `700 ${this.s(9)}px 'Orbitron','Courier New',monospace`;
    pus.forEach((pu, i) => {
      const def = POWERUP_DEFINITIONS[pu.type];
      const x = this.W / 2 + (i - (pus.length - 1) / 2) * this.s(52);
      const y = this.H - this.s(18);
      const prog = pu.framesLeft / def.duration;
      // Background bar
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = 'rgba(0,0,0,.5)';
      this.rrect(ctx, x - this.s(20), y - this.s(12), this.s(40), this.s(14), this.s(4));
      ctx.fill();
      // Progress bar
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = def.color;
      this.rrect(ctx, x - this.s(20), y - this.s(12), this.s(40) * prog, this.s(14), this.s(4));
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff';
      ctx.fillText(`${def.emoji}`, x, y);
    });
    ctx.restore();
  }

  private drawPhaseOverlay() {
    const ctx = this.ctx;
    if (this.gamePhase === 'countdown') {
      const val = this.countdownValue;
      const pulse = 0.7 + 0.3 * Math.sin(this.frameCount * 0.18);
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = 'rgba(0,0,0,.6)';
      ctx.fillRect(0, 0, this.W, this.H);
      ctx.globalAlpha = pulse;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = `900 ${this.s(90)}px 'Orbitron','Courier New',monospace`;
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`${val}`, this.W / 2, this.H / 2);
      ctx.restore();
    }
    if (this.gamePhase === 'levelup') {
      ctx.save();
      const pulse = 0.9 + 0.1 * Math.sin(this.frameCount * 0.2);
      ctx.globalAlpha = 0.65 * pulse;
      ctx.fillStyle = 'rgba(0,0,0,.55)';
      ctx.fillRect(0, 0, this.W, this.H);
      ctx.globalAlpha = pulse;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = `900 ${this.s(22)}px 'Orbitron','Courier New',monospace`;
      ctx.fillStyle = '#c084fc';
      ctx.fillText('LEVEL COMPLETE!', this.W / 2, this.H / 2 - this.s(15));
      ctx.font = `700 ${this.s(14)}px 'Orbitron','Courier New',monospace`;
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`→ LEVEL ${this.level + 1}`, this.W / 2, this.H / 2 + this.s(18));
      ctx.restore();
    }
  }

  // ── HELPERS ─────────────────────────────────

  private rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    if (w <= 0 || h <= 0) { ctx.beginPath(); return; }
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);     ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);     ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);         ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  private lighten(hex: string, amt: number): string {
    const n = parseInt(hex.replace('#',''), 16);
    const r = Math.min(255, (n >> 16) + amt);
    const g = Math.min(255, ((n >> 8) & 255) + amt);
    const b = Math.min(255, (n & 255) + amt);
    return `rgb(${r},${g},${b})`;
  }

  private darken(hex: string, amt: number): string {
    const n = parseInt(hex.replace('#',''), 16);
    const r = Math.max(0, (n >> 16) - amt);
    const g = Math.max(0, ((n >> 8) & 255) - amt);
    const b = Math.max(0, (n & 255) - amt);
    return `rgb(${r},${g},${b})`;
  }

  // ── PUBLIC ACCESSORS ────────────────────────

  public getScore()           { return this.score; }
  public getLives()           { return this.lives; }
  public getLevel()           { return this.level; }
  public getBricksDestroyed() { return this.bricksDestroyed; }
  public getGamePhase()       { return this.gamePhase; }
}

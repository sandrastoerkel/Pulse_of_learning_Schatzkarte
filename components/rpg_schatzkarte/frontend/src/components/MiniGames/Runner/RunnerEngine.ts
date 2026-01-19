// ============================================
// RUNNER ENGINE
// Game Loop, Physik, Kollisionen, Spawning
// Läuft außerhalb von React für Performance
// ============================================

import {
  AgeGroup,
  DifficultyConfig,
  DIFFICULTY_CONFIGS,
  CANVAS_CONFIG,
  PLAYER_CONFIG,
  GROUND_CONFIG,
  BACKGROUND_LAYERS,
  ObstacleType,
  ObstacleDefinition,
  OBSTACLE_DEFINITIONS,
  CollectibleType,
  CollectibleDefinition,
  COLLECTIBLE_DEFINITIONS,
  PowerUpType,
  PowerUpDefinition,
  POWERUP_DEFINITIONS,
  getRandomObstacleType,
  getRandomCollectibleType,
  getRandomPowerUpType,
  calculateObstacleGap,
  calculateMultiplier,
  getNextMilestone,
  BackgroundLayer
} from './RunnerAssets';

import { AvatarSprites, PlayerAnimationState } from './RunnerAvatarRenderer';
import { getSoundManager } from './RunnerSoundManager';

// === TYPEN ===

export type GameStatus = 'idle' | 'countdown' | 'playing' | 'paused' | 'won' | 'lost';

interface Player {
  x: number;
  y: number;
  vy: number;                 // Vertikale Geschwindigkeit
  width: number;
  height: number;
  state: PlayerAnimationState;
  isGrounded: boolean;
  animationFrame: number;
  animationTimer: number;
  invincibleTimer: number;    // Nach Schaden kurz unverwundbar
}

interface Obstacle {
  id: number;
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  definition: ObstacleDefinition;
  animationFrame: number;
}

interface Collectible {
  id: number;
  type: CollectibleType;
  x: number;
  y: number;
  size: number;
  definition: CollectibleDefinition;
  collected: boolean;
  animationPhase: number;
}

interface BackgroundObject {
  layerId: string;
  x: number;
  emoji: string;
  width: number;
  height: number;
  yOffset: number;
}

// === PARTICLE SYSTEM ===

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'dust' | 'spark' | 'star' | 'trail' | 'explosion';
}

// === SCORE POPUP ===

interface ScorePopup {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  scale: number;
  life: number;
}

// === POWER-UP ===

interface PowerUp {
  id: number;
  type: PowerUpType;
  x: number;
  y: number;
  size: number;
  definition: PowerUpDefinition;
  collected: boolean;
  animationPhase: number;
}

// === ACTIVE EFFECTS ===

interface ActiveEffect {
  type: PowerUpType;
  remainingTime: number;
  maxTime: number;
}

export interface GameState {
  status: GameStatus;
  distance: number;
  speed: number;
  score: number;
  lives: number;
  maxLives: number;
  coinsCollected: number;
  goldEarned: number;
  starsCollected: number;
  xpEarned: number;
  diamondsCollected: number;
  heartsCollected: number;
  currentMultiplier: number;
  nextMilestone: number | null;
  betAmount: number;
}

export interface GameResult {
  won: boolean;
  distance: number;
  multiplier: number;
  xpBet: number;
  xpWon: number;
  goldWon: number;
  coinsCollected: number;
  starsCollected: number;
  diamondsCollected: number;
}

type GameStateCallback = (state: GameState) => void;
type GameEndCallback = (result: GameResult) => void;

// === OBJECT POOL ===

class ObjectPool<T extends { id: number }> {
  private pool: T[] = [];
  private nextId: number = 0;

  acquire(factory: (id: number) => T): T {
    const obj = this.pool.pop() || factory(this.nextId++);
    return obj;
  }

  release(obj: T): void {
    this.pool.push(obj);
  }

  clear(): void {
    this.pool = [];
  }
}

// === RUNNER ENGINE KLASSE ===

export class RunnerEngine {
  // Canvas & Rendering
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private scale: number;

  // Sprites
  private avatarSprites: AvatarSprites;

  // Konfiguration
  private ageGroup: AgeGroup;
  private config: DifficultyConfig;
  private betAmount: number;

  // Spielzustand
  private status: GameStatus = 'idle';
  private player: Player;
  private obstacles: Obstacle[] = [];
  private collectibles: Collectible[] = [];
  private backgroundObjects: Map<string, BackgroundObject[]> = new Map();

  // Metriken
  private distance: number = 0;
  private speed: number = 0;
  private lives: number = 0;
  private coinsCollected: number = 0;
  private goldEarned: number = 0;
  private starsCollected: number = 0;
  private xpEarned: number = 0;
  private diamondsCollected: number = 0;
  private heartsCollected: number = 0;

  // Spawning
  private nextObstacleX: number = 0;
  private nextCollectibleX: number = 0;
  private obstaclePool: ObjectPool<Obstacle> = new ObjectPool();
  private collectiblePool: ObjectPool<Collectible> = new ObjectPool();

  // Timing
  private animationId: number = 0;
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private passedMilestones: Set<number> = new Set();

  // Sound
  private soundManager = getSoundManager();

  // Callbacks
  private onStateChange: GameStateCallback | null = null;
  private onGameEnd: GameEndCallback | null = null;

  // === NEUE COOLE FEATURES ===

  // Partikel-System
  private particles: Particle[] = [];

  // Score Popups
  private scorePopups: ScorePopup[] = [];

  // Power-Ups
  private powerUps: PowerUp[] = [];
  private activeEffects: Map<PowerUpType, ActiveEffect> = new Map();
  private nextPowerUpX: number = 0;

  // Combo-System
  private combo: number = 0;
  private comboTimer: number = 0;
  private maxCombo: number = 0;

  // Screen Shake
  private shakeIntensity: number = 0;
  private shakeDecay: number = 0.9;

  // Flash-Effekt
  private flashAlpha: number = 0;
  private flashColor: string = '#FFFFFF';

  // Tag/Nacht-Zyklus (basiert auf Distanz)
  private timeOfDay: number = 0; // 0 = Morgen, 0.5 = Mittag, 1 = Nacht

  // Speed Lines
  private speedLines: Array<{x: number; y: number; length: number; alpha: number}> = [];

  constructor(
    canvas: HTMLCanvasElement,
    avatarSprites: AvatarSprites,
    ageGroup: AgeGroup,
    betAmount: number
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.avatarSprites = avatarSprites;
    this.ageGroup = ageGroup;
    this.config = DIFFICULTY_CONFIGS[ageGroup];
    this.betAmount = betAmount;

    // Canvas-Größe anpassen
    this.width = CANVAS_CONFIG.width;
    this.height = CANVAS_CONFIG.height;
    
    // Retina-Support
    const dpr = window.devicePixelRatio || 1;
    this.scale = dpr;
    canvas.width = this.width * dpr;
    canvas.height = this.height * dpr;
    canvas.style.width = `${this.width}px`;
    canvas.style.height = `${this.height}px`;
    this.ctx.scale(dpr, dpr);

    // Spieler initialisieren
    this.player = this.createPlayer();

    // Hintergrund initialisieren
    this.initializeBackground();
  }

  /**
   * Erstellt den Spieler
   */
  private createPlayer(): Player {
    return {
      x: CANVAS_CONFIG.playerX,
      y: CANVAS_CONFIG.groundY - PLAYER_CONFIG.height,
      vy: 0,
      width: PLAYER_CONFIG.width,
      height: PLAYER_CONFIG.height,
      state: 'running',
      isGrounded: true,
      animationFrame: 0,
      animationTimer: 0,
      invincibleTimer: 0
    };
  }

  /**
   * Initialisiert Hintergrund-Objekte
   */
  private initializeBackground(): void {
    for (const layer of BACKGROUND_LAYERS) {
      const objects: BackgroundObject[] = [];
      
      // Initiale Objekte für die gesamte Canvas-Breite + Puffer
      for (let x = 0; x < this.width + 200; x += 100) {
        for (const element of layer.elements) {
          if (Math.random() < element.frequency) {
            objects.push({
              layerId: layer.id,
              x: x + Math.random() * 50,
              emoji: element.emoji,
              width: element.width,
              height: element.height,
              yOffset: element.yOffset + (Math.random() - 0.5) * 20
            });
          }
        }
      }
      
      this.backgroundObjects.set(layer.id, objects);
    }
  }

  /**
   * Setzt Callbacks
   */
  setCallbacks(onStateChange: GameStateCallback, onGameEnd: GameEndCallback): void {
    this.onStateChange = onStateChange;
    this.onGameEnd = onGameEnd;
  }

  /**
   * Startet das Spiel mit Countdown
   */
  start(): void {
    console.log('[RunnerEngine] start() called');
    this.reset();
    this.status = 'countdown';
    this.emitState();

    // Sound-Manager muss initialisiert sein
    console.log('[RunnerEngine] Calling playCountdown...');
    this.soundManager.playCountdown(() => {
      console.log('[RunnerEngine] playCountdown callback - starting game loop!');
      this.status = 'playing';
      this.lastFrameTime = performance.now();
      this.gameLoop();
    });
  }

  /**
   * Setzt das Spiel zurück
   */
  private reset(): void {
    this.player = this.createPlayer();
    this.obstacles = [];
    this.collectibles = [];
    this.distance = 0;
    this.speed = this.config.initialSpeed;
    this.lives = this.config.startLives;
    this.coinsCollected = 0;
    this.goldEarned = 0;
    this.starsCollected = 0;
    this.xpEarned = 0;
    this.diamondsCollected = 0;
    this.heartsCollected = 0;
    this.frameCount = 0;
    this.passedMilestones.clear();
    this.nextObstacleX = this.width + 200;
    this.nextCollectibleX = this.width + 100;

    this.obstaclePool.clear();
    this.collectiblePool.clear();

    // Neue Features zurücksetzen
    this.particles = [];
    this.scorePopups = [];
    this.powerUps = [];
    this.activeEffects.clear();
    this.nextPowerUpX = this.width + 500;
    this.combo = 0;
    this.comboTimer = 0;
    this.maxCombo = 0;
    this.shakeIntensity = 0;
    this.flashAlpha = 0;
    this.timeOfDay = 0;
    this.speedLines = [];
  }

  /**
   * Haupt-Game-Loop
   */
  private gameLoop = (): void => {
    if (this.status !== 'playing') {
      console.log('[RunnerEngine] gameLoop skipped - status:', this.status);
      return;
    }

    // Log nur alle 60 Frames (ca. 1 Sekunde)
    if (this.frameCount % 60 === 0) {
      console.log('[RunnerEngine] gameLoop running, distance:', Math.floor(this.distance));
    }

    const now = performance.now();
    const deltaTime = Math.min((now - this.lastFrameTime) / 16.67, 2); // Max 2 Frames überspringen
    this.lastFrameTime = now;

    this.update(deltaTime);
    this.render();
    this.emitState();

    this.animationId = requestAnimationFrame(this.gameLoop);
  }

  /**
   * Update-Logik
   */
  private update(deltaTime: number): void {
    this.frameCount++;

    // Slowmo-Effekt anwenden
    let effectiveDelta = deltaTime;
    if (this.activeEffects.has('slowmo')) {
      effectiveDelta *= 0.5;
    }

    // 1. Geschwindigkeit erhöhen
    this.updateSpeed();

    // 2. Distanz erhöhen
    this.distance += this.speed * effectiveDelta * 0.1;

    // 3. Tag/Nacht-Zyklus
    this.timeOfDay = Math.min((this.distance / 1000) % 1, 1);

    // 4. Milestone prüfen
    this.checkMilestones();

    // 5. Spieler-Physik
    this.updatePlayer(effectiveDelta);

    // 6. Hindernisse
    this.updateObstacles(effectiveDelta);
    this.spawnObstacles();

    // 7. Collectibles
    this.updateCollectibles(effectiveDelta);
    this.spawnCollectibles();

    // 8. Power-Ups
    this.updatePowerUps(effectiveDelta);
    this.spawnPowerUps();
    this.updateActiveEffects();

    // 9. Kollisionen
    this.checkCollisions();

    // 10. Hintergrund
    this.updateBackground(effectiveDelta);

    // 11. Partikel & Effekte
    this.updateParticles(deltaTime);
    this.updateScorePopups(deltaTime);
    this.updateScreenEffects(deltaTime);
    this.updateSpeedLines(effectiveDelta);
    this.updateCombo(deltaTime);

    // 12. Laufpartikel spawnen
    if (this.player.isGrounded && this.player.state === 'running') {
      if (this.frameCount % 8 === 0) {
        this.spawnDustParticle();
      }
    }

    // 13. Leben prüfen
    if (this.lives <= 0) {
      this.endGame(false);
    }
  }

  /**
   * Aktualisiert die Geschwindigkeit
   */
  private updateSpeed(): void {
    // Geschwindigkeit steigt alle 100m
    const speedLevel = Math.floor(this.distance / 100);
    const targetSpeed = Math.min(
      this.config.initialSpeed + speedLevel * this.config.speedIncrement,
      this.config.maxSpeed
    );
    
    // Sanfter Übergang
    this.speed += (targetSpeed - this.speed) * 0.02;
  }

  /**
   * Prüft Milestone-Erreichung
   */
  private checkMilestones(): void {
    const milestones = Object.keys(this.config.distanceMultipliers).map(Number);

    for (const milestone of milestones) {
      if (this.distance >= milestone && !this.passedMilestones.has(milestone)) {
        this.passedMilestones.add(milestone);
        this.soundManager.play('milestone');

        // Epic Milestone-Effekte!
        this.triggerScreenShake(6);
        this.flashColor = '#FFD700';
        this.flashAlpha = 0.3;

        // Konfetti-Explosion
        for (let i = 0; i < 30; i++) {
          const colors = ['#FFD700', '#FF6B6B', '#4ADE80', '#60A5FA', '#A855F7'];
          this.particles.push({
            x: this.width / 2 + (Math.random() - 0.5) * 200,
            y: this.height / 2,
            vx: (Math.random() - 0.5) * 10,
            vy: -5 - Math.random() * 8,
            size: 4 + Math.random() * 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 1,
            life: 80,
            maxLife: 80,
            type: 'explosion'
          });
        }

        // Großes Score-Popup
        const multiplier = this.config.distanceMultipliers[milestone];
        this.addScorePopup(
          this.width / 2,
          this.height / 2 - 50,
          `${milestone}m - x${multiplier}!`,
          '#FFD700'
        );
      }
    }
  }

  /**
   * Aktualisiert den Spieler
   */
  private updatePlayer(deltaTime: number): void {
    // Gravitation
    if (!this.player.isGrounded) {
      this.player.vy += CANVAS_CONFIG.gravity * deltaTime;
      this.player.y += this.player.vy * deltaTime;

      // Boden-Kollision
      const groundLevel = CANVAS_CONFIG.groundY - this.player.height;
      if (this.player.y >= groundLevel) {
        this.player.y = groundLevel;
        this.player.vy = 0;
        this.player.isGrounded = true;
        
        if (this.player.state === 'jumping' || this.player.state === 'falling') {
          this.player.state = 'running';
        }
      }

      // Fallend wenn Geschwindigkeit positiv
      if (this.player.vy > 2 && this.player.state === 'jumping') {
        this.player.state = 'falling';
      }
    }

    // Lauf-Animation
    if (this.player.state === 'running') {
      this.player.animationTimer += deltaTime * (this.speed / 5);
      if (this.player.animationTimer >= 1) {
        this.player.animationTimer = 0;
        this.player.animationFrame = (this.player.animationFrame + 1) % 4;
      }
    }

    // Unverwundbarkeits-Timer
    if (this.player.invincibleTimer > 0) {
      this.player.invincibleTimer -= deltaTime;
    }
  }

  /**
   * Spieler springt
   */
  jump(): void {
    if (this.status !== 'playing') return;
    
    if (this.player.isGrounded && this.player.state !== 'ducking') {
      this.player.vy = -CANVAS_CONFIG.jumpForce;
      this.player.isGrounded = false;
      this.player.state = 'jumping';
      this.soundManager.play('jump');
    }
  }

  /**
   * Spieler duckt sich
   */
  duck(): void {
    if (this.status !== 'playing') return;
    
    if (this.player.isGrounded && this.player.state !== 'jumping') {
      this.player.state = 'ducking';
      this.player.height = PLAYER_CONFIG.duckHeight;
      this.player.y = CANVAS_CONFIG.groundY - this.player.height;
    }
  }

  /**
   * Spieler hört auf zu ducken
   */
  stopDuck(): void {
    if (this.player.state === 'ducking') {
      this.player.state = 'running';
      this.player.height = PLAYER_CONFIG.height;
      this.player.y = CANVAS_CONFIG.groundY - this.player.height;
    }
  }

  /**
   * Aktualisiert Hindernisse
   */
  private updateObstacles(deltaTime: number): void {
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.x -= this.speed * deltaTime;

      // Animation für animierte Hindernisse
      if (obstacle.definition.animated) {
        obstacle.animationFrame = Math.floor(this.frameCount / 10) % 2;
      }

      // Entfernen wenn außerhalb
      if (obstacle.x + obstacle.width < 0) {
        this.obstaclePool.release(obstacle);
        this.obstacles.splice(i, 1);
      }
    }
  }

  /**
   * Spawnt neue Hindernisse
   */
  private spawnObstacles(): void {
    // Erstes Hindernis nach kurzer Strecke
    if (this.distance < 30) return;

    const rightmostX = this.obstacles.length > 0 
      ? Math.max(...this.obstacles.map(o => o.x + o.width))
      : 0;

    if (rightmostX < this.width + 100) {
      const gap = calculateObstacleGap(this.speed, this.config);
      const spawnX = Math.max(this.width + 50, rightmostX + gap);
      
      const type = getRandomObstacleType(this.distance);
      const definition = OBSTACLE_DEFINITIONS[type];

      const obstacle = this.obstaclePool.acquire((id) => ({
        id,
        type,
        x: 0,
        y: 0,
        width: definition.width,
        height: definition.height,
        definition,
        animationFrame: 0
      }));

      obstacle.type = type;
      obstacle.x = spawnX;
      obstacle.definition = definition;
      obstacle.width = definition.width;
      obstacle.height = definition.height;

      // Y-Position basierend auf Spawn-Typ
      if (definition.spawnY === 'air') {
        obstacle.y = CANVAS_CONFIG.groundY - PLAYER_CONFIG.height - 30;
      } else if (type === 'gap') {
        obstacle.y = CANVAS_CONFIG.groundY;
      } else {
        obstacle.y = CANVAS_CONFIG.groundY - definition.height;
      }

      this.obstacles.push(obstacle);
    }
  }

  /**
   * Aktualisiert Collectibles
   */
  private updateCollectibles(deltaTime: number): void {
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const collectible = this.collectibles[i];
      collectible.x -= this.speed * deltaTime;
      
      // Schwebe-Animation
      collectible.animationPhase += deltaTime * 0.1;

      // Entfernen wenn außerhalb oder gesammelt
      if (collectible.x + collectible.size < 0 || collectible.collected) {
        this.collectiblePool.release(collectible);
        this.collectibles.splice(i, 1);
      }
    }
  }

  /**
   * Spawnt neue Collectibles
   */
  private spawnCollectibles(): void {
    const rightmostX = this.collectibles.length > 0
      ? Math.max(...this.collectibles.map(c => c.x))
      : 0;

    if (rightmostX < this.width && Math.random() < this.config.collectibleDensity * 0.02) {
      const type = getRandomCollectibleType(this.config.heartSpawnRate);
      const definition = COLLECTIBLE_DEFINITIONS[type];

      const collectible = this.collectiblePool.acquire((id) => ({
        id,
        type,
        x: 0,
        y: 0,
        size: definition.size,
        definition,
        collected: false,
        animationPhase: 0
      }));

      collectible.type = type;
      collectible.x = this.width + 50 + Math.random() * 100;
      collectible.definition = definition;
      collectible.size = definition.size;
      collectible.collected = false;
      collectible.animationPhase = Math.random() * Math.PI * 2;

      // Y-Position: oben oder unten zufällig
      const isHigh = Math.random() > 0.5;
      collectible.y = isHigh 
        ? CANVAS_CONFIG.groundY - PLAYER_CONFIG.height - 40 - Math.random() * 30
        : CANVAS_CONFIG.groundY - 50 - Math.random() * 20;

      this.collectibles.push(collectible);
    }
  }

  /**
   * Prüft Kollisionen
   */
  private checkCollisions(): void {
    const playerHitbox = {
      x: this.player.x + PLAYER_CONFIG.hitboxPadding,
      y: this.player.y + PLAYER_CONFIG.hitboxPadding,
      width: this.player.width - PLAYER_CONFIG.hitboxPadding * 2,
      height: this.player.height - PLAYER_CONFIG.hitboxPadding * 2
    };

    // Hindernisse (nur wenn nicht unverwundbar und kein Schild aktiv)
    const isProtected = this.player.invincibleTimer > 0 || this.activeEffects.has('shield');
    if (!isProtected) {
      for (const obstacle of this.obstacles) {
        if (this.checkRectCollision(playerHitbox, obstacle)) {
          this.handleObstacleCollision(obstacle);
          break;
        }
      }
    }

    // Gap/Lücke im Boden
    for (const obstacle of this.obstacles) {
      if (obstacle.type === 'gap' && this.player.isGrounded) {
        if (playerHitbox.x + playerHitbox.width > obstacle.x &&
            playerHitbox.x < obstacle.x + obstacle.width) {
          if (!isProtected) {
            this.handleObstacleCollision(obstacle);
          }
          break;
        }
      }
    }

    // Collectibles
    for (const collectible of this.collectibles) {
      if (!collectible.collected) {
        const collectibleBox = {
          x: collectible.x - collectible.size / 2,
          y: collectible.y - collectible.size / 2,
          width: collectible.size,
          height: collectible.size
        };

        if (this.checkRectCollision(playerHitbox, collectibleBox)) {
          this.handleCollectibleCollision(collectible);
        }
      }
    }

    // Power-Ups
    for (const powerUp of this.powerUps) {
      if (!powerUp.collected) {
        const powerUpBox = {
          x: powerUp.x - powerUp.size / 2,
          y: powerUp.y - powerUp.size / 2,
          width: powerUp.size,
          height: powerUp.size
        };

        if (this.checkRectCollision(playerHitbox, powerUpBox)) {
          this.handlePowerUpCollision(powerUp);
        }
      }
    }
  }

  /**
   * Rechteck-Kollision
   */
  private checkRectCollision(
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number }
  ): boolean {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }

  /**
   * Behandelt Hindernis-Kollision
   */
  private handleObstacleCollision(obstacle: Obstacle): void {
    this.lives--;
    this.soundManager.play('hit');

    // Screen Shake!
    this.triggerScreenShake(12);

    // Roter Flash
    this.flashColor = '#EF4444';
    this.flashAlpha = 0.4;

    // Explosion-Partikel am Hindernis
    this.spawnExplosion(
      this.player.x + this.player.width / 2,
      this.player.y + this.player.height / 2,
      '#EF4444',
      12
    );

    // Combo zurücksetzen
    this.combo = 0;
    this.comboTimer = 0;

    // Kurze Unverwundbarkeit
    this.player.invincibleTimer = 60;
    this.player.state = 'hit';

    // Score-Popup
    this.addScorePopup(
      this.player.x + this.player.width / 2,
      this.player.y,
      '-1 ❤️',
      '#EF4444'
    );

    // Nach kurzer Zeit zurück zu running
    setTimeout(() => {
      if (this.player.state === 'hit') {
        this.player.state = this.player.isGrounded ? 'running' : 'falling';
      }
    }, 300);
  }

  /**
   * Behandelt Collectible-Kollision
   */
  private handleCollectibleCollision(collectible: Collectible): void {
    collectible.collected = true;
    const value = collectible.definition.value;

    // Combo erhöhen
    this.increaseCombo();

    // Combo-Bonus berechnen
    const comboMultiplier = 1 + Math.min(this.combo * 0.1, 1); // Max 2x bei 10er Combo

    // Double-XP Effekt
    const xpMultiplier = this.activeEffects.has('doubleXP') ? 2 : 1;

    // Funken-Partikel
    this.spawnSparkParticles(
      collectible.x,
      collectible.y,
      collectible.definition.color,
      6 + Math.min(this.combo, 10)
    );

    if (value.gold) {
      const goldValue = Math.round(value.gold * comboMultiplier);
      this.goldEarned += goldValue;

      if (collectible.type === 'diamond') {
        this.diamondsCollected++;
        this.soundManager.play('diamond');
        this.addScorePopup(collectible.x, collectible.y, `+${goldValue} 💰`, '#60A5FA');
        // Extra Flash für Diamanten
        this.flashColor = '#60A5FA';
        this.flashAlpha = 0.15;
      } else {
        this.coinsCollected++;
        this.soundManager.play('coin');
        this.addScorePopup(collectible.x, collectible.y, `+${goldValue}`, '#FFD700');
      }
    }

    if (value.xp) {
      const xpValue = Math.round(value.xp * comboMultiplier * xpMultiplier);
      this.xpEarned += xpValue;
      this.starsCollected++;
      this.soundManager.play('star');
      this.addScorePopup(collectible.x, collectible.y, `+${xpValue} XP`, '#FCD34D');
    }

    if (value.lives) {
      this.lives = Math.min(this.lives + value.lives, this.config.maxLives);
      this.heartsCollected++;
      this.soundManager.play('heart');
      this.addScorePopup(collectible.x, collectible.y, '+1 ❤️', '#EF4444');
      // Flash für Herz
      this.flashColor = '#EF4444';
      this.flashAlpha = 0.1;
    }
  }

  /**
   * Behandelt Power-Up Kollision
   */
  private handlePowerUpCollision(powerUp: PowerUp): void {
    powerUp.collected = true;
    this.activatePowerUp(powerUp.type);
    this.soundManager.play('star'); // Spezieller Sound wäre besser
  }

  /**
   * Aktualisiert Hintergrund
   */
  private updateBackground(deltaTime: number): void {
    for (const layer of BACKGROUND_LAYERS) {
      const objects = this.backgroundObjects.get(layer.id) || [];

      for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        obj.x -= this.speed * layer.speedMultiplier * deltaTime;

        if (obj.x + obj.width < 0) {
          objects.splice(i, 1);
        }
      }

      // Neue Objekte spawnen
      const rightmost = objects.length > 0 ? Math.max(...objects.map(o => o.x)) : 0;
      if (rightmost < this.width + 100) {
        for (const element of layer.elements) {
          if (Math.random() < element.frequency * 0.3) {
            objects.push({
              layerId: layer.id,
              x: this.width + 50 + Math.random() * 100,
              emoji: element.emoji,
              width: element.width,
              height: element.height,
              yOffset: element.yOffset + (Math.random() - 0.5) * 20
            });
          }
        }
      }
    }
  }

  // === POWER-UP SYSTEM ===

  /**
   * Aktualisiert Power-Ups
   */
  private updatePowerUps(deltaTime: number): void {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      powerUp.x -= this.speed * deltaTime;
      powerUp.animationPhase += deltaTime * 0.15;

      // Magnet-Effekt: Ziehe Collectibles zum Spieler
      if (this.activeEffects.has('magnet')) {
        // Power-Ups werden nicht vom Magneten angezogen
      }

      if (powerUp.x + powerUp.size < 0 || powerUp.collected) {
        this.powerUps.splice(i, 1);
      }
    }

    // Magnet-Effekt auf Collectibles anwenden
    if (this.activeEffects.has('magnet')) {
      for (const collectible of this.collectibles) {
        if (!collectible.collected) {
          const dx = this.player.x + this.player.width / 2 - collectible.x;
          const dy = this.player.y + this.player.height / 2 - collectible.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200 && dist > 0) {
            const force = 8 / dist;
            collectible.x += dx * force;
            collectible.y += dy * force;
          }
        }
      }
    }
  }

  /**
   * Spawnt neue Power-Ups
   */
  private spawnPowerUps(): void {
    // Selten spawnen (alle ~500m)
    if (Math.random() > 0.002) return;
    if (this.distance < 50) return;

    const rightmostX = this.powerUps.length > 0
      ? Math.max(...this.powerUps.map(p => p.x))
      : 0;

    if (rightmostX < this.width) {
      const type = getRandomPowerUpType(this.distance);
      if (!type) return;

      const definition = POWERUP_DEFINITIONS[type];
      const powerUp: PowerUp = {
        id: Date.now(),
        type,
        x: this.width + 100,
        y: CANVAS_CONFIG.groundY - PLAYER_CONFIG.height - 20,
        size: definition.size,
        definition,
        collected: false,
        animationPhase: 0
      };

      this.powerUps.push(powerUp);
    }
  }

  /**
   * Aktualisiert aktive Effekte
   */
  private updateActiveEffects(): void {
    for (const [type, effect] of this.activeEffects.entries()) {
      effect.remainingTime--;
      if (effect.remainingTime <= 0) {
        this.activeEffects.delete(type);
      }
    }
  }

  /**
   * Aktiviert ein Power-Up
   */
  private activatePowerUp(type: PowerUpType): void {
    const definition = POWERUP_DEFINITIONS[type];
    this.activeEffects.set(type, {
      type,
      remainingTime: definition.duration,
      maxTime: definition.duration
    });

    // Score-Popup anzeigen
    this.addScorePopup(
      this.player.x + this.player.width / 2,
      this.player.y,
      definition.description,
      definition.color
    );

    // Partikel-Explosion
    this.spawnExplosion(
      this.player.x + this.player.width / 2,
      this.player.y + this.player.height / 2,
      definition.color,
      15
    );

    // Flash-Effekt
    this.flashColor = definition.color;
    this.flashAlpha = 0.3;
  }

  // === PARTIKEL-SYSTEM ===

  /**
   * Spawnt Staub-Partikel beim Laufen
   */
  private spawnDustParticle(): void {
    this.particles.push({
      x: this.player.x + Math.random() * 20,
      y: CANVAS_CONFIG.groundY - 5,
      vx: -this.speed * 0.3 + (Math.random() - 0.5) * 2,
      vy: -Math.random() * 2,
      size: 3 + Math.random() * 4,
      color: '#8B7355',
      alpha: 0.6,
      life: 30,
      maxLife: 30,
      type: 'dust'
    });
  }

  /**
   * Spawnt Funken-Partikel beim Sammeln
   */
  private spawnSparkParticles(x: number, y: number, color: string, count: number = 8): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const speed = 3 + Math.random() * 4;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        color,
        alpha: 1,
        life: 25,
        maxLife: 25,
        type: 'spark'
      });
    }
  }

  /**
   * Spawnt Explosion-Partikel
   */
  private spawnExplosion(x: number, y: number, color: string, count: number = 20): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: 4 + Math.random() * 6,
        color,
        alpha: 1,
        life: 40,
        maxLife: 40,
        type: 'explosion'
      });
    }
  }

  /**
   * Spawnt Trail-Partikel hinter dem Spieler
   */
  private spawnTrailParticle(color: string): void {
    this.particles.push({
      x: this.player.x,
      y: this.player.y + this.player.height / 2 + Math.random() * 20 - 10,
      vx: -2,
      vy: 0,
      size: 5 + Math.random() * 5,
      color,
      alpha: 0.7,
      life: 20,
      maxLife: 20,
      type: 'trail'
    });
  }

  /**
   * Aktualisiert alle Partikel
   */
  private updateParticles(deltaTime: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;
      p.life -= deltaTime;
      p.alpha = (p.life / p.maxLife) * (p.type === 'dust' ? 0.6 : 1);

      // Gravitation für bestimmte Partikel
      if (p.type === 'explosion' || p.type === 'spark') {
        p.vy += 0.2 * deltaTime;
      }

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Limit particles
    if (this.particles.length > 200) {
      this.particles.splice(0, 50);
    }
  }

  // === COMBO-SYSTEM ===

  /**
   * Erhöht Combo
   */
  private increaseCombo(): void {
    this.combo++;
    this.comboTimer = 120; // 2 Sekunden
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }

    // Bei hohem Combo extra Effekte
    if (this.combo >= 5 && this.combo % 5 === 0) {
      this.flashColor = '#FFD700';
      this.flashAlpha = 0.2;
      this.soundManager.play('milestone');
    }
  }

  /**
   * Aktualisiert Combo-Timer
   */
  private updateCombo(deltaTime: number): void {
    if (this.comboTimer > 0) {
      this.comboTimer -= deltaTime;
      if (this.comboTimer <= 0) {
        this.combo = 0;
      }
    }
  }

  // === SCORE POPUPS ===

  /**
   * Fügt Score-Popup hinzu
   */
  private addScorePopup(x: number, y: number, text: string, color: string): void {
    this.scorePopups.push({
      x,
      y,
      text,
      color,
      alpha: 1,
      scale: 0.5,
      life: 60
    });
  }

  /**
   * Aktualisiert Score-Popups
   */
  private updateScorePopups(deltaTime: number): void {
    for (let i = this.scorePopups.length - 1; i >= 0; i--) {
      const popup = this.scorePopups[i];
      popup.y -= 1.5 * deltaTime;
      popup.life -= deltaTime;
      popup.alpha = popup.life / 60;
      popup.scale = Math.min(popup.scale + 0.05 * deltaTime, 1.2);

      if (popup.life <= 0) {
        this.scorePopups.splice(i, 1);
      }
    }
  }

  // === SCREEN EFFEKTE ===

  /**
   * Screen Shake auslösen
   */
  private triggerScreenShake(intensity: number): void {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
  }

  /**
   * Aktualisiert Screen-Effekte
   */
  private updateScreenEffects(deltaTime: number): void {
    // Shake abklingen lassen
    this.shakeIntensity *= this.shakeDecay;
    if (this.shakeIntensity < 0.1) {
      this.shakeIntensity = 0;
    }

    // Flash abklingen lassen
    if (this.flashAlpha > 0) {
      this.flashAlpha -= 0.02 * deltaTime;
      if (this.flashAlpha < 0) {
        this.flashAlpha = 0;
      }
    }
  }

  // === SPEED LINES ===

  /**
   * Aktualisiert Speed Lines
   */
  private updateSpeedLines(deltaTime: number): void {
    // Speed Lines nur bei hoher Geschwindigkeit
    if (this.speed > 8) {
      // Neue Lines spawnen
      if (Math.random() < (this.speed - 8) * 0.1) {
        this.speedLines.push({
          x: this.width,
          y: 50 + Math.random() * (CANVAS_CONFIG.groundY - 100),
          length: 50 + Math.random() * 100,
          alpha: 0.3 + Math.random() * 0.4
        });
      }
    }

    // Lines aktualisieren
    for (let i = this.speedLines.length - 1; i >= 0; i--) {
      const line = this.speedLines[i];
      line.x -= this.speed * 3 * deltaTime;
      line.alpha -= 0.02 * deltaTime;

      if (line.x + line.length < 0 || line.alpha <= 0) {
        this.speedLines.splice(i, 1);
      }
    }
  }

  /**
   * Render-Logik
   */
  private render(): void {
    this.ctx.save();

    // Screen Shake anwenden
    if (this.shakeIntensity > 0) {
      const shakeX = (Math.random() - 0.5) * this.shakeIntensity * 2;
      const shakeY = (Math.random() - 0.5) * this.shakeIntensity * 2;
      this.ctx.translate(shakeX, shakeY);
    }

    // Clear
    this.ctx.clearRect(-10, -10, this.width + 20, this.height + 20);

    // Hintergrund (mit Tag/Nacht)
    this.renderBackground();

    // Speed Lines (hinter allem)
    this.renderSpeedLines();

    // Boden
    this.renderGround();

    // Partikel (hinter Objekten)
    this.renderParticles('back');

    // Hindernisse
    this.renderObstacles();

    // Power-Ups
    this.renderPowerUps();

    // Collectibles
    this.renderCollectibles();

    // Spieler
    this.renderPlayer();

    // Partikel (vor Objekten)
    this.renderParticles('front');

    // Score Popups
    this.renderScorePopups();

    // Combo-Anzeige
    this.renderCombo();

    // Aktive Effekte UI
    this.renderActiveEffects();

    // Flash-Overlay
    if (this.flashAlpha > 0) {
      this.ctx.fillStyle = this.flashColor;
      this.ctx.globalAlpha = this.flashAlpha;
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.globalAlpha = 1;
    }

    this.ctx.restore();
  }

  /**
   * Rendert Hintergrund mit Tag/Nacht-Zyklus
   */
  private renderBackground(): void {
    // Dynamischer Himmel basierend auf Tageszeit
    const skyGradient = this.ctx.createLinearGradient(0, 0, 0, this.height);

    // Farben interpolieren basierend auf timeOfDay
    const t = this.timeOfDay;
    if (t < 0.3) {
      // Morgen -> Mittag (hell)
      skyGradient.addColorStop(0, '#1e3a5f');
      skyGradient.addColorStop(0.5, '#3b5998');
      skyGradient.addColorStop(1, '#87CEEB');
    } else if (t < 0.6) {
      // Mittag -> Abend (Sonnenuntergang)
      const blend = (t - 0.3) / 0.3;
      skyGradient.addColorStop(0, this.lerpColor('#1e3a5f', '#2d1b4e', blend));
      skyGradient.addColorStop(0.4, this.lerpColor('#3b5998', '#ff6b35', blend));
      skyGradient.addColorStop(0.7, this.lerpColor('#87CEEB', '#ff9f1c', blend));
      skyGradient.addColorStop(1, this.lerpColor('#87CEEB', '#ffb347', blend));
    } else {
      // Nacht
      const blend = Math.min((t - 0.6) / 0.2, 1);
      skyGradient.addColorStop(0, this.lerpColor('#2d1b4e', '#0a0a1a', blend));
      skyGradient.addColorStop(0.5, this.lerpColor('#4a2c6a', '#1a1a3a', blend));
      skyGradient.addColorStop(1, this.lerpColor('#ff6b35', '#2a2a4a', blend));
    }

    this.ctx.fillStyle = skyGradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Sterne bei Nacht
    if (this.timeOfDay > 0.6) {
      const starAlpha = Math.min((this.timeOfDay - 0.6) / 0.2, 1) * 0.8;
      this.ctx.fillStyle = `rgba(255, 255, 255, ${starAlpha})`;
      // Pseudo-random stars basierend auf fester Seed
      for (let i = 0; i < 50; i++) {
        const x = ((i * 137) % this.width);
        const y = ((i * 73) % (this.height * 0.6));
        const size = 1 + (i % 3);
        const twinkle = Math.sin(this.frameCount * 0.05 + i) * 0.5 + 0.5;
        this.ctx.globalAlpha = starAlpha * twinkle;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.globalAlpha = 1;
    }

    // Sonne/Mond
    this.renderCelestialBody();

    // Layer rendern
    for (const layer of BACKGROUND_LAYERS) {
      if (layer.id === 'sky') continue;

      const objects = this.backgroundObjects.get(layer.id) || [];
      this.ctx.textBaseline = 'bottom';
      this.ctx.textAlign = 'left';
      this.ctx.globalAlpha = 1;

      for (const obj of objects) {
        this.ctx.font = `${obj.height}px serif`;
        this.ctx.fillText(obj.emoji, obj.x, layer.yPosition + obj.yOffset);
      }
    }
  }

  /**
   * Rendert Sonne oder Mond
   */
  private renderCelestialBody(): void {
    const x = 650;
    const baseY = 80;

    if (this.timeOfDay < 0.5) {
      // Sonne
      const sunY = baseY + Math.sin(this.timeOfDay * Math.PI) * 30;
      this.ctx.save();
      this.ctx.shadowColor = '#FFD700';
      this.ctx.shadowBlur = 30;
      this.ctx.font = '50px serif';
      this.ctx.fillText('☀️', x, sunY);
      this.ctx.restore();
    } else if (this.timeOfDay > 0.65) {
      // Mond
      const moonAlpha = Math.min((this.timeOfDay - 0.65) / 0.15, 1);
      this.ctx.globalAlpha = moonAlpha;
      this.ctx.save();
      this.ctx.shadowColor = '#FFFFFF';
      this.ctx.shadowBlur = 20;
      this.ctx.font = '45px serif';
      this.ctx.fillText('🌙', x, baseY);
      this.ctx.restore();
      this.ctx.globalAlpha = 1;
    }
  }

  /**
   * Hilfsfunktion: Farben interpolieren
   */
  private lerpColor(color1: string, color2: string, t: number): string {
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);
    const r = Math.round(c1.r + (c2.r - c1.r) * t);
    const g = Math.round(c1.g + (c2.g - c1.g) * t);
    const b = Math.round(c1.b + (c2.b - c1.b) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }

  private hexToRgb(hex: string): {r: number; g: number; b: number} {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : {r: 0, g: 0, b: 0};
  }

  /**
   * Rendert Speed Lines
   */
  private renderSpeedLines(): void {
    if (this.speedLines.length === 0) return;

    this.ctx.save();
    for (const line of this.speedLines) {
      this.ctx.strokeStyle = `rgba(255, 255, 255, ${line.alpha})`;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(line.x, line.y);
      this.ctx.lineTo(line.x + line.length, line.y);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  /**
   * Rendert Boden
   */
  private renderGround(): void {
    const groundY = CANVAS_CONFIG.groundY;

    // Hauptboden
    this.ctx.fillStyle = GROUND_CONFIG.color;
    this.ctx.fillRect(0, groundY, this.width, GROUND_CONFIG.height);

    // Gras-Linie oben
    this.ctx.fillStyle = '#6B8E23';
    this.ctx.fillRect(0, groundY, this.width, 5);

    // Bewegte Linien für Geschwindigkeits-Effekt
    this.ctx.fillStyle = GROUND_CONFIG.patternColor;
    const offset = (this.frameCount * this.speed * 0.5) % GROUND_CONFIG.lineSpacing;
    
    for (let x = -offset; x < this.width; x += GROUND_CONFIG.lineSpacing) {
      this.ctx.fillRect(x, groundY + 15, 20, 3);
      this.ctx.fillRect(x + 15, groundY + 30, 25, 3);
    }

    // Löcher im Boden für Gaps
    for (const obstacle of this.obstacles) {
      if (obstacle.type === 'gap') {
        this.ctx.fillStyle = '#0f0f23';
        this.ctx.fillRect(obstacle.x, groundY, obstacle.width, GROUND_CONFIG.height);
        
        // Kanten
        this.ctx.fillStyle = '#2d2d2d';
        this.ctx.fillRect(obstacle.x, groundY, 3, GROUND_CONFIG.height);
        this.ctx.fillRect(obstacle.x + obstacle.width - 3, groundY, 3, GROUND_CONFIG.height);
      }
    }
  }

  /**
   * Rendert Hindernisse
   */
  private renderObstacles(): void {
    for (const obstacle of this.obstacles) {
      if (obstacle.type === 'gap') continue; // Gaps werden beim Boden gerendert

      this.ctx.save();

      // Sicherstellen dass Hindernis voll sichtbar ist
      this.ctx.globalAlpha = 1;

      // Animiertes Hindernis
      const wobble = obstacle.definition.animated
        ? Math.sin(this.frameCount * 0.2) * 3
        : 0;

      // Warnung für Hindernisse die bald kommen (nur bei höherer Geschwindigkeit)
      if (obstacle.x > this.width - 50 && obstacle.x < this.width + 100 && this.speed > 6) {
        const warningAlpha = Math.sin(this.frameCount * 0.3) * 0.5 + 0.5;
        this.ctx.save();
        this.ctx.globalAlpha = warningAlpha;
        this.ctx.font = 'bold 28px sans-serif';
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.textAlign = 'center';

        // Warnsymbol basierend auf Hindernis-Typ
        const warningY = obstacle.definition.spawnY === 'air' ? 100 : CANVAS_CONFIG.groundY - 80;
        const warningIcon = obstacle.definition.avoidBy === 'duck' ? '⬇️' : '⬆️';
        this.ctx.fillText('⚠️', this.width - 30, warningY);
        this.ctx.font = '20px sans-serif';
        this.ctx.fillText(warningIcon, this.width - 30, warningY + 25);
        this.ctx.restore();
      }

      // Schatten
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      this.ctx.beginPath();
      this.ctx.ellipse(
        obstacle.x + obstacle.width / 2,
        CANVAS_CONFIG.groundY + 5,
        obstacle.width / 2,
        8,
        0, 0, Math.PI * 2
      );
      this.ctx.fill();

      // Hindernis - mit korrekter Textausrichtung
      this.ctx.globalAlpha = 1;
      this.ctx.font = `${obstacle.height}px serif`;
      this.ctx.textBaseline = 'bottom';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(
        obstacle.definition.emoji,
        obstacle.x,
        obstacle.y + obstacle.height + wobble
      );

      this.ctx.restore();
    }
  }

  /**
   * Rendert Collectibles
   */
  private renderCollectibles(): void {
    for (const collectible of this.collectibles) {
      if (collectible.collected) continue;

      this.ctx.save();

      // Sicherstellen dass Collectible voll sichtbar ist
      this.ctx.globalAlpha = 1;

      // Schwebe-Animation
      const floatY = Math.sin(collectible.animationPhase) * 5;

      // Glow-Effekt
      this.ctx.shadowColor = collectible.definition.glowColor;
      this.ctx.shadowBlur = 15;

      // Collectible - mit korrekter Textausrichtung
      this.ctx.font = `${collectible.size}px serif`;
      this.ctx.textBaseline = 'middle';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        collectible.definition.emoji,
        collectible.x,
        collectible.y + floatY
      );

      this.ctx.restore();
    }
  }

  /**
   * Rendert Spieler
   */
  private renderPlayer(): void {
    this.ctx.save();

    // Shield-Effekt zeichnen
    if (this.activeEffects.has('shield')) {
      const effect = this.activeEffects.get('shield')!;
      const pulse = Math.sin(this.frameCount * 0.2) * 0.2 + 0.8;
      this.ctx.strokeStyle = `rgba(59, 130, 246, ${pulse * 0.7})`;
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.ellipse(
        this.player.x + this.player.width / 2,
        this.player.y + this.player.height / 2,
        this.player.width / 2 + 10,
        this.player.height / 2 + 5,
        0, 0, Math.PI * 2
      );
      this.ctx.stroke();

      // Schild-Glow
      this.ctx.shadowColor = '#3B82F6';
      this.ctx.shadowBlur = 15;
    }

    // Blinken bei Unverwundbarkeit (ohne Shield)
    if (this.player.invincibleTimer > 0 && !this.activeEffects.has('shield')) {
      if (Math.floor(this.player.invincibleTimer / 5) % 2 === 0) {
        this.ctx.globalAlpha = 0.5;
      }
    }

    // Sprite auswählen
    let sprite: HTMLCanvasElement;

    switch (this.player.state) {
      case 'jumping':
        sprite = this.avatarSprites.jumping;
        break;
      case 'falling':
        sprite = this.avatarSprites.falling;
        break;
      case 'ducking':
        sprite = this.avatarSprites.ducking;
        break;
      case 'hit':
        sprite = this.avatarSprites.hit;
        break;
      case 'running':
      default:
        sprite = this.avatarSprites.running[this.player.animationFrame];
        break;
    }

    // Schatten
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.beginPath();
    this.ctx.ellipse(
      this.player.x + this.player.width / 2,
      CANVAS_CONFIG.groundY + 5,
      this.player.width / 2,
      10,
      0, 0, Math.PI * 2
    );
    this.ctx.fill();

    // Trail-Effekt bei hoher Geschwindigkeit oder Double-XP
    if (this.speed > 10 || this.activeEffects.has('doubleXP')) {
      if (this.frameCount % 3 === 0) {
        const color = this.activeEffects.has('doubleXP') ? '#A855F7' : '#FFD700';
        this.spawnTrailParticle(color);
      }
    }

    // Sprite zeichnen
    this.ctx.drawImage(
      sprite,
      0, 0, sprite.width, sprite.height,
      this.player.x, this.player.y, this.player.width, this.player.height
    );

    this.ctx.restore();
  }

  /**
   * Rendert Power-Ups
   */
  private renderPowerUps(): void {
    for (const powerUp of this.powerUps) {
      if (powerUp.collected) continue;

      this.ctx.save();

      // Schwebe-Animation
      const floatY = Math.sin(powerUp.animationPhase) * 8;

      // Glow-Effekt
      this.ctx.shadowColor = powerUp.definition.glowColor;
      this.ctx.shadowBlur = 20 + Math.sin(this.frameCount * 0.1) * 5;

      // Rotierender Ring
      this.ctx.strokeStyle = powerUp.definition.color;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(
        powerUp.x,
        powerUp.y + floatY,
        powerUp.size / 2 + 8 + Math.sin(this.frameCount * 0.15) * 3,
        this.frameCount * 0.05,
        this.frameCount * 0.05 + Math.PI * 1.5
      );
      this.ctx.stroke();

      // Power-Up Emoji
      this.ctx.font = `${powerUp.size}px serif`;
      this.ctx.textBaseline = 'middle';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        powerUp.definition.emoji,
        powerUp.x,
        powerUp.y + floatY
      );

      this.ctx.restore();
    }
  }

  /**
   * Rendert Partikel
   */
  private renderParticles(layer: 'back' | 'front'): void {
    for (const p of this.particles) {
      // Back-Layer: Staub, Trail
      // Front-Layer: Funken, Explosion
      const isBack = p.type === 'dust' || p.type === 'trail';
      if ((layer === 'back') !== isBack) continue;

      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;

      if (p.type === 'spark' || p.type === 'explosion') {
        // Leuchtende Partikel
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 5;
      }

      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    }
  }

  /**
   * Rendert Score Popups
   */
  private renderScorePopups(): void {
    for (const popup of this.scorePopups) {
      this.ctx.save();
      this.ctx.globalAlpha = popup.alpha;
      this.ctx.font = `bold ${Math.round(18 * popup.scale)}px sans-serif`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';

      // Schatten
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.ctx.fillText(popup.text, popup.x + 2, popup.y + 2);

      // Text
      this.ctx.fillStyle = popup.color;
      this.ctx.fillText(popup.text, popup.x, popup.y);

      this.ctx.restore();
    }
  }

  /**
   * Rendert Combo-Anzeige
   */
  private renderCombo(): void {
    if (this.combo < 2) return;

    this.ctx.save();

    const x = this.width - 80;
    const y = 60;
    const pulse = 1 + Math.sin(this.frameCount * 0.3) * 0.1;

    // Hintergrund
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.beginPath();
    this.ctx.roundRect(x - 35, y - 20, 70, 40, 10);
    this.ctx.fill();

    // Combo-Text
    this.ctx.font = `bold ${Math.round(24 * pulse)}px sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // Farbe basierend auf Combo-Höhe
    let color = '#FFD700';
    if (this.combo >= 10) color = '#FF6B6B';
    else if (this.combo >= 5) color = '#A855F7';

    this.ctx.fillStyle = color;
    this.ctx.fillText(`${this.combo}x`, x, y);

    // "COMBO" Label
    this.ctx.font = '10px sans-serif';
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillText('COMBO', x, y + 18);

    this.ctx.restore();
  }

  /**
   * Rendert aktive Effekte UI
   */
  private renderActiveEffects(): void {
    if (this.activeEffects.size === 0) return;

    this.ctx.save();

    let offsetY = 0;
    for (const [type, effect] of this.activeEffects.entries()) {
      const definition = POWERUP_DEFINITIONS[type];
      const progress = effect.remainingTime / effect.maxTime;

      // Position
      const x = 15;
      const y = 50 + offsetY;

      // Hintergrund
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      this.ctx.beginPath();
      this.ctx.roundRect(x, y, 140, 28, 6);
      this.ctx.fill();

      // Progress Bar
      this.ctx.fillStyle = definition.color;
      this.ctx.globalAlpha = 0.3;
      this.ctx.fillRect(x + 2, y + 2, 136 * progress, 24);
      this.ctx.globalAlpha = 1;

      // Icon
      this.ctx.font = '18px serif';
      this.ctx.fillText(definition.emoji, x + 8, y + 20);

      // Text
      this.ctx.font = 'bold 12px sans-serif';
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillText(definition.description, x + 35, y + 18);

      offsetY += 35;
    }

    this.ctx.restore();
  }

  /**
   * Sendet aktuellen Spielzustand
   */
  private emitState(): void {
    if (!this.onStateChange) return;

    const multiplier = calculateMultiplier(this.distance, this.ageGroup);
    const nextMilestone = getNextMilestone(this.distance, this.ageGroup);

    this.onStateChange({
      status: this.status,
      distance: Math.floor(this.distance),
      speed: this.speed,
      score: Math.floor(this.distance) + this.goldEarned + this.xpEarned,
      lives: this.lives,
      maxLives: this.config.maxLives,
      coinsCollected: this.coinsCollected,
      goldEarned: this.goldEarned,
      starsCollected: this.starsCollected,
      xpEarned: this.xpEarned,
      diamondsCollected: this.diamondsCollected,
      heartsCollected: this.heartsCollected,
      currentMultiplier: multiplier,
      nextMilestone,
      betAmount: this.betAmount
    });
  }

  /**
   * Beendet das Spiel
   */
  private endGame(won: boolean): void {
    this.status = won ? 'won' : 'lost';
    cancelAnimationFrame(this.animationId);
    
    this.soundManager.play(won ? 'victory' : 'gameOver');

    const multiplier = calculateMultiplier(this.distance, this.ageGroup);
    const xpWon = multiplier > 0 
      ? Math.floor(this.betAmount * multiplier) + this.xpEarned
      : -this.betAmount + this.xpEarned;

    const result: GameResult = {
      won: multiplier > 0,
      distance: Math.floor(this.distance),
      multiplier,
      xpBet: this.betAmount,
      xpWon,
      goldWon: this.goldEarned,
      coinsCollected: this.coinsCollected,
      starsCollected: this.starsCollected,
      diamondsCollected: this.diamondsCollected
    };

    this.emitState();
    
    if (this.onGameEnd) {
      this.onGameEnd(result);
    }
  }

  /**
   * Pausiert das Spiel
   */
  pause(): void {
    if (this.status === 'playing') {
      this.status = 'paused';
      cancelAnimationFrame(this.animationId);
      this.emitState();
    }
  }

  /**
   * Setzt das Spiel fort
   */
  resume(): void {
    if (this.status === 'paused') {
      this.status = 'playing';
      this.lastFrameTime = performance.now();
      this.gameLoop();
    }
  }

  /**
   * Gibt Ressourcen frei
   */
  destroy(): void {
    cancelAnimationFrame(this.animationId);
    this.obstaclePool.clear();
    this.collectiblePool.clear();
    this.obstacles = [];
    this.collectibles = [];
    this.backgroundObjects.clear();
  }
}

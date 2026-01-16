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
  getRandomObstacleType,
  getRandomCollectibleType,
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

    // 1. Geschwindigkeit erhöhen
    this.updateSpeed();

    // 2. Distanz erhöhen
    this.distance += this.speed * deltaTime * 0.1; // Umrechnung in "Meter"

    // 3. Milestone prüfen
    this.checkMilestones();

    // 4. Spieler-Physik
    this.updatePlayer(deltaTime);

    // 5. Hindernisse
    this.updateObstacles(deltaTime);
    this.spawnObstacles();

    // 6. Collectibles
    this.updateCollectibles(deltaTime);
    this.spawnCollectibles();

    // 7. Kollisionen
    this.checkCollisions();

    // 8. Hintergrund
    this.updateBackground(deltaTime);

    // 9. Leben prüfen
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

    // Hindernisse
    if (this.player.invincibleTimer <= 0) {
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
          // In Lücke gefallen!
          this.handleObstacleCollision(obstacle);
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
    
    // Kurze Unverwundbarkeit
    this.player.invincibleTimer = 60; // ~1 Sekunde bei 60fps
    this.player.state = 'hit';
    
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

    if (value.gold) {
      this.goldEarned += value.gold;
      if (collectible.type === 'diamond') {
        this.diamondsCollected++;
        this.soundManager.play('diamond');
      } else {
        this.coinsCollected++;
        this.soundManager.play('coin');
      }
    }

    if (value.xp) {
      this.xpEarned += value.xp;
      this.starsCollected++;
      this.soundManager.play('star');
    }

    if (value.lives) {
      this.lives = Math.min(this.lives + value.lives, this.config.maxLives);
      this.heartsCollected++;
      this.soundManager.play('heart');
    }
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

  /**
   * Render-Logik
   */
  private render(): void {
    // Clear
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Hintergrund
    this.renderBackground();

    // Boden
    this.renderGround();

    // Hindernisse
    this.renderObstacles();

    // Collectibles
    this.renderCollectibles();

    // Spieler
    this.renderPlayer();
  }

  /**
   * Rendert Hintergrund
   */
  private renderBackground(): void {
    // Himmel-Gradient
    const skyGradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    skyGradient.addColorStop(0, '#1e3a5f');
    skyGradient.addColorStop(0.5, '#3b5998');
    skyGradient.addColorStop(1, '#87CEEB');
    this.ctx.fillStyle = skyGradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Layer rendern
    for (const layer of BACKGROUND_LAYERS) {
      if (layer.id === 'sky') continue;
      
      const objects = this.backgroundObjects.get(layer.id) || [];
      for (const obj of objects) {
        this.ctx.font = `${obj.height}px serif`;
        this.ctx.fillText(obj.emoji, obj.x, layer.yPosition + obj.yOffset);
      }
    }
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

      // Animiertes Hindernis
      const wobble = obstacle.definition.animated 
        ? Math.sin(this.frameCount * 0.2) * 3 
        : 0;

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

      // Hindernis
      this.ctx.font = `${obstacle.height}px serif`;
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

      // Schwebe-Animation
      const floatY = Math.sin(collectible.animationPhase) * 5;
      
      // Glow-Effekt
      this.ctx.shadowColor = collectible.definition.glowColor;
      this.ctx.shadowBlur = 15;

      // Collectible
      this.ctx.font = `${collectible.size}px serif`;
      this.ctx.fillText(
        collectible.definition.emoji,
        collectible.x - collectible.size / 2,
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

    // Blinken bei Unverwundbarkeit
    if (this.player.invincibleTimer > 0) {
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

    // Sprite zeichnen (skaliert von 2x auf 1x)
    this.ctx.drawImage(
      sprite,
      0, 0, sprite.width, sprite.height,
      this.player.x, this.player.y, this.player.width, this.player.height
    );

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

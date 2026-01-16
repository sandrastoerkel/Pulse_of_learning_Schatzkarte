// ============================================
// RUNNER AVATAR RENDERER
// Konvertiert CustomAvatar zu animierten Canvas-Sprites
// ============================================

import type { CustomAvatar, AvatarEquipped } from '../../../types';
import { PLAYER_CONFIG } from './RunnerAssets';
import { CanvasAvatarVisuals, adaptAvatarForCanvas } from './AvatarAdapter';

// === SPRITE-TYPEN ===

export type PlayerAnimationState = 'running' | 'jumping' | 'ducking' | 'falling' | 'hit';

export interface AvatarSprites {
  running: HTMLCanvasElement[];   // 4 Animation-Frames
  jumping: HTMLCanvasElement;
  ducking: HTMLCanvasElement;
  falling: HTMLCanvasElement;
  hit: HTMLCanvasElement;
}

// === ANIMATION-FRAMES ===

interface LimbPosition {
  leftArm: { x: number; y: number; angle: number };
  rightArm: { x: number; y: number; angle: number };
  leftLeg: { x: number; y: number; angle: number };
  rightLeg: { x: number; y: number; angle: number };
}

const RUNNING_FRAMES: LimbPosition[] = [
  // Frame 1: Rechtes Bein vorne
  {
    leftArm: { x: -5, y: 0, angle: 25 },
    rightArm: { x: 5, y: 0, angle: -25 },
    leftLeg: { x: -8, y: 0, angle: 20 },
    rightLeg: { x: 8, y: 0, angle: -30 }
  },
  // Frame 2: Übergang
  {
    leftArm: { x: 0, y: 0, angle: 0 },
    rightArm: { x: 0, y: 0, angle: 0 },
    leftLeg: { x: 0, y: -5, angle: 0 },
    rightLeg: { x: 0, y: -5, angle: 0 }
  },
  // Frame 3: Linkes Bein vorne
  {
    leftArm: { x: 5, y: 0, angle: -25 },
    rightArm: { x: -5, y: 0, angle: 25 },
    leftLeg: { x: 8, y: 0, angle: -30 },
    rightLeg: { x: -8, y: 0, angle: 20 }
  },
  // Frame 4: Übergang
  {
    leftArm: { x: 0, y: 0, angle: 0 },
    rightArm: { x: 0, y: 0, angle: 0 },
    leftLeg: { x: 0, y: -5, angle: 0 },
    rightLeg: { x: 0, y: -5, angle: 0 }
  }
];

const JUMPING_POSE: LimbPosition = {
  leftArm: { x: -10, y: -10, angle: -45 },
  rightArm: { x: 10, y: -10, angle: 45 },
  leftLeg: { x: -5, y: 5, angle: 15 },
  rightLeg: { x: 5, y: 5, angle: -15 }
};

const FALLING_POSE: LimbPosition = {
  leftArm: { x: -8, y: 5, angle: -30 },
  rightArm: { x: 8, y: 5, angle: 30 },
  leftLeg: { x: -3, y: 0, angle: 10 },
  rightLeg: { x: 3, y: 0, angle: -10 }
};

const DUCKING_POSE: LimbPosition = {
  leftArm: { x: -3, y: 10, angle: 10 },
  rightArm: { x: 3, y: 10, angle: -10 },
  leftLeg: { x: -8, y: 0, angle: 45 },
  rightLeg: { x: 8, y: 0, angle: -45 }
};

const HIT_POSE: LimbPosition = {
  leftArm: { x: -15, y: 0, angle: -60 },
  rightArm: { x: 15, y: 0, angle: 60 },
  leftLeg: { x: -5, y: 0, angle: 0 },
  rightLeg: { x: 5, y: 0, angle: 0 }
};

// === HAUPT-RENDERER-KLASSE ===

export class RunnerAvatarRenderer {
  private avatar: CustomAvatar;
  private visuals: CanvasAvatarVisuals;
  private equipped: AvatarEquipped;
  private sprites: AvatarSprites | null = null;
  private spriteWidth: number;
  private spriteHeight: number;
  private duckHeight: number;

  constructor(avatar: CustomAvatar) {
    this.avatar = avatar;
    // Avataaars-Visuals zu Canvas-kompatiblen Visuals konvertieren
    this.visuals = adaptAvatarForCanvas(avatar.visuals);
    this.equipped = avatar.equipped;
    this.spriteWidth = PLAYER_CONFIG.width;
    this.spriteHeight = PLAYER_CONFIG.height;
    this.duckHeight = PLAYER_CONFIG.duckHeight;
  }

  /**
   * Generiert alle Sprites für den Avatar
   */
  async generateSprites(): Promise<AvatarSprites> {
    if (this.sprites) {
      return this.sprites;
    }

    // Running Animation (4 Frames)
    const runningFrames: HTMLCanvasElement[] = [];
    for (const limbPos of RUNNING_FRAMES) {
      const canvas = this.createSpriteCanvas(this.spriteWidth, this.spriteHeight);
      this.drawAvatar(canvas, limbPos, false);
      runningFrames.push(canvas);
    }

    // Jumping
    const jumpingCanvas = this.createSpriteCanvas(this.spriteWidth, this.spriteHeight);
    this.drawAvatar(jumpingCanvas, JUMPING_POSE, false);

    // Falling
    const fallingCanvas = this.createSpriteCanvas(this.spriteWidth, this.spriteHeight);
    this.drawAvatar(fallingCanvas, FALLING_POSE, false);

    // Ducking (kleineres Canvas)
    const duckingCanvas = this.createSpriteCanvas(this.spriteWidth, this.duckHeight);
    this.drawAvatar(duckingCanvas, DUCKING_POSE, true);

    // Hit (Schaden genommen)
    const hitCanvas = this.createSpriteCanvas(this.spriteWidth, this.spriteHeight);
    this.drawAvatar(hitCanvas, HIT_POSE, false, true);

    this.sprites = {
      running: runningFrames,
      jumping: jumpingCanvas,
      ducking: duckingCanvas,
      falling: fallingCanvas,
      hit: hitCanvas
    };

    return this.sprites;
  }

  /**
   * Erstellt ein leeres Canvas-Element
   */
  private createSpriteCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width * 2;  // Höhere Auflösung für Retina
    canvas.height = height * 2;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(2, 2);
    return canvas;
  }

  /**
   * Zeichnet den kompletten Avatar auf ein Canvas
   */
  private drawAvatar(
    canvas: HTMLCanvasElement,
    limbPos: LimbPosition,
    isDucking: boolean,
    isHit: boolean = false
  ): void {
    const ctx = canvas.getContext('2d')!;
    const visuals = this.visuals;
    const equipped = this.equipped;
    
    const centerX = this.spriteWidth / 2;
    const height = isDucking ? this.duckHeight : this.spriteHeight;
    
    // Skalierungsfaktoren
    const scale = isDucking ? 0.6 : 1;
    
    ctx.save();
    
    // Hit-Effekt: Rot-Tönung
    if (isHit) {
      ctx.globalAlpha = 0.8;
    }

    // === KÖRPER-PROPORTIONEN ===
    const headSize = 22 * scale;
    const bodyHeight = 25 * scale;
    const bodyWidth = 20 * scale;
    const armLength = 18 * scale;
    const armWidth = 6 * scale;
    const legLength = 22 * scale;
    const legWidth = 7 * scale;

    // Y-Positionen
    const headY = isDucking ? headSize + 5 : headSize + 8;
    const bodyY = headY + headSize * 0.6;
    const legStartY = bodyY + bodyHeight * 0.8;

    // === BEINE ZEICHNEN (hinten) ===
    this.drawLimb(ctx, centerX - 6, legStartY, legLength, legWidth, 
      limbPos.leftLeg.angle, visuals.pantsColor, false);
    this.drawLimb(ctx, centerX + 6, legStartY, legLength, legWidth, 
      limbPos.rightLeg.angle, visuals.pantsColor, false);

    // === SCHUHE ===
    this.drawShoes(ctx, centerX, legStartY, legLength, limbPos, scale, visuals.pantsColor);

    // === KÖRPER/SHIRT ===
    this.drawBody(ctx, centerX, bodyY, bodyWidth, bodyHeight, visuals);

    // === ARME ZEICHNEN ===
    const armY = bodyY + 3;
    this.drawLimb(ctx, centerX - bodyWidth * 0.6, armY, armLength, armWidth, 
      limbPos.leftArm.angle, visuals.skinTone, true);
    this.drawLimb(ctx, centerX + bodyWidth * 0.6, armY, armLength, armWidth, 
      limbPos.rightArm.angle, visuals.skinTone, true);

    // === KOPF ===
    this.drawHead(ctx, centerX, headY, headSize, visuals);

    // === HAARE ===
    this.drawHair(ctx, centerX, headY, headSize, visuals);

    // === GESICHT ===
    this.drawFace(ctx, centerX, headY, headSize, visuals, isHit);

    // === AUSGERÜSTETE ITEMS ===
    this.drawEquippedItems(ctx, centerX, headY, headSize, equipped, scale);

    // === CAPE (falls ausgerüstet) ===
    if (equipped.cape) {
      this.drawCape(ctx, centerX, bodyY, bodyHeight, limbPos, equipped.cape);
    }

    // Hit-Effekt: Rote Überlagerung
    if (isHit) {
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.fillRect(0, 0, this.spriteWidth, height);
    }

    ctx.restore();
  }

  /**
   * Zeichnet ein Gliedmaß (Arm oder Bein)
   */
  private drawLimb(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    length: number,
    width: number,
    angle: number,
    color: string,
    isArm: boolean
  ): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((angle * Math.PI) / 180);
    
    // Gliedmaß
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(-width / 2, 0, width, length, width / 2);
    ctx.fill();

    // Schatten/Tiefe
    ctx.fillStyle = this.darkenColor(color, 20);
    ctx.beginPath();
    ctx.roundRect(-width / 2, length * 0.6, width, length * 0.4, width / 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Zeichnet den Körper/Shirt
   */
  private drawBody(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    bodyY: number,
    width: number,
    height: number,
    visuals: CanvasAvatarVisuals
  ): void {
    const shirtColor = visuals.shirtColor;
    
    // Hauptkörper
    ctx.fillStyle = shirtColor;
    ctx.beginPath();
    ctx.roundRect(centerX - width, bodyY, width * 2, height, 6);
    ctx.fill();

    // Shirt-Details basierend auf Style
    this.drawShirtDetails(ctx, centerX, bodyY, width, height, visuals);
  }

  /**
   * Zeichnet Shirt-Details basierend auf dem Style
   */
  private drawShirtDetails(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    bodyY: number,
    width: number,
    height: number,
    visuals: CanvasAvatarVisuals
  ): void {
    const { shirtStyle, shirtColor } = visuals;
    const darkerShirt = this.darkenColor(shirtColor, 25);

    switch (shirtStyle) {
      case 'hoodie':
        // Kapuzen-Linie
        ctx.strokeStyle = darkerShirt;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, bodyY + 3, width * 0.5, 0, Math.PI, true);
        ctx.stroke();
        // Bauchtasche
        ctx.fillStyle = darkerShirt;
        ctx.fillRect(centerX - width * 0.6, bodyY + height * 0.6, width * 1.2, height * 0.25);
        break;

      case 'polo':
      case 'tshirt':
        // Kragen
        ctx.fillStyle = darkerShirt;
        ctx.beginPath();
        ctx.moveTo(centerX - 5, bodyY);
        ctx.lineTo(centerX, bodyY + 6);
        ctx.lineTo(centerX + 5, bodyY);
        ctx.closePath();
        ctx.fill();
        break;

      case 'vest':
        // Westen-Öffnung
        ctx.fillStyle = visuals.skinTone;
        ctx.beginPath();
        ctx.roundRect(centerX - 4, bodyY + 2, 8, height - 4, 2);
        ctx.fill();
        break;

      case 'sweater':
        // Muster-Linien
        ctx.strokeStyle = darkerShirt;
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(centerX - width, bodyY + height * 0.3 + i * 5);
          ctx.lineTo(centerX + width, bodyY + height * 0.3 + i * 5);
          ctx.stroke();
        }
        break;

      case 'sportshirt':
        // Streifen an den Seiten
        ctx.fillStyle = this.lightenColor(shirtColor, 30);
        ctx.fillRect(centerX - width - 1, bodyY, 3, height);
        ctx.fillRect(centerX + width - 2, bodyY, 3, height);
        break;
    }
  }

  /**
   * Zeichnet den Kopf
   */
  private drawHead(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    headY: number,
    size: number,
    visuals: CanvasAvatarVisuals
  ): void {
    ctx.fillStyle = visuals.skinTone;
    
    switch (visuals.headShape) {
      case 'round':
        ctx.beginPath();
        ctx.arc(centerX, headY, size, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'oval':
        ctx.beginPath();
        ctx.ellipse(centerX, headY, size * 0.85, size, 0, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'square':
        ctx.beginPath();
        ctx.roundRect(centerX - size, headY - size, size * 2, size * 2, 6);
        ctx.fill();
        break;

      case 'heart':
        ctx.beginPath();
        ctx.arc(centerX, headY, size, 0, Math.PI * 2);
        ctx.fill();
        // Kinn spitzer
        ctx.beginPath();
        ctx.moveTo(centerX - size * 0.5, headY + size * 0.3);
        ctx.quadraticCurveTo(centerX, headY + size * 1.3, centerX + size * 0.5, headY + size * 0.3);
        ctx.fill();
        break;

      case 'long':
        ctx.beginPath();
        ctx.ellipse(centerX, headY, size * 0.8, size * 1.1, 0, 0, Math.PI * 2);
        ctx.fill();
        break;

      default:
        ctx.beginPath();
        ctx.arc(centerX, headY, size, 0, Math.PI * 2);
        ctx.fill();
    }

    // Ohren
    ctx.fillStyle = this.darkenColor(visuals.skinTone, 10);
    ctx.beginPath();
    ctx.ellipse(centerX - size - 2, headY, 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(centerX + size + 2, headY, 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Zeichnet die Haare
   */
  private drawHair(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    headY: number,
    headSize: number,
    visuals: CanvasAvatarVisuals
  ): void {
    if (visuals.hairStyle === 'bald') return;

    ctx.fillStyle = visuals.hairColor;
    const hairDark = this.darkenColor(visuals.hairColor, 20);

    switch (visuals.hairStyle) {
      case 'short':
        ctx.beginPath();
        ctx.arc(centerX, headY - headSize * 0.3, headSize * 0.9, Math.PI, 0, false);
        ctx.fill();
        break;

      case 'medium':
        ctx.beginPath();
        ctx.arc(centerX, headY - headSize * 0.2, headSize * 1.05, Math.PI * 0.9, Math.PI * 0.1, false);
        ctx.fill();
        // Seiten
        ctx.fillRect(centerX - headSize - 3, headY - headSize * 0.3, 6, headSize * 0.8);
        ctx.fillRect(centerX + headSize - 3, headY - headSize * 0.3, 6, headSize * 0.8);
        break;

      case 'long':
        ctx.beginPath();
        ctx.arc(centerX, headY - headSize * 0.2, headSize * 1.1, Math.PI * 0.85, Math.PI * 0.15, false);
        ctx.fill();
        // Lange Seiten
        ctx.fillRect(centerX - headSize - 5, headY - headSize * 0.4, 10, headSize * 1.8);
        ctx.fillRect(centerX + headSize - 5, headY - headSize * 0.4, 10, headSize * 1.8);
        break;

      case 'curly':
        // Mehrere Kreise für Locken
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI / 7) * i + Math.PI * 0.9;
          const x = centerX + Math.cos(angle) * headSize;
          const y = headY + Math.sin(angle) * headSize * 0.5;
          ctx.beginPath();
          ctx.arc(x, y - headSize * 0.3, headSize * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'spiky':
        // Spitzen
        for (let i = 0; i < 7; i++) {
          const x = centerX - headSize + (i * headSize * 2 / 6);
          ctx.beginPath();
          ctx.moveTo(x - 4, headY - headSize * 0.4);
          ctx.lineTo(x, headY - headSize * 1.3);
          ctx.lineTo(x + 4, headY - headSize * 0.4);
          ctx.closePath();
          ctx.fill();
        }
        break;

      case 'ponytail':
        // Basis-Haare
        ctx.beginPath();
        ctx.arc(centerX, headY - headSize * 0.3, headSize * 0.95, Math.PI, 0, false);
        ctx.fill();
        // Zopf hinten
        ctx.fillStyle = hairDark;
        ctx.beginPath();
        ctx.ellipse(centerX + headSize * 0.8, headY + headSize * 0.3, 5, 15, 0.3, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'braids':
        // Basis
        ctx.beginPath();
        ctx.arc(centerX, headY - headSize * 0.3, headSize * 0.9, Math.PI, 0, false);
        ctx.fill();
        // Zwei Zöpfe
        ctx.fillStyle = hairDark;
        ctx.fillRect(centerX - headSize - 2, headY, 6, headSize * 1.2);
        ctx.fillRect(centerX + headSize - 4, headY, 6, headSize * 1.2);
        break;

      case 'bun':
        // Basis
        ctx.beginPath();
        ctx.arc(centerX, headY - headSize * 0.3, headSize * 0.9, Math.PI, 0, false);
        ctx.fill();
        // Dutt oben
        ctx.beginPath();
        ctx.arc(centerX, headY - headSize * 1.2, headSize * 0.5, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'mohawk':
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const x = centerX - headSize * 0.4 + (i * headSize * 0.2);
          ctx.moveTo(x - 3, headY - headSize * 0.5);
          ctx.lineTo(x, headY - headSize * 1.5);
          ctx.lineTo(x + 3, headY - headSize * 0.5);
        }
        ctx.closePath();
        ctx.fill();
        break;

      case 'afro':
        ctx.beginPath();
        ctx.arc(centerX, headY - headSize * 0.3, headSize * 1.4, 0, Math.PI * 2);
        ctx.fill();
        break;

      default:
        // Default: kurz
        ctx.beginPath();
        ctx.arc(centerX, headY - headSize * 0.3, headSize * 0.9, Math.PI, 0, false);
        ctx.fill();
    }
  }

  /**
   * Zeichnet das Gesicht (Augen, Augenbrauen, Mund)
   */
  private drawFace(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    headY: number,
    headSize: number,
    visuals: CanvasAvatarVisuals,
    isHit: boolean
  ): void {
    const eyeY = headY - headSize * 0.1;
    const eyeSpacing = headSize * 0.4;

    // === AUGEN ===
    if (isHit) {
      // X-Augen bei Schaden
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      const eyeSize = 4;
      [-1, 1].forEach(side => {
        const ex = centerX + side * eyeSpacing;
        ctx.beginPath();
        ctx.moveTo(ex - eyeSize, eyeY - eyeSize);
        ctx.lineTo(ex + eyeSize, eyeY + eyeSize);
        ctx.moveTo(ex + eyeSize, eyeY - eyeSize);
        ctx.lineTo(ex - eyeSize, eyeY + eyeSize);
        ctx.stroke();
      });
    } else {
      this.drawEyes(ctx, centerX, eyeY, eyeSpacing, visuals);
    }

    // === AUGENBRAUEN ===
    if (!isHit) {
      this.drawEyebrows(ctx, centerX, eyeY - 6, eyeSpacing, visuals);
    }

    // === MUND ===
    const mouthY = headY + headSize * 0.4;
    if (isHit) {
      // O-Mund bei Schaden
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.ellipse(centerX, mouthY, 4, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      this.drawMouth(ctx, centerX, mouthY, visuals);
    }
  }

  /**
   * Zeichnet die Augen
   */
  private drawEyes(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    eyeY: number,
    spacing: number,
    visuals: CanvasAvatarVisuals
  ): void {
    [-1, 1].forEach(side => {
      const eyeX = centerX + side * spacing;

      switch (visuals.eyeStyle) {
        case 'round':
          // Weißes
          ctx.fillStyle = '#FFF';
          ctx.beginPath();
          ctx.arc(eyeX, eyeY, 5, 0, Math.PI * 2);
          ctx.fill();
          // Iris
          ctx.fillStyle = visuals.eyeColor;
          ctx.beginPath();
          ctx.arc(eyeX, eyeY, 3.5, 0, Math.PI * 2);
          ctx.fill();
          // Pupille
          ctx.fillStyle = '#000';
          ctx.beginPath();
          ctx.arc(eyeX, eyeY, 1.5, 0, Math.PI * 2);
          ctx.fill();
          // Glanzpunkt
          ctx.fillStyle = '#FFF';
          ctx.beginPath();
          ctx.arc(eyeX + 1, eyeY - 1, 1, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'almond':
          ctx.fillStyle = '#FFF';
          ctx.beginPath();
          ctx.ellipse(eyeX, eyeY, 6, 4, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = visuals.eyeColor;
          ctx.beginPath();
          ctx.arc(eyeX, eyeY, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#000';
          ctx.beginPath();
          ctx.arc(eyeX, eyeY, 1.5, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'big':
          ctx.fillStyle = '#FFF';
          ctx.beginPath();
          ctx.arc(eyeX, eyeY, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = visuals.eyeColor;
          ctx.beginPath();
          ctx.arc(eyeX, eyeY, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#000';
          ctx.beginPath();
          ctx.arc(eyeX, eyeY, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#FFF';
          ctx.beginPath();
          ctx.arc(eyeX + 2, eyeY - 2, 1.5, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'sleepy':
          ctx.fillStyle = '#FFF';
          ctx.beginPath();
          ctx.arc(eyeX, eyeY, 5, 0, Math.PI);
          ctx.fill();
          ctx.fillStyle = visuals.eyeColor;
          ctx.beginPath();
          ctx.arc(eyeX, eyeY + 1, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#000';
          ctx.beginPath();
          ctx.arc(eyeX, eyeY + 1, 1.5, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'happy':
          // Bogen-Augen (lächelnd)
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(eyeX, eyeY + 2, 4, Math.PI, 0, true);
          ctx.stroke();
          break;

        case 'narrow':
          ctx.fillStyle = '#FFF';
          ctx.beginPath();
          ctx.ellipse(eyeX, eyeY, 5, 2.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = visuals.eyeColor;
          ctx.beginPath();
          ctx.arc(eyeX, eyeY, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#000';
          ctx.beginPath();
          ctx.arc(eyeX, eyeY, 1, 0, Math.PI * 2);
          ctx.fill();
          break;
      }
    });
  }

  /**
   * Zeichnet die Augenbrauen
   */
  private drawEyebrows(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    browY: number,
    spacing: number,
    visuals: CanvasAvatarVisuals
  ): void {
    ctx.strokeStyle = this.darkenColor(visuals.hairColor, 30);
    ctx.lineCap = 'round';

    [-1, 1].forEach(side => {
      const browX = centerX + side * spacing;
      
      switch (visuals.eyebrowStyle) {
        case 'normal':
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(browX - 5, browY);
          ctx.lineTo(browX + 5, browY);
          ctx.stroke();
          break;

        case 'thick':
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(browX - 5, browY);
          ctx.lineTo(browX + 5, browY);
          ctx.stroke();
          break;

        case 'thin':
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(browX - 5, browY);
          ctx.lineTo(browX + 5, browY);
          ctx.stroke();
          break;

        case 'arched':
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(browX - 5, browY + 2);
          ctx.quadraticCurveTo(browX, browY - 3, browX + 5, browY + 1);
          ctx.stroke();
          break;

        case 'angry':
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(browX - 5 * side, browY + 3);
          ctx.lineTo(browX + 5 * side, browY - 2);
          ctx.stroke();
          break;

        case 'worried':
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(browX - 5 * side, browY - 2);
          ctx.lineTo(browX + 5 * side, browY + 2);
          ctx.stroke();
          break;
      }
    });
  }

  /**
   * Zeichnet den Mund
   */
  private drawMouth(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    mouthY: number,
    visuals: CanvasAvatarVisuals
  ): void {
    ctx.fillStyle = '#000';
    ctx.strokeStyle = '#000';

    switch (visuals.mouthStyle) {
      case 'smile':
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, mouthY - 3, 6, 0.2, Math.PI - 0.2);
        ctx.stroke();
        break;

      case 'grin':
        // Breites Lächeln mit Zähnen
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.ellipse(centerX, mouthY, 8, 4, 0, 0, Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Trennlinie für Zähne
        ctx.beginPath();
        ctx.moveTo(centerX - 8, mouthY);
        ctx.lineTo(centerX + 8, mouthY);
        ctx.stroke();
        break;

      case 'neutral':
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX - 5, mouthY);
        ctx.lineTo(centerX + 5, mouthY);
        ctx.stroke();
        break;

      case 'small':
        ctx.beginPath();
        ctx.arc(centerX, mouthY, 2, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'open':
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.ellipse(centerX, mouthY, 5, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        // Zunge
        ctx.fillStyle = '#FF6B6B';
        ctx.beginPath();
        ctx.ellipse(centerX, mouthY + 3, 3, 2, 0, 0, Math.PI);
        ctx.fill();
        break;
    }
  }

  /**
   * Zeichnet Schuhe
   */
  private drawShoes(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    legStartY: number,
    legLength: number,
    limbPos: LimbPosition,
    scale: number,
    pantsColor: string
  ): void {
    const shoeColor = this.darkenColor(pantsColor, 40);
    const shoeY = legStartY + legLength * (scale === 1 ? 0.95 : 0.7);

    ctx.fillStyle = shoeColor;
    
    // Linker Schuh
    ctx.save();
    ctx.translate(centerX - 6, shoeY);
    ctx.rotate((limbPos.leftLeg.angle * Math.PI) / 180);
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Rechter Schuh
    ctx.save();
    ctx.translate(centerX + 6, shoeY);
    ctx.rotate((limbPos.rightLeg.angle * Math.PI) / 180);
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * Zeichnet ausgerüstete Items (Hut, Brille, etc.)
   */
  private drawEquippedItems(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    headY: number,
    headSize: number,
    equipped: AvatarEquipped,
    scale: number
  ): void {
    // === HUT ===
    if (equipped.hat) {
      this.drawHat(ctx, centerX, headY, headSize, equipped.hat);
    }

    // === BRILLE ===
    if (equipped.glasses) {
      this.drawGlasses(ctx, centerX, headY, headSize, equipped.glasses);
    }

    // === ACCESSOIRE ===
    if (equipped.accessory) {
      this.drawAccessory(ctx, centerX, headY, headSize, equipped.accessory);
    }
  }

  /**
   * Zeichnet einen Hut
   */
  private drawHat(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    headY: number,
    headSize: number,
    hatId: string
  ): void {
    const hatY = headY - headSize - 5;

    // Verschiedene Hut-Typen basierend auf ID
    if (hatId.includes('crown')) {
      // Krone
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.moveTo(centerX - 15, hatY + 10);
      ctx.lineTo(centerX - 15, hatY - 5);
      ctx.lineTo(centerX - 8, hatY + 2);
      ctx.lineTo(centerX, hatY - 10);
      ctx.lineTo(centerX + 8, hatY + 2);
      ctx.lineTo(centerX + 15, hatY - 5);
      ctx.lineTo(centerX + 15, hatY + 10);
      ctx.closePath();
      ctx.fill();
      // Juwelen
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(centerX, hatY - 3, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (hatId.includes('wizard')) {
      // Zauberhut
      ctx.fillStyle = '#4B0082';
      ctx.beginPath();
      ctx.moveTo(centerX, hatY - 25);
      ctx.lineTo(centerX - 18, hatY + 5);
      ctx.lineTo(centerX + 18, hatY + 5);
      ctx.closePath();
      ctx.fill();
      // Sterne
      ctx.fillStyle = '#FFD700';
      ctx.font = '8px serif';
      ctx.fillText('✦', centerX - 5, hatY - 8);
      ctx.fillText('✦', centerX + 3, hatY);
    } else if (hatId.includes('cap')) {
      // Baseballkappe
      ctx.fillStyle = '#E74C3C';
      ctx.beginPath();
      ctx.arc(centerX, hatY + 5, 16, Math.PI, 0, false);
      ctx.fill();
      // Schirm
      ctx.fillStyle = '#C0392B';
      ctx.beginPath();
      ctx.ellipse(centerX + 12, hatY + 8, 12, 4, 0.3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Standard: einfacher Hut
      ctx.fillStyle = '#2C3E50';
      ctx.beginPath();
      ctx.ellipse(centerX, hatY + 5, 20, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(centerX - 12, hatY - 10, 24, 15);
    }
  }

  /**
   * Zeichnet eine Brille
   */
  private drawGlasses(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    headY: number,
    headSize: number,
    glassesId: string
  ): void {
    const eyeY = headY - headSize * 0.1;
    const eyeSpacing = headSize * 0.4;

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;

    if (glassesId.includes('round')) {
      // Runde Brille
      ctx.beginPath();
      ctx.arc(centerX - eyeSpacing, eyeY, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(centerX + eyeSpacing, eyeY, 8, 0, Math.PI * 2);
      ctx.stroke();
      // Steg
      ctx.beginPath();
      ctx.moveTo(centerX - eyeSpacing + 8, eyeY);
      ctx.lineTo(centerX + eyeSpacing - 8, eyeY);
      ctx.stroke();
    } else if (glassesId.includes('sunglasses')) {
      // Sonnenbrille
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.beginPath();
      ctx.roundRect(centerX - eyeSpacing - 8, eyeY - 5, 16, 12, 3);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(centerX + eyeSpacing - 8, eyeY - 5, 16, 12, 3);
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.beginPath();
      ctx.moveTo(centerX - eyeSpacing + 8, eyeY);
      ctx.lineTo(centerX + eyeSpacing - 8, eyeY);
      ctx.stroke();
    } else {
      // Eckige Brille
      ctx.strokeRect(centerX - eyeSpacing - 7, eyeY - 5, 14, 10);
      ctx.strokeRect(centerX + eyeSpacing - 7, eyeY - 5, 14, 10);
      ctx.beginPath();
      ctx.moveTo(centerX - eyeSpacing + 7, eyeY);
      ctx.lineTo(centerX + eyeSpacing - 7, eyeY);
      ctx.stroke();
    }
  }

  /**
   * Zeichnet ein Accessoire
   */
  private drawAccessory(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    headY: number,
    headSize: number,
    accessoryId: string
  ): void {
    if (accessoryId.includes('earring')) {
      // Ohrringe
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(centerX - headSize - 5, headY + 5, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(centerX + headSize + 5, headY + 5, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (accessoryId.includes('necklace')) {
      // Halskette (wird am Körper gezeichnet)
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, headY + headSize + 10, 12, 0.3, Math.PI - 0.3);
      ctx.stroke();
      // Anhänger
      ctx.fillStyle = '#60A5FA';
      ctx.beginPath();
      ctx.moveTo(centerX, headY + headSize + 22);
      ctx.lineTo(centerX - 5, headY + headSize + 28);
      ctx.lineTo(centerX + 5, headY + headSize + 28);
      ctx.closePath();
      ctx.fill();
    }
  }

  /**
   * Zeichnet einen Cape
   */
  private drawCape(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    bodyY: number,
    bodyHeight: number,
    limbPos: LimbPosition,
    capeId: string
  ): void {
    // Cape-Farbe basierend auf ID
    let capeColor = '#8B5CF6';
    if (capeId.includes('red')) capeColor = '#EF4444';
    if (capeId.includes('blue')) capeColor = '#3B82F6';
    if (capeId.includes('gold')) capeColor = '#F59E0B';
    if (capeId.includes('rainbow')) {
      const gradient = ctx.createLinearGradient(centerX - 20, bodyY, centerX + 20, bodyY + 40);
      gradient.addColorStop(0, '#EF4444');
      gradient.addColorStop(0.2, '#F59E0B');
      gradient.addColorStop(0.4, '#22C55E');
      gradient.addColorStop(0.6, '#3B82F6');
      gradient.addColorStop(0.8, '#8B5CF6');
      gradient.addColorStop(1, '#EC4899');
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = capeColor;
    }

    // Cape wehend basierend auf Arm-Position
    const waveOffset = (limbPos.leftArm.angle + limbPos.rightArm.angle) / 4;

    ctx.beginPath();
    ctx.moveTo(centerX - 15, bodyY);
    ctx.quadraticCurveTo(
      centerX - 25 + waveOffset, 
      bodyY + bodyHeight * 0.5, 
      centerX - 20, 
      bodyY + bodyHeight + 15
    );
    ctx.lineTo(centerX + 20, bodyY + bodyHeight + 15);
    ctx.quadraticCurveTo(
      centerX + 25 - waveOffset, 
      bodyY + bodyHeight * 0.5, 
      centerX + 15, 
      bodyY
    );
    ctx.closePath();
    ctx.fill();
  }

  // === HELPER FUNKTIONEN ===

  /**
   * Verdunkelt eine Hex-Farbe
   */
  private darkenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max((num >> 16) - amt, 0);
    const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
    const B = Math.max((num & 0x0000FF) - amt, 0);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }

  /**
   * Hellt eine Hex-Farbe auf
   */
  private lightenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min((num >> 16) + amt, 255);
    const G = Math.min((num >> 8 & 0x00FF) + amt, 255);
    const B = Math.min((num & 0x0000FF) + amt, 255);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }
}

// === EXPORT FACTORY FUNCTION ===

export async function createAvatarSprites(avatar: CustomAvatar): Promise<AvatarSprites> {
  const renderer = new RunnerAvatarRenderer(avatar);
  return renderer.generateSprites();
}

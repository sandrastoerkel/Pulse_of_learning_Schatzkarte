// ============================================
// RUNNER SOUND MANAGER
// Web Audio API basiertes Sound-System
// ============================================

import { SoundType, SoundDefinition, SOUND_DEFINITIONS } from './RunnerAssets';

// === SOUND MANAGER KLASSE ===

export class RunnerSoundManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private masterVolume: number = 0.7;
  private isInitialized: boolean = false;

  constructor() {
    // AudioContext wird erst bei User-Interaktion erstellt (Browser-Policy)
  }

  /**
   * Initialisiert den Audio-Kontext (muss nach User-Interaktion aufgerufen werden)
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Verschiedene Browser-Prefixes
      const AudioContextClass = window.AudioContext || 
        (window as any).webkitAudioContext;
      
      if (!AudioContextClass) {
        console.warn('Web Audio API not supported');
        return;
      }

      this.audioContext = new AudioContextClass();
      
      // Master Gain für Gesamtlautstärke
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.masterVolume;
      this.masterGain.connect(this.audioContext.destination);

      // Resume context wenn suspended (Chrome Autoplay Policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.isInitialized = true;
      console.log('Sound Manager initialized');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  /**
   * Spielt einen Sound ab
   */
  play(soundType: SoundType): void {
    if (!this.isInitialized || !this.audioContext || !this.masterGain || this.isMuted) {
      return;
    }

    const definition = SOUND_DEFINITIONS[soundType];
    if (!definition) {
      console.warn(`Unknown sound type: ${soundType}`);
      return;
    }

    try {
      if (definition.notes && definition.notes.length > 0) {
        // Komplexer Sound mit mehreren Noten
        this.playNotes(definition);
      } else if (definition.frequency) {
        // Einfacher Ton
        this.playTone(definition);
      }
    } catch (error) {
      console.error(`Failed to play sound ${soundType}:`, error);
    }
  }

  /**
   * Spielt einen einfachen Ton
   */
  private playTone(definition: SoundDefinition): void {
    if (!this.audioContext || !this.masterGain) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = definition.type || 'sine';
    oscillator.frequency.value = definition.frequency!;

    gainNode.gain.value = definition.volume;
    
    // Envelope für smoothen Sound
    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(definition.volume, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + (definition.duration || 0.2));

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start(now);
    oscillator.stop(now + (definition.duration || 0.2) + 0.05);
  }

  /**
   * Spielt eine Sequenz von Noten
   */
  private playNotes(definition: SoundDefinition): void {
    if (!this.audioContext || !this.masterGain || !definition.notes) return;

    const now = this.audioContext.currentTime;

    for (const note of definition.notes) {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = note.frequency;

      const noteVolume = definition.volume * 0.5;
      const startTime = now + note.delay;
      const endTime = startTime + note.duration;

      // Envelope
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(noteVolume, startTime + 0.01);
      gainNode.gain.setValueAtTime(noteVolume, endTime - 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, endTime);

      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);

      oscillator.start(startTime);
      oscillator.stop(endTime + 0.05);
    }
  }

  /**
   * Spielt den Countdown-Sound (3, 2, 1, Go!)
   */
  playCountdown(callback: () => void): void {
    console.log('[SoundManager] playCountdown called, isInitialized:', this.isInitialized);

    if (!this.isInitialized) {
      // Fallback ohne Sound
      console.log('[SoundManager] Using fallback (no sound), callback in 3s');
      setTimeout(() => {
        console.log('[SoundManager] Fallback timeout fired, calling callback');
        callback();
      }, 3000);
      return;
    }

    console.log('[SoundManager] Playing countdown sounds...');
    // 3
    setTimeout(() => this.play('countdown'), 0);
    // 2
    setTimeout(() => this.play('countdown'), 1000);
    // 1
    setTimeout(() => this.play('countdown'), 2000);
    // Go!
    setTimeout(() => {
      console.log('[SoundManager] Countdown finished, calling callback');
      this.play('start');
      callback();
    }, 3000);
  }

  /**
   * Spielt Sound für gesammeltes Item
   */
  playCollectible(type: 'coin' | 'star' | 'diamond' | 'heart'): void {
    this.play(type);
  }

  /**
   * Spielt Milestone-Sound
   */
  playMilestone(): void {
    this.play('milestone');
  }

  /**
   * Setzt Master-Lautstärke
   */
  setVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : this.masterVolume;
    }
  }

  /**
   * Gibt aktuelle Lautstärke zurück
   */
  getVolume(): number {
    return this.masterVolume;
  }

  /**
   * Schaltet Ton stumm/an
   */
  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : this.masterVolume;
    }
    return this.isMuted;
  }

  /**
   * Setzt Mute-Status direkt
   */
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : this.masterVolume;
    }
  }

  /**
   * Gibt Mute-Status zurück
   */
  getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Gibt an ob Sound-System bereit ist
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Räumt Ressourcen auf
   */
  destroy(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.masterGain = null;
      this.isInitialized = false;
    }
  }
}

// === SINGLETON INSTANCE ===

let soundManagerInstance: RunnerSoundManager | null = null;

export function getSoundManager(): RunnerSoundManager {
  if (!soundManagerInstance) {
    soundManagerInstance = new RunnerSoundManager();
  }
  return soundManagerInstance;
}

// === EINFACHE HELPER FUNKTIONEN ===

export async function initializeSound(): Promise<void> {
  const manager = getSoundManager();
  await manager.initialize();
}

export function playSound(type: SoundType): void {
  const manager = getSoundManager();
  manager.play(type);
}

export function toggleSound(): boolean {
  const manager = getSoundManager();
  return manager.toggleMute();
}

export function setVolume(volume: number): void {
  const manager = getSoundManager();
  manager.setVolume(volume);
}

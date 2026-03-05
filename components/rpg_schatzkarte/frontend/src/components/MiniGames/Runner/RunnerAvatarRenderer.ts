// ============================================
// RUNNER AVATAR RENDERER (Stub)
// Brick-Breaker nutzt keinen Canvas-Avatar mehr.
// Datei bleibt fuer Import-Kompatibilitaet.
// ============================================

import type { CustomAvatar } from '../../../types';

export type PlayerAnimationState = 'running' | 'jumping' | 'ducking' | 'falling' | 'hit';

export interface AvatarSprites {
  running: HTMLCanvasElement[];
  jumping: HTMLCanvasElement;
  ducking: HTMLCanvasElement;
  falling: HTMLCanvasElement;
  hit: HTMLCanvasElement;
}

export class RunnerAvatarRenderer {
  constructor(_avatar: CustomAvatar) {}
  async generateSprites(): Promise<AvatarSprites> {
    const empty = document.createElement('canvas');
    return {
      running: [empty],
      jumping: empty,
      ducking: empty,
      falling: empty,
      hit: empty,
    };
  }
}

export async function createAvatarSprites(_avatar: CustomAvatar): Promise<AvatarSprites> {
  const renderer = new RunnerAvatarRenderer(_avatar);
  return renderer.generateSprites();
}

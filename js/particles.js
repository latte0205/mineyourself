// ===== 方塊破壞粒子 =====

import { TILE_H } from './config.js';
import { layers } from './stage.js';
import { worldToScreen, getCameraOffset } from './camera.js';
import { hexToNum } from './util.js';

const particles = [];

export function spawnBurst(x, y, z, color) {
  const c = hexToNum(color);
  for (let i = 0; i < 10; i++) {
    particles.push({
      x: x + (Math.random() - 0.5) * 0.6,
      y: y + (Math.random() - 0.5) * 0.6,
      z: z + 0.5 + Math.random() * 0.5,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      vz: 2 + Math.random() * 4,
      life: 0.5 + Math.random() * 0.3,
      color: c,
    });
  }
}

export function updateParticles(dt) {
  const g = layers.particles;
  g.clear();
  if (!particles.length) return;
  const off = getCameraOffset();
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= dt;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    p.vz -= 18 * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.z += p.vz * dt;
    const s = worldToScreen(p.x, p.y, p.z);
    g.beginFill(p.color, Math.min(1, p.life * 2.5));
    g.drawRect(s.x + off.x - 2, s.y + off.y - TILE_H - 2, 4, 4);
    g.endFill();
  }
}

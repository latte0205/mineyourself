// ===== 日夜循環 =====

import { DAY_LENGTH } from './config.js';
import { app, layers } from './stage.js';
import { lerpColor } from './util.js';

export const dayState = { time: 0.35 };   // 0=午夜, 0.5=正午

export function daylight(t = dayState.time) {
  const s = 0.5 + 0.85 * Math.sin((t - 0.25) * Math.PI * 2);
  return Math.max(0.15, Math.min(1, s));
}

export function buildStars() {
  const g = layers.stars;
  g.clear();
  g.beginFill(0xffffff);
  for (let i = 0; i < 120; i++) {
    const x = (i * 137.5 + 50) % app.screen.width;
    const y = (i * 97.3 + 20) % (app.screen.height * 0.6);
    g.drawRect(x, y, 1 + (i % 2), 1 + (i % 2));
  }
  g.endFill();
}

export function updateDayNight(dt) {
  dayState.time = (dayState.time + dt / DAY_LENGTH) % 1;
  const l = daylight();
  app.renderer.background.color = lerpColor(0x0a0a1e, 0x6a9ec8, (l - 0.15) / 0.85);
  const night = layers.night;
  night.clear();
  if (l < 0.95) {
    night.beginFill(0x0a1030, (1 - l) * 0.45);
    night.drawRect(0, 0, app.screen.width, app.screen.height);
    night.endFill();
  }
  layers.stars.alpha = l < 0.4 ? (0.4 - l) / 0.25 : 0;
}

export function clockText() {
  const hr = Math.floor(dayState.time * 24);
  const mn = Math.floor((dayState.time * 24 - hr) * 60);
  return `${String(hr).padStart(2, '0')}:${String(mn).padStart(2, '0')}`;
}

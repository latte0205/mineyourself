// ===== 相機與等距投影 =====

import { TILE_W, TILE_H, WORLD_W, WORLD_H } from './config.js';
import { app } from './stage.js';

export const camera = { x: WORLD_W / 2, y: WORLD_H / 2, z: 16 };

export function worldToScreen(x, y, z) {
  return {
    x: (x - y) * TILE_W / 2,
    y: (x + y) * TILE_H / 2 - z * TILE_H,
  };
}

// 反推：給定螢幕點與 z 層，求該層「頂面」上的世界座標
export function screenToWorldTop(sx, sy, z) {
  const a = sx / (TILE_W / 2);
  const b = (sy + (z + 1) * TILE_H) / (TILE_H / 2);
  return { x: (a + b) / 2, y: (b - a) / 2 };
}

export function getCameraOffset() {
  const t = worldToScreen(camera.x, camera.y, camera.z);
  return {
    x: app.screen.width / 2 - t.x,
    y: app.screen.height / 2 - t.y,
  };
}

// 相機平滑跟隨目標（通常是玩家）
export function followCamera(target, dt) {
  const k = Math.min(1, dt * 8);
  camera.x += (target.x - camera.x) * k;
  camera.y += (target.y - camera.y) * k;
  camera.z += (target.z - camera.z) * k;
}

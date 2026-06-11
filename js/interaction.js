// ===== 方塊互動：點選 / 破壞 / 放置 =====

import { WORLD_D, REACH } from './config.js';
import { screenToWorldTop, getCameraOffset } from './camera.js';
import { world } from './world.js';
import { BLOCK, blockDef } from './blocks.js';
import { spawnBurst } from './particles.js';
import { sfx } from './audio.js';
import { player } from './entities.js';
import { selectedBlockId, showToast } from './ui.js';

// 螢幕 → 世界 raycast：由上往下逐 z 層找第一個非空方塊
export function pickBlock(mx, my) {
  const off = getCameraOffset();
  let prev = null;
  for (let z = WORLD_D - 1; z >= 0; z--) {
    const w = screenToWorldTop(mx - off.x, my - off.y, z);
    const bx = Math.round(w.x), by = Math.round(w.y);
    if (!world.inBounds(bx, by, z)) { prev = null; continue; }
    const id = world.get(bx, by, z);
    if (id !== BLOCK.AIR) return { x: bx, y: by, z, prev };
    prev = { x: bx, y: by, z };
  }
  return null;
}

function inReach(bx, by) {
  return Math.hypot(bx - player.x, by - player.y) <= REACH;
}

export function breakBlock(mx, my) {
  const hit = pickBlock(mx, my);
  if (!hit || !inReach(hit.x, hit.y)) return;
  const def = blockDef(world.get(hit.x, hit.y, hit.z));
  if (def.unbreakable) { showToast(def.breakMessage || '無法破壞'); return; }
  const ctx = { ...hit, world, player };
  if (def.onBreak && def.onBreak(ctx) === false) return;   // hook 可取消
  spawnBurst(hit.x, hit.y, hit.z, def.top);
  world.set(hit.x, hit.y, hit.z, BLOCK.AIR);
  sfx(160 + Math.random() * 60, 0.08, 'square');
}

export function placeBlock(mx, my) {
  const hit = pickBlock(mx, my);
  if (!hit || !hit.prev) return;
  const t = hit.prev;
  if (!world.inBounds(t.x, t.y, t.z)) return;
  if (!inReach(t.x, t.y)) return;
  if (world.get(t.x, t.y, t.z) !== BLOCK.AIR) return;
  // 不可放在玩家身體佔據的格子
  const pcx = Math.round(player.x), pcy = Math.round(player.y);
  const pfz = Math.floor(player.z + 0.001);
  if (t.x === pcx && t.y === pcy && (t.z === pfz || t.z === pfz + 1)) return;
  const def = blockDef(selectedBlockId());
  const ctx = { x: t.x, y: t.y, z: t.z, world, player };
  if (def.onPlace && def.onPlace(ctx) === false) return;   // hook 可取消
  world.set(t.x, t.y, t.z, def.id);
  sfx(420 + Math.random() * 80, 0.06, 'triangle');
}

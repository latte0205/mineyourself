// ===== 等距世界渲染 =====
// Painter's algorithm：(x+y) 由遠到近，欄內 z 由下而上。
// 玩家所在深度把世界切成 back/front 兩層，實體夾在中間。

import { TILE_W, TILE_H, WORLD_W, WORLD_H, WORLD_D, VIEW_RANGE } from './config.js';
import { layers } from './stage.js';
import { camera, worldToScreen, getCameraOffset } from './camera.js';
import { world, isOpaque } from './world.js';
import { blockDef, BLOCK } from './blocks.js';
import { patterns } from './patterns.js';
import { entities, player } from './entities.js';
import { hexToNum, hash2D, isTouch } from './util.js';

export const renderer = { dirty: true };

// 鏤空效果：擋住玩家的前景方塊變半透明（螢幕橢圓範圍）
const CUTAWAY_RX = 110;
const CUTAWAY_RY = 90;
const CUTAWAY_ALPHA = 0.3;

export function drawBlock(g, x, y, z, def, alphaMul = 1) {
  const p = worldToScreen(x, y, z);
  const cx = p.x, cy = p.y;
  const hw = TILE_W / 2;
  const hh = TILE_H / 2;
  const tcy = cy - TILE_H;
  const alpha = (def.transparent ? 0.6 : 1) * alphaMul;

  // 右面（+x 朝向觀察者）
  g.beginFill(hexToNum(def.right), alpha);
  g.moveTo(cx + hw, cy - hh);
  g.lineTo(cx + hw, tcy - hh);
  g.lineTo(cx, tcy);
  g.lineTo(cx, cy);
  g.closePath();
  g.endFill();

  // 左面（+y 朝向觀察者）
  g.beginFill(hexToNum(def.left), alpha);
  g.moveTo(cx - hw, cy - hh);
  g.lineTo(cx - hw, tcy - hh);
  g.lineTo(cx, tcy);
  g.lineTo(cx, cy);
  g.closePath();
  g.endFill();

  // 頂面
  g.beginFill(hexToNum(def.top), alpha);
  g.moveTo(cx, tcy - hh);
  g.lineTo(cx + hw, tcy);
  g.lineTo(cx, tcy + hh);
  g.lineTo(cx - hw, tcy);
  g.closePath();
  g.endFill();

  // 半透明鏤空時省略紋理，保持乾淨
  if (alphaMul < 1) return;
  const fn = def.pattern && patterns.get(def.pattern);
  if (fn) fn(g, { x, y, z, def, cx, tcy, seed: hash2D(x * 7 + z * 3, y * 13 + z) });
}

export function renderWorld() {
  const gBack = layers.back;
  const gFront = layers.front;
  gBack.clear();
  gFront.clear();

  const cx = Math.floor(camera.x);
  const cy = Math.floor(camera.y);
  const xMin = Math.max(0, cx - VIEW_RANGE);
  const xMax = Math.min(WORLD_W - 1, cx + VIEW_RANGE);
  const yMin = Math.max(0, cy - VIEW_RANGE);
  const yMax = Math.min(WORLD_H - 1, cy + VIEW_RANGE);
  const pSum = player.x + player.y;
  const pScr = worldToScreen(player.x, player.y, player.z);
  const pcx = pScr.x;
  const pcy = pScr.y - 28;          // 角色軀幹中心
  const pz = Math.floor(player.z);

  for (let sum = xMin + yMin; sum <= xMax + yMax; sum++) {
    const front = sum > pSum + 0.5;
    const g = front ? gFront : gBack;
    for (let x = xMin; x <= xMax; x++) {
      const y = sum - x;
      if (y < yMin || y > yMax) continue;
      for (let z = 0; z < WORLD_D; z++) {
        const id = world.get(x, y, z);
        if (id === BLOCK.AIR) continue;
        // 遮蔽剔除：三個可見面方向都被擋住才可能不可見；
        // 對角 (+1,+1,+1) 是視線方向，角落有空隙時仍須繪製以免漏出天空
        if (isOpaque(x + 1, y, z) && isOpaque(x, y + 1, z) && isOpaque(x, y, z + 1) &&
            isOpaque(x + 1, y + 1, z + 1)) continue;

        // 鏤空：玩家身前、螢幕上蓋住角色的方塊變半透明
        let alphaMul = 1;
        if (front && z >= pz) {
          const bp = worldToScreen(x, y, z);
          const ddx = (bp.x - pcx) / CUTAWAY_RX;
          const ddy = (bp.y - TILE_H - pcy) / CUTAWAY_RY;
          if (ddx * ddx + ddy * ddy < 1) alphaMul = CUTAWAY_ALPHA;
        }
        drawBlock(g, x, y, z, blockDef(id), alphaMul);
      }
    }
  }
}

// 每幀：圖層跟著相機平移（便宜），實體 sprite 對位
export function syncLayers() {
  const off = getCameraOffset();
  layers.back.position.set(off.x, off.y);
  layers.front.position.set(off.x, off.y);
  for (const e of entities) {
    if (!e.sprite) continue;
    const p = worldToScreen(e.x, e.y, e.z);
    e.sprite.position.set(p.x + off.x, p.y + off.y + 2);
    if (e.facing !== undefined) e.sprite.scale.x = Math.abs(e.sprite.scale.x) * (e.facing >= 0 ? 1 : -1);
  }
}

export function drawHighlight(hit) {
  const g = layers.highlight;
  g.clear();
  if (!hit || isTouch) return;
  const off = getCameraOffset();
  const p = worldToScreen(hit.x, hit.y, hit.z);
  const cx = p.x + off.x, cy = p.y + off.y;
  const hw = TILE_W / 2, hh = TILE_H / 2;
  const tcy = cy - TILE_H;
  g.lineStyle(2, 0xffffff, 0.9);
  g.moveTo(cx, tcy - hh);
  g.lineTo(cx + hw, tcy);
  g.lineTo(cx, tcy + hh);
  g.lineTo(cx - hw, tcy);
  g.closePath();
  g.lineStyle(1, 0xffffff, 0.5);
  g.moveTo(cx - hw, tcy).lineTo(cx - hw, cy - hh).lineTo(cx, cy).lineTo(cx + hw, cy - hh).lineTo(cx + hw, tcy);
  g.moveTo(cx, tcy + hh).lineTo(cx, cy);
}

// hotbar 小圖示用的迷你方塊
export function drawMiniBlock(g, cx, cy, def, s) {
  const hw = TILE_W / 2 * s, hh = TILE_H / 2 * s, th = TILE_H * s;
  const tcy = cy - th / 2;
  const bcy = cy + th / 2;
  g.beginFill(hexToNum(def.right));
  g.moveTo(cx + hw, bcy - hh); g.lineTo(cx + hw, tcy - hh); g.lineTo(cx, tcy); g.lineTo(cx, bcy);
  g.closePath(); g.endFill();
  g.beginFill(hexToNum(def.left));
  g.moveTo(cx - hw, bcy - hh); g.lineTo(cx - hw, tcy - hh); g.lineTo(cx, tcy); g.lineTo(cx, bcy);
  g.closePath(); g.endFill();
  g.beginFill(hexToNum(def.top));
  g.moveTo(cx, tcy - hh); g.lineTo(cx + hw, tcy); g.lineTo(cx, tcy + hh); g.lineTo(cx - hw, tcy);
  g.closePath(); g.endFill();
}

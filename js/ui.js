// ===== UI：Hotbar / HUD / Toast / 虛擬搖桿 =====

import { TILE_H } from './config.js';
import { app, layers } from './stage.js';
import { BLOCK, blockDef } from './blocks.js';
import { drawMiniBlock } from './render.js';
import { buildStars, clockText } from './daynight.js';
import { isTouch } from './util.js';
import { player } from './entities.js';

export const hotbar = {
  items: [BLOCK.GRASS, BLOCK.DIRT, BLOCK.STONE, BLOCK.OAK_LOG, BLOCK.PLANKS,
          BLOCK.LEAVES, BLOCK.GLASS, BLOCK.SAND, BLOCK.TORCH],
  selected: 0,
  slotSize: 46,
};

export const uiState = { touchMode: 'break' };   // 觸控模式：break | place

// 外部掛入的動作（main.js 注入，避免循環依賴）
export const uiActions = { newWorld: () => {} };

const uiGfx = new PIXI.Graphics();

const hudText = new PIXI.Text('', {
  fontFamily: 'Courier New, monospace', fontSize: 14, fill: 0xffffff,
  stroke: 0x000000, strokeThickness: 3,
});
hudText.position.set(10, 8);

const hintText = new PIXI.Text('', {
  fontFamily: 'Courier New, monospace', fontSize: 12, fill: 0xcccccc,
  stroke: 0x000000, strokeThickness: 3,
});

const toastText = new PIXI.Text('', {
  fontFamily: 'Courier New, monospace', fontSize: 14, fill: 0x88ff88,
  stroke: 0x000000, strokeThickness: 3,
});
toastText.anchor.set(0.5, 0);
let toastTimer = 0;

const newWorldText = new PIXI.Text('✦ 新世界', {
  fontFamily: 'Courier New, monospace', fontSize: 14, fill: 0xffdd66,
  stroke: 0x000000, strokeThickness: 3,
});

const modeText = new PIXI.Text('⛏', {
  fontFamily: 'Courier New, monospace', fontSize: 26, fill: 0xffffff,
  stroke: 0x000000, strokeThickness: 4,
});
modeText.anchor.set(0.5);

layers.ui.addChild(uiGfx, hudText, hintText, toastText, newWorldText, modeText);

export function hotbarRect() {
  const w = hotbar.slotSize * 9;
  return {
    x: (app.screen.width - w) / 2,
    y: app.screen.height - hotbar.slotSize - 10,
    w, h: hotbar.slotSize,
  };
}

export function selectSlot(i) {
  hotbar.selected = ((i % 9) + 9) % 9;
  rebuildUI();
}

export function selectedBlockId() {
  return hotbar.items[hotbar.selected];
}

export function rebuildUI() {
  uiGfx.clear();
  const r = hotbarRect();
  for (let i = 0; i < 9; i++) {
    const sx = r.x + i * hotbar.slotSize;
    const sel = i === hotbar.selected;
    uiGfx.beginFill(0x000000, sel ? 0.65 : 0.4);
    uiGfx.drawRoundedRect(sx + 2, r.y + 2, hotbar.slotSize - 4, hotbar.slotSize - 4, 6);
    uiGfx.endFill();
    uiGfx.lineStyle(sel ? 3 : 1, sel ? 0xffffff : 0x888888, sel ? 1 : 0.6);
    uiGfx.drawRoundedRect(sx + 2, r.y + 2, hotbar.slotSize - 4, hotbar.slotSize - 4, 6);
    uiGfx.lineStyle(0);
    drawMiniBlock(uiGfx, sx + hotbar.slotSize / 2, r.y + hotbar.slotSize / 2, blockDef(hotbar.items[i]), 0.42);
  }

  newWorldText.position.set(app.screen.width - newWorldText.width - 14, 10);
  hintText.text = isTouch
    ? '左半邊拖曳移動 · 點方塊互動 · 右下切換 ⛏/🧱'
    : 'WASD 移動 · Space 跳躍 · 左鍵挖 · 右鍵放 · 1-9/滾輪 選方塊 · N 新世界';
  hintText.position.set(10, app.screen.height - 24);
  toastText.position.set(app.screen.width / 2, r.y - 30);
  modeText.visible = isTouch;
  if (isTouch) {
    modeText.text = uiState.touchMode === 'break' ? '⛏' : '🧱';
    modeText.position.set(app.screen.width - 44, r.y - 36);
    uiGfx.beginFill(0x000000, 0.45);
    uiGfx.drawCircle(app.screen.width - 44, r.y - 36, 26);
    uiGfx.endFill();
  }
  buildStars();
}

export function showToast(msg) {
  toastText.text = msg;
  toastText.alpha = 1;
  toastTimer = 2;
}

export function updateToast(dt) {
  if (toastTimer > 0) {
    toastTimer -= dt;
    toastText.alpha = Math.min(1, toastTimer);
    if (toastTimer <= 0) toastText.text = '';
  }
}

export function updateHUD() {
  const name = blockDef(selectedBlockId()).label;
  hudText.text = `🧱 ${name}   📍 (${Math.round(player.x)}, ${Math.round(player.y)}, ${Math.floor(player.z)})   🕐 ${clockText()}`;
}

// 點擊命中 UI 時回傳動作字串，否則 null
export function uiHitTest(mx, my) {
  const r = hotbarRect();
  if (mx >= r.x && mx < r.x + r.w && my >= r.y && my < r.y + r.h) {
    selectSlot(Math.floor((mx - r.x) / hotbar.slotSize));
    return 'hotbar';
  }
  const nb = newWorldText.getBounds();
  if (mx >= nb.x - 6 && mx <= nb.x + nb.width + 6 && my >= nb.y - 6 && my <= nb.y + nb.height + 6) {
    uiActions.newWorld();
    return 'newworld';
  }
  if (isTouch) {
    const bx = app.screen.width - 44, by = r.y - 36;
    if (Math.hypot(mx - bx, my - by) < 30) {
      uiState.touchMode = uiState.touchMode === 'break' ? 'place' : 'break';
      rebuildUI();
      return 'mode';
    }
  }
  return null;
}

export function drawJoystick(joy) {
  const g = layers.joystick;
  g.clear();
  if (!joy.active) return;
  g.lineStyle(2, 0xffffff, 0.4);
  g.drawCircle(joy.ox, joy.oy, 50);
  g.beginFill(0xffffff, 0.5);
  g.drawCircle(joy.ox + joy.dx * 50, joy.oy + joy.dy * 50, 18);
  g.endFill();
}

// ===== 輸入：鍵盤 / 滑鼠 / 觸控搖桿 =====

import { app, canvas } from './stage.js';
import { isTouch } from './util.js';
import { uiHitTest, selectSlot, hotbar, uiState, rebuildUI } from './ui.js';
import { breakBlock, placeBlock } from './interaction.js';

export const KEY = {};
export const mouse = { x: -1, y: -1 };
export const joy = { active: false, id: null, ox: 0, oy: 0, dx: 0, dy: 0 };

// 鍵盤/搖桿 → 世界座標移動向量
export function getMoveVector() {
  let dx = 0, dy = 0;
  if (KEY['w'] || KEY['arrowup'])    { dx -= 1; dy -= 1; }
  if (KEY['s'] || KEY['arrowdown'])  { dx += 1; dy += 1; }
  if (KEY['a'] || KEY['arrowleft'])  { dx -= 1; dy += 1; }
  if (KEY['d'] || KEY['arrowright']) { dx += 1; dy -= 1; }
  if (joy.active) {
    // 螢幕方向 → 等距世界方向
    dx += joy.dx + joy.dy;
    dy += -joy.dx + joy.dy;
  }
  return { dx, dy, jump: !!KEY[' '] };
}

export function setupInput({ onNewWorld }) {
  document.addEventListener('keydown', e => {
    KEY[e.key.toLowerCase()] = true;
    const k = e.key;
    if (k >= '1' && k <= '9') selectSlot(+k - 1);
    if (k.toLowerCase() === 'n') onNewWorld();
    if (k === ' ') e.preventDefault();
  });
  document.addEventListener('keyup', e => { KEY[e.key.toLowerCase()] = false; });

  canvas.addEventListener('contextmenu', e => e.preventDefault());

  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    selectSlot(hotbar.selected + (e.deltaY > 0 ? 1 : -1));
  }, { passive: false });

  canvas.addEventListener('pointerdown', e => {
    const mx = e.offsetX, my = e.offsetY;
    if (uiHitTest(mx, my)) return;

    if (isTouch) {
      if (mx < app.screen.width * 0.4) {
        joy.active = true; joy.id = e.pointerId;
        joy.ox = mx; joy.oy = my; joy.dx = 0; joy.dy = 0;
      } else if (uiState.touchMode === 'break') {
        breakBlock(mx, my);
      } else {
        placeBlock(mx, my);
      }
      return;
    }

    if (e.button === 0) breakBlock(mx, my);
    else if (e.button === 2) placeBlock(mx, my);
  });

  canvas.addEventListener('pointermove', e => {
    mouse.x = e.offsetX; mouse.y = e.offsetY;
    if (joy.active && e.pointerId === joy.id) {
      const dx = e.offsetX - joy.ox, dy = e.offsetY - joy.oy;
      const len = Math.hypot(dx, dy);
      const max = 50;
      const f = len > max ? max / len : 1;
      joy.dx = dx * f / max;
      joy.dy = dy * f / max;
    }
  });

  const endJoy = e => {
    if (joy.active && e.pointerId === joy.id) {
      joy.active = false; joy.dx = 0; joy.dy = 0;
    }
  };
  canvas.addEventListener('pointerup', endJoy);
  canvas.addEventListener('pointercancel', endJoy);

  window.addEventListener('resize', rebuildUI);
}

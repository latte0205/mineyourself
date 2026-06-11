// ===== 方塊紋理 pattern 註冊表 =====
// 每個 pattern 是一個繪製函式 fn(g, info)：
//   g    = PIXI.Graphics
//   info = { x, y, z, def, cx, tcy, seed }
//     cx  = 方塊底部菱形中心 X；tcy = 頂面菱形中心 Y；seed = 確定性 [0,1)
// 新增紋理：definePattern('myPattern', fn)，方塊定義裡寫 pattern: 'myPattern'

import { hexToNum } from './util.js';

export const patterns = new Map();

export function definePattern(name, fn) {
  patterns.set(name, fn);
}

definePattern('ore', (g, { def, cx, tcy, seed }) => {
  const c = hexToNum(def.oreColor || '#ffffff');
  g.beginFill(c);
  g.drawRect(cx - 8 + seed * 8, tcy - 4, 5, 5);                 // 頂面
  g.drawRect(cx - 18, tcy + 6 + seed * 6, 5, 5);                // 左面
  g.drawRect(cx + 12, tcy + 4 + seed * 8, 5, 5);                // 右面
  g.endFill();
});

definePattern('grass', (g, { cx, tcy, seed }) => {
  g.beginFill(0x4a7a2a);
  g.drawRect(cx - 10 + seed * 6, tcy - 5, 4, 3);
  g.drawRect(cx + 4, tcy + 2 + seed * 4, 4, 3);
  g.endFill();
});

definePattern('leaves', (g, { cx, tcy, seed }) => {
  g.beginFill(0x1a5a1a, 0.8);
  g.drawRect(cx - 8 + seed * 10, tcy - 4, 4, 4);
  g.drawRect(cx + 2 - seed * 8, tcy + 2, 4, 4);
  g.endFill();
});

definePattern('wood', (g, { cx, tcy }) => {
  g.beginFill(0x4a2a08, 0.7);
  g.drawRect(cx - 4, tcy - 3, 8, 5);                            // 年輪
  g.endFill();
});

definePattern('planks', (g, { cx, tcy }) => {
  g.beginFill(0x000000, 0.15);
  g.drawRect(cx - 24, tcy + 14, 20, 2);
  g.drawRect(cx + 6, tcy + 12, 18, 2);
  g.endFill();
});

definePattern('bricks', (g, { cx, tcy }) => {
  g.beginFill(0x000000, 0.15);
  g.drawRect(cx - 24, tcy + 14, 20, 2);
  g.drawRect(cx + 6, tcy + 12, 18, 2);
  g.endFill();
});

definePattern('speckle', (g, { cx, tcy, seed }) => {
  g.beginFill(0x000000, 0.12);
  g.drawRect(cx - 8 + seed * 12, tcy - 3 + seed * 4, 4, 4);
  g.endFill();
});

definePattern('torch', (g, { cx, tcy }) => {
  g.beginFill(0xffe080);
  g.drawRect(cx - 3, tcy - 8, 6, 6);
  g.endFill();
});

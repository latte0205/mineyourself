// ===== PixiJS 應用與圖層 =====
// 圖層順序（下→上）：星空 → 世界背層 → 實體 → 世界前層 → 高亮 → 粒子 → 夜幕 → 搖桿 → UI

export const app = new PIXI.Application({
  resizeTo: window,
  backgroundColor: 0x486a7a,
  antialias: false,
  resolution: Math.min(window.devicePixelRatio || 1, 2),
  autoDensity: true,
});
document.body.appendChild(app.view);
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

export const canvas = app.view;

export const layers = {
  stars: new PIXI.Graphics(),
  back: new PIXI.Graphics(),       // 玩家身後的世界方塊
  entities: new PIXI.Container(),  // 玩家與未來的 NPC
  front: new PIXI.Graphics(),      // 玩家身前的世界方塊
  highlight: new PIXI.Graphics(),
  particles: new PIXI.Graphics(),
  night: new PIXI.Graphics(),
  joystick: new PIXI.Graphics(),
  ui: new PIXI.Container(),
};

app.stage.addChild(
  layers.stars, layers.back, layers.entities, layers.front,
  layers.highlight, layers.particles, layers.night, layers.joystick, layers.ui,
);

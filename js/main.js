// ===== MineYourself 入口：開機 + 遊戲迴圈 =====

import { SAVE_INTERVAL } from './config.js';
import { app } from './stage.js';
import { camera, followCamera } from './camera.js';
import { world } from './world.js';
import { player, spawnEntity } from './entities.js';
import { renderer, renderWorld, syncLayers, drawHighlight } from './render.js';
import { updateParticles } from './particles.js';
import { updateDayNight } from './daynight.js';
import { rebuildUI, updateHUD, updateToast, showToast, uiActions, drawJoystick, hotbar } from './ui.js';
import { saveWorld, loadWorld, clearSave } from './save.js';
import { setupInput, getMoveVector, mouse, joy } from './input.js';
import { pickBlock } from './interaction.js';
import { isTouch } from './util.js';

function newWorld() {
  if (!window.confirm('確定要產生新世界嗎？目前的世界會被覆蓋。')) return;
  clearSave();
  world.generate();
  player.respawn();
  camera.x = player.x; camera.y = player.y; camera.z = player.z;
  showToast('新世界誕生！');
}
uiActions.newWorld = newWorld;

// ----- 開機 -----
if (!loadWorld()) {
  world.generate();
} else {
  showToast('已載入存檔');
}
spawnEntity(player);
player.respawn();
camera.x = player.x;
camera.y = player.y;
camera.z = player.z;

setupInput({ onNewWorld: newWorld });
rebuildUI();
updateHUD();

setInterval(saveWorld, SAVE_INTERVAL);
window.addEventListener('beforeunload', saveWorld);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') saveWorld();
});

// ----- 遊戲迴圈 -----
let hudTimer = 0;
const lastCell = { x: -999, y: -999, sum: -999 };

app.ticker.add(() => {
  const dt = Math.min(0.05, app.ticker.deltaMS / 1000);

  player.update(dt, getMoveVector());
  followCamera(player, dt);
  updateDayNight(dt);
  updateParticles(dt);

  // 圖層跟著相機平移（每幀，便宜）；只有跨格/世界變動才整層重繪
  syncLayers();
  const ccx = Math.round(camera.x), ccy = Math.round(camera.y);
  const pSumCell = Math.round(player.x + player.y);
  if (ccx !== lastCell.x || ccy !== lastCell.y || pSumCell !== lastCell.sum) {
    renderer.dirty = true;
    lastCell.x = ccx; lastCell.y = ccy; lastCell.sum = pSumCell;
  }
  if (world.dirty) { renderer.dirty = true; world.dirty = false; }
  if (renderer.dirty) {
    renderWorld();
    renderer.dirty = false;
  }

  drawJoystick(joy);
  drawHighlight(!isTouch && mouse.x >= 0 ? pickBlock(mouse.x, mouse.y) : null);

  hudTimer += dt;
  if (hudTimer > 0.15) { updateHUD(); hudTimer = 0; }
  updateToast(dt);
});

// 除錯/測試用握把（瀏覽器 console 可直接操作遊戲物件）
import * as blocksMod from './blocks.js';
import * as worldMod from './world.js';
import * as patternsMod from './patterns.js';
import * as entitiesMod from './entities.js';
import * as interactionMod from './interaction.js';
import * as cameraMod from './camera.js';
import * as dayMod from './daynight.js';

window.GAME = {
  app, world, player, camera, hotbar,
  blocks: blocksMod, worldMod, patterns: patternsMod,
  entities: entitiesMod, interaction: interactionMod,
  cameraMod, day: dayMod,
  newWorld, saveWorld, loadWorld,
};

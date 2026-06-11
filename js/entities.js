// ===== 實體系統 =====
// 所有會動的東西都是 Entity 的子類別；新增 NPC/生物：
//   class Sheep extends Entity { update(dt) { ... } }
//   spawnEntity(new Sheep(x, y, z))

import { WORLD_W, WORLD_H, WORLD_D } from './config.js';
import { world, isSolid } from './world.js';
import { layers } from './stage.js';
import { sfx } from './audio.js';

export class Entity {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x; this.y = y; this.z = z;
    this.vz = 0;
    this.onGround = false;
    this.sprite = null;          // PIXI.DisplayObject，子類別建立
  }

  update(dt) {}

  // 像素 sprite 工具：rows = 數字索引網格，palette = 索引→色碼
  static makePixelTexture(rows, palette, ps = 3) {
    const c = document.createElement('canvas');
    c.width = rows[0].length * ps;
    c.height = rows.length * ps;
    const ctx = c.getContext('2d');
    for (let r = 0; r < rows.length; r++) {
      for (let col = 0; col < rows[r].length; col++) {
        const i = rows[r][col];
        if (!i) continue;
        ctx.fillStyle = palette[i];
        ctx.fillRect(col * ps, r * ps, ps, ps);
      }
    }
    return PIXI.Texture.from(c);
  }
}

export const entities = [];

export function spawnEntity(e) {
  entities.push(e);
  if (e.sprite) layers.entities.addChild(e.sprite);
  return e;
}

export function updateEntities(dt) {
  for (const e of entities) e.update(dt);
}

// ----- 玩家（像素角色取自 char-designer 原型，8x10、PS=3）-----

const PLAYER_ROWS = [
  [0,0,1,1,1,1,0,0],
  [0,1,2,2,2,2,1,0],
  [0,1,2,2,2,2,1,0],
  [1,1,2,4,4,2,1,1],
  [1,2,2,2,2,2,2,1],
  [1,2,2,2,2,2,2,1],
  [0,1,2,2,2,2,1,0],
  [1,1,1,1,1,1,1,1],
  [1,0,1,0,0,1,0,1],
  [1,0,1,0,0,1,0,1],
];
const PLAYER_PAL = ['', '#1a3366', '#3355aa', '#5577cc', '#eebb99', '#fff'];

export class Player extends Entity {
  constructor() {
    super(WORLD_W / 2, WORLD_H / 2, 20);
    this.speed = 5;       // 格/秒
    this.facing = 1;      // 1=右, -1=左
    this.sprite = new PIXI.Sprite(Entity.makePixelTexture(PLAYER_ROWS, PLAYER_PAL));
    this.sprite.anchor.set(0.5, 1);
    this.sprite.scale.set(1.6);
  }

  respawn() {
    this.x = WORLD_W / 2;
    this.y = WORLD_H / 2;
    this.z = world.surfaceZ(Math.round(this.x), Math.round(this.y)) + 1;
    this.vz = 0;
  }

  // move = { dx, dy, jump }（世界座標方向，由 input 模組換算）
  update(dt, move = { dx: 0, dy: 0, jump: false }) {
    let { dx, dy } = move;
    const len = Math.hypot(dx, dy);
    if (len > 0.01) {
      dx /= len; dy /= len;
      if (dx - dy > 0.01) this.facing = 1;
      else if (dx - dy < -0.01) this.facing = -1;
      const fz = Math.floor(this.z + 0.001);

      const nx = this.x + dx * this.speed * dt;
      if (!isSolid(Math.round(nx), Math.round(this.y), fz) &&
          !isSolid(Math.round(nx), Math.round(this.y), fz + 1)) this.x = nx;

      const ny = this.y + dy * this.speed * dt;
      if (!isSolid(Math.round(this.x), Math.round(ny), fz) &&
          !isSolid(Math.round(this.x), Math.round(ny), fz + 1)) this.y = ny;

      this.x = Math.max(0, Math.min(WORLD_W - 1, this.x));
      this.y = Math.max(0, Math.min(WORLD_H - 1, this.y));
    }

    // 跳躍與重力
    if (move.jump && this.onGround) {
      this.vz = 8.5;
      this.onGround = false;
      sfx(300, 0.05, 'sine');
    }
    this.vz -= 24 * dt;
    let nz = this.z + this.vz * dt;
    const pcx = Math.round(this.x), pcy = Math.round(this.y);
    if (this.vz <= 0) {
      const footCell = Math.floor(nz);
      if (isSolid(pcx, pcy, footCell)) {
        nz = footCell + 1;
        this.vz = 0;
        this.onGround = true;
      } else {
        this.onGround = false;
      }
    } else if (isSolid(pcx, pcy, Math.floor(nz) + 2)) {
      this.vz = 0;
      nz = this.z;
    }
    this.z = Math.max(1, Math.min(WORLD_D - 2, nz));
    if (this.z <= 1 && !isSolid(pcx, pcy, 1)) this.respawn();
  }
}

export const player = new Player();

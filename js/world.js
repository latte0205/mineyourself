// ===== 世界資料 + 地形生成 =====
// 地形生成由 generatorPasses 組成，每個 pass 是 { name, apply(world) }。
// 新增地形特徵（村莊、洞穴…）：generatorPasses.push({ name: 'caves', apply(w) { ... } })

import { WORLD_W, WORLD_H, WORLD_D } from './config.js';
import { hash2D, smoothNoise } from './util.js';
import { BLOCK, isOpaqueId, isSolidId } from './blocks.js';

// 低頻大振幅 → 高頻小振幅：平滑丘陵 + 細節
export function terrainNoise(x, y) {
  let v = 0, amp = 1, total = 0, scale = 32;
  for (let i = 0; i < 4; i++) {
    v += smoothNoise(x, y, scale) * amp;
    total += amp;
    amp *= 0.5;
    scale /= 2;
  }
  return v / total;
}

export class World {
  constructor() {
    this.data = new Uint8Array(WORLD_W * WORLD_H * WORLD_D);
    this.dirty = true;
  }

  idx(x, y, z) {
    return x + y * WORLD_W + z * WORLD_W * WORLD_H;
  }

  inBounds(x, y, z) {
    return x >= 0 && x < WORLD_W && y >= 0 && y < WORLD_H && z >= 0 && z < WORLD_D;
  }

  get(x, y, z) {
    if (!this.inBounds(x, y, z)) return BLOCK.AIR;
    return this.data[this.idx(x, y, z)];
  }

  set(x, y, z, id) {
    if (!this.inBounds(x, y, z)) return;
    this.data[this.idx(x, y, z)] = id;
    this.dirty = true;
  }

  getHeight(x, y) {
    const n = terrainNoise(x, y);
    const h = Math.floor(12 + n * 10);
    return Math.max(1, Math.min(WORLD_D - 8, h));
  }

  surfaceZ(x, y) {
    for (let z = WORLD_D - 1; z >= 0; z--) {
      if (isSolidId(this.get(x, y, z))) return z;
    }
    return 0;
  }

  generate() {
    this.data.fill(BLOCK.AIR);
    for (const pass of generatorPasses) pass.apply(this);
    this.dirty = true;
  }
}

export const generatorPasses = [];

generatorPasses.push({
  name: 'terrain',
  apply(w) {
    for (let x = 0; x < WORLD_W; x++) {
      for (let y = 0; y < WORLD_H; y++) {
        const h = w.getHeight(x, y);
        for (let z = 0; z <= h; z++) {
          let block;
          if (z === 0) block = BLOCK.BEDROCK;
          else if (z === h) block = h > 17 ? BLOCK.SNOW : (h < 11 ? BLOCK.SAND : BLOCK.GRASS);
          else if (z > h - 4) block = BLOCK.DIRT;
          else block = BLOCK.STONE;
          w.set(x, y, z, block);
        }
      }
    }
  },
});

generatorPasses.push({
  name: 'ores',
  apply(w) {
    for (let x = 0; x < WORLD_W; x++) {
      for (let y = 0; y < WORLD_H; y++) {
        for (let z = 1; z < WORLD_D; z++) {
          if (w.get(x, y, z) !== BLOCK.STONE) continue;
          const r = hash2D(x * 31 + y * 17, z * 7 + x);
          let ore = 0;
          if (z > 2 && z < 12 && r > 0.995) ore = BLOCK.DIAMOND_ORE;
          else if (z > 2 && z < 18 && r > 0.985) ore = BLOCK.GOLD_ORE;
          else if (z > 4 && z < 24 && r > 0.965) ore = BLOCK.IRON_ORE;
          else if (z > 2 && z < 28 && r > 0.94) ore = BLOCK.COAL_ORE;
          else if (r > 0.938) ore = BLOCK.LAPIS_ORE;
          else if (r > 0.93) ore = BLOCK.REDSTONE;
          if (ore) w.set(x, y, z, ore);
        }
      }
    }
  },
});

generatorPasses.push({
  name: 'trees',
  apply(w) {
    for (let x = 5; x < WORLD_W - 5; x += 3) {
      for (let y = 5; y < WORLD_H - 5; y += 3) {
        // 雙雜湊去除格點偏差，約 10% 的格點長樹
        if ((hash2D(x, y) + hash2D(y + 50, x + 99)) % 1 > 0.22) continue;
        const h = w.getHeight(x, y);
        if (w.get(x, y, h) !== BLOCK.GRASS) continue;
        const trunkH = 3 + Math.floor(hash2D(x + 100, y) * 3);
        for (let tz = h + 1; tz <= h + trunkH; tz++) {
          w.set(x, y, tz, BLOCK.OAK_LOG);
        }
        for (let lx = -2; lx <= 2; lx++) {
          for (let ly = -2; ly <= 2; ly++) {
            for (let lz = 0; lz <= 2; lz++) {
              if (Math.abs(lx) + Math.abs(ly) + lz > 4) continue;
              if (lx === 0 && ly === 0 && lz === 0) continue;
              const tx = x + lx, ty = y + ly, tz = h + trunkH + lz;
              if (w.get(tx, ty, tz) === BLOCK.AIR) w.set(tx, ty, tz, BLOCK.LEAVES);
            }
          }
        }
        w.set(x, y, h + trunkH + 1, BLOCK.LEAVES);
      }
    }
  },
});

export const world = new World();

export function isOpaque(x, y, z) {
  return isOpaqueId(world.get(x, y, z));
}

export function isSolid(x, y, z) {
  return isSolidId(world.get(x, y, z));
}

// ===== 方塊定義（資料驅動）=====
// 每個方塊是一個可擴充的物件：
//   id          顯式數值 id（存檔格式依賴，不可重排）
//   name        程式內名稱（BLOCK.GRASS）
//   label       顯示名稱
//   top/left/right  三個可見面的顏色
//   pattern     紋理名稱（見 patterns.js），可省略
//   solid       是否有碰撞（預設 true）
//   transparent 是否半透明（玻璃、水…，預設 false）
//   unbreakable 不可破壞（基岩）
//   breakMessage 嘗試破壞時的提示
//   onBreak(ctx) / onPlace(ctx)  可選 hook，ctx = { x, y, z, world, player }
//
// 新增方塊：defineBlock({ id: 37, name: 'MY_BLOCK', ... })
// 修改既有方塊：blocks.extend('GLASS', { solid: false })

import { Registry } from './registry.js';

export const blocks = new Registry('block');

// name → id 快速查表
export const BLOCK = {};

export function defineBlock(def) {
  blocks.register({ solid: true, transparent: false, ...def });
  BLOCK[def.name] = def.id;
  return def;
}

export function blockDef(id) {
  return blocks.get(id);
}

export function isOpaqueId(id) {
  const d = blocks.get(id);
  return !!d && d.id !== 0 && d.solid && !d.transparent;
}

export function isSolidId(id) {
  const d = blocks.get(id);
  return !!d && d.id !== 0 && d.solid;
}

defineBlock({ id: 0, name: 'AIR', label: 'Air', solid: false });
defineBlock({ id: 1, name: 'GRASS', label: 'Grass', top: '#5a8a3a', left: '#8a6a3a', right: '#6a4a1a', pattern: 'grass' });
defineBlock({ id: 2, name: 'DIRT', label: 'Dirt', top: '#8a6a3a', left: '#7a5a2a', right: '#6a4a1a', pattern: 'speckle' });
defineBlock({ id: 3, name: 'STONE', label: 'Stone', top: '#7a7a7a', left: '#6a6a6a', right: '#5a5a5a', pattern: 'speckle' });
defineBlock({ id: 4, name: 'OAK_WOOD', label: 'Oak Wood', top: '#8a6a3a', left: '#6a4a1a', right: '#5a3a0a', pattern: 'wood' });
defineBlock({ id: 5, name: 'LEAVES', label: 'Leaves', top: '#3a8a3a', left: '#2a7a2a', right: '#1a6a1a', pattern: 'leaves' });
defineBlock({ id: 6, name: 'PLANKS', label: 'Planks', top: '#c8a060', left: '#b89050', right: '#a08040', pattern: 'planks' });
defineBlock({ id: 7, name: 'STONE_BRICKS', label: 'Stone Bricks', top: '#8a8a8a', left: '#7a7a7a', right: '#6a6a6a', pattern: 'bricks' });
defineBlock({ id: 8, name: 'SAND', label: 'Sand', top: '#d8c868', left: '#c8b858', right: '#b8a848', pattern: 'speckle' });
defineBlock({ id: 9, name: 'GLASS', label: 'Glass', top: '#88cccc', left: '#77bbbb', right: '#66aaaa', transparent: true });
defineBlock({ id: 10, name: 'BIRCH_WOOD', label: 'Birch Wood', top: '#c8b080', left: '#a89060', right: '#907850', pattern: 'wood' });
defineBlock({ id: 11, name: 'SPRUCE_WOOD', label: 'Spruce Wood', top: '#5a4a2a', left: '#4a3a1a', right: '#3a2a0a', pattern: 'wood' });
defineBlock({ id: 12, name: 'COBBLESTONE', label: 'Cobblestone', top: '#6a6a6a', left: '#5a5a5a', right: '#4a4a4a', pattern: 'speckle' });
defineBlock({ id: 13, name: 'IRON_ORE', label: 'Iron Ore', top: '#7a6a5a', left: '#6a5a4a', right: '#5a4a3a', pattern: 'ore', oreColor: '#c8a060' });
defineBlock({ id: 14, name: 'GOLD_ORE', label: 'Gold Ore', top: '#7a6a5a', left: '#6a5a4a', right: '#5a4a3a', pattern: 'ore', oreColor: '#e8d040' });
defineBlock({ id: 15, name: 'DIAMOND_ORE', label: 'Diamond Ore', top: '#7a6a5a', left: '#6a5a4a', right: '#5a4a3a', pattern: 'ore', oreColor: '#40e8e8' });
defineBlock({ id: 16, name: 'LAVA', label: 'Lava', top: '#e84000', left: '#c83000', right: '#a82000' });
defineBlock({ id: 17, name: 'WATER', label: 'Water', top: '#3040e8', left: '#2030c8', right: '#1020a8', transparent: true });
defineBlock({ id: 18, name: 'BOOKSHELF', label: 'Bookshelf', top: '#c8a060', left: '#8a6a3a', right: '#6a4a1a', pattern: 'planks' });
defineBlock({ id: 19, name: 'FENCE', label: 'Fence', top: '#c8a060', left: '#b89050', right: '#a08040', solid: false });
defineBlock({ id: 20, name: 'REDSTONE', label: 'Redstone Ore', top: '#7a6a5a', left: '#6a5a4a', right: '#5a4a3a', pattern: 'ore', oreColor: '#e82020' });
defineBlock({ id: 21, name: 'COAL_ORE', label: 'Coal Ore', top: '#7a6a5a', left: '#6a5a4a', right: '#5a4a3a', pattern: 'ore', oreColor: '#2a2a2a' });
defineBlock({ id: 22, name: 'LAPIS_ORE', label: 'Lapis Ore', top: '#7a6a5a', left: '#6a5a4a', right: '#5a4a3a', pattern: 'ore', oreColor: '#2040c8' });
defineBlock({ id: 23, name: 'NETHERRACK', label: 'Netherrack', top: '#8a3040', left: '#7a2030', right: '#6a1020', pattern: 'speckle' });
defineBlock({ id: 24, name: 'SOUL_SAND', label: 'Soul Sand', top: '#6a4a3a', left: '#5a3a2a', right: '#4a2a1a', pattern: 'speckle' });
defineBlock({ id: 25, name: 'ICE', label: 'Ice', top: '#a0d8d8', left: '#90c8c8', right: '#80b8b8', transparent: true });
defineBlock({ id: 26, name: 'SNOW', label: 'Snow', top: '#e8e8f0', left: '#d8d8e0', right: '#c8c8d0' });
defineBlock({ id: 27, name: 'RED_MUSHROOM', label: 'Red Mushroom', top: '#e84040', left: '#c83030', right: '#a82020', solid: false });
defineBlock({ id: 28, name: 'BROWN_MUSHROOM', label: 'Brown Mushroom', top: '#c8a080', left: '#b89070', right: '#a08060', solid: false });
defineBlock({ id: 29, name: 'TORCH', label: 'Torch', top: '#e8a040', left: '#c88030', right: '#a86020', solid: false, pattern: 'torch' });
defineBlock({ id: 30, name: 'BEDROCK', label: 'Bedrock', top: '#3a3a3a', left: '#2a2a2a', right: '#1a1a1a', pattern: 'speckle', unbreakable: true, breakMessage: '基岩無法破壞' });
defineBlock({ id: 31, name: 'GRAVEL', label: 'Gravel', top: '#8a8a7a', left: '#7a7a6a', right: '#6a6a5a', pattern: 'speckle' });
defineBlock({ id: 32, name: 'BRICK', label: 'Brick', top: '#c86040', left: '#b85030', right: '#a84020', pattern: 'bricks' });
defineBlock({ id: 33, name: 'OAK_LOG', label: 'Oak Log', top: '#8a6a3a', left: '#6a4a1a', right: '#5a3a0a', pattern: 'wood' });
defineBlock({ id: 34, name: 'SPRUCE_LOG', label: 'Spruce Log', top: '#5a4a2a', left: '#4a3a1a', right: '#3a2a0a', pattern: 'wood' });
defineBlock({ id: 35, name: 'WHITE_WOOL', label: 'White Wool', top: '#e8e8e8', left: '#d8d8d8', right: '#c8c8c8' });
defineBlock({ id: 36, name: 'OAK_PLANKS', label: 'Oak Planks', top: '#c8a060', left: '#b89050', right: '#a08040', pattern: 'planks' });

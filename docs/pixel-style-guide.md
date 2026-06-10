# Isometric 像素風格指南

基於 gstack zombie shooter 的 pixel-style-guide 擴充，新增 isometric 45° 視角規範。

## 核心規格

- **引擎**: PixiJS 8 (WebGL + Canvas)
- **視角**: Isometric 45°，2.5D 俯視
- **Tile 尺寸**: 64×32 螢幕像素（每個 tile 為菱形）
- **方塊高度**: 每個方塊佔 16 螢幕像素高（half tile height）
- **Pixel Unit**: 2px（方塊紋理用 PS=2，角色用 PS=3）

## Isometric 投影公式

```
螢幕 X = (worldX - worldY) * TILE_W / 2
螢幕 Y = (worldX + worldY) * TILE_H / 2 - worldZ * TILE_H / 2
```

## Block Face 結構

每個方塊由三個可見面組成：
- **頂面 (Top)**: 菱形，16×8 像素網格
- **左側面 (Left)**: 平行四邊形，8×16 像素網格
- **右側面 (Right)**: 平行四邊形，8×16 像素網格

## 世界資料結構

```
world[x][y][z] = blockId
x, y: 水平位置 (0~79)
z: 垂直高度 (0~31)
blockId: 0=空氣, 1~36=方塊類型
```

## 色票（方塊用）

沿用角色色票索引規則，擴充方塊色票：

| Block | Top | Left | Right |
|-------|-----|------|-------|
| Grass | #5a8a3a | #4a7a2a | #3a6a1a |
| Dirt | #8a6a3a | #7a5a2a | #6a4a1a |
| Stone | #7a7a7a | #6a6a6a | #5a5a5a |
| Wood | #8a6a3a | #7a5a2a | #6a4a1a |
| 等 | ... | ... | ... |

## 手機版差異

- Virtual joystick（左半螢幕移動）
- Tap to break/place（點方塊破壞/放置）
- 自動縮放 Canvas 填滿螢幕
- Hotbar 移到下方便於觸控

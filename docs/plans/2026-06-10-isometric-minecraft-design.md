# Isometric Minecraft — Design Doc

## Tech Stack
- PixiJS 8 (CDN), pure Canvas fallback
- Single `index.html` + `game.js`
- LocalStorage for save/load

## World
- 80×80×32 block 3D array
- Terrain: grass → dirt → stone → ores
- 30+ block types (8 hand-crafted textures, rest procedural)

## Rendering
- Isometric 45° projection
- TILE_W=64, TILE_H=32 screen pixels
- Painter's algorithm depth sorting
- 3 visible faces per block (top, left, right)

## Player
- WASD movement, space to jump
- Left click break block, right click place
- Pixel art character (8×10 sprite, PS=3)

## UI
- Bottom hotbar (9 slots)
- Block name display
- Desktop: keyboard + mouse
- Mobile: virtual joystick + tap

## Platforms
- Web first (Chrome/Safari/Firefox)
- PWA or Tauri later for Steam

## Save
- Auto-save every 30s
- Load on entry
- LocalStorage key: `project4_world`

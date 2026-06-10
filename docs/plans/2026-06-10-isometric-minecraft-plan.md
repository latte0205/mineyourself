# Isometric Minecraft Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a 2.5D isometric pixel-art Minecraft-like creative mode game

**Architecture:** PixiJS 8 rendering + custom isometric engine. World as 3D block array. Painter's algorithm for depth sorting.

**Tech Stack:** PixiJS 8 (CDN), Canvas 2D, LocalStorage

---

### Task 1: Project Scaffold

**Files:**
- Create: `project4/index.html`
- Create: `project4/game.js`

**Step 1:** Create `index.html` with PixiJS CDN, fullscreen canvas, responsive CSS

**Step 2:** Create `game.js` with PixiJS Application setup, game loop skeleton, state management

**Step 3:** Open in browser — verify PixiJS renders a blank canvas

---

### Task 2: World System

**Files:**
- Modify: `project4/game.js`

**Step 1:** Define world constants: W=80, H=80, D=32

**Step 2:** Implement `World` class with 3D Uint8Array storage

**Step 3:** Implement terrain generator:
- Heightmap with simplex noise (or simple sine-based)
- z=surface: grass
- z=surface-1 to surface-5: dirt
- z=0 to surface-6: stone
- Scatter ores in stone layer

**Step 4:** Implement block getter/setter with bounds checking

---

### Task 3: Block Registry

**Files:**
- Modify: `project4/game.js`

**Step 1:** Define block database (30+ types):
```
AIR=0, GRASS=1, DIRT=2, STONE=3, OAK_WOOD=4, LEAVES=5,
PLANKS=6, STONE_BRICKS=7, SAND=8, GLASS=9,
BIRCH_WOOD=10, SPRUCE_WOOD=11, COBBLESTONE=12,
IRON_ORE=13, GOLD_ORE=14, DIAMOND_ORE=15,
LAVA=16, WATER=17, BOOKSHELF=18, FENCE=19,
REDSTONE=20, COAL_ORE=21, LAPIS_ORE=22,
NETHERRACK=23, SOUL_SAND=24, ICE=25, SNOW=26,
RED_MUSHROOM=27, BROWN_MUSHROOM=28, TORCH=29, BEDROCK=30
```

**Step 2:** Each block has: id, name, topColor, leftColor, rightColor, texture type, solid

**Step 3:** Hand-craft texture patterns for key blocks (grass, dirt, stone, wood, leaves, planks, sand, glass)

**Step 4:** Implement procedural texture generator for remaining blocks (base color + noise/detail)

---

### Task 4: Isometric Renderer

**Files:**
- Modify: `project4/game.js`

**Step 1:** Implement world-to-screen projection:
```
sx = (x - y) * TILE_W / 2
sy = (x + y) * TILE_H / 2 - z * TILE_H
```

**Step 2:** Implement screen-to-world raycasting (for click detection)

**Step 3:** Build block face renderers:
- Top face: diamond using polygon points
- Left face: left parallelogram
- Right face: right parallelogram
- Apply texture colors per pixel

**Step 4:** Implement painter's algorithm:
- Sort visible blocks by (x + y + z) depth
- Draw farthest to nearest
- Skip air blocks

**Step 5:** Apply camera offset (center camera on player)

---

### Task 5: Block Textures (Pixel Art)

**Files:**
- Modify: `project4/game.js`

**Step 1:** Define texture grids for hand-crafted blocks:
- Each face is an 8×8 (top) or 8×4 (sides) color grid
- Draw grass with green top + brown speckles
- Draw stone with gray speckles
- Draw wood with brown rings
- Draw leaves with green clusters
- Draw planks with horizontal lines
- Draw sand with yellow dots
- Draw glass with light blue + transparency

**Step 2:** For procedural blocks, generate textures with:
- Base color fills the face
- Add noise/pattern based on block type
- Add edge highlights for depth

---

### Task 6: Player

**Files:**
- Modify: `project4/game.js`

**Step 1:** Player object with world position (x,y,z), size, speed

**Step 2:** WASD movement in isometric world space:
- W: (dx=-1, dy=-1) — move up-right on screen
- S: (dx=+1, dy=+1) — move down-left
- A: (dx=-1, dy=+1) — move up-left
- D: (dx=+1, dy=-1) — move down-right

**Step 3:** Jump with Space (gravity, ground collision)

**Step 4:** Camera follows player

**Step 5:** Draw player as pixel-art character (update angle based on movement direction)

---

### Task 7: Block Interaction

**Files:**
- Modify: `project4/game.js`

**Step 1:** Implement isometric raycasting:
- From screen click → world ray
- Step through blocks until hitting a solid one
- Return block coordinates and face

**Step 2:** Left-click destroy:
- Get block under cursor via raycast
- Set to AIR
- Add particle effect

**Step 3:** Right-click place:
- Get block adjacent to clicked face
- Set to currently selected block
- Validate placement (not inside player)

**Step 4:** Highlight hovered block (wireframe overlay)

---

### Task 8: UI / Hotbar

**Files:**
- Modify: `project4/game.js`

**Step 1:** Bottom hotbar with 9 slots
- PixiJS Graphics drawing
- Highlight selected slot
- Show block icon in each slot

**Step 2:** Keyboard selection: 1-9 keys, scroll wheel

**Step 3:** HUD text: selected block name, coordinates

**Step 4:** Responsive layout (update on resize)

---

### Task 9: Save/Load

**Files:**
- Modify: `project4/game.js`

**Step 1:** Serialize world to compressed string:
- Uint8Array → base64 or JSON

**Step 2:** Save to localStorage on:
- Manual interval (30s)
- Window unload

**Step 3:** Load on startup, check if save exists

**Step 4:** "New World" button in UI

---

### Task 10: Mobile Controls

**Files:**
- Modify: `project4/game.js`

**Step 1:** Detect touch device

**Step 2:** Virtual joystick (left half of screen):
- PixiJS Graphics circle
- Touch drag to move
- Release to stop

**Step 3:** Tap to interact:
- Tap block: break
- Tap air adjacent to block: place

**Step 4:** Hotbar touch buttons

**Step 5:** Responsive canvas fills screen

---

### Task 11: Polish

**Files:**
- Modify: `project4/game.js`

**Step 1:** Block break particles (small colored squares)

**Step 2:** Block place animation (scale in)

**Step 3:** Day/night cycle or at least sky gradient

**Step 4:** Block highlight outline

**Step 5:** Sound effects (Web Audio API or simple beeps)

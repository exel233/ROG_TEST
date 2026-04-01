# Rift Outlast

Rift Outlast is a browser-based 2D top-down survival action game prototype built with vanilla JavaScript and HTML5 Canvas. It keeps the original playable loop, then layers in pixel-art presentation, stronger early-game pacing, richer rewards, and clearer extension points for future content.

## Run

```bash
npm run dev
```

Default URL:

```text
http://localhost:5173
```

If `5173` is already in use, the local server automatically retries on the next available port.

## Controls

- `WASD` or arrow keys: move
- Mouse: click upgrade or reward cards
- `Esc`: pause or resume

## What Is In The Current Build

### Core Gameplay

- Auto-attacking survival combat
- Experience drops, leveling, and pause-on-level-up choices
- Enemy escalation with elite marks and a boss encounter
- Game over, restart, and character selection

### Playable Content

- 3 playable characters
- 8 weapon archetypes
- 15 permanent passive upgrades
- 4 temporary blessing buffs
- 9 enemy archetypes including elite, summoner, and boss
- Healing drops, supply caches, and rare chest rewards

### Visual Upgrade

- Pixel-art battlefield rendering with sprite atlases
- Pixel-style UI theme and local bitmap-friendly font
- Sprite-based player, enemy, and pickup presentation
- Floating damage text, particle bursts, pickup feedback, and stronger hit feel
- Dark fantasy dungeon floor tiling instead of the original abstract geometry

### Progression

- Smoother early-game pacing and stronger opening survivability
- Opening shield to reduce early frustration
- Persistent shard currency across runs
- Meta upgrades that improve future runs
- Best kills and best survival time saved locally

## Open Source Assets

This project includes lightweight open-source assets from:

- Tiny Dungeon by Kenney
- Tiny Creatures by Clint Bellanger, made to visually match Tiny Dungeon
- Kenney UI Pack

Local copies and license files are stored in:

- `src/assets/atlases`
- `src/assets/fonts`
- `src/assets/packs`

## Project Structure

```text
.
|- index.html
|- package.json
|- server.js
|- README.md
`- src
   |- main.js
   |- styles.css
   |- assets
   |  |- atlases
   |  |- fonts
   |  `- packs
   |- data
   |  |- balance.js
   |  |- config.js
   |  `- visuals.js
   |- entities
   |  `- Entities.js
   |- game
   |  |- Game.js
   |  `- SceneManager.js
   |- renderers
   |  `- EntityRenderer.js
   |- scenes
   |  `- ArenaScene.js
   |- systems
   |  |- AssetManager.js
   |  |- MetaProgression.js
   |  `- Systems.js
   `- utils
      `- math.js
```

## Main Modules

- `src/game/Game.js`
  - bootstrap, resize, asset loading, scene switching, main loop
- `src/scenes/ArenaScene.js`
  - a full run: combat, events, rewards, boss phases, pickups, particles, records
- `src/entities/Entities.js`
  - player, enemy, projectile, and pickup behavior
- `src/systems/Systems.js`
  - input, spawning, upgrades, collisions, and DOM HUD or overlay control
- `src/systems/AssetManager.js`
  - atlas and font loading
- `src/systems/MetaProgression.js`
  - persistent shards, run rewards, and meta upgrade purchases
- `src/renderers/EntityRenderer.js`
  - battlefield, sprites, particles, floating texts, and pickup rendering
- `src/data/config.js`
  - characters, weapons, passives, temporary buffs, meta upgrades, enemies
- `src/data/balance.js`
  - pacing, drops, events, records, and shard economy
- `src/data/visuals.js`
  - atlas sources, sprite mappings, floor tiles, and palette data

## Recent Upgrade Summary

### Visual Pass

- Added sprite atlases and a renderer layer
- Shifted the game to a coherent pixel-art look
- Restyled HUD and overlays to match the game world

### Balance Pass

- Improved opening survivability and weapon effectiveness
- Slowed early pressure without flattening later danger
- Added short opening protection and more stable early growth

### Content Pass

- Added summoner behavior
- Added healing drops and timed supply cache events
- Added temporary blessing buffs
- Added boss enrages, radial bursts, and add summons
- Added persistent shard rewards and menu-side meta upgrades

## Known Issues

- The current sprite presentation is intentionally lightweight and does not yet include full walk cycles for every actor
- UI remains DOM-driven for stability and ease of iteration
- The development scripts currently use a Windows-specific Node path to avoid PATH issues in this environment
- Meta progression is intentionally compact and can still grow into a larger unlock tree later

## Recommended Next Steps

- Add multi-frame player and enemy animations
- Add boss telegraph decals and more distinct late-game attack patterns
- Split `Entities.js` and `Systems.js` into smaller files as the project grows
- Add sound effects, settings, and optional screen shake toggles
- Add more relic-style chest rewards and map event variations

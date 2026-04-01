# Rift Outlast

Rift Outlast is a browser-based 2D top-down survival action game built with vanilla JavaScript and HTML5 Canvas. This version keeps the original playable prototype, then continues iterating toward a stronger pixel-art presentation, clearer combat feedback, and a smoother early-game power curve.

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

## Current Build Highlights

### Core Survival Loop

- Auto-attacking survival combat
- Enemy swarms, elites, and a boss encounter
- Experience drops, level-up pauses, and build choices
- Game over, restart, and character selection

### Visual Upgrade

- Cohesive pixel-art rendering based on CC0 fantasy pixel packs
- Stronger battlefield tiling with floor overlays and prop clutter
- Sprite-based player, enemy, pickup, and orbital weapon rendering
- Real projectile visuals for every weapon archetype
- Muzzle flashes, slash FX, hit sparks, burst FX, smoke fades, and floating damage text
- Pixel-themed UI panels, icon-driven cards, and improved build HUD

### Content and Progression

- 3 playable characters
- 8 weapon archetypes
- 15 permanent passive upgrades
- 4 temporary blessing buffs
- 9 enemy archetypes including elite, summoner, and phase-based boss
- Healing drops, supply caches, rare rewards, and persistent meta shards

### Balance Improvements

- Faster first and second levels
- Better pickup flow and smoother early XP gain
- Stronger starting character baselines
- More reliable opening weapon performance
- Slightly slower early enemy ramp while mid-game challenge remains

## Open Source Assets And Licenses

All newly integrated art assets in this version use clear CC0 licensing.

### World, Characters, Props

- `Tiny Dungeon` by Kenney
- Source: `https://kenney.nl/assets/tiny-dungeon`
- License: CC0 1.0
- Usage: dungeon tiles, player sprites, props, pickups, icons cropped from the atlas

- `Tiny Creatures` by Clint Bellanger
- Source: `https://opengameart.org/content/tiny-creatures`
- License: CC0 1.0
- Usage: enemy sprites and boss or elite creature visuals

### UI And Panels

- `UI Pack - Pixel Adventure` by Kenney
- Source: `https://kenney.nl/assets/ui-pack-pixel-adventure`
- License: CC0 1.0
- Usage: panel and button tile textures used in the HUD and overlays

### Combat Effects

- `Particle Pack` by Kenney
- Source: `https://kenney.nl/assets/particle-pack`
- License: CC0 1.0
- Usage: slash FX, muzzle flashes, sparks, smoke, traces, magic flares

### Weapon And Upgrade Icons

- `Roguelike Characters` by Kenney
- Source: `https://kenney.nl/assets/roguelike-characters`
- License: CC0 1.0
- Usage: source reference for icon direction; this build uses cropped icon-style items and character portraits derived from the existing fantasy atlas for tighter visual consistency

Local license files are stored in:

- `src/assets/packs/tiny-dungeon-license.txt`
- `src/assets/packs/tiny-creatures-license.txt`
- `src/assets/packs/ui-pack-license.txt`
- `src/assets/packs/ui-pack-pixel-adventure-license.txt`
- `src/assets/packs/particle-pack-license.txt`
- `src/assets/packs/roguelike-characters-license.txt`

## Resource Directory Layout

```text
src/assets
|- atlases
|  |- tiny-dungeon.png
|  `- tiny-creatures.png
|- fx
|  |- slash_01.png
|  |- muzzle_01.png
|  |- spark_01.png
|  `- ...
|- fonts
|  `- KenneyFuture.ttf
|- icons
|  |- weapon_arcBlades.png
|  |- passive_damage.png
|  `- character_strider.png
|- packs
|  `- license files
`- ui
   `- pixel
      |- panel_blue.png
      |- panel_brown.png
      |- button_red.png
      `- button_green.png
```

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

- `src/data/visuals.js`
  - central visual index for atlases, effect sprites, UI textures, icons, and weapon FX configuration
- `src/renderers/EntityRenderer.js`
  - battlefield drawing, sprite rendering, projectile visuals, effect sprite drawing, particles, and floating text
- `src/scenes/ArenaScene.js`
  - one full run of gameplay, including combat, drops, rewards, boss phases, and effect spawning
- `src/systems/AssetManager.js`
  - image and font loading
- `src/systems/Systems.js`
  - input, enemy spawning, upgrades, collision handling, HUD and overlay UI
- `src/entities/Entities.js`
  - player, projectile, enemy, and pickup behavior
- `src/data/config.js`
  - characters, weapons, passives, buffs, meta upgrades, enemies, encounter schedule
- `src/data/balance.js`
  - pacing, drops, event timing, records, and meta economy

## Attack And Feedback Improvements

The current build now adds a clearer visual loop for combat:

- Distinct projectile looks for lance, shard, pollen, wisp, enemy shots, and returning sickles
- Real slash visuals for orbital and boomerang-style weapons
- Impact sparks and smoke bursts on hit or projectile expiration
- Pulse and aura visuals for thunder and frost area attacks
- Better projectile trails to improve direction readability
- Stronger enemy death feedback and boss phase bursts

## Balance Changes In This Iteration

The player felt weaker than intended mostly because the first build-up window was still too slow and the visual confirmation of damage was too soft.

This iteration improves that by:

- reducing early level XP requirements
- raising the base XP multiplier
- lengthening the opening shield window
- strengthening starting character baselines
- buffing the level-1 versions of `Arc Blades`, `Ember Lance`, and `Frost Field`
- increasing pickup attraction strength
- delaying the first enemy schedule spikes slightly
- moving the first supply event earlier

Result:

- the first 30 to 60 seconds are less punishing
- the player starts snowballing earlier
- combat feels stronger partly because the weapons are better and partly because the visuals now confirm hits more clearly
- the mid-game still ramps because enemy cap and growth continue scaling upward

## Known Issues

- Full directional walk animation sets are still not present for every actor
- Some UI panels still rely on CSS composition instead of true nine-slice UI sprites
- Long-session gameplay balance was improved, but not fully hand-tuned across many runs yet
- The development scripts still use a Windows-specific Node path in `package.json` because that was the safest option in this environment

## Recommended Next Steps

- add true directional movement animation sets for player and major enemies
- add telegraph decals for boss radial attacks
- expand relic-style reward variety from chests
- split `Entities.js` and `Systems.js` into smaller files as the project grows
- add sound effects, settings, and optional accessibility toggles for shake and hit flash

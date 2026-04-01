export const atlases = {
  dungeon: {
    key: "dungeon",
    src: "./src/assets/atlases/tiny-dungeon.png",
    tileSize: 16
  },
  creatures: {
    key: "creatures",
    src: "./src/assets/atlases/tiny-creatures.png",
    tileSize: 16
  }
};

export const imageAssets = {
  fxSlash1: { key: "fxSlash1", src: "./src/assets/fx/slash_01.png" },
  fxSlash2: { key: "fxSlash2", src: "./src/assets/fx/slash_02.png" },
  fxSlash3: { key: "fxSlash3", src: "./src/assets/fx/slash_03.png" },
  fxMuzzle1: { key: "fxMuzzle1", src: "./src/assets/fx/muzzle_01.png" },
  fxMuzzle2: { key: "fxMuzzle2", src: "./src/assets/fx/muzzle_02.png" },
  fxSpark1: { key: "fxSpark1", src: "./src/assets/fx/spark_01.png" },
  fxSpark4: { key: "fxSpark4", src: "./src/assets/fx/spark_04.png" },
  fxMagic1: { key: "fxMagic1", src: "./src/assets/fx/magic_01.png" },
  fxMagic3: { key: "fxMagic3", src: "./src/assets/fx/magic_03.png" },
  fxTrace3: { key: "fxTrace3", src: "./src/assets/fx/trace_03.png" },
  fxTrace5: { key: "fxTrace5", src: "./src/assets/fx/trace_05.png" },
  fxFlare1: { key: "fxFlare1", src: "./src/assets/fx/flare_01.png" },
  fxSmoke3: { key: "fxSmoke3", src: "./src/assets/fx/smoke_03.png" },
  uiPanelBlue: { key: "uiPanelBlue", src: "./src/assets/ui/pixel/panel_blue.png" },
  uiPanelBrown: { key: "uiPanelBrown", src: "./src/assets/ui/pixel/panel_brown.png" },
  uiButtonRed: { key: "uiButtonRed", src: "./src/assets/ui/pixel/button_red.png" },
  uiButtonGreen: { key: "uiButtonGreen", src: "./src/assets/ui/pixel/button_green.png" },
  iconArcBlades: { key: "iconArcBlades", src: "./src/assets/icons/weapon_arcBlades.png" },
  iconEmberLance: { key: "iconEmberLance", src: "./src/assets/icons/weapon_emberLance.png" },
  iconPollenBurst: { key: "iconPollenBurst", src: "./src/assets/icons/weapon_pollenBurst.png" },
  iconThunderPulse: { key: "iconThunderPulse", src: "./src/assets/icons/weapon_thunderPulse.png" },
  iconSeekerWisps: { key: "iconSeekerWisps", src: "./src/assets/icons/weapon_seekerWisps.png" },
  iconRailShard: { key: "iconRailShard", src: "./src/assets/icons/weapon_railShard.png" },
  iconBoomerSickle: { key: "iconBoomerSickle", src: "./src/assets/icons/weapon_boomerSickle.png" },
  iconFrostField: { key: "iconFrostField", src: "./src/assets/icons/weapon_frostField.png" },
  iconPassiveDamage: { key: "iconPassiveDamage", src: "./src/assets/icons/passive_damage.png" },
  iconPassiveSpeed: { key: "iconPassiveSpeed", src: "./src/assets/icons/passive_speed.png" },
  iconPassiveGuard: { key: "iconPassiveGuard", src: "./src/assets/icons/passive_guard.png" },
  iconPassiveGrowth: { key: "iconPassiveGrowth", src: "./src/assets/icons/passive_growth.png" },
  iconPassiveSupport: { key: "iconPassiveSupport", src: "./src/assets/icons/passive_support.png" },
  iconPassiveUtility: { key: "iconPassiveUtility", src: "./src/assets/icons/passive_utility.png" },
  iconCharacterStrider: { key: "iconCharacterStrider", src: "./src/assets/icons/character_strider.png" },
  iconCharacterEmber: { key: "iconCharacterEmber", src: "./src/assets/icons/character_ember.png" },
  iconCharacterWarden: { key: "iconCharacterWarden", src: "./src/assets/icons/character_warden.png" }
};

export const pixelScale = 3;

export const worldPalette = {
  shadow: "rgba(7, 8, 14, 0.48)",
  floorTint: "rgba(12, 16, 22, 0.24)",
  floorGlow: "rgba(45, 112, 134, 0.16)",
  riftGlow: "rgba(91, 221, 189, 0.14)",
  hitWarm: "#ffcf7d",
  hitCold: "#92dfff",
  hitNature: "#c3f36a",
  hitArcane: "#e0b8ff",
  xp: "#62e5ff",
  heal: "#7ef0a8",
  chest: "#ffd166",
  buff: "#ff8da1"
};

export const floorTiles = [
  { atlas: "dungeon", x: 0, y: 4 },
  { atlas: "dungeon", x: 1, y: 4 },
  { atlas: "dungeon", x: 2, y: 4 },
  { atlas: "dungeon", x: 3, y: 4 },
  { atlas: "dungeon", x: 4, y: 4 }
];

export const floorOverlayTiles = [
  { atlas: "dungeon", x: 0, y: 3 },
  { atlas: "dungeon", x: 1, y: 3 },
  { atlas: "dungeon", x: 2, y: 3 }
];

export const decorTiles = [
  { atlas: "dungeon", x: 0, y: 0 },
  { atlas: "dungeon", x: 1, y: 0 },
  { atlas: "dungeon", x: 3, y: 0 },
  { atlas: "dungeon", x: 5, y: 0 },
  { atlas: "dungeon", x: 7, y: 0 },
  { atlas: "dungeon", x: 8, y: 0 },
  { atlas: "dungeon", x: 9, y: 0 },
  { atlas: "dungeon", x: 10, y: 0 },
  { atlas: "dungeon", x: 11, y: 0 }
];

export const propTiles = [
  { atlas: "dungeon", x: 5, y: 5 },
  { atlas: "dungeon", x: 6, y: 5 },
  { atlas: "dungeon", x: 7, y: 5 },
  { atlas: "dungeon", x: 8, y: 5 },
  { atlas: "dungeon", x: 9, y: 5 },
  { atlas: "dungeon", x: 10, y: 5 },
  { atlas: "dungeon", x: 11, y: 5 }
];

export const characterSprites = {
  strider: {
    atlas: "dungeon",
    idle: [{ x: 0, y: 7 }, { x: 1, y: 7 }],
    move: [{ x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }]
  },
  ember: {
    atlas: "dungeon",
    idle: [{ x: 2, y: 7 }, { x: 3, y: 7 }],
    move: [{ x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }]
  },
  warden: {
    atlas: "dungeon",
    idle: [{ x: 3, y: 7 }, { x: 4, y: 7 }],
    move: [{ x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }]
  }
};

export const enemySprites = {
  crawler: { atlas: "creatures", idle: [{ x: 0, y: 6 }, { x: 1, y: 6 }] },
  sprinter: { atlas: "creatures", idle: [{ x: 2, y: 6 }, { x: 3, y: 6 }] },
  juggernaut: { atlas: "creatures", idle: [{ x: 5, y: 8 }, { x: 4, y: 8 }] },
  spitter: { atlas: "creatures", idle: [{ x: 5, y: 6 }, { x: 6, y: 6 }] },
  dasher: { atlas: "creatures", idle: [{ x: 8, y: 2 }, { x: 9, y: 2 }] },
  splitter: { atlas: "creatures", idle: [{ x: 0, y: 7 }, { x: 1, y: 7 }] },
  elite: { atlas: "creatures", idle: [{ x: 0, y: 0 }, { x: 1, y: 0 }] },
  boss: { atlas: "creatures", idle: [{ x: 4, y: 4 }, { x: 5, y: 4 }] },
  summoner: { atlas: "creatures", idle: [{ x: 7, y: 0 }, { x: 8, y: 0 }] }
};

export const pickupSprites = {
  xp: { atlas: "dungeon", frame: { x: 7, y: 4 } },
  heal: { atlas: "dungeon", frame: { x: 6, y: 9 } },
  chest: { atlas: "dungeon", frame: { x: 2, y: 0 } }
};

export const iconSources = {
  characters: {
    strider: imageAssets.iconCharacterStrider.src,
    ember: imageAssets.iconCharacterEmber.src,
    warden: imageAssets.iconCharacterWarden.src
  },
  weapons: {
    arcBlades: imageAssets.iconArcBlades.src,
    emberLance: imageAssets.iconEmberLance.src,
    pollenBurst: imageAssets.iconPollenBurst.src,
    thunderPulse: imageAssets.iconThunderPulse.src,
    seekerWisps: imageAssets.iconSeekerWisps.src,
    railShard: imageAssets.iconRailShard.src,
    boomerSickle: imageAssets.iconBoomerSickle.src,
    frostField: imageAssets.iconFrostField.src
  },
  passives: {
    rapidity: imageAssets.iconPassiveSpeed.src,
    might: imageAssets.iconPassiveDamage.src,
    multishot: imageAssets.iconPassiveUtility.src,
    velocity: imageAssets.iconPassiveSpeed.src,
    crit: imageAssets.iconPassiveDamage.src,
    expansion: imageAssets.iconPassiveSupport.src,
    duration: imageAssets.iconPassiveSupport.src,
    stride: imageAssets.iconPassiveSpeed.src,
    vitality: imageAssets.iconPassiveGuard.src,
    magnetism: imageAssets.iconPassiveUtility.src,
    scholar: imageAssets.iconPassiveGrowth.src,
    recovery: imageAssets.iconPassiveGrowth.src,
    guard: imageAssets.iconPassiveGuard.src,
    scavenger: imageAssets.iconPassiveUtility.src,
    overclock: imageAssets.iconPassiveDamage.src
  },
  rewards: {
    heal: imageAssets.iconPassiveGrowth.src,
    "full-heal": imageAssets.iconPassiveGrowth.src
  }
};

export const weaponVisuals = {
  arcBlades: {
    color: "#9cf0ff",
    orbitalSprite: { atlas: "dungeon", x: 7, y: 8 },
    hitFx: "fxSlash1",
    deathFx: "fxSpark1"
  },
  emberLance: {
    color: "#ff9a76",
    projectileFx: "fxTrace5",
    projectileScale: 0.38,
    trailLength: 18,
    trailColor: "rgba(255, 139, 92, 0.52)",
    muzzleFx: "fxMuzzle2",
    hitFx: "fxSpark4",
    deathFx: "fxSmoke3"
  },
  pollenBurst: {
    color: "#d9f16f",
    projectileFx: "fxTrace3",
    projectileScale: 0.3,
    trailLength: 12,
    trailColor: "rgba(190, 233, 104, 0.44)",
    muzzleFx: "fxMuzzle1",
    hitFx: "fxSpark1",
    deathFx: "fxSmoke3"
  },
  thunderPulse: {
    color: "#d7b8ff",
    zoneFx: "fxMagic3",
    zoneOutline: "#d7b8ff",
    hitFx: "fxMagic1"
  },
  seekerWisps: {
    color: "#9dffba",
    projectileFx: "fxMagic1",
    projectileScale: 0.42,
    trailLength: 10,
    trailColor: "rgba(134, 255, 185, 0.34)",
    muzzleFx: "fxFlare1",
    hitFx: "fxSpark1",
    deathFx: "fxFlare1"
  },
  railShard: {
    color: "#a8d6ff",
    projectileFx: "fxTrace5",
    projectileScale: 0.34,
    trailLength: 22,
    trailColor: "rgba(146, 212, 255, 0.48)",
    muzzleFx: "fxMuzzle1",
    hitFx: "fxSpark4",
    deathFx: "fxSmoke3"
  },
  boomerSickle: {
    color: "#ffb3d2",
    projectileFx: "fxSlash2",
    projectileScale: 0.36,
    trailLength: 10,
    trailColor: "rgba(255, 175, 210, 0.35)",
    muzzleFx: "fxSlash3",
    hitFx: "fxSlash1",
    deathFx: "fxSmoke3"
  },
  frostField: {
    color: "#8df0ff",
    zoneFx: "fxMagic1",
    zoneOutline: "#8df0ff",
    hitFx: "fxSpark4"
  },
  enemy: {
    color: "#9ef5b2",
    projectileFx: "fxMagic3",
    projectileScale: 0.34,
    trailLength: 13,
    trailColor: "rgba(130, 232, 157, 0.35)",
    hitFx: "fxSpark1",
    deathFx: "fxSmoke3"
  },
  boss: {
    color: "#ffd38e",
    projectileFx: "fxFlare1",
    projectileScale: 0.42,
    trailLength: 20,
    trailColor: "rgba(255, 211, 142, 0.45)",
    hitFx: "fxSpark4",
    deathFx: "fxSmoke3"
  }
};

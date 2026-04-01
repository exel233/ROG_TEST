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

export const pixelScale = 3;

export const worldPalette = {
  shadow: "rgba(11, 10, 18, 0.38)",
  floorTint: "rgba(16, 17, 25, 0.22)",
  riftGlow: "rgba(91, 221, 189, 0.14)",
  hitWarm: "#ffcf7d",
  hitCold: "#92dfff",
  xp: "#62e5ff",
  heal: "#7ef0a8",
  chest: "#ffd166",
  buff: "#ff8da1"
};

export const floorTiles = [
  { atlas: "dungeon", x: 0, y: 4 },
  { atlas: "dungeon", x: 1, y: 4 },
  { atlas: "dungeon", x: 2, y: 4 }
];

export const decorTiles = [
  { atlas: "dungeon", x: 0, y: 0 },
  { atlas: "dungeon", x: 0, y: 1 },
  { atlas: "dungeon", x: 5, y: 4 },
  { atlas: "dungeon", x: 7, y: 3 }
];

export const characterSprites = {
  strider: {
    atlas: "dungeon",
    idle: [{ x: 0, y: 6 }, { x: 0, y: 7 }]
  },
  ember: {
    atlas: "dungeon",
    idle: [{ x: 3, y: 6 }, { x: 3, y: 7 }]
  },
  warden: {
    atlas: "dungeon",
    idle: [{ x: 5, y: 6 }, { x: 5, y: 7 }]
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
  heal: { atlas: "dungeon", frame: { x: 8, y: 0 } },
  chest: { atlas: "dungeon", frame: { x: 2, y: 0 } }
};

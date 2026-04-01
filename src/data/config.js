export const characters = [
  { id: "strider", name: "Rift Strider", tag: "Mobile", description: "Fast movement, better pickup flow, ideal for kiting.", color: "#6be1be", baseStats: { maxHealth: 105, moveSpeed: 240, damageMultiplier: 0.95, cooldownMultiplier: 0.92, pickupRadius: 74, luck: 0.08 }, startingWeapons: ["arcBlades"] },
  { id: "ember", name: "Ember Sage", tag: "Power", description: "Higher damage and faster spell rhythm for snowball builds.", color: "#ff9a76", baseStats: { maxHealth: 95, moveSpeed: 215, damageMultiplier: 1.18, cooldownMultiplier: 0.94, projectileSpeedMultiplier: 1.1, luck: 0.05 }, startingWeapons: ["emberLance"] },
  { id: "warden", name: "Prism Warden", tag: "Guard", description: "More health, larger area effects, safer frontline play.", color: "#9cc0ff", baseStats: { maxHealth: 130, moveSpeed: 205, damageMultiplier: 1, cooldownMultiplier: 1, areaMultiplier: 1.12, armor: 0.12 }, startingWeapons: ["frostField"] }
];

export const weapons = {
  arcBlades: { id: "arcBlades", name: "Arc Blades", kind: "orbital", color: "#9cf0ff", maxLevel: 5, description: "Orbiting blades that protect the player at close range.", levels: [{ count: 2, radius: 52, size: 11, damage: 15, speed: 2.3 }, { count: 3, radius: 56, size: 11, damage: 19, speed: 2.55 }, { count: 3, radius: 60, size: 13, damage: 24, speed: 2.8 }, { count: 4, radius: 62, size: 13, damage: 30, speed: 3.1 }, { count: 5, radius: 68, size: 14, damage: 38, speed: 3.35 }] },
  emberLance: { id: "emberLance", name: "Ember Lance", kind: "targetedProjectile", color: "#ff9a76", maxLevel: 5, description: "Fires high speed bolts toward the nearest target.", levels: [{ count: 1, cooldown: 0.88, damage: 22, speed: 420, size: 7, life: 1.2 }, { count: 1, cooldown: 0.72, damage: 28, speed: 450, size: 8, life: 1.25 }, { count: 2, cooldown: 0.72, damage: 30, speed: 480, size: 8, life: 1.3 }, { count: 2, cooldown: 0.6, damage: 38, speed: 520, size: 9, life: 1.4 }, { count: 3, cooldown: 0.56, damage: 42, speed: 560, size: 10, life: 1.45 }] },
  pollenBurst: { id: "pollenBurst", name: "Pollen Burst", kind: "scatterShot", color: "#f4ec7a", maxLevel: 5, description: "Fires a cone of seed shots.", levels: [{ count: 4, cooldown: 1.45, damage: 12, speed: 310, size: 6, spread: 0.5, life: 0.9 }, { count: 5, cooldown: 1.35, damage: 14, speed: 330, size: 6, spread: 0.56, life: 0.95 }, { count: 6, cooldown: 1.25, damage: 16, speed: 350, size: 7, spread: 0.62, life: 1 }, { count: 7, cooldown: 1.15, damage: 18, speed: 365, size: 7, spread: 0.68, life: 1.05 }, { count: 8, cooldown: 1.05, damage: 22, speed: 390, size: 8, spread: 0.72, life: 1.1 }] },
  thunderPulse: { id: "thunderPulse", name: "Thunder Pulse", kind: "nova", color: "#c8a8ff", maxLevel: 5, description: "Timed burst around the player that knocks enemies back.", levels: [{ cooldown: 3.8, damage: 40, radius: 92, width: 22, knockback: 120 }, { cooldown: 3.4, damage: 48, radius: 104, width: 24, knockback: 135 }, { cooldown: 3.1, damage: 60, radius: 118, width: 26, knockback: 150 }, { cooldown: 2.8, damage: 74, radius: 132, width: 28, knockback: 170 }, { cooldown: 2.45, damage: 92, radius: 150, width: 30, knockback: 200 }] },
  seekerWisps: { id: "seekerWisps", name: "Seeker Wisps", kind: "homing", color: "#9dffba", maxLevel: 5, description: "Homing spirit shots that chase targets.", levels: [{ count: 1, cooldown: 1.5, damage: 18, speed: 220, size: 8, turnRate: 3.5, life: 3.4 }, { count: 2, cooldown: 1.4, damage: 20, speed: 230, size: 8, turnRate: 3.8, life: 3.6 }, { count: 2, cooldown: 1.2, damage: 26, speed: 245, size: 9, turnRate: 4.1, life: 3.8 }, { count: 3, cooldown: 1.15, damage: 30, speed: 260, size: 9, turnRate: 4.4, life: 4 }, { count: 4, cooldown: 1.05, damage: 36, speed: 280, size: 10, turnRate: 4.8, life: 4.2 }] },
  railShard: { id: "railShard", name: "Rail Shard", kind: "pierce", color: "#a8d6ff", maxLevel: 5, description: "High speed shards that pierce through enemies.", levels: [{ count: 1, cooldown: 1.1, damage: 26, speed: 520, size: 6, pierce: 2, life: 1.3 }, { count: 1, cooldown: 0.96, damage: 34, speed: 560, size: 7, pierce: 3, life: 1.35 }, { count: 2, cooldown: 0.96, damage: 36, speed: 590, size: 7, pierce: 3, life: 1.4 }, { count: 2, cooldown: 0.82, damage: 44, speed: 620, size: 8, pierce: 4, life: 1.45 }, { count: 3, cooldown: 0.78, damage: 52, speed: 660, size: 8, pierce: 5, life: 1.5 }] },
  boomerSickle: { id: "boomerSickle", name: "Boomer Sickle", kind: "boomerang", color: "#ffb3d2", maxLevel: 5, description: "Returning blades that fly out and curve back.", levels: [{ count: 1, cooldown: 1.7, damage: 24, speed: 280, size: 11, duration: 1.15, returnSpeed: 360 }, { count: 1, cooldown: 1.5, damage: 31, speed: 300, size: 11, duration: 1.2, returnSpeed: 390 }, { count: 2, cooldown: 1.5, damage: 34, speed: 315, size: 12, duration: 1.25, returnSpeed: 405 }, { count: 2, cooldown: 1.3, damage: 42, speed: 335, size: 12, duration: 1.32, returnSpeed: 430 }, { count: 3, cooldown: 1.2, damage: 48, speed: 360, size: 13, duration: 1.4, returnSpeed: 460 }] },
  frostField: { id: "frostField", name: "Frost Field", kind: "aura", color: "#8df0ff", maxLevel: 5, description: "Persistent chilling aura around the player.", levels: [{ damage: 8, radius: 78, tick: 0.45, slow: 0.16 }, { damage: 10, radius: 88, tick: 0.4, slow: 0.2 }, { damage: 13, radius: 98, tick: 0.36, slow: 0.24 }, { damage: 17, radius: 112, tick: 0.33, slow: 0.28 }, { damage: 22, radius: 126, tick: 0.3, slow: 0.32 }] }
};

export const weaponPool = Object.keys(weapons);

export const passives = {
  rapidity: { id: "rapidity", name: "Rapid Loop", description: "Attack cooldown reduced by 8 percent.", maxLevel: 5, apply: "cooldownMultiplier", values: [0.92, 0.92, 0.9, 0.9, 0.88] },
  might: { id: "might", name: "Overload", description: "Total damage increased by 12 percent.", maxLevel: 5, apply: "damageMultiplier", values: [1.12, 1.12, 1.1, 1.1, 1.08] },
  multishot: { id: "multishot", name: "Multi Shot", description: "Gain one extra projectile.", maxLevel: 3, apply: "extraProjectiles", values: [1, 1, 1] },
  velocity: { id: "velocity", name: "Fast Cast", description: "Projectile speed increased by 15 percent.", maxLevel: 4, apply: "projectileSpeedMultiplier", values: [1.15, 1.15, 1.12, 1.1] },
  crit: { id: "crit", name: "Rift Crit", description: "Crit chance plus 8 percent. Crits deal double damage.", maxLevel: 4, apply: "critChance", values: [0.08, 0.08, 0.07, 0.07] },
  expansion: { id: "expansion", name: "Wide Amp", description: "Area effects increased by 12 percent.", maxLevel: 4, apply: "areaMultiplier", values: [1.12, 1.12, 1.1, 1.1] },
  duration: { id: "duration", name: "Long Echo", description: "Effect duration increased by 18 percent.", maxLevel: 4, apply: "durationMultiplier", values: [1.18, 1.16, 1.14, 1.12] },
  stride: { id: "stride", name: "Swift Stride", description: "Move speed up.", maxLevel: 5, apply: "moveSpeed", values: [18, 18, 16, 16, 14] },
  vitality: { id: "vitality", name: "Vital Mesh", description: "Max health plus 22 and heal 22 instantly.", maxLevel: 4, apply: "maxHealth", values: [22, 22, 24, 24] },
  magnetism: { id: "magnetism", name: "Magnet Field", description: "Pickup radius increased.", maxLevel: 4, apply: "pickupRadius", values: [24, 24, 28, 28] },
  scholar: { id: "scholar", name: "Scholar Circuit", description: "Experience gain increased.", maxLevel: 4, apply: "xpMultiplier", values: [1.18, 1.16, 1.14, 1.12] },
  recovery: { id: "recovery", name: "Field Repair", description: "Recover health every second.", maxLevel: 4, apply: "regen", values: [0.7, 0.8, 1, 1.2] },
  guard: { id: "guard", name: "Phase Guard", description: "Reduce incoming damage.", maxLevel: 4, apply: "armor", values: [0.06, 0.06, 0.05, 0.05] }
};

export const passivePool = Object.keys(passives);

export const enemies = {
  crawler: { id: "crawler", name: "Crawler", color: "#ff857c", radius: 14, hp: 32, speed: 92, damage: 11, xp: 1, weight: 10, behavior: "chase" },
  sprinter: { id: "sprinter", name: "Sprinter", color: "#ffcf6e", radius: 11, hp: 20, speed: 152, damage: 9, xp: 1, weight: 5, behavior: "chase" },
  juggernaut: { id: "juggernaut", name: "Juggernaut", color: "#89a8ff", radius: 22, hp: 120, speed: 54, damage: 18, xp: 3, weight: 3, behavior: "chase" },
  spitter: { id: "spitter", name: "Spitter", color: "#82e89d", radius: 15, hp: 44, speed: 72, damage: 10, xp: 2, weight: 3, behavior: "ranged", shotCooldown: 2.8, preferredRange: 220 },
  dasher: { id: "dasher", name: "Dasher", color: "#f69eff", radius: 13, hp: 48, speed: 84, damage: 15, xp: 2, weight: 2, behavior: "dash", dashCooldown: 3.1, dashSpeed: 300, dashDuration: 0.5 },
  splitter: { id: "splitter", name: "Splitter", color: "#9ff7ef", radius: 18, hp: 72, speed: 68, damage: 14, xp: 3, weight: 2, behavior: "split", splitInto: "crawler", splitCount: 2 },
  elite: { id: "elite", name: "Elite Prism", color: "#ffd6f3", radius: 24, hp: 220, speed: 82, damage: 22, xp: 8, weight: 0, behavior: "elite" },
  boss: { id: "boss", name: "Crown Colossus", color: "#ffffff", radius: 36, hp: 1200, speed: 78, damage: 28, xp: 25, weight: 0, behavior: "boss", shotCooldown: 1.6, preferredRange: 260 }
};

export const encounterSchedule = [
  { time: 0, pool: ["crawler"] },
  { time: 25, pool: ["crawler", "sprinter"] },
  { time: 50, pool: ["crawler", "sprinter", "juggernaut"] },
  { time: 85, pool: ["crawler", "sprinter", "juggernaut", "spitter"] },
  { time: 120, pool: ["sprinter", "juggernaut", "spitter", "dasher"] },
  { time: 155, pool: ["juggernaut", "spitter", "dasher", "splitter"] },
  { time: 190, pool: ["spitter", "dasher", "splitter", "elite"] }
];

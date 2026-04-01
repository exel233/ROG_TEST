export const balance = {
  records: {
    bestKills: "rift-outlast-best-kills",
    bestTime: "rift-outlast-best-time",
    metaState: "rift-outlast-meta-state"
  },
  player: {
    baseXpMultiplier: 1.14,
    openingShieldSeconds: 3.2
  },
  spawn: {
    baseInterval: 1.16,
    minInterval: 0.24,
    growthPerSecond: 0.0024,
    baseCap: 20,
    capRate: 0.72,
    eliteMarks: [75, 135, 195],
    bossTime: 225
  },
  drops: {
    commonHealChance: 0.035,
    heavyHealChance: 0.12,
    eliteChestChance: 0.5,
    bossChestCount: 2,
    eliteBuffChance: 0.45,
    bossBuffChance: 1
  },
  events: {
    firstSupplyTime: 42,
    supplyInterval: 68
  },
  buffs: {
    chestBlessingChance: 0.55,
    supplyBuffChance: 0.35
  },
  meta: {
    shardsFromMinute: 4,
    shardsFromKillsStep: 35,
    shardsPerKillStep: 1,
    eliteBonus: 5,
    bossBonus: 18
  }
};

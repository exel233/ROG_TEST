import { balance } from "../data/balance.js";
import { metaUpgrades } from "../data/config.js";

function createDefaultState() {
  return {
    shards: 0,
    runs: 0,
    totalKills: 0,
    upgrades: Object.fromEntries(Object.keys(metaUpgrades).map((id) => [id, 0]))
  };
}

export class MetaProgression {
  constructor() {
    this.storageKey = balance.records.metaState;
    this.state = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        return createDefaultState();
      }
      const parsed = JSON.parse(raw);
      return {
        ...createDefaultState(),
        ...parsed,
        upgrades: {
          ...createDefaultState().upgrades,
          ...(parsed.upgrades || {})
        }
      };
    } catch {
      return createDefaultState();
    }
  }

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.state));
  }

  getLevel(id) {
    return this.state.upgrades[id] || 0;
  }

  getUpgradeCost(id) {
    const definition = metaUpgrades[id];
    const level = this.getLevel(id);
    if (!definition || level >= definition.maxLevel) {
      return null;
    }
    return definition.costs[level];
  }

  canUpgrade(id) {
    const cost = this.getUpgradeCost(id);
    return cost !== null && this.state.shards >= cost;
  }

  buyUpgrade(id) {
    const cost = this.getUpgradeCost(id);
    if (cost === null || this.state.shards < cost) {
      return false;
    }
    this.state.shards -= cost;
    this.state.upgrades[id] = this.getLevel(id) + 1;
    this.save();
    return true;
  }

  awardRun(stats) {
    const minuteShards = Math.floor(stats.timeAlive / 60) * balance.meta.shardsFromMinute;
    const killShards = Math.floor(stats.kills / balance.meta.shardsFromKillsStep) * balance.meta.shardsPerKillStep;
    const eliteShards = stats.elites * balance.meta.eliteBonus;
    const bossShards = stats.bosses * balance.meta.bossBonus;
    const total = Math.max(3, minuteShards + killShards + eliteShards + bossShards);
    this.state.shards += total;
    this.state.runs += 1;
    this.state.totalKills += stats.kills;
    this.save();
    return total;
  }

  getRunBonuses() {
    const bonuses = [];
    for (const definition of Object.values(metaUpgrades)) {
      const level = this.getLevel(definition.id);
      for (let count = 0; count < level; count += 1) {
        bonuses.push(...definition.effects);
      }
    }
    return bonuses;
  }

  getSnapshot() {
    return {
      shards: this.state.shards,
      runs: this.state.runs,
      totalKills: this.state.totalKills,
      upgrades: Object.values(metaUpgrades).map((definition) => ({
        id: definition.id,
        name: definition.name,
        description: definition.description,
        level: this.getLevel(definition.id),
        maxLevel: definition.maxLevel,
        nextCost: this.getUpgradeCost(definition.id),
        affordable: this.canUpgrade(definition.id)
      }))
    };
  }
}

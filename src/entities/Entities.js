import { weapons } from "../data/config.js";

export class Projectile {
  constructor(config) {
    Object.assign(this, config);
    this.radius = config.radius || 6;
    this.alive = true;
    this.age = 0;
    this.hitIds = new Set();
    this.returning = false;
    this.tickTimer = 0;
  }

  update(delta, scene) {
    this.age += delta;
    if (this.type === "zone") {
      this.tickTimer -= delta;
      if (this.followPlayer) {
        this.x = scene.player.x;
        this.y = scene.player.y;
      }
      if (this.life && this.age >= this.life) {
        this.alive = false;
      }
      return;
    }
    if (this.behavior === "homing") {
      const target = scene.getNearestEnemy({ x: this.x, y: this.y });
      if (target) {
        const desired = Math.atan2(target.y - this.y, target.x - this.x);
        const diff = ((desired - this.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        this.angle += diff * Math.min(1, delta * this.turnRate);
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
      }
    }
    if (this.behavior === "boomerang") {
      if (!this.returning && this.age >= this.outboundTime) {
        this.returning = true;
      }
      if (this.returning) {
        const dx = scene.player.x - this.x;
        const dy = scene.player.y - this.y;
        const len = Math.hypot(dx, dy) || 1;
        this.vx = (dx / len) * this.returnSpeed;
        this.vy = (dy / len) * this.returnSpeed;
        if (len < scene.player.radius + this.radius + 8) {
          this.alive = false;
        }
      }
    }
    this.x += this.vx * delta;
    this.y += this.vy * delta;
    if (this.life && this.age >= this.life) {
      this.alive = false;
    }
  }
}

export class Pickup {
  constructor(config) {
    Object.assign(this, config);
    this.radius = config.radius || 7;
    this.alive = true;
  }

  update(delta, player) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy) || 1;
    if (dist < player.pickupRadius + 40) {
      const strength = dist < player.pickupRadius ? 360 : 160;
      this.x += (dx / dist) * strength * delta;
      this.y += (dy / dist) * strength * delta;
    }
  }
}

export class Enemy {
  constructor(id, config, x, y, scale = 1) {
    this.instanceId = id;
    this.id = config.id;
    this.x = x;
    this.y = y;
    this.baseConfig = config;
    this.color = config.color;
    this.radius = config.radius * Math.sqrt(scale);
    this.maxHealth = config.hp * scale;
    this.health = this.maxHealth;
    this.speed = config.speed * Math.pow(scale, 0.08);
    this.damage = config.damage * Math.pow(scale, 0.12);
    this.xp = Math.max(1, Math.round(config.xp * scale));
    this.behavior = config.behavior;
    this.alive = true;
    this.hitFlash = 0;
    this.attackCooldown = 0;
    this.dashTimer = 0;
    this.slowFactor = 1;
    this.slowTimer = 0;
  }

  update(delta, scene) {
    this.hitFlash = Math.max(0, this.hitFlash - delta * 3);
    this.attackCooldown -= delta;
    if (this.slowTimer > 0) {
      this.slowTimer -= delta;
    } else {
      this.slowFactor = 1;
    }
    const player = scene.player;
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy) || 1;
    const nx = dx / dist;
    const ny = dy / dist;
    const speed = this.speed * this.slowFactor;
    if (this.behavior === "ranged" || this.behavior === "boss") {
      const preferredRange = this.baseConfig.preferredRange || 220;
      if (dist > preferredRange + 20) {
        this.x += nx * speed * delta;
        this.y += ny * speed * delta;
      } else if (dist < preferredRange - 35) {
        this.x -= nx * speed * 0.8 * delta;
        this.y -= ny * speed * 0.8 * delta;
      }
      if (this.attackCooldown <= 0) {
        scene.spawnEnemyProjectile(this, nx, ny);
        this.attackCooldown = this.baseConfig.shotCooldown || 2.6;
      }
      return;
    }
    if (this.behavior === "dash") {
      if (this.dashTimer > 0) {
        this.x += nx * this.baseConfig.dashSpeed * delta;
        this.y += ny * this.baseConfig.dashSpeed * delta;
        this.dashTimer -= delta;
      } else {
        this.x += nx * speed * delta;
        this.y += ny * speed * delta;
        if (this.attackCooldown <= 0 && dist < 220) {
          this.dashTimer = this.baseConfig.dashDuration || 0.45;
          this.attackCooldown = this.baseConfig.dashCooldown || 3;
        }
      }
      return;
    }
    this.x += nx * speed * delta;
    this.y += ny * speed * delta;
  }

  takeHit() {
    this.hitFlash = 1;
  }

  applySlow(amount, duration) {
    this.slowFactor = Math.min(this.slowFactor, 1 - amount);
    this.slowTimer = Math.max(this.slowTimer, duration);
  }
}

export class Player {
  constructor(character) {
    const stats = character.baseStats;
    this.character = character;
    this.x = 0;
    this.y = 0;
    this.radius = 18;
    this.color = character.color;
    this.level = 1;
    this.xp = 0;
    this.kills = 0;
    this.timeAlive = 0;
    this.maxHealth = stats.maxHealth;
    this.health = this.maxHealth;
    this.moveSpeed = stats.moveSpeed;
    this.damageMultiplier = stats.damageMultiplier ?? 1;
    this.cooldownMultiplier = stats.cooldownMultiplier ?? 1;
    this.projectileSpeedMultiplier = stats.projectileSpeedMultiplier ?? 1;
    this.areaMultiplier = stats.areaMultiplier ?? 1;
    this.durationMultiplier = stats.durationMultiplier ?? 1;
    this.pickupRadius = stats.pickupRadius ?? 60;
    this.xpMultiplier = 1;
    this.extraProjectiles = 0;
    this.critChance = 0;
    this.regen = 0;
    this.armor = stats.armor ?? 0;
    this.luck = stats.luck ?? 0;
    this.invulnTimer = 0;
    this.weapons = new Map();
    this.passives = new Map();
    this.weaponState = new Map();
    this.pendingLevels = 0;
    this.xpToNext = this.getXpTarget();
    for (const weaponId of character.startingWeapons) {
      this.addWeapon(weaponId);
    }
  }

  getXpTarget() {
    return Math.floor(14 + Math.pow(this.level, 1.32) * 12);
  }

  addWeapon(weaponId) {
    const nextLevel = Math.min((this.weapons.get(weaponId) || 0) + 1, weapons[weaponId].maxLevel);
    this.weapons.set(weaponId, nextLevel);
    if (!this.weaponState.has(weaponId)) {
      this.weaponState.set(weaponId, { cooldown: 0, tick: 0, angle: 0 });
    }
  }

  gainXp(amount) {
    this.xp += amount * this.xpMultiplier;
    let leveled = false;
    while (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.level += 1;
      this.pendingLevels += 1;
      this.xpToNext = this.getXpTarget();
      leveled = true;
    }
    return leveled;
  }

  levelUpPassive(passiveId, definition) {
    const nextLevel = Math.min((this.passives.get(passiveId) || 0) + 1, definition.maxLevel);
    this.passives.set(passiveId, nextLevel);
    const value = definition.values[nextLevel - 1];
    switch (definition.apply) {
      case "cooldownMultiplier":
      case "damageMultiplier":
      case "projectileSpeedMultiplier":
      case "areaMultiplier":
      case "durationMultiplier":
      case "xpMultiplier":
        this[definition.apply] *= value;
        break;
      case "moveSpeed":
      case "pickupRadius":
      case "regen":
      case "extraProjectiles":
      case "critChance":
      case "armor":
        this[definition.apply] += value;
        break;
      case "maxHealth":
        this.maxHealth += value;
        this.health = Math.min(this.maxHealth, this.health + value);
        break;
      default:
        break;
    }
  }

  takeDamage(amount) {
    if (this.invulnTimer > 0) {
      return false;
    }
    this.health -= Math.max(1, amount * (1 - this.armor));
    this.invulnTimer = 0.45;
    return true;
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }
}

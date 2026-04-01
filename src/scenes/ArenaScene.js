import { balance } from "../data/balance.js";
import { enemies, timedBuffPool, weapons } from "../data/config.js";
import { weaponVisuals } from "../data/visuals.js";
import { Enemy, Pickup, Player, Projectile } from "../entities/Entities.js";
import { CollisionSystem, SpawnSystem, UpgradeSystem } from "../systems/Systems.js";
import { angleTo, clamp, distance, formatTime, fromAngle, normalize, randomRange, TAU } from "../utils/math.js";

export class ArenaScene {
  constructor(game, character, metaBonuses = []) {
    this.game = game;
    this.character = character;
    this.player = new Player(character, metaBonuses);
    this.player.xpMultiplier *= balance.player.baseXpMultiplier;
    this.player.openingShield = balance.player.openingShieldSeconds;
    this.enemies = [];
    this.projectiles = [];
    this.pickups = [];
    this.effects = [];
    this.particles = [];
    this.floatingTexts = [];
    this.enemyIdCounter = 1;
    this.elapsed = 0;
    this.state = "running";
    this.pendingChoices = [];
    this.rewardChoices = [];
    this.cameraShake = 0;
    this.spawnSystem = new SpawnSystem();
    this.collisionSystem = new CollisionSystem();
    this.upgradeSystem = new UpgradeSystem();
    this.elitesDefeated = 0;
    this.bossesDefeated = 0;
    this.shardsEarned = 0;
    this.bestScore = Number(localStorage.getItem(balance.records.bestKills) || 0);
    this.bestTime = Number(localStorage.getItem(balance.records.bestTime) || 0);
    this.nextSupplyTime = balance.events.firstSupplyTime;
  }

  restart() {
    this.game.startRun(this.character.id);
  }

  resume() {
    if (this.state === "paused") {
      this.state = "running";
      this.game.ui.clearOverlay();
    }
  }

  queueLevelUp() {
    if (this.state === "gameover" || this.state === "reward") {
      return;
    }
    this.state = "levelup";
    this.pendingChoices = this.upgradeSystem.getChoices(this.player);
    this.game.ui.showLevelUp(this.pendingChoices, this.player.level);
  }

  queueRewardChoice(label) {
    if (this.state === "gameover" || this.state === "levelup") {
      return;
    }
    this.state = "reward";
    this.rewardChoices = this.upgradeSystem.getRewardChoices(this.player);
    this.game.ui.showReward(this.rewardChoices, label);
  }

  selectUpgrade(choice) {
    this.upgradeSystem.applyChoice(this.player, choice);
    this.player.pendingLevels = Math.max(0, this.player.pendingLevels - 1);
    if (this.player.pendingLevels > 0) {
      this.pendingChoices = this.upgradeSystem.getChoices(this.player);
      this.game.ui.showLevelUp(this.pendingChoices, this.player.level);
    } else {
      this.state = "running";
      this.game.ui.clearOverlay();
    }
  }

  selectReward(choice) {
    this.upgradeSystem.applyChoice(this.player, choice);
    this.state = "running";
    this.game.ui.clearOverlay();
  }

  update(delta) {
    if (this.game.input.consumePause()) {
      if (this.state === "running") {
        this.state = "paused";
        this.game.ui.showPause(this);
      } else if (this.state === "paused") {
        this.resume();
      }
    }

    if (this.state !== "running") {
      this.game.ui.renderHud(this);
      return;
    }

    this.elapsed += delta;
    this.player.timeAlive = this.elapsed;
    this.player.invulnTimer = Math.max(0, this.player.invulnTimer - delta);
    this.player.openingShield = Math.max(0, this.player.openingShield - delta);
    this.cameraShake = Math.max(0, this.cameraShake - delta * 22);

    if (this.player.regen > 0) {
      this.player.heal(this.player.regen * delta);
    }
    this.player.updateTimedBuffs(delta);

    this.updatePlayer(delta);
    this.updateWeapons(delta);
    this.spawnSystem.update(delta, this);
    this.updateWorldEvents();

    for (const enemy of this.enemies) {
      enemy.update(delta, this);
    }
    for (const projectile of this.projectiles) {
      projectile.update(delta, this);
    }
    for (const pickup of this.pickups) {
      pickup.update(delta, this.player);
    }
    this.updateEffects(delta);
    this.updateParticles(delta);
    this.updateTexts(delta);

    this.collisionSystem.update(this, delta);
    this.cleanup();
    this.game.ui.renderHud(this);

    if (this.player.health <= 0) {
      this.state = "gameover";
      this.bestScore = Math.max(this.bestScore, this.player.kills);
      this.bestTime = Math.max(this.bestTime, this.elapsed);
      localStorage.setItem(balance.records.bestKills, String(this.bestScore));
      localStorage.setItem(balance.records.bestTime, String(Math.floor(this.bestTime)));
      this.shardsEarned = this.game.meta.awardRun({
        timeAlive: this.elapsed,
        kills: this.player.kills,
        elites: this.elitesDefeated,
        bosses: this.bossesDefeated
      });
      this.game.ui.showGameOver(this);
    }
  }

  updatePlayer(delta) {
    const move = this.game.input.getMoveVector();
    const direction = normalize(move.x, move.y);
    this.player.x += direction.x * this.player.moveSpeed * delta;
    this.player.y += direction.y * this.player.moveSpeed * delta;
  }

  updateWeapons(delta) {
    for (const [weaponId, level] of this.player.weapons.entries()) {
      const weapon = weapons[weaponId];
      const stats = weapon.levels[level - 1];
      const state = this.player.weaponState.get(weaponId);
      state.cooldown -= delta;
      if (weapon.kind === "orbital") {
        state.angle += stats.speed * delta;
        for (let i = 0; i < stats.count; i += 1) {
          const angle = state.angle + (i / stats.count) * TAU;
          const x = this.player.x + Math.cos(angle) * stats.radius * this.player.areaMultiplier;
          const y = this.player.y + Math.sin(angle) * stats.radius * this.player.areaMultiplier;
          for (const enemy of this.enemies) {
            if (distance({ x, y }, enemy) <= stats.size + enemy.radius) {
              this.damageEnemy(enemy, this.scaleDamage(stats.damage) * delta * 4.6, weaponId);
            }
          }
        }
        continue;
      }
      if (weapon.kind === "aura") {
        const existing = this.projectiles.find((projectile) => projectile.type === "zone" && projectile.weaponId === weaponId);
        if (!existing) {
          this.projectiles.push(
            new Projectile({
              type: "zone",
              team: "player",
              weaponId,
              x: this.player.x,
              y: this.player.y,
              radius: stats.radius * this.player.areaMultiplier,
              damage: this.scaleDamage(stats.damage),
              tickRate: stats.tick,
              slow: stats.slow,
              followPlayer: true
            })
          );
        } else {
          existing.radius = stats.radius * this.player.areaMultiplier;
          existing.damage = this.scaleDamage(stats.damage);
          existing.tickRate = stats.tick * this.player.cooldownMultiplier;
          existing.slow = stats.slow;
        }
        continue;
      }
      if (state.cooldown > 0) {
        continue;
      }
      if (weapon.kind === "targetedProjectile") {
        this.fireTargeted(weaponId, stats);
      } else if (weapon.kind === "scatterShot") {
        this.fireScatter(weaponId, stats);
      } else if (weapon.kind === "nova") {
        this.fireNova(weaponId, stats);
      } else if (weapon.kind === "homing") {
        this.fireHoming(weaponId, stats);
      } else if (weapon.kind === "pierce") {
        this.firePierce(weaponId, stats);
      } else if (weapon.kind === "boomerang") {
        this.fireBoomerang(weaponId, stats);
      }
      state.cooldown = (stats.cooldown || 0.5) * this.player.cooldownMultiplier;
    }
  }

  updateWorldEvents() {
    if (this.elapsed >= this.nextSupplyTime) {
      this.nextSupplyTime += balance.events.supplyInterval;
      const angle = randomRange(0, TAU);
      const dist = randomRange(120, 220);
      if (Math.random() < balance.buffs.supplyBuffChance) {
        const buffId = timedBuffPool[Math.floor(Math.random() * timedBuffPool.length)];
        this.pickups.push(
          new Pickup({
            x: this.player.x + Math.cos(angle) * dist,
            y: this.player.y + Math.sin(angle) * dist,
            kind: "buff",
            buffId,
            radius: 13
          })
        );
        this.pushFloatingText("RIFT BLESSING", this.player.x, this.player.y - 38, "#d7b8ff");
      } else {
        this.pickups.push(
          new Pickup({
            x: this.player.x + Math.cos(angle) * dist,
            y: this.player.y + Math.sin(angle) * dist,
            kind: "chest",
            value: 1,
            radius: 15
          })
        );
        this.pushFloatingText("SUPPLY CACHE", this.player.x, this.player.y - 38, "#ffd166");
      }
    }
  }

  updateEffects(delta) {
    for (const effect of this.effects) {
      effect.life -= delta;
      effect.age += delta;
      effect.rotation += (effect.rotationSpeed || 0) * delta;
      effect.scale += (effect.growth || 0) * delta;
      effect.x += (effect.vx || 0) * delta;
      effect.y += (effect.vy || 0) * delta;
    }
  }

  updateParticles(delta) {
    for (const particle of this.particles) {
      particle.life -= delta;
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      particle.vx *= 0.92;
      particle.vy *= 0.92;
    }
  }

  updateTexts(delta) {
    for (const text of this.floatingTexts) {
      text.life -= delta;
      text.y -= text.speed * delta;
    }
  }

  getNearestEnemy(origin = this.player) {
    let best = null;
    let bestDistance = Infinity;
    for (const enemy of this.enemies) {
      if (!enemy.alive) {
        continue;
      }
      const dist = distance(origin, enemy);
      if (dist < bestDistance) {
        best = enemy;
        bestDistance = dist;
      }
    }
    return best;
  }

  getAimAngle() {
    const target = this.getNearestEnemy();
    return target ? angleTo(this.player, target) : -Math.PI / 2;
  }

  scaleDamage(baseDamage) {
    let total = baseDamage * this.player.damageMultiplier;
    if (this.player.openingShield > 0) {
      total *= 1.18;
    }
    if (Math.random() < this.player.critChance) {
      total *= 2;
    }
    return total;
  }

  createProjectile(config) {
    this.projectiles.push(new Projectile(config));
  }

  spawnEffect(config) {
    this.effects.push({
      x: config.x,
      y: config.y,
      key: config.key,
      color: config.color || "#ffffff",
      size: config.size || 42,
      scale: config.scale || 1,
      growth: config.growth || 0,
      rotation: config.rotation || 0,
      rotationSpeed: config.rotationSpeed || 0,
      vx: config.vx || 0,
      vy: config.vy || 0,
      life: config.life || 0.25,
      maxLife: config.life || 0.25,
      blend: config.blend || "screen"
    });
  }

  fireTargeted(weaponId, stats) {
    const angle = this.getAimAngle();
    const visual = weaponVisuals[weaponId];
    const total = stats.count + this.player.extraProjectiles;
    for (let i = 0; i < total; i += 1) {
      const spread = (i - (total - 1) / 2) * 0.08;
      const velocity = fromAngle(angle + spread, stats.speed * this.player.projectileSpeedMultiplier);
      if (visual?.muzzleFx) {
        this.spawnEffect({
          x: this.player.x + velocity.x * 0.02,
          y: this.player.y + velocity.y * 0.02,
          key: visual.muzzleFx,
          color: visual.color,
          size: 38,
          life: 0.12,
          rotation: angle + spread
        });
      }
      this.createProjectile({
        x: this.player.x,
        y: this.player.y,
        vx: velocity.x,
        vy: velocity.y,
        angle: angle + spread,
        speed: stats.speed * this.player.projectileSpeedMultiplier,
        radius: stats.size,
        life: stats.life,
        damage: this.scaleDamage(stats.damage),
        team: "player",
        weaponId
      });
    }
  }

  fireScatter(weaponId, stats) {
    const angle = this.getAimAngle();
    const visual = weaponVisuals[weaponId];
    const total = stats.count + this.player.extraProjectiles;
    for (let i = 0; i < total; i += 1) {
      const offset = total === 1 ? 0 : (i / (total - 1) - 0.5) * stats.spread;
      const velocity = fromAngle(angle + offset, stats.speed * this.player.projectileSpeedMultiplier);
      if (visual?.muzzleFx) {
        this.spawnEffect({
          x: this.player.x,
          y: this.player.y,
          key: visual.muzzleFx,
          color: visual.color,
          size: 30,
          life: 0.1,
          rotation: angle + offset
        });
      }
      this.createProjectile({
        x: this.player.x,
        y: this.player.y,
        vx: velocity.x,
        vy: velocity.y,
        angle: angle + offset,
        speed: stats.speed * this.player.projectileSpeedMultiplier,
        radius: stats.size,
        life: stats.life,
        damage: this.scaleDamage(stats.damage),
        team: "player",
        weaponId
      });
    }
  }

  fireNova(weaponId, stats) {
    const visual = weaponVisuals[weaponId];
    if (visual?.zoneFx) {
      this.spawnEffect({
        x: this.player.x,
        y: this.player.y,
        key: visual.zoneFx,
        color: visual.color,
        size: stats.radius * 1.5,
        life: 0.22,
        growth: 70
      });
    }
    this.createProjectile({
      type: "zone",
      x: this.player.x,
      y: this.player.y,
      radius: stats.radius * this.player.areaMultiplier,
      damage: this.scaleDamage(stats.damage),
      tickRate: 0.1,
      team: "player",
      weaponId,
      knockback: stats.knockback,
      life: 0.16
    });
  }

  fireHoming(weaponId, stats) {
    const visual = weaponVisuals[weaponId];
    const total = stats.count + this.player.extraProjectiles;
    for (let i = 0; i < total; i += 1) {
      const angle = this.getAimAngle() + (i - (total - 1) / 2) * 0.2;
      const velocity = fromAngle(angle, stats.speed * this.player.projectileSpeedMultiplier);
      if (visual?.muzzleFx) {
        this.spawnEffect({
          x: this.player.x,
          y: this.player.y,
          key: visual.muzzleFx,
          color: visual.color,
          size: 34,
          life: 0.14,
          rotation: angle
        });
      }
      this.createProjectile({
        x: this.player.x,
        y: this.player.y,
        vx: velocity.x,
        vy: velocity.y,
        angle,
        speed: stats.speed * this.player.projectileSpeedMultiplier,
        radius: stats.size,
        life: stats.life * this.player.durationMultiplier,
        damage: this.scaleDamage(stats.damage),
        behavior: "homing",
        turnRate: stats.turnRate,
        team: "player",
        weaponId
      });
    }
  }

  firePierce(weaponId, stats) {
    const angle = this.getAimAngle();
    const visual = weaponVisuals[weaponId];
    const total = stats.count + this.player.extraProjectiles;
    for (let i = 0; i < total; i += 1) {
      const spread = (i - (total - 1) / 2) * 0.06;
      const velocity = fromAngle(angle + spread, stats.speed * this.player.projectileSpeedMultiplier);
      if (visual?.muzzleFx) {
        this.spawnEffect({
          x: this.player.x,
          y: this.player.y,
          key: visual.muzzleFx,
          color: visual.color,
          size: 32,
          life: 0.08,
          rotation: angle + spread
        });
      }
      this.createProjectile({
        x: this.player.x,
        y: this.player.y,
        vx: velocity.x,
        vy: velocity.y,
        angle: angle + spread,
        speed: stats.speed * this.player.projectileSpeedMultiplier,
        radius: stats.size,
        life: stats.life,
        damage: this.scaleDamage(stats.damage),
        pierce: stats.pierce,
        team: "player",
        weaponId
      });
    }
  }

  fireBoomerang(weaponId, stats) {
    const angle = this.getAimAngle();
    const visual = weaponVisuals[weaponId];
    for (let i = 0; i < stats.count; i += 1) {
      const spread = (i - (stats.count - 1) / 2) * 0.24;
      const velocity = fromAngle(angle + spread, stats.speed * this.player.projectileSpeedMultiplier);
      if (visual?.muzzleFx) {
        this.spawnEffect({
          x: this.player.x,
          y: this.player.y,
          key: visual.muzzleFx,
          color: visual.color,
          size: 42,
          life: 0.12,
          rotation: angle + spread
        });
      }
      this.createProjectile({
        x: this.player.x,
        y: this.player.y,
        vx: velocity.x,
        vy: velocity.y,
        angle: angle + spread,
        speed: stats.speed * this.player.projectileSpeedMultiplier,
        radius: stats.size,
        life: stats.duration * this.player.durationMultiplier * 2,
        damage: this.scaleDamage(stats.damage),
        behavior: "boomerang",
        outboundTime: stats.duration * this.player.durationMultiplier,
        returnSpeed: stats.returnSpeed,
        pierce: 99,
        team: "player",
        weaponId
      });
    }
  }

  createEnemy(enemyId, x, y, scale = 1) {
    if (enemies[enemyId]) {
      this.enemies.push(new Enemy(this.enemyIdCounter++, enemies[enemyId], x, y, scale));
    }
  }

  spawnEnemyProjectile(enemy, nx, ny) {
    const speed = enemy.id === "boss" ? 250 : 200;
    const visual = enemy.id === "boss" ? weaponVisuals.boss : weaponVisuals.enemy;
    this.spawnEffect({
      x: enemy.x,
      y: enemy.y,
      key: visual.projectileFx,
      color: visual.color,
      size: enemy.id === "boss" ? 42 : 30,
      life: 0.12
    });
    this.createProjectile({
      x: enemy.x,
      y: enemy.y,
      vx: nx * speed,
      vy: ny * speed,
      radius: enemy.id === "boss" ? 10 : 7,
      life: 3,
      damage: enemy.damage,
      team: "enemy",
      color: enemy.color,
      weaponId: enemy.id === "boss" ? "boss" : "enemy"
    });
  }

  spawnRadialBurst(enemy, count) {
    this.pushFloatingText(enemy.phase >= 3 ? "ANNIHILATION" : "VOID BURST", enemy.x, enemy.y - enemy.radius - 30, "#ffd38e", 0.85);
    this.addBurst(enemy.x, enemy.y, "#ffd38e", 16, 90);
    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * TAU;
      this.createProjectile({
        x: enemy.x,
        y: enemy.y,
        vx: Math.cos(angle) * 220,
        vy: Math.sin(angle) * 220,
        radius: enemy.phase >= 3 ? 9 : 8,
        life: 3,
        damage: enemy.damage * (enemy.phase >= 3 ? 1.15 : 1),
        team: "enemy",
        color: "#ffd38e"
      });
    }
    this.cameraShake = Math.max(this.cameraShake, 10 + enemy.phase * 2);
  }

  spawnBossAdds(enemy, count) {
    this.pushFloatingText("CALL OF THE RIFT", enemy.x, enemy.y - enemy.radius - 18, "#ffb9f4", 0.8);
    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * TAU + randomRange(-0.24, 0.24);
      this.createEnemy(
        enemy.baseConfig.summonType || "dasher",
        enemy.x + Math.cos(angle) * 54,
        enemy.y + Math.sin(angle) * 54,
        0.9 + enemy.phase * 0.08
      );
    }
  }

  onBossPhaseChange(enemy, phase) {
    this.cameraShake = Math.max(this.cameraShake, 16);
    this.addBurst(enemy.x, enemy.y, phase >= 3 ? "#ffb06c" : "#f5d0ff", 20, 110);
    this.pushFloatingText(phase === 2 ? "BOSS ENRAGED" : "FINAL PHASE", enemy.x, enemy.y - enemy.radius - 22, "#fff1a3", 1.1);
  }

  damageEnemy(enemy, damage, weaponId, source = null) {
    enemy.health -= damage;
    enemy.takeHit();
    const visual = weaponVisuals[weaponId] || weaponVisuals[source?.weaponId] || weaponVisuals.emberLance;
    this.addBurst(enemy.x, enemy.y, source?.weaponId === "frostField" ? "#92dfff" : visual.color || "#ffcf7d", enemy.id === "boss" ? 10 : 6);
    if (visual?.hitFx) {
      this.spawnEffect({
        x: enemy.x,
        y: enemy.y,
        key: visual.hitFx,
        color: visual.color,
        size: enemy.id === "boss" ? 58 : 34,
        life: 0.16,
        rotation: randomRange(0, TAU),
        growth: 30
      });
    }
    this.pushFloatingText(`${Math.max(1, Math.round(damage))}`, enemy.x, enemy.y - enemy.radius - 8, "#fff4c2", 0.4);

    if (source?.type === "zone" && source.knockback) {
      const dx = enemy.x - this.player.x;
      const dy = enemy.y - this.player.y;
      const len = Math.hypot(dx, dy) || 1;
      enemy.x += (dx / len) * source.knockback * 0.06;
      enemy.y += (dy / len) * source.knockback * 0.06;
    }
    if (enemy.health <= 0 && enemy.alive) {
      enemy.alive = false;
      this.player.kills += 1;
      if (enemy.id === "elite") {
        this.elitesDefeated += 1;
      }
      if (enemy.id === "boss") {
        this.bossesDefeated += 1;
      }
      this.cameraShake = Math.max(this.cameraShake, enemy.id === "boss" ? 18 : 6);
      this.pickups.push(new Pickup({ x: enemy.x, y: enemy.y, value: enemy.xp, kind: "xp", radius: 10 }));
      this.addBurst(enemy.x, enemy.y, "#ffcf7d", enemy.id === "boss" ? 18 : 8, 80);
      this.spawnEffect({
        x: enemy.x,
        y: enemy.y,
        key: enemy.id === "boss" ? "fxFlare1" : "fxSmoke3",
        color: enemy.id === "boss" ? "#ffd38e" : enemy.color,
        size: enemy.id === "boss" ? 96 : 46,
        life: enemy.id === "boss" ? 0.45 : 0.24,
        growth: enemy.id === "boss" ? 55 : 20
      });
      if (enemy.id === "splitter") {
        for (let i = 0; i < enemy.baseConfig.splitCount; i += 1) {
          const angle = (i / enemy.baseConfig.splitCount) * TAU;
          this.createEnemy(enemy.baseConfig.splitInto, enemy.x + Math.cos(angle) * 20, enemy.y + Math.sin(angle) * 20, 0.85);
        }
      }

      const healChance =
        enemy.id === "elite"
          ? 0.8
          : enemy.id === "juggernaut"
            ? balance.drops.heavyHealChance + this.player.lootLuck
            : balance.drops.commonHealChance + this.player.lootLuck * 0.5;

      if (Math.random() < healChance) {
        this.pickups.push(new Pickup({ x: enemy.x + randomRange(-10, 10), y: enemy.y + randomRange(-10, 10), kind: "heal", value: 16, radius: 11 }));
      }

      if (enemy.id === "elite" && Math.random() < balance.drops.eliteChestChance + this.player.lootLuck) {
        this.pickups.push(new Pickup({ x: enemy.x, y: enemy.y, kind: "chest", value: 1, radius: 15 }));
      }

      if ((enemy.id === "elite" && Math.random() < balance.drops.eliteBuffChance + this.player.lootLuck * 0.6) || enemy.id === "boss") {
        const buffId = timedBuffPool[Math.floor(Math.random() * timedBuffPool.length)];
        this.pickups.push(new Pickup({ x: enemy.x + randomRange(-18, 18), y: enemy.y + randomRange(-18, 18), kind: "buff", buffId, radius: 13 }));
      }

      if (enemy.id === "boss") {
        for (let count = 0; count < balance.drops.bossChestCount; count += 1) {
          this.pickups.push(
            new Pickup({
              x: enemy.x + randomRange(-24, 24),
              y: enemy.y + randomRange(-24, 24),
              kind: "chest",
              value: 1,
              radius: 15
            })
          );
        }
      }
    }
  }

  addBurst(x, y, color, count = 8, speed = 52) {
    this.game.renderer.createBurst(this, x, y, color, count, speed);
  }

  pushFloatingText(text, x, y, color = "#fff4c2", life = 0.6) {
    this.floatingTexts.push({ text, x, y, color, speed: 22, life, maxLife: life });
  }

  cleanup() {
    this.enemies = this.enemies.filter((enemy) => enemy.alive);
    this.projectiles = this.projectiles.filter(
      (projectile) => projectile.alive && Math.abs(projectile.x - this.player.x) < 1500 && Math.abs(projectile.y - this.player.y) < 1100
    );
    this.pickups = this.pickups.filter((pickup) => pickup.alive);
    this.effects = this.effects.filter((effect) => effect.life > 0);
    this.particles = this.particles.filter((particle) => particle.life > 0);
    this.floatingTexts = this.floatingTexts.filter((text) => text.life > 0);
  }

  render(ctx) {
    const width = this.game.canvas.width / window.devicePixelRatio;
    const height = this.game.canvas.height / window.devicePixelRatio;
    const shakeX = this.cameraShake > 0 ? randomRange(-this.cameraShake, this.cameraShake) : 0;
    const shakeY = this.cameraShake > 0 ? randomRange(-this.cameraShake, this.cameraShake) : 0;
    const cameraX = this.player.x - width / 2 + shakeX;
    const cameraY = this.player.y - height / 2 + shakeY;
    const renderer = this.game.renderer;

    renderer.drawSceneBackground(ctx, cameraX, cameraY, width, height, this.elapsed);

    for (const pickup of this.pickups) {
      renderer.drawPickup(ctx, pickup, cameraX, cameraY, this.elapsed);
    }

    for (const projectile of this.projectiles) {
      renderer.drawProjectile(ctx, projectile, cameraX, cameraY, this.elapsed);
    }

    for (const [weaponId, level] of this.player.weapons.entries()) {
      const weapon = weapons[weaponId];
      if (weapon.kind !== "orbital") {
        continue;
      }
      const stats = weapon.levels[level - 1];
      const state = this.player.weaponState.get(weaponId);
      for (let i = 0; i < stats.count; i += 1) {
        const angle = state.angle + (i / stats.count) * TAU;
        const x = this.player.x + Math.cos(angle) * stats.radius * this.player.areaMultiplier;
        const y = this.player.y + Math.sin(angle) * stats.radius * this.player.areaMultiplier;
        renderer.drawOrbital(ctx, weapon, stats, angle, x, y, cameraX, cameraY);
      }
    }

    for (const enemy of this.enemies) {
      renderer.drawEnemy(ctx, enemy, cameraX, cameraY, this.elapsed);
      renderer.drawHealthBar(ctx, enemy, cameraX, cameraY);
    }

    renderer.drawPlayer(ctx, this.player, cameraX, cameraY, this.elapsed);
    renderer.drawEffects(ctx, this.effects, cameraX, cameraY);
    renderer.drawParticles(ctx, this.particles, cameraX, cameraY);
    renderer.drawFloatingTexts(ctx, this.floatingTexts, cameraX, cameraY);

    const boss = this.enemies.find((enemy) => enemy.id === "boss");
    if (boss) {
      ctx.save();
      ctx.strokeStyle = boss.phase >= 3 ? "rgba(255, 176, 108, 0.36)" : "rgba(245, 208, 255, 0.32)";
      ctx.lineWidth = boss.phase >= 3 ? 4 : 3;
      ctx.beginPath();
      ctx.arc(boss.x - cameraX, boss.y - cameraY, boss.radius + 16 + Math.sin(this.elapsed * 5) * 4, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    if (this.player.openingShield > 0) {
      const glow = 0.25 + this.player.openingShield * 0.12;
      ctx.beginPath();
      ctx.arc(this.player.x - cameraX, this.player.y - cameraY, this.player.radius + 10, 0, TAU);
      ctx.strokeStyle = `rgba(126, 240, 168, ${glow})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (this.player.invulnTimer > 0) {
      ctx.beginPath();
      ctx.arc(this.player.x - cameraX, this.player.y - cameraY, this.player.radius + 8, 0, TAU);
      ctx.strokeStyle = "rgba(255,255,255,0.42)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.save();
    ctx.font = "16px KenneyFuture, monospace";
    ctx.fillStyle = "rgba(255, 209, 102, 0.85)";
    ctx.fillText(`Best Time ${formatTime(this.bestTime)}`, width - 220, height - 28);
    ctx.restore();
  }
}

import { enemies, weapons } from "../data/config.js";
import { Enemy, Pickup, Player, Projectile } from "../entities/Entities.js";
import { CollisionSystem, SpawnSystem, UpgradeSystem } from "../systems/Systems.js";
import { angleTo, clamp, distance, fromAngle, normalize, randomRange, TAU } from "../utils/math.js";

export class ArenaScene {
  constructor(game, character) {
    this.game = game;
    this.character = character;
    this.player = new Player(character);
    this.enemies = [];
    this.projectiles = [];
    this.pickups = [];
    this.enemyIdCounter = 1;
    this.elapsed = 0;
    this.state = "running";
    this.pendingChoices = [];
    this.cameraShake = 0;
    this.spawnSystem = new SpawnSystem();
    this.collisionSystem = new CollisionSystem();
    this.upgradeSystem = new UpgradeSystem();
    this.bestScore = Number(localStorage.getItem("rift-outlast-best") || 0);
    this.backgroundSeed = Array.from({ length: 140 }, () => ({ x: randomRange(-2400, 2400), y: randomRange(-2400, 2400), size: randomRange(6, 32), alpha: randomRange(0.04, 0.12) }));
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
    if (this.state === "gameover") {
      return;
    }
    this.state = "levelup";
    this.pendingChoices = this.upgradeSystem.getChoices(this.player);
    this.game.ui.showLevelUp(this.pendingChoices, this.player.level);
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
    this.cameraShake = Math.max(0, this.cameraShake - delta * 22);
    if (this.player.regen > 0) {
      this.player.heal(this.player.regen * delta);
    }
    this.updatePlayer(delta);
    this.updateWeapons(delta);
    this.spawnSystem.update(delta, this);
    for (const enemy of this.enemies) {
      enemy.update(delta, this);
    }
    for (const projectile of this.projectiles) {
      projectile.update(delta, this);
    }
    for (const pickup of this.pickups) {
      pickup.update(delta, this.player);
    }
    this.collisionSystem.update(this, delta);
    this.cleanup();
    this.game.ui.renderHud(this);
    if (this.player.health <= 0) {
      this.state = "gameover";
      this.bestScore = Math.max(this.bestScore, this.player.kills);
      localStorage.setItem("rift-outlast-best", String(this.bestScore));
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
              this.damageEnemy(enemy, this.scaleDamage(stats.damage) * delta * 4.5, weaponId);
            }
          }
        }
        continue;
      }
      if (weapon.kind === "aura") {
        const existing = this.projectiles.find((projectile) => projectile.type === "zone" && projectile.weaponId === weaponId);
        if (!existing) {
          this.projectiles.push(new Projectile({ type: "zone", team: "player", weaponId, x: this.player.x, y: this.player.y, radius: stats.radius * this.player.areaMultiplier, damage: this.scaleDamage(stats.damage), tickRate: stats.tick, slow: stats.slow, followPlayer: true }));
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
    return baseDamage * this.player.damageMultiplier * (Math.random() < this.player.critChance ? 2 : 1);
  }

  createProjectile(config) {
    this.projectiles.push(new Projectile(config));
  }

  fireTargeted(weaponId, stats) {
    const angle = this.getAimAngle();
    const total = stats.count + this.player.extraProjectiles;
    for (let i = 0; i < total; i += 1) {
      const spread = (i - (total - 1) / 2) * 0.08;
      const velocity = fromAngle(angle + spread, stats.speed * this.player.projectileSpeedMultiplier);
      this.createProjectile({ x: this.player.x, y: this.player.y, vx: velocity.x, vy: velocity.y, angle: angle + spread, speed: stats.speed * this.player.projectileSpeedMultiplier, radius: stats.size, life: stats.life, damage: this.scaleDamage(stats.damage), team: "player", weaponId });
    }
  }

  fireScatter(weaponId, stats) {
    const angle = this.getAimAngle();
    const total = stats.count + this.player.extraProjectiles;
    for (let i = 0; i < total; i += 1) {
      const offset = total === 1 ? 0 : (i / (total - 1) - 0.5) * stats.spread;
      const velocity = fromAngle(angle + offset, stats.speed * this.player.projectileSpeedMultiplier);
      this.createProjectile({ x: this.player.x, y: this.player.y, vx: velocity.x, vy: velocity.y, angle: angle + offset, speed: stats.speed * this.player.projectileSpeedMultiplier, radius: stats.size, life: stats.life, damage: this.scaleDamage(stats.damage), team: "player", weaponId });
    }
  }

  fireNova(weaponId, stats) {
    this.createProjectile({ type: "zone", x: this.player.x, y: this.player.y, radius: stats.radius * this.player.areaMultiplier, damage: this.scaleDamage(stats.damage), tickRate: 0.1, team: "player", weaponId, knockback: stats.knockback, life: 0.16 });
  }

  fireHoming(weaponId, stats) {
    const total = stats.count + this.player.extraProjectiles;
    for (let i = 0; i < total; i += 1) {
      const angle = this.getAimAngle() + (i - (total - 1) / 2) * 0.2;
      const velocity = fromAngle(angle, stats.speed * this.player.projectileSpeedMultiplier);
      this.createProjectile({ x: this.player.x, y: this.player.y, vx: velocity.x, vy: velocity.y, angle, speed: stats.speed * this.player.projectileSpeedMultiplier, radius: stats.size, life: stats.life * this.player.durationMultiplier, damage: this.scaleDamage(stats.damage), behavior: "homing", turnRate: stats.turnRate, team: "player", weaponId });
    }
  }

  firePierce(weaponId, stats) {
    const angle = this.getAimAngle();
    const total = stats.count + this.player.extraProjectiles;
    for (let i = 0; i < total; i += 1) {
      const spread = (i - (total - 1) / 2) * 0.06;
      const velocity = fromAngle(angle + spread, stats.speed * this.player.projectileSpeedMultiplier);
      this.createProjectile({ x: this.player.x, y: this.player.y, vx: velocity.x, vy: velocity.y, angle: angle + spread, speed: stats.speed * this.player.projectileSpeedMultiplier, radius: stats.size, life: stats.life, damage: this.scaleDamage(stats.damage), pierce: stats.pierce, team: "player", weaponId });
    }
  }

  fireBoomerang(weaponId, stats) {
    const angle = this.getAimAngle();
    for (let i = 0; i < stats.count; i += 1) {
      const spread = (i - (stats.count - 1) / 2) * 0.24;
      const velocity = fromAngle(angle + spread, stats.speed * this.player.projectileSpeedMultiplier);
      this.createProjectile({ x: this.player.x, y: this.player.y, vx: velocity.x, vy: velocity.y, angle: angle + spread, speed: stats.speed * this.player.projectileSpeedMultiplier, radius: stats.size, life: stats.duration * this.player.durationMultiplier * 2, damage: this.scaleDamage(stats.damage), behavior: "boomerang", outboundTime: stats.duration * this.player.durationMultiplier, returnSpeed: stats.returnSpeed, pierce: 99, team: "player", weaponId });
    }
  }

  createEnemy(enemyId, x, y, scale = 1) {
    if (enemies[enemyId]) {
      this.enemies.push(new Enemy(this.enemyIdCounter++, enemies[enemyId], x, y, scale));
    }
  }

  spawnEnemyProjectile(enemy, nx, ny) {
    const speed = enemy.id === "boss" ? 250 : 200;
    this.createProjectile({ x: enemy.x, y: enemy.y, vx: nx * speed, vy: ny * speed, radius: enemy.id === "boss" ? 10 : 7, life: 3, damage: enemy.damage, team: "enemy", color: enemy.color });
  }

  damageEnemy(enemy, damage, weaponId, source = null) {
    enemy.health -= damage;
    enemy.takeHit();
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
      this.cameraShake = Math.max(this.cameraShake, enemy.id === "boss" ? 18 : 6);
      this.pickups.push(new Pickup({ x: enemy.x, y: enemy.y, value: enemy.xp, kind: "xp", radius: 8 }));
      if (enemy.id === "splitter") {
        for (let i = 0; i < enemy.baseConfig.splitCount; i += 1) {
          const angle = (i / enemy.baseConfig.splitCount) * TAU;
          this.createEnemy(enemy.baseConfig.splitInto, enemy.x + Math.cos(angle) * 20, enemy.y + Math.sin(angle) * 20, 0.85);
        }
      }
    }
  }

  cleanup() {
    this.enemies = this.enemies.filter((enemy) => enemy.alive);
    this.projectiles = this.projectiles.filter((projectile) => projectile.alive && Math.abs(projectile.x - this.player.x) < 1400 && Math.abs(projectile.y - this.player.y) < 1000);
    this.pickups = this.pickups.filter((pickup) => pickup.alive);
  }

  render(ctx) {
    const width = this.game.canvas.width / window.devicePixelRatio;
    const height = this.game.canvas.height / window.devicePixelRatio;
    const shakeX = this.cameraShake > 0 ? randomRange(-this.cameraShake, this.cameraShake) : 0;
    const shakeY = this.cameraShake > 0 ? randomRange(-this.cameraShake, this.cameraShake) : 0;
    const cameraX = this.player.x - width / 2 + shakeX;
    const cameraY = this.player.y - height / 2 + shakeY;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#07141c";
    ctx.fillRect(0, 0, width, height);
    this.renderBackground(ctx, cameraX, cameraY, width, height);
    this.renderGrid(ctx, cameraX, cameraY, width, height);
    for (const pickup of this.pickups) {
      this.drawCircle(ctx, pickup.x - cameraX, pickup.y - cameraY, pickup.radius, "#ffd166");
    }
    for (const projectile of this.projectiles) {
      if (projectile.type === "zone") {
        ctx.beginPath();
        ctx.arc(projectile.x - cameraX, projectile.y - cameraY, projectile.radius, 0, TAU);
        ctx.fillStyle = projectile.weaponId === "frostField" ? "rgba(141, 240, 255, 0.15)" : "rgba(200, 168, 255, 0.18)";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = projectile.weaponId === "frostField" ? "rgba(141, 240, 255, 0.55)" : "rgba(200, 168, 255, 0.55)";
        ctx.stroke();
      } else {
        this.drawCircle(ctx, projectile.x - cameraX, projectile.y - cameraY, projectile.radius, projectile.team === "enemy" ? projectile.color || "#82e89d" : "#f8fafc");
      }
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
        this.drawCircle(ctx, x - cameraX, y - cameraY, stats.size, weapon.color);
      }
    }
    for (const enemy of this.enemies) {
      this.drawCircle(ctx, enemy.x - cameraX, enemy.y - cameraY, enemy.radius, enemy.hitFlash > 0 ? "#ffffff" : enemy.color);
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(enemy.x - cameraX - enemy.radius, enemy.y - cameraY - enemy.radius - 10, enemy.radius * 2, 5);
      ctx.fillStyle = "#ff7f88";
      ctx.fillRect(enemy.x - cameraX - enemy.radius, enemy.y - cameraY - enemy.radius - 10, (enemy.health / enemy.maxHealth) * enemy.radius * 2, 5);
    }
    this.drawCircle(ctx, this.player.x - cameraX, this.player.y - cameraY, this.player.radius, this.player.color);
    if (this.player.invulnTimer > 0) {
      ctx.beginPath();
      ctx.arc(this.player.x - cameraX, this.player.y - cameraY, this.player.radius + 6, 0, TAU);
      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  renderBackground(ctx, cameraX, cameraY, width, height) {
    for (const star of this.backgroundSeed) {
      const x = star.x - cameraX * 0.14;
      const y = star.y - cameraY * 0.14;
      const sx = ((x % (width + 200)) + width + 200) % (width + 200) - 100;
      const sy = ((y % (height + 200)) + height + 200) % (height + 200) - 100;
      ctx.fillStyle = `rgba(107, 225, 190, ${star.alpha})`;
      ctx.fillRect(sx, sy, star.size, star.size);
    }
  }

  renderGrid(ctx, cameraX, cameraY, width, height) {
    const grid = 72;
    const startX = -((cameraX % grid) + grid) % grid;
    const startY = -((cameraY % grid) + grid) % grid;
    ctx.strokeStyle = "rgba(164, 223, 229, 0.08)";
    ctx.lineWidth = 1;
    for (let x = startX; x < width; x += grid) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = startY; y < height; y += grid) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  drawCircle(ctx, x, y, radius, color) {
    ctx.beginPath();
    ctx.arc(x, y, clamp(radius, 2, 180), 0, TAU);
    ctx.fillStyle = color;
    ctx.fill();
  }
}

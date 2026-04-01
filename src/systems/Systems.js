import { characters, encounterSchedule, enemies, passivePool, passives, weaponPool, weapons } from "../data/config.js";
import { circlesOverlap, distance, formatTime, pickRandom, randomRange } from "../utils/math.js";

export class Input {
  constructor() {
    this.keys = new Set();
    this.pausePressed = false;
    window.addEventListener("keydown", (event) => {
      this.keys.add(event.code);
      if (event.code === "Escape") {
        this.pausePressed = true;
      }
    });
    window.addEventListener("keyup", (event) => this.keys.delete(event.code));
  }

  isDown(...codes) {
    return codes.some((code) => this.keys.has(code));
  }

  consumePause() {
    const value = this.pausePressed;
    this.pausePressed = false;
    return value;
  }

  getMoveVector() {
    const x = (this.isDown("KeyD", "ArrowRight") ? 1 : 0) - (this.isDown("KeyA", "ArrowLeft") ? 1 : 0);
    const y = (this.isDown("KeyS", "ArrowDown") ? 1 : 0) - (this.isDown("KeyW", "ArrowUp") ? 1 : 0);
    return { x, y };
  }
}

export class SpawnSystem {
  constructor() {
    this.spawnTimer = 0;
    this.eliteSpawnedAt = new Set();
    this.bossSpawned = false;
  }

  update(delta, scene) {
    const time = scene.elapsed;
    const intensity = 1 + time / 90;
    const maxEnemies = Math.min(220, 28 + Math.floor(time * 0.85));
    if (scene.enemies.length < maxEnemies) {
      this.spawnTimer -= delta;
      if (this.spawnTimer <= 0) {
        const spawnCount = Math.max(1, Math.floor(intensity));
        for (let i = 0; i < spawnCount; i += 1) {
          this.spawnEnemy(scene, this.pickEnemyType(time), 1 + time / 230);
        }
        this.spawnTimer = Math.max(0.16, 0.8 - time * 0.003);
      }
    }
    for (const mark of [60, 120, 180]) {
      if (time >= mark && !this.eliteSpawnedAt.has(mark)) {
        this.spawnEnemy(scene, "elite", 1 + mark / 160);
        this.eliteSpawnedAt.add(mark);
      }
    }
    if (time >= 210 && !this.bossSpawned) {
      this.spawnEnemy(scene, "boss", 1.1);
      this.bossSpawned = true;
    }
  }

  pickEnemyType(time) {
    let pool = encounterSchedule[0].pool;
    for (const step of encounterSchedule) {
      if (time >= step.time) {
        pool = step.pool;
      }
    }
    const weighted = [];
    for (const enemyId of pool) {
      for (let i = 0; i < (enemies[enemyId].weight || 1); i += 1) {
        weighted.push(enemyId);
      }
    }
    return weighted[Math.floor(Math.random() * weighted.length)];
  }

  spawnEnemy(scene, enemyId, scale) {
    const angle = randomRange(0, Math.PI * 2);
    const dist = randomRange(420, 560);
    scene.createEnemy(enemyId, scene.player.x + Math.cos(angle) * dist, scene.player.y + Math.sin(angle) * dist, scale);
  }
}

export class UpgradeSystem {
  getChoices(player) {
    const choices = [];
    for (const weaponId of weaponPool) {
      const level = player.weapons.get(weaponId) || 0;
      if (level <= 0 && player.weapons.size < 6) {
        choices.push({ type: "weapon-new", id: weaponId, name: `Unlock ${weapons[weaponId].name}`, description: weapons[weaponId].description });
      } else if (level > 0 && level < weapons[weaponId].maxLevel) {
        choices.push({ type: "weapon-level", id: weaponId, name: `Upgrade ${weapons[weaponId].name} Lv.${level + 1}`, description: weapons[weaponId].description });
      }
    }
    for (const passiveId of passivePool) {
      const current = player.passives.get(passiveId) || 0;
      if (current < passives[passiveId].maxLevel) {
        choices.push({ type: "passive", id: passiveId, name: `${passives[passiveId].name} Lv.${current + 1}`, description: passives[passiveId].description });
      }
    }
    choices.push({ type: "heal", id: "heal", name: "Emergency Repair", description: "Heal 35 percent of max health instantly." });
    const weighted = [];
    for (const choice of choices) {
      weighted.push(choice);
      if (choice.type === "weapon-level") {
        weighted.push(choice);
      }
      if (choice.type === "passive" && Math.random() < player.luck) {
        weighted.push(choice);
      }
    }
    return pickRandom(weighted, 3).filter((choice, index, array) => array.findIndex((item) => item.type === choice.type && item.id === choice.id) === index);
  }

  applyChoice(player, choice) {
    if (choice.type === "weapon-new" || choice.type === "weapon-level") {
      player.addWeapon(choice.id);
    } else if (choice.type === "passive") {
      player.levelUpPassive(choice.id, passives[choice.id]);
    } else {
      player.heal(player.maxHealth * 0.35);
    }
  }
}

export class CollisionSystem {
  update(scene, delta) {
    for (const enemy of scene.enemies) {
      if (circlesOverlap(scene.player, enemy) && scene.player.takeDamage(enemy.damage * delta * 2.2)) {
        scene.cameraShake = Math.max(scene.cameraShake, 8);
      }
    }
    for (const projectile of scene.projectiles) {
      if (!projectile.alive) {
        continue;
      }
      if (projectile.team === "enemy") {
        if (circlesOverlap(scene.player, projectile) && scene.player.takeDamage(projectile.damage)) {
          projectile.alive = false;
          scene.cameraShake = Math.max(scene.cameraShake, 10);
        }
        continue;
      }
      if (projectile.type === "zone") {
        if (projectile.tickTimer <= 0) {
          projectile.tickTimer = projectile.tickRate;
          for (const enemy of scene.enemies) {
            if (enemy.alive && distance(projectile, enemy) <= projectile.radius + enemy.radius) {
              scene.damageEnemy(enemy, projectile.damage, projectile.weaponId, projectile);
              if (projectile.slow) {
                enemy.applySlow(projectile.slow, 0.6);
              }
            }
          }
        }
        continue;
      }
      for (const enemy of scene.enemies) {
        if (!enemy.alive || projectile.hitIds.has(enemy.instanceId)) {
          continue;
        }
        if (circlesOverlap(projectile, enemy)) {
          scene.damageEnemy(enemy, projectile.damage, projectile.weaponId, projectile);
          projectile.hitIds.add(enemy.instanceId);
          if (projectile.pierce > 0) {
            projectile.pierce -= 1;
          } else {
            projectile.alive = false;
            break;
          }
        }
      }
    }
    for (const pickup of scene.pickups) {
      if (circlesOverlap(scene.player, pickup)) {
        if (pickup.kind === "xp") {
          if (scene.player.gainXp(pickup.value)) {
            scene.queueLevelUp();
          }
        } else {
          scene.player.heal(pickup.value);
        }
        pickup.alive = false;
      }
    }
  }
}

export class UiController {
  constructor() {
    this.overlayRoot = document.getElementById("overlay-root");
    this.healthFill = document.getElementById("health-fill");
    this.healthText = document.getElementById("health-text");
    this.xpFill = document.getElementById("xp-fill");
    this.xpText = document.getElementById("xp-text");
    this.levelText = document.getElementById("level-text");
    this.timeText = document.getElementById("time-text");
    this.killsText = document.getElementById("kills-text");
    this.recordText = document.getElementById("record-text");
    this.weaponList = document.getElementById("weapon-list");
    this.passiveList = document.getElementById("passive-list");
    this.handlers = {};
  }

  bindHandlers(handlers) {
    this.handlers = handlers;
  }

  renderHud(scene) {
    const player = scene.player;
    this.healthFill.style.width = `${(player.health / player.maxHealth) * 100}%`;
    this.healthText.textContent = `${Math.ceil(player.health)} / ${player.maxHealth}`;
    this.xpFill.style.width = `${(player.xp / player.xpToNext) * 100}%`;
    this.xpText.textContent = `Lv.${player.level}`;
    this.levelText.textContent = String(player.level);
    this.timeText.textContent = formatTime(scene.elapsed);
    this.killsText.textContent = String(player.kills);
    this.recordText.textContent = String(scene.bestScore);
    this.weaponList.innerHTML = [...player.weapons.entries()].map(([weaponId, level]) => `<li>${weapons[weaponId].name} <strong>Lv.${level}</strong></li>`).join("");
    this.passiveList.innerHTML = [...player.passives.entries()].map(([passiveId, level]) => `<li>${passives[passiveId].name} <strong>Lv.${level}</strong></li>`).join("");
  }

  showCharacterSelect() {
    this.overlayRoot.innerHTML = `<div class="overlay"><div class="modal"><div class="two-column"><div><h1>Rift Outlast</h1><p>Pick a route and survive the rift swarm.</p><div class="card-grid">${characters.map((character) => `<button class="hero-card" data-character="${character.id}"><div class="hero-title"><strong>${character.name}</strong><span class="badge">${character.tag}</span></div><p>${character.description}</p><small>Starting weapon: ${character.startingWeapons.map((weaponId) => weapons[weaponId].name).join(", ")}</small></button>`).join("")}</div></div><div><h3>Phase 1 Plan</h3><p class="subtle">Stack: Vanilla JavaScript plus HTML5 Canvas.</p><p class="subtle">Reason: no heavy dependencies, fast startup, safe for an empty repo, easy to extend.</p><p class="subtle">Core systems: scene manager, player, enemies, weapons, projectiles, upgrades, spawning, collision, HUD, config data.</p><p class="subtle">MVP order: movement to enemy chase to 2 weapons to XP and level ups to HUD and restart.</p><p class="subtle">Expansion order: more weapons, more enemy behaviors, character identity, boss and pacing, final cleanup.</p></div></div></div></div>`;
    this.overlayRoot.querySelectorAll("[data-character]").forEach((button) => button.addEventListener("click", () => this.handlers.onStart?.(button.getAttribute("data-character"))));
  }

  showLevelUp(choices, level) {
    this.overlayRoot.innerHTML = `<div class="overlay"><div class="modal"><h2>Level Up Lv.${level}</h2><p>Combat is paused. Pick one upgrade.</p><div class="card-grid">${choices.map((choice, index) => `<button class="choice-card" data-choice="${index}"><strong>${choice.name}</strong><p>${choice.description}</p><small>${choice.type}</small></button>`).join("")}</div></div></div>`;
    this.overlayRoot.querySelectorAll("[data-choice]").forEach((button) => button.addEventListener("click", () => this.handlers.onUpgrade?.(choices[Number(button.getAttribute("data-choice"))])));
  }

  showPause(scene) {
    this.overlayRoot.innerHTML = `<div class="overlay"><div class="modal"><h2>Paused</h2><p>Time ${formatTime(scene.elapsed)}. Kills ${scene.player.kills}.</p><div class="action-row"><button class="action-button" data-action="resume">Resume</button><button class="action-button" data-action="restart">Restart</button></div></div></div>`;
    this.overlayRoot.querySelectorAll("[data-action]").forEach((button) => button.addEventListener("click", () => button.getAttribute("data-action") === "resume" ? this.handlers.onResume?.() : this.handlers.onRestart?.()));
  }

  showGameOver(scene) {
    this.overlayRoot.innerHTML = `<div class="overlay"><div class="modal"><h2>Game Over</h2><p>You survived ${formatTime(scene.elapsed)}. Level ${scene.player.level}. Kills ${scene.player.kills}.</p><div class="action-row"><button class="action-button" data-action="restart">Restart</button><button class="action-button" data-action="menu">Back To Heroes</button></div></div></div>`;
    this.overlayRoot.querySelectorAll("[data-action]").forEach((button) => button.addEventListener("click", () => button.getAttribute("data-action") === "restart" ? this.handlers.onRestart?.() : this.handlers.onMenu?.()));
  }

  clearOverlay() {
    this.overlayRoot.innerHTML = "";
  }
}

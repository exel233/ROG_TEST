import { balance } from "../data/balance.js";
import { characters, encounterSchedule, enemies, passivePool, passives, timedBuffPool, timedBuffs, weaponPool, weapons } from "../data/config.js";
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
    const intensity = 1 + time / 105;
    const maxEnemies = Math.min(240, balance.spawn.baseCap + Math.floor(time * balance.spawn.capRate));
    if (scene.enemies.length < maxEnemies) {
      this.spawnTimer -= delta;
      if (this.spawnTimer <= 0) {
        const spawnCount = Math.max(1, Math.floor(intensity));
        for (let i = 0; i < spawnCount; i += 1) {
          this.spawnEnemy(scene, this.pickEnemyType(time), 0.96 + time / 240);
        }
        this.spawnTimer = Math.max(
          balance.spawn.minInterval,
          balance.spawn.baseInterval - time * balance.spawn.growthPerSecond
        );
      }
    }
    for (const mark of balance.spawn.eliteMarks) {
      if (time >= mark && !this.eliteSpawnedAt.has(mark)) {
        this.spawnEnemy(scene, "elite", 1 + mark / 175);
        this.eliteSpawnedAt.add(mark);
      }
    }
    if (time >= balance.spawn.bossTime && !this.bossSpawned) {
      this.spawnEnemy(scene, "boss", 1.12);
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
    const dist = randomRange(430, 620);
    scene.createEnemy(enemyId, scene.player.x + Math.cos(angle) * dist, scene.player.y + Math.sin(angle) * dist, scale);
  }
}

export class UpgradeSystem {
  getChoices(player) {
    const choices = [];
    for (const weaponId of weaponPool) {
      const level = player.weapons.get(weaponId) || 0;
      if (level <= 0 && player.weapons.size < 6) {
        choices.push({
          type: "weapon-new",
          id: weaponId,
          name: `Unlock ${weapons[weaponId].name}`,
          description: weapons[weaponId].description
        });
      } else if (level > 0 && level < weapons[weaponId].maxLevel) {
        choices.push({
          type: "weapon-level",
          id: weaponId,
          name: `Upgrade ${weapons[weaponId].name} Lv.${level + 1}`,
          description: weapons[weaponId].description
        });
      }
    }
    for (const passiveId of passivePool) {
      const current = player.passives.get(passiveId) || 0;
      if (current < passives[passiveId].maxLevel) {
        choices.push({
          type: "passive",
          id: passiveId,
          name: `${passives[passiveId].name} Lv.${current + 1}`,
          description: passives[passiveId].description
        });
      }
    }
    choices.push({ type: "heal", id: "heal", name: "Emergency Repair", description: "Heal 35 percent of max health instantly." });
    return this.weightAndPick(player, choices);
  }

  getRewardChoices(player) {
    const choices = [];
    for (const weaponId of weaponPool) {
      const level = player.weapons.get(weaponId) || 0;
      if (level > 0 && level < weapons[weaponId].maxLevel) {
        choices.push({
          type: "weapon-level",
          id: weaponId,
          name: `Forge ${weapons[weaponId].name}`,
          description: "A focused upgrade from a rare chest."
        });
      }
    }
    for (const passiveId of passivePool) {
      const current = player.passives.get(passiveId) || 0;
      if (current < passives[passiveId].maxLevel) {
        choices.push({
          type: "passive",
          id: passiveId,
          name: `Bless ${passives[passiveId].name}`,
          description: "A stronger reward choice from a rare chest."
        });
      }
    }
    choices.push({
      type: "full-heal",
      id: "full-heal",
      name: "Warm Campfire",
      description: "Restore full health and gain a little bonus experience."
    });
    for (const buffId of timedBuffPool) {
      choices.push({
        type: "reward-buff",
        id: buffId,
        name: timedBuffs[buffId].name,
        description: timedBuffs[buffId].description
      });
    }
    return this.weightAndPick(player, choices, 3, true);
  }

  weightAndPick(player, choices, count = 3, favorStrong = false) {
    const weighted = [];
    for (const choice of choices) {
      weighted.push(choice);
      if (choice.type === "weapon-level") {
        weighted.push(choice);
        if (favorStrong) {
          weighted.push(choice);
        }
      }
      if (choice.type === "passive" && Math.random() < player.luck + (favorStrong ? 0.1 : 0)) {
        weighted.push(choice);
      }
    }
    return pickRandom(weighted, count).filter(
      (choice, index, array) => array.findIndex((item) => item.type === choice.type && item.id === choice.id) === index
    );
  }

  applyChoice(player, choice) {
    if (choice.type === "weapon-new" || choice.type === "weapon-level") {
      player.addWeapon(choice.id);
    } else if (choice.type === "passive") {
      player.levelUpPassive(choice.id, passives[choice.id]);
    } else if (choice.type === "reward-buff") {
      player.applyTimedBuff(timedBuffs[choice.id]);
    } else if (choice.type === "full-heal") {
      player.heal(player.maxHealth);
      player.gainXp(8);
    } else {
      player.heal(player.maxHealth * 0.35);
    }
  }
}

export class CollisionSystem {
  update(scene, delta) {
    for (const enemy of scene.enemies) {
      if (circlesOverlap(scene.player, enemy) && scene.player.takeDamage(enemy.damage * delta * 2.05)) {
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
          scene.addBurst(projectile.x, projectile.y, "#8ef1a7", 6, 50);
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
        } else if (pickup.kind === "heal") {
          scene.player.heal(pickup.value);
          scene.pushFloatingText("HEAL", pickup.x, pickup.y, "#7ef0a8");
        } else if (pickup.kind === "buff") {
          const buff = timedBuffs[pickup.buffId];
          if (buff) {
            scene.player.applyTimedBuff(buff);
            scene.pushFloatingText(buff.name, pickup.x, pickup.y, buff.color, 0.95);
          }
        } else if (pickup.kind === "chest") {
          scene.queueRewardChoice("Supply Cache");
        }
        scene.addBurst(
          pickup.x,
          pickup.y,
          pickup.kind === "heal" ? "#7ef0a8" : pickup.kind === "chest" ? "#ffd166" : pickup.kind === "buff" ? "#d5b5ff" : "#62e5ff"
        );
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
    this.buffList = document.getElementById("buff-list");
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
    this.recordText.textContent = `${scene.bestScore} / ${formatTime(scene.bestTime)}`;
    this.weaponList.innerHTML = [...player.weapons.entries()]
      .map(([weaponId, level]) => `<li>${weapons[weaponId].name} <strong>Lv.${level}</strong></li>`)
      .join("");
    this.passiveList.innerHTML = [...player.passives.entries()]
      .map(([passiveId, level]) => `<li>${passives[passiveId].name} <strong>Lv.${level}</strong></li>`)
      .join("");
    this.buffList.innerHTML = player.activeBuffs.length
      ? player.activeBuffs
          .map((buff) => `<li style="color:${buff.color}">${buff.name} <strong>${Math.ceil(buff.remaining)}s</strong></li>`)
          .join("")
      : "<li>None</li>";
  }

  showLoading() {
    this.overlayRoot.innerHTML = `
      <div class="overlay">
        <div class="modal modal-small">
          <h2>Loading Assets</h2>
          <p>Preparing pixel sprites, UI theme, and battlefield visuals.</p>
        </div>
      </div>
    `;
  }

  showCharacterSelect(meta) {
    this.overlayRoot.innerHTML = `
      <div class="overlay">
        <div class="modal">
          <div class="two-column">
            <div>
              <h1>Rift Outlast</h1>
              <p>Hold the breach, build your loadout, and survive the swarm.</p>
              <div class="card-grid">
                ${characters
                  .map(
                    (character) => `
                      <button class="hero-card" data-character="${character.id}">
                        <div class="hero-title">
                          <strong>${character.name}</strong>
                          <span class="badge">${character.tag}</span>
                        </div>
                        <p>${character.description}</p>
                        <small>Starting weapon: ${character.startingWeapons
                          .map((weaponId) => weapons[weaponId].name)
                          .join(", ")}</small>
                      </button>
                    `
                  )
                  .join("")}
              </div>
            </div>
            <div>
              <h3>Rift Archive</h3>
              <p class="subtle">Shards <strong>${meta.shards}</strong> | Runs <strong>${meta.runs}</strong> | Total Kills <strong>${meta.totalKills}</strong></p>
              <div class="card-grid compact-grid">
                ${meta.upgrades
                  .map(
                    (upgrade) => `
                      <button class="choice-card meta-card" data-meta-upgrade="${upgrade.id}" ${upgrade.nextCost === null || !upgrade.affordable ? "disabled" : ""}>
                        <strong>${upgrade.name}</strong>
                        <p>${upgrade.description}</p>
                        <small>Level ${upgrade.level}/${upgrade.maxLevel}${upgrade.nextCost === null ? " | MAX" : ` | Cost ${upgrade.nextCost}`}</small>
                      </button>
                    `
                  )
                  .join("")}
              </div>
              <p class="subtle">Move with WASD or arrow keys. Pick upgrades during pauses. Press Esc to pause the run.</p>
            </div>
          </div>
        </div>
      </div>
    `;
    this.overlayRoot.querySelectorAll("[data-character]").forEach((button) => {
      button.addEventListener("click", () => this.handlers.onStart?.(button.getAttribute("data-character")));
    });
    this.overlayRoot.querySelectorAll("[data-meta-upgrade]").forEach((button) => {
      button.addEventListener("click", () => this.handlers.onMetaUpgrade?.(button.getAttribute("data-meta-upgrade")));
    });
  }

  showChoiceOverlay(title, subtitle, choices, handlerName = "onUpgrade") {
    this.overlayRoot.innerHTML = `
      <div class="overlay">
        <div class="modal">
          <h2>${title}</h2>
          <p>${subtitle}</p>
          <div class="card-grid">
            ${choices
              .map(
                (choice, index) => `
                  <button class="choice-card" data-choice="${index}">
                    <strong>${choice.name}</strong>
                    <p>${choice.description}</p>
                    <small>${choice.type}</small>
                  </button>
                `
              )
              .join("")}
          </div>
        </div>
      </div>
    `;
    this.overlayRoot.querySelectorAll("[data-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.getAttribute("data-choice"));
        this.handlers[handlerName]?.(choices[index]);
      });
    });
  }

  showLevelUp(choices, level) {
    this.showChoiceOverlay(`Level Up Lv.${level}`, "Combat is paused. Pick one upgrade.", choices, "onUpgrade");
  }

  showReward(choices, label) {
    this.showChoiceOverlay(label, "A rare cache offers one stronger reward.", choices, "onReward");
  }

  showPause(scene) {
    this.overlayRoot.innerHTML = `
      <div class="overlay">
        <div class="modal modal-small">
          <h2>Paused</h2>
          <p>Time ${formatTime(scene.elapsed)}. Kills ${scene.player.kills}.</p>
          <div class="action-row">
            <button class="action-button" data-action="resume">Resume</button>
            <button class="action-button" data-action="restart">Restart</button>
          </div>
        </div>
      </div>
    `;
    this.overlayRoot.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", () =>
        button.getAttribute("data-action") === "resume" ? this.handlers.onResume?.() : this.handlers.onRestart?.()
      );
    });
  }

  showGameOver(scene) {
    this.overlayRoot.innerHTML = `
      <div class="overlay">
        <div class="modal modal-small">
          <h2>Game Over</h2>
          <p>You survived ${formatTime(scene.elapsed)}. Level ${scene.player.level}. Kills ${scene.player.kills}.</p>
          <p>Shards earned ${scene.shardsEarned}. Total shards ${scene.game.meta.getSnapshot().shards}.</p>
          <div class="action-row">
            <button class="action-button" data-action="restart">Restart</button>
            <button class="action-button" data-action="menu">Back To Heroes</button>
          </div>
        </div>
      </div>
    `;
    this.overlayRoot.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", () =>
        button.getAttribute("data-action") === "restart" ? this.handlers.onRestart?.() : this.handlers.onMenu?.()
      );
    });
  }

  clearOverlay() {
    this.overlayRoot.innerHTML = "";
  }
}

import {
  atlases,
  characterSprites,
  decorTiles,
  enemySprites,
  floorTiles,
  floorOverlayTiles,
  propTiles,
  pickupSprites,
  pixelScale,
  weaponVisuals,
  worldPalette
} from "../data/visuals.js";
import { clamp, randomRange, TAU } from "../utils/math.js";

export class EntityRenderer {
  constructor(assetManager) {
    this.assets = assetManager;
  }

  setPixelMode(ctx) {
    ctx.imageSmoothingEnabled = false;
  }

  drawSceneBackground(ctx, cameraX, cameraY, width, height, elapsed) {
    this.setPixelMode(ctx);
    const tileSize = atlases.dungeon.tileSize * pixelScale;
    const startX = Math.floor(cameraX / tileSize) - 2;
    const startY = Math.floor(cameraY / tileSize) - 2;
    const endX = Math.floor((cameraX + width) / tileSize) + 2;
    const endY = Math.floor((cameraY + height) / tileSize) + 2;

    ctx.fillStyle = "#0c1017";
    ctx.fillRect(0, 0, width, height);

    for (let gy = startY; gy <= endY; gy += 1) {
      for (let gx = startX; gx <= endX; gx += 1) {
        const floorTile = floorTiles[Math.abs((gx * 7 + gy * 13) % floorTiles.length)];
        const x = gx * tileSize - cameraX;
        const y = gy * tileSize - cameraY;
        this.drawAtlasFrame(ctx, floorTile.atlas, floorTile.x, floorTile.y, x, y, tileSize);
        if ((gx + gy) % 6 === 0) {
          const overlay = floorOverlayTiles[Math.abs((gx * 5 + gy * 11) % floorOverlayTiles.length)];
          this.drawAtlasFrame(ctx, overlay.atlas, overlay.x, overlay.y, x, y, tileSize, 0.15);
        }
        if ((gx + gy) % 17 === 0) {
          const decor = decorTiles[Math.abs((gx * 3 + gy * 5) % decorTiles.length)];
          this.drawAtlasFrame(ctx, decor.atlas, decor.x, decor.y, x, y, tileSize);
        }
        if ((gx * 5 + gy * 3) % 29 === 0) {
          const prop = propTiles[Math.abs((gx * 11 + gy * 17) % propTiles.length)];
          this.drawAtlasFrame(ctx, prop.atlas, prop.x, prop.y, x, y, tileSize);
        }
      }
    }

    ctx.fillStyle = worldPalette.floorTint;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = worldPalette.floorGlow;
    for (let index = 0; index < 5; index += 1) {
      const px = ((index * 193 + elapsed * 14) % (width + 220)) - 110;
      const py = (index * 137) % height;
      ctx.beginPath();
      ctx.arc(px, py, 68 + index * 14, 0, TAU);
      ctx.fill();
    }

    const pulse = 0.5 + Math.sin(elapsed * 0.9) * 0.5;
    ctx.fillStyle = `rgba(91, 221, 189, ${0.06 + pulse * 0.04})`;
    ctx.beginPath();
    ctx.arc(width * 0.82, height * 0.22, 160, 0, TAU);
    ctx.fill();
  }

  drawAtlasFrame(ctx, atlasKey, tileX, tileY, x, y, size, alpha = 1) {
    const image = this.assets.getImage(atlasKey);
    if (!image) {
      return false;
    }
    const tileSize = atlases[atlasKey].tileSize;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(image, tileX * tileSize, tileY * tileSize, tileSize, tileSize, Math.round(x), Math.round(y), size, size);
    ctx.restore();
    return true;
  }

  drawShadow(ctx, x, y, radiusX, radiusY) {
    ctx.fillStyle = worldPalette.shadow;
    ctx.beginPath();
    ctx.ellipse(Math.round(x), Math.round(y), radiusX, radiusY, 0, 0, TAU);
    ctx.fill();
  }

  drawTintedImage(ctx, key, x, y, size, color = "#ffffff", alpha = 1, rotation = 0, blend = "source-over") {
    const image = this.assets.getImage(key);
    if (!image) {
      return false;
    }
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.globalCompositeOperation = blend;
    ctx.translate(Math.round(x), Math.round(y));
    ctx.rotate(rotation);
    ctx.drawImage(image, -size / 2, -size / 2, size, size);
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = color;
    ctx.fillRect(-size / 2, -size / 2, size, size);
    ctx.restore();
    return true;
  }

  drawPlayer(ctx, player, cameraX, cameraY, elapsed) {
    const sprite = characterSprites[player.character.id];
    const moving = Math.abs(player.x - (player.lastRenderX || player.x)) + Math.abs(player.y - (player.lastRenderY || player.y)) > 0.2;
    const animation = moving ? sprite.move || sprite.idle : sprite.idle;
    const frame = animation[Math.floor(elapsed * (moving ? 10 : 5)) % animation.length];
    const size = 16 * pixelScale;
    const drawX = player.x - cameraX - size / 2;
    const drawY = player.y - cameraY - size / 2 - 8 + Math.sin(elapsed * 7) * 1.5;
    this.drawShadow(ctx, player.x - cameraX, player.y - cameraY + 12, 14, 7);
    this.drawAtlasFrame(ctx, sprite.atlas, frame.x, frame.y, drawX, drawY, size);
    player.lastRenderX = player.x;
    player.lastRenderY = player.y;
  }

  drawEnemy(ctx, enemy, cameraX, cameraY, elapsed) {
    const sprite = enemySprites[enemy.id];
    const frame = sprite ? sprite.idle[Math.floor((elapsed * 4 + enemy.instanceId * 0.37) % sprite.idle.length)] : null;
    const size = clamp(enemy.radius * 2.4, 26, enemy.id === "boss" ? 84 : 56);
    const drawX = enemy.x - cameraX - size / 2;
    const drawY = enemy.y - cameraY - size / 2 - 6 + Math.sin(elapsed * 5 + enemy.instanceId) * 1.3;
    this.drawShadow(ctx, enemy.x - cameraX, enemy.y - cameraY + enemy.radius * 0.9, enemy.radius * 0.92, enemy.radius * 0.42);

    if (frame && this.drawAtlasFrame(ctx, sprite.atlas, frame.x, frame.y, drawX, drawY, size, enemy.hitFlash > 0 ? 0.76 : 1)) {
      if (enemy.hitFlash > 0) {
        ctx.strokeStyle = "rgba(255,255,255,0.65)";
        ctx.lineWidth = 2;
        ctx.strokeRect(drawX + 2, drawY + 2, size - 4, size - 4);
      }
      return;
    }

    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.arc(enemy.x - cameraX, enemy.y - cameraY, enemy.radius, 0, TAU);
    ctx.fill();
  }

  drawPickup(ctx, pickup, cameraX, cameraY, elapsed) {
    const sprite = pickupSprites[pickup.kind];
    const size = pickup.kind === "chest" ? 16 * pixelScale : 12 * pixelScale;
    const bob = Math.sin(elapsed * 4 + pickup.x * 0.01 + pickup.y * 0.01) * 2;
    const x = pickup.x - cameraX - size / 2;
    const y = pickup.y - cameraY - size / 2 + bob;
    this.drawShadow(ctx, pickup.x - cameraX, pickup.y - cameraY + 10, size * 0.22, size * 0.1);

    if (sprite && this.drawAtlasFrame(ctx, sprite.atlas, sprite.frame.x, sprite.frame.y, x, y, size)) {
      return;
    }

    if (pickup.kind === "buff") {
      ctx.save();
      ctx.translate(x + size / 2, y + size / 2);
      ctx.rotate(elapsed * 1.8);
      ctx.fillStyle = "#d8bcff";
      ctx.fillRect(-size * 0.2, -size * 0.42, size * 0.4, size * 0.84);
      ctx.fillRect(-size * 0.42, -size * 0.2, size * 0.84, size * 0.4);
      ctx.restore();
      return;
    }

    const color = pickup.kind === "heal" ? worldPalette.heal : pickup.kind === "chest" ? worldPalette.chest : worldPalette.xp;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size * 0.5, size * 0.5);
  }

  drawProjectile(ctx, projectile, cameraX, cameraY, elapsed) {
    const x = projectile.x - cameraX;
    const y = projectile.y - cameraY;
    const visual = weaponVisuals[projectile.weaponId] || (projectile.team === "enemy" ? weaponVisuals.enemy : null);

    if (projectile.type === "zone") {
      const size = projectile.radius * 2.15;
      if (visual?.zoneFx) {
        this.drawTintedImage(ctx, visual.zoneFx, x, y, size, visual.color, 0.34, elapsed * 0.3, "screen");
      }
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, projectile.radius, 0, TAU);
      ctx.fillStyle = projectile.weaponId === "frostField" ? "rgba(110, 221, 255, 0.16)" : "rgba(225, 139, 255, 0.12)";
      ctx.fill();
      ctx.strokeStyle = visual?.zoneOutline || (projectile.weaponId === "frostField" ? "rgba(165, 244, 255, 0.55)" : "rgba(236, 163, 255, 0.55)");
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      return;
    }

    const trailColor = visual?.trailColor || (projectile.team === "enemy" ? "rgba(130, 232, 157, 0.22)" : "rgba(255,255,255,0.2)");
    ctx.strokeStyle = trailColor;
    ctx.lineWidth = Math.max(2, projectile.radius * 0.8);
    ctx.beginPath();
    ctx.moveTo(x, y);
    const trailMul = (visual?.trailLength || 12) / 100;
    ctx.lineTo(x - (projectile.vx || 0) * trailMul, y - (projectile.vy || 0) * trailMul);
    ctx.stroke();

    if (visual?.projectileFx) {
      const size = Math.max(16, projectile.radius * 8 * (visual.projectileScale || 0.35));
      this.drawTintedImage(ctx, visual.projectileFx, x, y, size, visual.color || projectile.color || "#ffffff", 0.92, projectile.angle || elapsed * 4, "screen");
      return;
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((projectile.angle || elapsed * 6) + Math.PI / 4);
    ctx.fillStyle = projectile.team === "enemy" ? projectile.color || "#82e89d" : "#fdf7db";
    const size = Math.max(4, projectile.radius * 1.65);
    ctx.fillRect(-size / 2, -size / 2, size, size);
    ctx.restore();
  }

  drawOrbital(ctx, weapon, stats, angle, x, y, cameraX, cameraY) {
    const size = stats.size * 1.9;
    this.drawShadow(ctx, x - cameraX, y - cameraY + 7, size * 0.34, size * 0.14);
    const visual = weaponVisuals[weapon.id];
    if (visual?.orbitalSprite) {
      this.drawAtlasFrame(
        ctx,
        visual.orbitalSprite.atlas,
        visual.orbitalSprite.x,
        visual.orbitalSprite.y,
        x - cameraX - size / 2,
        y - cameraY - size / 2,
        size
      );
      return;
    }
    ctx.save();
    ctx.translate(x - cameraX, y - cameraY);
    ctx.rotate(angle + Math.PI / 4);
    ctx.fillStyle = weapon.color;
    ctx.fillRect(-size / 2, -size / 2, size, size);
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 1;
    ctx.strokeRect(-size / 2, -size / 2, size, size);
    ctx.restore();
  }

  drawHealthBar(ctx, enemy, cameraX, cameraY) {
    const width = enemy.radius * 2;
    const x = enemy.x - cameraX - enemy.radius;
    const y = enemy.y - cameraY - enemy.radius - 13;
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(x, y, width, 5);
    ctx.fillStyle = enemy.id === "boss" ? "#ffd166" : "#ff7f88";
    ctx.fillRect(x + 1, y + 1, Math.max(0, (enemy.health / enemy.maxHealth) * (width - 2)), 3);
  }

  drawParticles(ctx, particles, cameraX, cameraY) {
    for (const particle of particles) {
      ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
      ctx.fillStyle = particle.color;
      ctx.fillRect(Math.round(particle.x - cameraX), Math.round(particle.y - cameraY), particle.size, particle.size);
    }
    ctx.globalAlpha = 1;
  }

  drawEffects(ctx, effects, cameraX, cameraY) {
    for (const effect of effects) {
      const alpha = Math.max(0, effect.life / effect.maxLife);
      this.drawTintedImage(
        ctx,
        effect.key,
        effect.x - cameraX,
        effect.y - cameraY,
        effect.size * effect.scale,
        effect.color,
        alpha,
        effect.rotation,
        effect.blend
      );
    }
  }

  drawFloatingTexts(ctx, texts, cameraX, cameraY) {
    ctx.save();
    ctx.font = "14px KenneyFuture, monospace";
    ctx.textAlign = "center";
    for (const text of texts) {
      ctx.globalAlpha = Math.max(0, text.life / text.maxLife);
      ctx.fillStyle = text.color;
      ctx.fillText(text.text, Math.round(text.x - cameraX), Math.round(text.y - cameraY));
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  createBurst(scene, x, y, color, count = 8, speed = 52) {
    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * TAU + randomRange(-0.2, 0.2);
      scene.particles.push({
        x,
        y,
        vx: Math.cos(angle) * randomRange(speed * 0.55, speed),
        vy: Math.sin(angle) * randomRange(speed * 0.55, speed),
        color,
        size: randomRange(2, 4),
        life: 0.34,
        maxLife: 0.34
      });
    }
  }
}

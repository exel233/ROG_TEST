import { atlases, imageAssets } from "../data/visuals.js";

export class AssetManager {
  constructor() {
    this.images = new Map();
    this.ready = false;
  }

  async loadAll() {
    const atlasJobs = Object.values(atlases).map((atlas) => this.loadImage(atlas.key, atlas.src));
    const imageJobs = Object.values(imageAssets).map((asset) => this.loadImage(asset.key, asset.src));
    await Promise.all([...atlasJobs, ...imageJobs]);
    await this.loadFont();
    this.ready = true;
  }

  loadImage(key, src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        this.images.set(key, image);
        resolve(image);
      };
      image.onerror = reject;
      image.src = src;
    });
  }

  async loadFont() {
    if (!("fonts" in document)) {
      return;
    }
    const face = new FontFace("KenneyFuture", "url('./src/assets/fonts/KenneyFuture.ttf')");
    await face.load();
    document.fonts.add(face);
  }

  getImage(key) {
    return this.images.get(key) || null;
  }
}

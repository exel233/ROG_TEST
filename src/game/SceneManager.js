export class SceneManager {
  constructor() {
    this.current = null;
  }

  set(scene) {
    this.current = scene;
  }

  update(delta) {
    this.current?.update(delta);
  }

  render(ctx) {
    this.current?.render(ctx);
  }
}

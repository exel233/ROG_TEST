import { characters } from "../data/config.js";
import { ArenaScene } from "../scenes/ArenaScene.js";
import { SceneManager } from "./SceneManager.js";
import { Input, UiController } from "../systems/Systems.js";

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.sceneManager = new SceneManager();
    this.input = new Input();
    this.ui = new UiController();
    this.lastFrame = 0;
    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.ui.bindHandlers({
      onStart: (characterId) => this.startRun(characterId),
      onUpgrade: (choice) => this.sceneManager.current?.selectUpgrade(choice),
      onResume: () => this.sceneManager.current?.resume(),
      onRestart: () => this.sceneManager.current?.restart(),
      onMenu: () => this.showMenu()
    });
  }

  resize() {
    this.canvas.width = window.innerWidth * window.devicePixelRatio;
    this.canvas.height = window.innerHeight * window.devicePixelRatio;
    this.ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  }

  start() {
    this.showMenu();
    requestAnimationFrame((time) => this.loop(time));
  }

  showMenu() {
    this.sceneManager.set(null);
    this.ui.showCharacterSelect();
  }

  startRun(characterId) {
    const character = characters.find((entry) => entry.id === characterId) || characters[0];
    this.sceneManager.set(new ArenaScene(this, character));
    this.ui.clearOverlay();
  }

  loop(time) {
    const delta = Math.min(0.033, (time - this.lastFrame) / 1000 || 0.016);
    this.lastFrame = time;
    this.sceneManager.update(delta);
    this.sceneManager.render(this.ctx);
    requestAnimationFrame((next) => this.loop(next));
  }
}

import { Game } from "./game/Game.js";

const canvas = document.getElementById("game-canvas");

if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error("Canvas element not found");
}

const game = new Game(canvas);
game.start();

export class GameUI {
  constructor() {
    this.modeEl = document.getElementById("mode");
    this.speedEl = document.getElementById("speed");
    this.promptEl = document.getElementById("prompt");
    this.pauseEl = document.getElementById("paused");
    this.pauseBtn = document.getElementById("pause-btn");
    this.restartBtn = document.getElementById("restart-btn");
    this.startOverlay = document.getElementById("start-overlay");
    this.startBtn = document.getElementById("start-btn");
  }

  setMode(modeText) {
    this.modeEl.textContent = `Mode: ${modeText}`;
  }

  setSpeed(speedKmh) {
    this.speedEl.textContent = `Speed: ${Math.round(speedKmh)} km/h`;
  }

  showPrompt(show, text = "Press E to enter") {
    this.promptEl.textContent = text;
    this.promptEl.classList.toggle("hidden", !show);
  }

  setPaused(show) {
    this.pauseEl.classList.toggle("hidden", !show);
    this.pauseBtn.textContent = show ? "Resume" : "Pause";
  }

  hideStartOverlay() {
    this.startOverlay.classList.add("hidden");
  }
}

export class InputController {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.mouseDelta = { x: 0, y: 0 };
    this.pointerLocked = false;
    this._bindEvents();
  }

  _bindEvents() {
    window.addEventListener("keydown", (event) => {
      this.keys.add(event.code);
    });

    window.addEventListener("keyup", (event) => {
      this.keys.delete(event.code);
    });

    document.addEventListener("pointerlockchange", () => {
      this.pointerLocked = document.pointerLockElement === this.canvas;
      if (!this.pointerLocked) {
        this.mouseDelta.x = 0;
        this.mouseDelta.y = 0;
      }
    });

    window.addEventListener("mousemove", (event) => {
      if (!this.pointerLocked) {
        return;
      }
      this.mouseDelta.x += event.movementX;
      this.mouseDelta.y += event.movementY;
    });
  }

  isDown(code) {
    return this.keys.has(code);
  }

  consumeMouseDelta() {
    const delta = { ...this.mouseDelta };
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
    return delta;
  }
}

import * as THREE from "https://unpkg.com/three@0.163.0/build/three.module.js";
import * as CANNON from "https://unpkg.com/cannon-es@0.20.0/dist/cannon-es.js";
import { CONFIG } from "./config.js";
import { InputController } from "./input.js";
import { ThirdPersonCamera } from "./camera.js";
import { GameUI } from "./ui.js";
import { PlayerController } from "./player.js";
import { CarController } from "./car.js";
import { createEnvironment } from "./environment.js";

const canvas = document.getElementById("game-canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 500);

const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, CONFIG.world.gravity, 0)
});
world.defaultContactMaterial.friction = 0.45;
world.defaultContactMaterial.restitution = 0.05;
world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = true;

createEnvironment(scene, world);
const input = new InputController(canvas);
const ui = new GameUI();
const player = new PlayerController(scene, world);
const car = new CarController(scene, world);
const cameraController = new ThirdPersonCamera(camera);

let gameMode = "foot";
let paused = false;
let started = false;
let previousTime = performance.now();

const keyWasDown = new Map();

function isKeyJustPressed(code) {
  const down = input.isDown(code);
  const was = keyWasDown.get(code) || false;
  keyWasDown.set(code, down);
  return down && !was;
}

function syncAllKeysState() {
  const keys = ["KeyE", "KeyP", "KeyR"];
  for (const code of keys) {
    keyWasDown.set(code, input.isDown(code));
  }
}

function setPaused(nextPaused) {
  paused = nextPaused;
  ui.setPaused(paused);
}

function setMode(nextMode) {
  gameMode = nextMode;
  ui.setMode(nextMode === "car" ? "Driving" : "On Foot");
}

function startGame() {
  if (started) {
    return;
  }

  started = true;
  document.body.classList.add("started");
  ui.hideStartOverlay();
  previousTime = performance.now();

  if (!input.pointerLocked) {
    try {
      canvas.requestPointerLock();
    } catch (error) {
      console.warn("Pointer lock request failed:", error);
    }
  }
}

function restartGame() {
  car.resetToSpawn();
  player.setPosition(CONFIG.world.playerSpawn.x, CONFIG.world.playerSpawn.y, CONFIG.world.playerSpawn.z);
  setMode("foot");
  setPaused(false);
}

function tryEnterOrExitCar() {
  if (gameMode === "foot") {
    const dist = player.getPosition().distanceTo(car.getPosition());
    if (dist <= CONFIG.car.interactDistance) {
      setMode("car");
      player.mesh.visible = false;
      player.body.position.set(9999, 9999, 9999);
      player.body.velocity.set(0, 0, 0);
    }
  } else if (gameMode === "car" && car.canExit()) {
    const carPos = car.getPosition();
    const exitOffset = new THREE.Vector3(1.8, 0.8, 0.8);
    player.setPosition(carPos.x + exitOffset.x, Math.max(1.2, carPos.y + exitOffset.y), carPos.z + exitOffset.z);
    player.mesh.visible = true;
    setMode("foot");
  }
}

function updateInteractionPrompt() {
  if (gameMode === "foot") {
    const dist = player.getPosition().distanceTo(car.getPosition());
    ui.showPrompt(dist <= CONFIG.car.interactDistance, "Press E to enter");
  } else {
    const allowExit = car.canExit();
    ui.showPrompt(allowExit, allowExit ? "Press E to exit" : "Slow down to exit");
  }
}

function updateCamera(deltaSeconds) {
  cameraController.updateFromMouse(input);

  if (gameMode === "car") {
    const carPos = car.getPosition();
    cameraController.update(carPos, "car", deltaSeconds);
  } else {
    const playerPos = player.getPosition();
    cameraController.update(playerPos, "foot", deltaSeconds);
  }
}

function animate(now) {
  requestAnimationFrame(animate);

  const deltaSeconds = Math.min((now - previousTime) / 1000, 0.05);
  previousTime = now;

  if (!started) {
    renderer.render(scene, camera);
    return;
  }

  if (isKeyJustPressed("KeyP")) {
    setPaused(!paused);
  }

  if (!paused) {
    const forward = cameraController.getForwardFlat();

    player.update(input, forward, deltaSeconds, gameMode === "foot");
    const speedKmh = car.update(input, deltaSeconds, gameMode === "car");
    world.step(1 / 60, deltaSeconds, 3);

    player.syncVisual();
    car.syncVisual(deltaSeconds);

    if (gameMode === "car" && isKeyJustPressed("KeyR")) {
      car.resetIfOverturned(true);
    }

    if (isKeyJustPressed("KeyE")) {
      tryEnterOrExitCar();
    }

    updateInteractionPrompt();
    updateCamera(deltaSeconds);
    ui.setSpeed(speedKmh);
  }

  syncAllKeysState();
  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

ui.pauseBtn.addEventListener("click", () => {
  setPaused(!paused);
});

ui.restartBtn.addEventListener("click", () => {
  restartGame();
});

ui.startBtn.addEventListener("click", () => {
  startGame();
});

canvas.addEventListener("click", () => {
  if (!started) {
    startGame();
    return;
  }

  if (!input.pointerLocked && started) {
    try {
      canvas.requestPointerLock();
    } catch (error) {
      console.warn("Pointer lock request failed:", error);
    }
  }
});

window.addEventListener("keydown", (event) => {
  if (!started && (event.code === "Enter" || event.code === "Space")) {
    startGame();
  }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  });
}

setMode("foot");
ui.setSpeed(0);
camera.position.set(0, 3, 10);
camera.lookAt(0, 1, 0);
animate(performance.now());

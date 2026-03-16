import * as THREE from "https://unpkg.com/three@0.163.0/build/three.module.js";
import { CONFIG } from "./config.js";

export class ThirdPersonCamera {
  constructor(camera) {
    this.camera = camera;
    this.yaw = Math.PI;
    this.pitch = -0.25;
    this.currentPosition = new THREE.Vector3(0, 2, 9);
    this.currentLookAt = new THREE.Vector3();
  }

  updateFromMouse(input) {
    const delta = input.consumeMouseDelta();
    if (delta.x === 0 && delta.y === 0) {
      return;
    }

    this.yaw -= delta.x * CONFIG.camera.sensitivity;
    this.pitch -= delta.y * CONFIG.camera.sensitivity;
    this.pitch = Math.max(CONFIG.camera.minPitch, Math.min(CONFIG.camera.maxPitch, this.pitch));
  }

  getForwardFlat() {
    const forward = new THREE.Vector3(
      Math.sin(this.yaw),
      0,
      Math.cos(this.yaw)
    );
    return forward.normalize();
  }

  update(targetPos, mode, deltaSeconds) {
    const followDistance = mode === "car" ? CONFIG.car.followDistance : CONFIG.player.followDistance;
    const followHeight = mode === "car" ? CONFIG.car.followHeight : CONFIG.player.followHeight;

    const back = new THREE.Vector3(
      Math.sin(this.yaw) * -Math.cos(this.pitch),
      Math.sin(this.pitch),
      Math.cos(this.yaw) * -Math.cos(this.pitch)
    );

    const desiredPosition = targetPos
      .clone()
      .addScaledVector(back, followDistance)
      .add(new THREE.Vector3(0, followHeight, 0));

    const desiredLookAt = targetPos.clone().add(new THREE.Vector3(0, mode === "car" ? 1.2 : 1.4, 0));

    const lerp = 1 - Math.exp(-CONFIG.camera.smoothness * deltaSeconds);
    this.currentPosition.lerp(desiredPosition, lerp);
    this.currentLookAt.lerp(desiredLookAt, lerp);

    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.currentLookAt);
  }
}

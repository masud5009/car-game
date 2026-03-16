import * as THREE from "https://unpkg.com/three@0.163.0/build/three.module.js";
import * as CANNON from "https://unpkg.com/cannon-es@0.20.0/dist/cannon-es.js";
import { CONFIG } from "./config.js";

function kmhFromBody(body) {
  return body.velocity.length() * 3.6;
}

export class CarController {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;

    this.group = new THREE.Group();

    const chassisMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 0.8, 4.2),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.2, roughness: 0.5 })
    );
    chassisMesh.castShadow = true;
    chassisMesh.receiveShadow = true;
    this.group.add(chassisMesh);

    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.65, 1.9),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 })
    );
    cabin.position.set(0, 0.65, -0.1);
    cabin.castShadow = true;
    this.group.add(cabin);

    const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.28, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827 });
    this.wheels = [];
    const wheelOffsets = [
      [0.95, -0.35, 1.45],
      [-0.95, -0.35, 1.45],
      [0.95, -0.35, -1.45],
      [-0.95, -0.35, -1.45]
    ];

    for (const [x, y, z] of wheelOffsets) {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI * 0.5;
      wheel.position.set(x, y, z);
      wheel.castShadow = true;
      this.group.add(wheel);
      this.wheels.push(wheel);
    }

    this.scene.add(this.group);

    this.body = new CANNON.Body({
      mass: CONFIG.car.mass,
      shape: new CANNON.Box(new CANNON.Vec3(1.05, 0.4, 2.1)),
      position: new CANNON.Vec3(CONFIG.world.carSpawn.x, CONFIG.world.carSpawn.y, CONFIG.world.carSpawn.z),
      angularDamping: CONFIG.car.angularDrag,
      linearDamping: 0.2
    });
    this.world.addBody(this.body);

    this.steerVisual = 0;
  }

  update(input, deltaSeconds, enabled) {
    const speed = this.body.velocity.length();
    const speedKmh = speed * 3.6;

    if (enabled) {
      const steerInput = (input.isDown("KeyD") ? 1 : 0) - (input.isDown("KeyA") ? 1 : 0);
      const accelInput = (input.isDown("KeyW") ? 1 : 0) - (input.isDown("KeyS") ? 1 : 0);

      const forward = new CANNON.Vec3(0, 0, -1);
      this.body.quaternion.vmult(forward, forward);

      let engineForce = 0;
      if (accelInput > 0) {
        engineForce = CONFIG.car.maxEngineForce;
      } else if (accelInput < 0) {
        engineForce = -CONFIG.car.reverseForce;
      }

      const force = forward.scale(engineForce);
      this.body.applyForce(force, this.body.position);

      const normalizedSpeed = Math.min(speedKmh / 110, 1);
      const steerCapability =
        CONFIG.car.maxSteerAtLowSpeed * (1 - normalizedSpeed) +
        CONFIG.car.maxSteerAtHighSpeed * normalizedSpeed;

      this.body.angularVelocity.y += steerInput * CONFIG.car.steeringTorque * steerCapability * deltaSeconds;
      this.steerVisual = steerInput * steerCapability;

      if (input.isDown("Space")) {
        this.body.velocity.scale(0.94, this.body.velocity);
        this.body.angularVelocity.scale(0.8, this.body.angularVelocity);
      }

      if (input.isDown("KeyR")) {
        this.resetIfOverturned(true);
      }
    }

    this.applyDrag(deltaSeconds);
    this.syncVisual(deltaSeconds);

    return speedKmh;
  }

  applyDrag(deltaSeconds) {
    const dragFactor = Math.max(0, 1 - CONFIG.car.drag * (deltaSeconds * 60));
    this.body.velocity.scale(dragFactor, this.body.velocity);
  }

  syncVisual(deltaSeconds) {
    this.group.position.set(this.body.position.x, this.body.position.y, this.body.position.z);
    this.group.quaternion.set(
      this.body.quaternion.x,
      this.body.quaternion.y,
      this.body.quaternion.z,
      this.body.quaternion.w
    );

    const wheelSpin = this.body.velocity.length() * deltaSeconds * 3;
    for (let i = 0; i < this.wheels.length; i += 1) {
      this.wheels[i].rotation.x += wheelSpin;
      if (i < 2) {
        this.wheels[i].rotation.y = this.steerVisual;
      }
    }
  }

  getPosition() {
    return new THREE.Vector3(this.body.position.x, this.body.position.y, this.body.position.z);
  }

  getSpeedKmh() {
    return kmhFromBody(this.body);
  }

  canExit() {
    return this.getSpeedKmh() <= CONFIG.car.exitMinSpeedKmh;
  }

  resetIfOverturned(force = false) {
    const up = new CANNON.Vec3(0, 1, 0);
    const carUp = new CANNON.Vec3(0, 1, 0);
    this.body.quaternion.vmult(carUp, carUp);
    const upDot = carUp.dot(up);

    if (force || upDot < 0.3) {
      this.body.position.y += 1.0;
      this.body.quaternion.setFromEuler(0, this.getYaw(), 0);
      this.body.velocity.set(0, 0, 0);
      this.body.angularVelocity.set(0, 0, 0);
    }
  }

  getYaw() {
    const q = this.body.quaternion;
    const siny = 2 * (q.w * q.y + q.x * q.z);
    const cosy = 1 - 2 * (q.y * q.y + q.z * q.z);
    return Math.atan2(siny, cosy);
  }

  resetToSpawn() {
    this.body.position.set(CONFIG.world.carSpawn.x, CONFIG.world.carSpawn.y, CONFIG.world.carSpawn.z);
    this.body.quaternion.setFromEuler(0, Math.PI, 0);
    this.body.velocity.set(0, 0, 0);
    this.body.angularVelocity.set(0, 0, 0);
  }
}

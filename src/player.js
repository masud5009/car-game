import * as THREE from "https://unpkg.com/three@0.163.0/build/three.module.js";
import * as CANNON from "https://unpkg.com/cannon-es@0.20.0/dist/cannon-es.js";
import { CONFIG } from "./config.js";

export class PlayerController {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.walkCycle = 0;

    this.mesh = new THREE.Group();

    const clothMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.75 });
    const darkClothMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf1c27d, roughness: 0.9 });

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.0, 0.45), clothMat);
    torso.position.set(0, 1.5, 0);
    torso.castShadow = true;
    this.mesh.add(torso);

    const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.35, 0.4), darkClothMat);
    pelvis.position.set(0, 0.95, 0);
    pelvis.castShadow = true;
    this.mesh.add(pelvis);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.12, 8), skinMat);
    neck.position.set(0, 2.04, 0);
    neck.castShadow = true;
    this.mesh.add(neck);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 18, 14), skinMat);
    head.position.set(0, 2.32, 0);
    head.castShadow = true;
    this.mesh.add(head);

    this.leftArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.62, 6, 10), clothMat);
    this.rightArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.62, 6, 10), clothMat);
    this.leftArm.position.set(0.55, 1.52, 0);
    this.rightArm.position.set(-0.55, 1.52, 0);
    this.leftArm.castShadow = true;
    this.rightArm.castShadow = true;
    this.mesh.add(this.leftArm);
    this.mesh.add(this.rightArm);

    this.leftLeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.8, 6, 10), darkClothMat);
    this.rightLeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.8, 6, 10), darkClothMat);
    this.leftLeg.position.set(0.18, 0.35, 0);
    this.rightLeg.position.set(-0.18, 0.35, 0);
    this.leftLeg.castShadow = true;
    this.rightLeg.castShadow = true;
    this.mesh.add(this.leftLeg);
    this.mesh.add(this.rightLeg);

    const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, 0.34), darkClothMat);
    const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, 0.34), darkClothMat);
    leftShoe.position.set(0.18, -0.2, 0.08);
    rightShoe.position.set(-0.18, -0.2, 0.08);
    leftShoe.castShadow = true;
    rightShoe.castShadow = true;
    this.mesh.add(leftShoe);
    this.mesh.add(rightShoe);

    this.scene.add(this.mesh);

    this.body = new CANNON.Body({
      mass: CONFIG.player.mass,
      shape: new CANNON.Sphere(CONFIG.player.radius),
      position: new CANNON.Vec3(CONFIG.world.playerSpawn.x, CONFIG.world.playerSpawn.y, CONFIG.world.playerSpawn.z),
      fixedRotation: true,
      linearDamping: 0.9
    });
    this.body.updateMassProperties();
    this.world.addBody(this.body);
  }

  update(input, cameraForward, deltaSeconds, enabled) {
    if (!enabled) {
      this.body.velocity.x = 0;
      this.body.velocity.z = 0;
      this.syncVisual();
      return;
    }

    const right = new THREE.Vector3(cameraForward.z, 0, -cameraForward.x).normalize();
    const move = new THREE.Vector3();

    if (input.isDown("KeyW")) move.add(cameraForward);
    if (input.isDown("KeyS")) move.addScaledVector(cameraForward, -1);
    if (input.isDown("KeyA")) move.addScaledVector(right, -1);
    if (input.isDown("KeyD")) move.add(right);

    const isSprinting = input.isDown("ShiftLeft") || input.isDown("ShiftRight");
    const maxSpeed = isSprinting ? CONFIG.player.sprintSpeed : CONFIG.player.walkSpeed;
    let planarSpeed = 0;

    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(maxSpeed);
      this.body.velocity.x = move.x;
      this.body.velocity.z = move.z;
      planarSpeed = move.length();
    } else {
      this.body.velocity.x *= 0.8;
      this.body.velocity.z *= 0.8;
      planarSpeed = Math.sqrt(this.body.velocity.x ** 2 + this.body.velocity.z ** 2);
    }

    if (this.body.position.y < CONFIG.player.radius + 0.2) {
      this.body.position.y = CONFIG.player.radius + 0.2;
      this.body.velocity.y = 0;
    }

    this.syncVisual(deltaSeconds, planarSpeed);
  }

  syncVisual(deltaSeconds = 0, planarSpeed = 0) {
    this.mesh.position.set(this.body.position.x, this.body.position.y + 0.6, this.body.position.z);

    const lookDir = new THREE.Vector3(this.body.velocity.x, 0, this.body.velocity.z);
    if (lookDir.lengthSq() > 0.001) {
      this.mesh.rotation.y = Math.atan2(lookDir.x, lookDir.z);
    }

    const walking = planarSpeed > 0.6;
    if (walking) {
      const cycleSpeed = Math.min(10, 4 + planarSpeed * 0.8);
      this.walkCycle += deltaSeconds * cycleSpeed;
    }

    const amp = walking ? 0.55 : 0.06;
    const phase = this.walkCycle;
    this.leftArm.rotation.x = Math.sin(phase + Math.PI) * amp * 0.7;
    this.rightArm.rotation.x = Math.sin(phase) * amp * 0.7;
    this.leftLeg.rotation.x = Math.sin(phase) * amp;
    this.rightLeg.rotation.x = Math.sin(phase + Math.PI) * amp;
  }

  setPosition(x, y, z) {
    this.body.position.set(x, y, z);
    this.body.velocity.set(0, 0, 0);
    this.syncVisual();
  }

  getPosition() {
    return new THREE.Vector3(this.body.position.x, this.body.position.y, this.body.position.z);
  }
}

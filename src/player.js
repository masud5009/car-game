import * as THREE from "https://unpkg.com/three@0.163.0/build/three.module.js";
import * as CANNON from "https://unpkg.com/cannon-es@0.20.0/dist/cannon-es.js";
import { CONFIG } from "./config.js";

export class PlayerController {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.walkCycle = 0;
    this.idleTime = 0;

    this.mesh = new THREE.Group();

    const hoodieMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.7, metalness: 0.03 });
    const hoodieTrimMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.66, metalness: 0.04 });
    const clothDetailMat = new THREE.MeshStandardMaterial({ color: 0x1e40af, roughness: 0.74, metalness: 0.03 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1a2540, roughness: 0.76, metalness: 0.05 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.46, metalness: 0.1 });
    const soleMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.36, metalness: 0.06 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xc68642, roughness: 0.8, metalness: 0.01 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x1a1005, roughness: 0.62, metalness: 0.04 });
    const capMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.66, metalness: 0.07 });
    const tshirtMat = new THREE.MeshStandardMaterial({ color: 0xf0f4f8, roughness: 0.72, metalness: 0.01 });
    const stubbleMat = new THREE.MeshStandardMaterial({ color: 0x1a0c04, roughness: 0.95, metalness: 0, transparent: true, opacity: 0.4 });
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0 });
    const faceDarkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.42 });
    const lipMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.5, metalness: 0.02 });

    this.bodyRoot = new THREE.Group();
    this.bodyRoot.position.set(0, 0, 0);
    this.mesh.add(this.bodyRoot);

    this.torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.78, 4, 8), hoodieMat);
    this.torso.position.set(0, 1.48, -0.01);
    this.torso.castShadow = true;
    this.bodyRoot.add(this.torso);

    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.42, 0.24), hoodieTrimMat);
    chest.position.set(0, 1.58, 0.11);
    chest.castShadow = true;
    this.bodyRoot.add(chest);

    const waist = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.28, 0.26, 8), hoodieTrimMat);
    waist.position.set(0, 1.05, 0.02);
    waist.castShadow = true;
    this.bodyRoot.add(waist);

    // White t-shirt visible under open hoodie
    const tshirtBody = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.21, 0.76, 8), tshirtMat);
    tshirtBody.position.set(0, 1.44, 0);
    tshirtBody.castShadow = true;
    this.bodyRoot.add(tshirtBody);

    const tshirtCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.082, 0.11, 8), tshirtMat);
    tshirtCollar.position.set(0, 1.9, 0);
    this.bodyRoot.add(tshirtCollar);

    const hoodieHem = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.33, 0.18, 8), clothDetailMat);
    hoodieHem.position.set(0, 0.96, 0.01);
    hoodieHem.castShadow = true;
    this.bodyRoot.add(hoodieHem);

    const zipper = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.86, 0.02), clothDetailMat);
    zipper.position.set(0, 1.4, 0.23);
    zipper.castShadow = true;
    this.bodyRoot.add(zipper);

    const leftPocket = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.11, 0.02), clothDetailMat);
    const rightPocket = leftPocket.clone();
    leftPocket.position.set(0.18, 1.17, 0.2);
    rightPocket.position.set(-0.18, 1.17, 0.2);
    this.bodyRoot.add(leftPocket);
    this.bodyRoot.add(rightPocket);

    const foldBandA = new THREE.Mesh(new THREE.TorusGeometry(0.245, 0.012, 5, 10), clothDetailMat);
    const foldBandB = foldBandA.clone();
    foldBandA.position.set(0, 1.26, 0.06);
    foldBandB.position.set(0, 1.35, 0.06);
    foldBandA.rotation.x = Math.PI * 0.5;
    foldBandB.rotation.x = Math.PI * 0.5;
    this.bodyRoot.add(foldBandA);
    this.bodyRoot.add(foldBandB);

    const hood = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.08, 6, 12), hoodieTrimMat);
    hood.position.set(0, 1.9, -0.11);
    hood.rotation.x = Math.PI * 0.5;
    hood.castShadow = true;
    this.bodyRoot.add(hood);

    const drawstringGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.33, 6);
    const leftDrawstring = new THREE.Mesh(drawstringGeo, clothDetailMat);
    const rightDrawstring = new THREE.Mesh(drawstringGeo, clothDetailMat);
    leftDrawstring.position.set(0.06, 1.72, 0.2);
    rightDrawstring.position.set(-0.06, 1.72, 0.2);
    leftDrawstring.rotation.z = 0.1;
    rightDrawstring.rotation.z = -0.1;
    this.bodyRoot.add(leftDrawstring);
    this.bodyRoot.add(rightDrawstring);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.13, 8), skinMat);
    neck.position.set(0, 1.92, 0);
    neck.castShadow = true;
    this.bodyRoot.add(neck);

    this.headPivot = new THREE.Group();
    this.headPivot.position.set(0, 2.2, 0.02);
    this.bodyRoot.add(this.headPivot);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 8), skinMat);
    head.scale.set(0.96, 1.08, 0.92);
    head.castShadow = true;
    this.headPivot.add(head);

    const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.14, 0.24), skinMat);
    jaw.position.set(0, -0.12, 0.04);
    jaw.castShadow = true;
    this.headPivot.add(jaw);

    const chin = new THREE.Mesh(new THREE.SphereGeometry(0.075, 7, 6), skinMat);
    chin.position.set(0, -0.18, 0.1);
    chin.scale.set(1, 0.7, 1);
    this.headPivot.add(chin);

    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.07, 6), skinMat);
    nose.position.set(0, -0.01, 0.24);
    nose.rotation.x = Math.PI * 0.5;
    this.headPivot.add(nose);

    const earGeo = new THREE.SphereGeometry(0.04, 7, 6);
    const leftEar = new THREE.Mesh(earGeo, skinMat);
    const rightEar = new THREE.Mesh(earGeo, skinMat);
    leftEar.position.set(0.24, 0.02, 0.01);
    rightEar.position.set(-0.24, 0.02, 0.01);
    leftEar.scale.set(0.8, 1, 0.55);
    rightEar.scale.copy(leftEar.scale);
    this.headPivot.add(leftEar);
    this.headPivot.add(rightEar);

    // Black baseball cap
    const capBack = new THREE.Mesh(new THREE.SphereGeometry(0.268, 10, 7, 0, Math.PI * 2, 0, Math.PI * 0.58), capMat);
    capBack.position.set(0, 0.08, -0.02);
    capBack.castShadow = true;
    this.headPivot.add(capBack);

    const capTopFlat = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.268, 0.04, 10), capMat);
    capTopFlat.position.set(0, 0.22, -0.01);
    this.headPivot.add(capTopFlat);

    const capVisor = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.038, 0.28), capMat);
    capVisor.position.set(0, -0.04, 0.24);
    capVisor.rotation.x = 0.12;
    capVisor.castShadow = true;
    this.headPivot.add(capVisor);

    const capVisorTip = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.024, 0.1), capMat);
    capVisorTip.position.set(0, -0.055, 0.38);
    capVisorTip.rotation.x = 0.22;
    this.headPivot.add(capVisorTip);

    // Short hair sides visible under cap
    const hairSideR = new THREE.Mesh(new THREE.CapsuleGeometry(0.042, 0.1, 3, 6), hairMat);
    const hairSideL = hairSideR.clone();
    hairSideR.position.set(0.22, -0.1, -0.01);
    hairSideL.position.set(-0.22, -0.1, -0.01);
    this.headPivot.add(hairSideR);
    this.headPivot.add(hairSideL);

    const hairBack = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.08, 3, 8), hairMat);
    hairBack.position.set(0, -0.06, -0.2);
    hairBack.scale.set(1.3, 0.55, 0.75);
    this.headPivot.add(hairBack);

    const leftEyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), eyeWhiteMat);
    const rightEyeWhite = leftEyeWhite.clone();
    leftEyeWhite.position.set(0.09, 0.03, 0.22);
    rightEyeWhite.position.set(-0.09, 0.03, 0.22);
    leftEyeWhite.scale.set(1, 0.75, 0.45);
    rightEyeWhite.scale.copy(leftEyeWhite.scale);
    this.headPivot.add(leftEyeWhite);
    this.headPivot.add(rightEyeWhite);

    const leftPupil = new THREE.Mesh(new THREE.SphereGeometry(0.016, 7, 6), faceDarkMat);
    const rightPupil = leftPupil.clone();
    leftPupil.position.set(0.09, 0.02, 0.25);
    rightPupil.position.set(-0.09, 0.02, 0.25);
    this.headPivot.add(leftPupil);
    this.headPivot.add(rightPupil);
    this.leftPupil = leftPupil;
    this.rightPupil = rightPupil;

    const browGeo = new THREE.BoxGeometry(0.09, 0.02, 0.015);
    this.leftBrow = new THREE.Mesh(browGeo, faceDarkMat);
    this.rightBrow = new THREE.Mesh(browGeo, faceDarkMat);
    this.leftBrow.position.set(0.09, 0.12, 0.24);
    this.rightBrow.position.set(-0.09, 0.12, 0.24);
    this.leftBrow.rotation.z = 0.18;
    this.rightBrow.rotation.z = -0.18;
    this.headPivot.add(this.leftBrow);
    this.headPivot.add(this.rightBrow);

    this.mouth = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.022, 0.015), lipMat);
    this.mouth.position.set(0, -0.09, 0.24);
    this.headPivot.add(this.mouth);

    // Stubble / 5 o'clock shadow
    const stubbleArea = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.24), stubbleMat);
    stubbleArea.position.set(0, -0.095, 0.232);
    this.headPivot.add(stubbleArea);

    const mustacheZone = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.06), stubbleMat);
    mustacheZone.position.set(0, -0.03, 0.237);
    this.headPivot.add(mustacheZone);

    const sideburn = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.14), stubbleMat);
    const sideburnR = sideburn.clone();
    sideburn.position.set(0.23, -0.04, 0.12);
    sideburn.rotation.y = -1.2;
    sideburnR.position.set(-0.23, -0.04, 0.12);
    sideburnR.rotation.y = 1.2;
    this.headPivot.add(sideburn);
    this.headPivot.add(sideburnR);

    const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.53, 0.24, 0.36), pantsMat);
    pelvis.position.set(0, 0.88, 0.01);
    pelvis.castShadow = true;
    this.bodyRoot.add(pelvis);

    const shoulderGeo = new THREE.SphereGeometry(0.125, 8, 6);
    const leftShoulder = new THREE.Mesh(shoulderGeo, hoodieMat);
    const rightShoulder = new THREE.Mesh(shoulderGeo, hoodieMat);
    leftShoulder.position.set(0.34, 1.72, 0.01);
    rightShoulder.position.set(-0.34, 1.72, 0.01);
    leftShoulder.scale.set(1.15, 0.9, 1.15);
    rightShoulder.scale.copy(leftShoulder.scale);
    leftShoulder.castShadow = true;
    rightShoulder.castShadow = true;
    this.bodyRoot.add(leftShoulder);
    this.bodyRoot.add(rightShoulder);

    this.leftUpperArmPivot = new THREE.Group();
    this.rightUpperArmPivot = new THREE.Group();
    this.leftUpperArmPivot.position.set(0.38, 1.64, 0);
    this.rightUpperArmPivot.position.set(-0.38, 1.64, 0);
    this.bodyRoot.add(this.leftUpperArmPivot);
    this.bodyRoot.add(this.rightUpperArmPivot);

    const leftUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.085, 0.42, 7), hoodieMat);
    const rightUpperArm = leftUpperArm.clone();
    leftUpperArm.position.set(0, -0.22, 0);
    rightUpperArm.position.set(0, -0.22, 0);
    leftUpperArm.castShadow = true;
    rightUpperArm.castShadow = true;
    this.leftUpperArmPivot.add(leftUpperArm);
    this.rightUpperArmPivot.add(rightUpperArm);

    const leftElbow = new THREE.Mesh(new THREE.SphereGeometry(0.056, 7, 6), hoodieTrimMat);
    const rightElbow = leftElbow.clone();
    leftElbow.position.set(0, -0.42, 0.01);
    rightElbow.position.set(0, -0.42, 0.01);
    this.leftUpperArmPivot.add(leftElbow);
    this.rightUpperArmPivot.add(rightElbow);

    const leftSleeveFold = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.01, 5, 10), clothDetailMat);
    const rightSleeveFold = leftSleeveFold.clone();
    leftSleeveFold.position.set(0, -0.02, 0);
    rightSleeveFold.position.set(0, -0.02, 0);
    leftSleeveFold.rotation.x = Math.PI * 0.5;
    rightSleeveFold.rotation.x = Math.PI * 0.5;
    this.leftUpperArmPivot.add(leftSleeveFold);
    this.rightUpperArmPivot.add(rightSleeveFold);

    this.leftLowerArmPivot = new THREE.Group();
    this.rightLowerArmPivot = new THREE.Group();
    this.leftLowerArmPivot.position.set(0, -0.44, 0);
    this.rightLowerArmPivot.position.set(0, -0.44, 0);
    this.leftUpperArmPivot.add(this.leftLowerArmPivot);
    this.rightUpperArmPivot.add(this.rightLowerArmPivot);

    const leftLowerArm = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.065, 0.34, 7), hoodieTrimMat);
    const rightLowerArm = leftLowerArm.clone();
    leftLowerArm.position.set(0, -0.18, 0);
    rightLowerArm.position.set(0, -0.18, 0);
    leftLowerArm.castShadow = true;
    rightLowerArm.castShadow = true;
    this.leftLowerArmPivot.add(leftLowerArm);
    this.rightLowerArmPivot.add(rightLowerArm);

    const createHandRig = (sideSign) => {
      const handRoot = new THREE.Group();

      const palm = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.08, 0.11), skinMat);
      palm.position.set(0, -0.34, 0.04);
      palm.castShadow = true;
      handRoot.add(palm);

      const wrist = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.06, 6), skinMat);
      wrist.position.set(0, -0.29, 0.02);
      wrist.castShadow = true;
      handRoot.add(wrist);

      const thumbPivot = new THREE.Group();
      thumbPivot.position.set(0.045 * sideSign, -0.34, 0.06);
      thumbPivot.rotation.z = -0.55 * sideSign;
      thumbPivot.rotation.x = -0.3;
      const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.015, 0.06, 3, 6), skinMat);
      thumb.position.set(0, -0.03, 0.01);
      thumb.castShadow = true;
      thumbPivot.add(thumb);
      handRoot.add(thumbPivot);

      const fingers = [];
      const xOffsets = [0.036, 0.012, -0.012, -0.036];
      for (let i = 0; i < xOffsets.length; i += 1) {
        const fingerPivot = new THREE.Group();
        fingerPivot.position.set(xOffsets[i], -0.315, 0.095);
        const finger = new THREE.Mesh(new THREE.CapsuleGeometry(0.012, 0.075, 3, 6), skinMat);
        finger.position.set(0, -0.04, 0);
        finger.castShadow = true;
        fingerPivot.add(finger);
        handRoot.add(fingerPivot);
        fingers.push(fingerPivot);
      }

      return { handRoot, fingers, thumbPivot };
    };

    const leftHandRig = createHandRig(1);
    const rightHandRig = createHandRig(-1);
    this.leftLowerArmPivot.add(leftHandRig.handRoot);
    this.rightLowerArmPivot.add(rightHandRig.handRoot);
    this.leftFingerPivots = leftHandRig.fingers;
    this.rightFingerPivots = rightHandRig.fingers;
    this.leftThumbPivot = leftHandRig.thumbPivot;
    this.rightThumbPivot = rightHandRig.thumbPivot;

    this.leftUpperLegPivot = new THREE.Group();
    this.rightUpperLegPivot = new THREE.Group();
    this.leftUpperLegPivot.position.set(0.15, 0.86, 0);
    this.rightUpperLegPivot.position.set(-0.15, 0.86, 0);
    this.bodyRoot.add(this.leftUpperLegPivot);
    this.bodyRoot.add(this.rightUpperLegPivot);

    const leftUpperLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.11, 0.52, 7), pantsMat);
    const rightUpperLeg = leftUpperLeg.clone();
    leftUpperLeg.position.set(0, -0.3, 0);
    rightUpperLeg.position.set(0, -0.3, 0);
    leftUpperLeg.castShadow = true;
    rightUpperLeg.castShadow = true;
    this.leftUpperLegPivot.add(leftUpperLeg);
    this.rightUpperLegPivot.add(rightUpperLeg);

    this.leftKnee = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), pantsMat);
    this.rightKnee = this.leftKnee.clone();
    this.leftKnee.position.set(0, -0.58, 0.04);
    this.rightKnee.position.set(0, -0.58, 0.04);
    this.leftKnee.castShadow = true;
    this.rightKnee.castShadow = true;
    this.leftUpperLegPivot.add(this.leftKnee);
    this.rightUpperLegPivot.add(this.rightKnee);

    this.leftLowerLegPivot = new THREE.Group();
    this.rightLowerLegPivot = new THREE.Group();
    this.leftLowerLegPivot.position.set(0, -0.62, 0);
    this.rightLowerLegPivot.position.set(0, -0.62, 0);
    this.leftUpperLegPivot.add(this.leftLowerLegPivot);
    this.rightUpperLegPivot.add(this.rightLowerLegPivot);

    const leftLowerLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.085, 0.46, 7), pantsMat);
    const rightLowerLeg = leftLowerLeg.clone();
    leftLowerLeg.position.set(0, -0.25, 0);
    rightLowerLeg.position.set(0, -0.25, 0);
    leftLowerLeg.castShadow = true;
    rightLowerLeg.castShadow = true;
    this.leftLowerLegPivot.add(leftLowerLeg);
    this.rightLowerLegPivot.add(rightLowerLeg);

    const ankleLeft = new THREE.Mesh(new THREE.SphereGeometry(0.062, 7, 6), pantsMat);
    const ankleRight = ankleLeft.clone();
    ankleLeft.position.set(0, -0.49, 0.01);
    ankleRight.position.set(0, -0.49, 0.01);
    this.leftLowerLegPivot.add(ankleLeft);
    this.rightLowerLegPivot.add(ankleRight);

    const shoeGeo = new THREE.BoxGeometry(0.22, 0.12, 0.36);
    this.leftShoePivot = new THREE.Group();
    this.rightShoePivot = new THREE.Group();
    this.leftShoePivot.position.set(0, -0.5, 0.03);
    this.rightShoePivot.position.set(0, -0.5, 0.03);
    this.leftLowerLegPivot.add(this.leftShoePivot);
    this.rightLowerLegPivot.add(this.rightShoePivot);

    const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    const rightShoe = leftShoe.clone();
    leftShoe.position.set(0, -0.02, 0.1);
    rightShoe.position.set(0, -0.02, 0.1);
    leftShoe.castShadow = true;
    rightShoe.castShadow = true;
    this.leftShoePivot.add(leftShoe);
    this.rightShoePivot.add(rightShoe);

    const leftSole = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.37), soleMat);
    const rightSole = leftSole.clone();
    leftSole.position.set(0, -0.09, 0.1);
    rightSole.position.set(0, -0.09, 0.1);
    this.leftShoePivot.add(leftSole);
    this.rightShoePivot.add(rightSole);

    const leftToe = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), shoeMat);
    const rightToe = leftToe.clone();
    leftToe.position.set(0, -0.03, 0.25);
    rightToe.position.set(0, -0.03, 0.25);
    leftToe.scale.set(1.05, 0.62, 1.22);
    rightToe.scale.copy(leftToe.scale);
    leftToe.castShadow = true;
    rightToe.castShadow = true;
    this.leftShoePivot.add(leftToe);
    this.rightShoePivot.add(rightToe);

    const laceGeo = new THREE.BoxGeometry(0.1, 0.008, 0.02);
    for (let i = 0; i < 3; i += 1) {
      const laceL = new THREE.Mesh(laceGeo, soleMat);
      const laceR = new THREE.Mesh(laceGeo, soleMat);
      const z = 0.04 + i * 0.07;
      laceL.position.set(0, 0.03, z);
      laceR.position.set(0, 0.03, z);
      this.leftShoePivot.add(laceL);
      this.rightShoePivot.add(laceR);
    }

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
    const groundOffset = CONFIG.player.radius + 0.2;
    this.mesh.position.set(this.body.position.x, this.body.position.y - groundOffset, this.body.position.z);

    const lookDir = new THREE.Vector3(this.body.velocity.x, 0, this.body.velocity.z);
    if (lookDir.lengthSq() > 0.001) {
      this.mesh.rotation.y = Math.atan2(lookDir.x, lookDir.z);
    }

    this.idleTime += deltaSeconds;
    const walking = planarSpeed > 0.6;
    if (walking) {
      const cycleSpeed = Math.min(13, 4.5 + planarSpeed * 0.95);
      this.walkCycle += deltaSeconds * cycleSpeed;
    }

    const amp = walking ? 0.52 : 0.035;
    const phase = this.walkCycle;

    const torsoBob = walking ? Math.abs(Math.sin(phase * 2)) * 0.032 : Math.sin(this.idleTime * 1.6) * 0.012;
    this.bodyRoot.position.y = torsoBob;
    this.torso.scale.y = 1 + Math.sin(this.idleTime * 2.1) * 0.012;
    this.bodyRoot.rotation.z = Math.sin(phase) * (walking ? 0.03 : 0.01);

    if (this.headPivot) {
      this.headPivot.rotation.x = Math.sin(this.idleTime * 1.8) * 0.02 + (walking ? Math.sin(phase * 2) * 0.02 : 0);
      this.headPivot.rotation.y = Math.sin(this.idleTime * 1.15) * 0.04;
    }

    const alertness = Math.min(1, planarSpeed / CONFIG.player.sprintSpeed);
    if (this.leftBrow && this.rightBrow && this.mouth) {
      this.leftBrow.position.y = 0.12 + alertness * 0.012;
      this.rightBrow.position.y = 0.12 + alertness * 0.012;
      this.leftBrow.rotation.z = 0.18 + alertness * 0.06;
      this.rightBrow.rotation.z = -0.18 - alertness * 0.06;
      this.mouth.scale.x = 1 + alertness * 0.22;
      this.mouth.position.y = -0.09 - alertness * 0.006;
    }

    if (this.leftPupil && this.rightPupil) {
      const eyeDrift = Math.sin(this.idleTime * 0.8) * 0.003;
      this.leftPupil.position.x = 0.09 + eyeDrift;
      this.rightPupil.position.x = -0.09 + eyeDrift;
    }

    const leftLegSwing = Math.sin(phase) * amp;
    const rightLegSwing = Math.sin(phase + Math.PI) * amp;
    const leftArmSwing = Math.sin(phase + Math.PI) * amp * 0.66;
    const rightArmSwing = Math.sin(phase) * amp * 0.66;

    this.leftUpperArmPivot.rotation.x = leftArmSwing;
    this.rightUpperArmPivot.rotation.x = rightArmSwing;
    this.leftLowerArmPivot.rotation.x = Math.max(0, Math.sin(phase + Math.PI)) * 0.28;
    this.rightLowerArmPivot.rotation.x = Math.max(0, Math.sin(phase)) * 0.28;

    this.leftUpperLegPivot.rotation.x = leftLegSwing;
    this.rightUpperLegPivot.rotation.x = rightLegSwing;

    const kneeAmp = walking ? 0.62 : 0.12;
    this.leftLowerLegPivot.rotation.x = Math.max(0, Math.sin(phase)) * kneeAmp;
    this.rightLowerLegPivot.rotation.x = Math.max(0, Math.sin(phase + Math.PI)) * kneeAmp;

    this.leftShoePivot.rotation.x = Math.max(0, -Math.sin(phase)) * 0.28;
    this.rightShoePivot.rotation.x = Math.max(0, -Math.sin(phase + Math.PI)) * 0.28;

    this.leftUpperArmPivot.rotation.z = 0.08;
    this.rightUpperArmPivot.rotation.z = -0.08;

    const handCurl = walking ? 0.35 + Math.abs(Math.sin(phase)) * 0.25 : 0.18;
    if (this.leftFingerPivots && this.rightFingerPivots) {
      for (let i = 0; i < this.leftFingerPivots.length; i += 1) {
        this.leftFingerPivots[i].rotation.x = -handCurl;
      }
      for (let i = 0; i < this.rightFingerPivots.length; i += 1) {
        this.rightFingerPivots[i].rotation.x = -handCurl;
      }
    }

    if (this.leftThumbPivot && this.rightThumbPivot) {
      this.leftThumbPivot.rotation.y = Math.sin(phase + Math.PI) * 0.12;
      this.rightThumbPivot.rotation.y = Math.sin(phase) * 0.12;
    }
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

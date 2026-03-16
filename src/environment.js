import * as THREE from "https://unpkg.com/three@0.163.0/build/three.module.js";
import * as CANNON from "https://unpkg.com/cannon-es@0.20.0/dist/cannon-es.js";
import { CONFIG } from "./config.js";

function addStaticBox(world, scene, size, position, color = 0x64748b) {
  const [sx, sy, sz] = size;

  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(sx, sy, sz),
    new THREE.MeshStandardMaterial({ color })
  );
  mesh.position.set(position.x, position.y, position.z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);

  const body = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(new CANNON.Vec3(sx * 0.5, sy * 0.5, sz * 0.5)),
    position: new CANNON.Vec3(position.x, position.y, position.z)
  });
  world.addBody(body);

  return { mesh, body };
}

function addRoadMarking(scene, width, length, x, z, color = 0xf8fafc) {
  const marking = new THREE.Mesh(
    new THREE.PlaneGeometry(width, length),
    new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0 })
  );
  marking.rotation.x = -Math.PI * 0.5;
  marking.position.set(x, 0.03, z);
  scene.add(marking);
}

function addPalmTree(world, scene, x, z) {
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.76, side: THREE.DoubleSide });

  const trunkSegs = 6;
  for (let i = 0; i < trunkSegs; i += 1) {
    const seg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1 - i * 0.008, 0.13 - i * 0.007, 1.1, 7),
      trunkMat
    );
    seg.position.set(
      x + Math.sin(i * 0.28) * 0.07,
      0.55 + i * 1.0,
      z + Math.cos(i * 0.28) * 0.07
    );
    seg.rotation.z = Math.sin(i * 0.28) * 0.06;
    seg.castShadow = true;
    scene.add(seg);
  }

  const topY = 6.3;
  const numLeaves = 8;
  for (let i = 0; i < numLeaves; i += 1) {
    const angle = (i / numLeaves) * Math.PI * 2;
    const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 2.4), leafMat);
    leaf.position.set(
      x + Math.cos(angle) * 0.55,
      topY + 0.1,
      z + Math.sin(angle) * 0.55
    );
    leaf.rotation.y = angle;
    leaf.rotation.x = 0.52;
    leaf.castShadow = true;
    scene.add(leaf);
  }

  const treeBody = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Cylinder(0.11, 0.13, 6.0, 6),
    position: new CANNON.Vec3(x, 3.0, z)
  });
  world.addBody(treeBody);
}

function addLamp(scene, x, z) {
  const poleMat = new THREE.MeshStandardMaterial({ color: 0xb0bec5, roughness: 0.5, metalness: 0.28 });
  const lightMat = new THREE.MeshStandardMaterial({ color: 0xfffaed, roughness: 0.18, emissive: 0xfde68a, emissiveIntensity: 0.62 });

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.08, 6.5, 8), poleMat);
  pole.position.set(x, 3.25, z);
  pole.castShadow = true;
  scene.add(pole);

  const armDir = x > 0 ? -1 : 1;
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.038, 1.8, 6), poleMat);
  arm.position.set(x + armDir * 0.9, 6.44, z);
  arm.rotation.z = armDir * 1.48;
  arm.castShadow = true;
  scene.add(arm);

  const lampHead = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.14, 0.3), lightMat);
  lampHead.position.set(x + armDir * 1.7, 5.94, z);
  lampHead.castShadow = true;
  scene.add(lampHead);

  const lampLens = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.05, 0.26), lightMat);
  lampLens.position.set(x + armDir * 1.7, 5.85, z);
  scene.add(lampLens);
}

export function createEnvironment(scene, world) {
  const worldHalf = CONFIG.world.size * 0.5;
  const obstacles = [];

  scene.background = new THREE.Color(0x86c9eb);
  scene.fog = new THREE.Fog(0x86c9eb, 85, 340);

  const hemi = new THREE.HemisphereLight(0xdbeafe, 0x4b5563, 1.4);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xfff7ed, 2.4);
  sun.position.set(55, 80, 30);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -120;
  sun.shadow.camera.right = 120;
  sun.shadow.camera.top = 120;
  sun.shadow.camera.bottom = -120;
  scene.add(sun);

  const groundMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(CONFIG.world.size, CONFIG.world.size, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.96 })
  );
  groundMesh.rotation.x = -Math.PI * 0.5;
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);

  const groundBody = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Plane(),
    material: new CANNON.Material("ground")
  });
  groundBody.quaternion.setFromEuler(-Math.PI * 0.5, 0, 0);
  world.addBody(groundBody);

  const roadW = 30;
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x2d3142, roughness: 0.94 });
  const roadMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(CONFIG.world.size * 0.92, roadW),
    roadMat
  );
  roadMesh.rotation.x = -Math.PI * 0.5;
  roadMesh.position.y = 0.01;
  scene.add(roadMesh);

  const roadMesh2 = new THREE.Mesh(
    new THREE.PlaneGeometry(roadW, CONFIG.world.size * 0.92),
    roadMat
  );
  roadMesh2.rotation.x = -Math.PI * 0.5;
  roadMesh2.position.y = 0.011;
  scene.add(roadMesh2);

  const curbMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.72 });
  const sidewalkMaterial = new THREE.MeshStandardMaterial({ color: 0xa8b4be, roughness: 0.88 });
  const swHalf = roadW * 0.5 + 0.4;

  const sidewalkA = new THREE.Mesh(new THREE.BoxGeometry(CONFIG.world.size * 0.9, 0.22, 5.5), sidewalkMaterial);
  sidewalkA.position.set(0, 0.11, swHalf + 2.75);
  sidewalkA.receiveShadow = true;
  scene.add(sidewalkA);
  const sidewalkB = sidewalkA.clone();
  sidewalkB.position.z = -(swHalf + 2.75);
  scene.add(sidewalkB);
  const sidewalkC = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.22, CONFIG.world.size * 0.9), sidewalkMaterial);
  sidewalkC.position.set(swHalf + 2.75, 0.11, 0);
  sidewalkC.receiveShadow = true;
  scene.add(sidewalkC);
  const sidewalkD = sidewalkC.clone();
  sidewalkD.position.x = -(swHalf + 2.75);
  scene.add(sidewalkD);

  // Curbs
  const curbA = new THREE.Mesh(new THREE.BoxGeometry(CONFIG.world.size * 0.9, 0.14, 0.32), curbMat);
  curbA.position.set(0, 0.07, swHalf + 0.16); scene.add(curbA);
  const curbB = curbA.clone(); curbB.position.z = -(swHalf + 0.16); scene.add(curbB);
  const curbC = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.14, CONFIG.world.size * 0.9), curbMat);
  curbC.position.set(swHalf + 0.16, 0.07, 0); scene.add(curbC);
  const curbD = curbC.clone(); curbD.position.x = -(swHalf + 0.16); scene.add(curbD);

  // Yellow center divider lines
  addRoadMarking(scene, CONFIG.world.size * 0.9, 0.28, 0, 0, 0xfbbf24);
  addRoadMarking(scene, 0.28, CONFIG.world.size * 0.9, 0, 0, 0xfbbf24);

  // White lane dash stripes at ±8 from center
  const laneGap = 10;
  const laneOffsets = [-8, 8];
  for (const laneOff of laneOffsets) {
    for (let i = -90; i <= 90; i += laneGap) {
      addRoadMarking(scene, 5, 0.22, i, laneOff);
      addRoadMarking(scene, 0.22, 5, laneOff, i);
    }
  }

  for (let i = -4; i <= 4; i += 1) {
    const coord = i * 22;
    addLamp(scene, 17, coord);
    addLamp(scene, -17, coord);
  }

  const buildingPalette = [0x4b5e72, 0x3a4a5e, 0x2c3e55, 0x5e6b7a, 0x1e3652];
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x7ecbf7, roughness: 0.14, metalness: 0.6, emissive: 0x0d3b52, emissiveIntensity: 0.1 });
  const windowLitMat = new THREE.MeshStandardMaterial({ color: 0xfef9c3, roughness: 0.08, emissive: 0xfde68a, emissiveIntensity: 0.42 });
  const windowDarkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.08, metalness: 0.7 });

  for (let i = -5; i <= 5; i += 1) {
    const heightSeed = (Math.abs(i * 3 + 2) % 5);
    const buildingHeight = 12 + heightSeed * 5;
    const buildingW = 11 + (i % 2 === 0 ? 3 : 0);
    const buildingD = 9 + (Math.abs(i) % 2) * 2;
    const x = i * 18;
    const zSide = i % 2 === 0 ? 38 : -38;
    const bColor = buildingPalette[Math.abs(i) % buildingPalette.length];

    obstacles.push(
      addStaticBox(world, scene, [buildingW, buildingHeight, buildingD], { x, y: buildingHeight * 0.5, z: zSide }, bColor)
    );

    // Glass curtain wall on road-facing side
    const faceZ = zSide + (zSide > 0 ? -(buildingD * 0.5 + 0.01) : (buildingD * 0.5 + 0.01));
    const facade = new THREE.Mesh(new THREE.PlaneGeometry(buildingW * 0.9, buildingHeight * 0.94), glassMat);
    facade.position.set(x, buildingHeight * 0.5, faceZ);
    if (zSide < 0) facade.rotation.y = Math.PI;
    scene.add(facade);

    // Window grid
    const wCols = 4;
    const wRows = Math.max(3, Math.floor(buildingHeight / 2.2));
    const cellW = (buildingW * 0.9) / wCols;
    const cellH = (buildingHeight * 0.9) / wRows;
    for (let row = 0; row < wRows; row += 1) {
      for (let col = 0; col < wCols; col += 1) {
        const lit = Math.random() > 0.3;
        const wMesh = new THREE.Mesh(new THREE.PlaneGeometry(cellW * 0.6, cellH * 0.62), lit ? windowLitMat : windowDarkMat);
        const wx = x - (buildingW * 0.9) * 0.5 + (col + 0.5) * cellW;
        const wy = buildingHeight * 0.05 + (row + 0.5) * cellH;
        const wz = faceZ + (zSide > 0 ? -0.04 : 0.04);
        wMesh.position.set(wx, wy, wz);
        if (zSide < 0) wMesh.rotation.y = Math.PI;
        scene.add(wMesh);
      }
    }
  }

  const barrierThickness = 2;
  const barrierHeight = 4;
  obstacles.push(
    addStaticBox(world, scene, [CONFIG.world.size, barrierHeight, barrierThickness], { x: 0, y: barrierHeight * 0.5, z: -worldHalf }, 0x1f2937),
    addStaticBox(world, scene, [CONFIG.world.size, barrierHeight, barrierThickness], { x: 0, y: barrierHeight * 0.5, z: worldHalf }, 0x1f2937),
    addStaticBox(world, scene, [barrierThickness, barrierHeight, CONFIG.world.size], { x: -worldHalf, y: barrierHeight * 0.5, z: 0 }, 0x1f2937),
    addStaticBox(world, scene, [barrierThickness, barrierHeight, CONFIG.world.size], { x: worldHalf, y: barrierHeight * 0.5, z: 0 }, 0x1f2937)
  );

  const obstacleData = [
    { x: -20, y: 1, z: -10, sx: 4, sy: 2, sz: 4, color: 0xf97316 },
    { x: -8, y: 1.5, z: 18, sx: 3, sy: 3, sz: 3, color: 0xf97316 },
    { x: 12, y: 1, z: 8, sx: 5, sy: 2, sz: 4, color: 0xea580c },
    { x: 30, y: 1.2, z: -6, sx: 4, sy: 2.4, sz: 5, color: 0xea580c },
    { x: -32, y: 1.2, z: 10, sx: 5, sy: 2.4, sz: 4, color: 0xea580c }
  ];

  for (const item of obstacleData) {
    obstacles.push(addStaticBox(world, scene, [item.sx, item.sy, item.sz], item, item.color));
  }

  const palmCoords = [
    [-44, -44], [-36, 44], [40, -42], [46, 36], [-58, 16], [60, -18],
    [20, 20], [-20, -20], [28, -46], [-28, 46], [52, 20], [-52, -20]
  ];
  for (const [x, z] of palmCoords) {
    addPalmTree(world, scene, x, z);
  }

  return { obstacles };
}

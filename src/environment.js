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

function addTree(world, scene, x, z) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.35, 2.2, 10),
    new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.95 })
  );
  trunk.position.set(x, 1.1, z);
  trunk.castShadow = true;
  scene.add(trunk);

  const crown = new THREE.Mesh(
    new THREE.SphereGeometry(1.25, 14, 12),
    new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.85 })
  );
  crown.position.set(x, 2.9, z);
  crown.castShadow = true;
  scene.add(crown);

  const treeBody = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Cylinder(0.35, 0.35, 2.2, 10),
    position: new CANNON.Vec3(x, 1.1, z)
  });
  world.addBody(treeBody);
}

function addLamp(scene, x, z) {
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.11, 4.8, 10),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.6 })
  );
  pole.position.set(x, 2.4, z);
  pole.castShadow = true;
  scene.add(pole);

  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.18, 0.5),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, emissive: 0x111111 })
  );
  head.position.set(x, 4.85, z);
  head.castShadow = true;
  scene.add(head);
}

export function createEnvironment(scene, world) {
  const worldHalf = CONFIG.world.size * 0.5;
  const obstacles = [];

  scene.background = new THREE.Color(0xbfdfff);
  scene.fog = new THREE.Fog(0xbfdfff, 70, 300);

  const hemi = new THREE.HemisphereLight(0xeaf4ff, 0x4b5563, 1.35);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xfff7ed, 2.3);
  sun.position.set(40, 60, 20);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -120;
  sun.shadow.camera.right = 120;
  sun.shadow.camera.top = 120;
  sun.shadow.camera.bottom = -120;
  scene.add(sun);

  const groundMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(CONFIG.world.size, CONFIG.world.size, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0x86efac, roughness: 0.95 })
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

  const roadMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(CONFIG.world.size * 0.9, 16),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.92 })
  );
  roadMesh.rotation.x = -Math.PI * 0.5;
  roadMesh.position.y = 0.01;
  scene.add(roadMesh);

  const roadMesh2 = new THREE.Mesh(
    new THREE.PlaneGeometry(16, CONFIG.world.size * 0.9),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.92 })
  );
  roadMesh2.rotation.x = -Math.PI * 0.5;
  roadMesh2.position.y = 0.011;
  scene.add(roadMesh2);

  const sidewalkMaterial = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.95 });
  const sidewalkA = new THREE.Mesh(new THREE.BoxGeometry(CONFIG.world.size * 0.9, 0.28, 4), sidewalkMaterial);
  sidewalkA.position.set(0, 0.14, 10.7);
  sidewalkA.receiveShadow = true;
  scene.add(sidewalkA);
  const sidewalkB = sidewalkA.clone();
  sidewalkB.position.z = -10.7;
  scene.add(sidewalkB);
  const sidewalkC = new THREE.Mesh(new THREE.BoxGeometry(4, 0.28, CONFIG.world.size * 0.9), sidewalkMaterial);
  sidewalkC.position.set(10.7, 0.14, 0);
  sidewalkC.receiveShadow = true;
  scene.add(sidewalkC);
  const sidewalkD = sidewalkC.clone();
  sidewalkD.position.x = -10.7;
  scene.add(sidewalkD);

  const laneGap = 10;
  for (let i = -90; i <= 90; i += laneGap) {
    addRoadMarking(scene, 0.5, 5, 0, i);
    addRoadMarking(scene, 5, 0.5, i, 0);
  }

  for (let i = -4; i <= 4; i += 1) {
    const coord = i * 22;
    addLamp(scene, 8.5, coord);
    addLamp(scene, -8.5, coord);
  }

  for (let i = -5; i <= 5; i += 1) {
    const buildingHeight = 5 + ((i + 7) % 5) * 2;
    const x = i * 14;
    const z = i % 2 === 0 ? 30 : -30;
    obstacles.push(
      addStaticBox(world, scene, [10, buildingHeight, 10], { x, y: buildingHeight * 0.5, z }, i % 2 === 0 ? 0x94a3b8 : 0x64748b)
    );

    const windowRows = Math.floor(buildingHeight);
    for (let row = 0; row < windowRows; row += 1) {
      const y = 1.1 + row;
      const windowMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.2, 0.55),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, emissive: 0xfacc15, emissiveIntensity: 0.15 })
      );
      windowMesh.position.set(x + 5.01, y, z);
      scene.add(windowMesh);
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

  const treeCoords = [
    [-42, -42],
    [-35, 42],
    [38, -40],
    [45, 36],
    [-56, 16],
    [58, -18]
  ];
  for (const [x, z] of treeCoords) {
    addTree(world, scene, x, z);
  }

  return { obstacles };
}

export const CONFIG = {
  world: {
    gravity: -9.82,
    size: 220,
    playerSpawn: { x: 0, y: 1.2, z: 8 },
    carSpawn: { x: 0, y: 1, z: 0 }
  },
  player: {
    walkSpeed: 6,
    sprintSpeed: 10,
    radius: 0.45,
    mass: 80,
    followDistance: 5.8,
    followHeight: 2.4
  },
  car: {
    mass: 1200,
    maxEngineForce: 5500,
    reverseForce: 3000,
    steeringTorque: 3.6,
    maxSteerAtLowSpeed: 1.0,
    maxSteerAtHighSpeed: 0.35,
    drag: 0.03,
    angularDrag: 0.25,
    followDistance: 8.8,
    followHeight: 3.2,
    exitMinSpeedKmh: 8,
    interactDistance: 3.8
  },
  camera: {
    sensitivity: 0.0023,
    minPitch: -1.05,
    maxPitch: 0.42,
    smoothness: 10
  }
};

# Open World 3D Car Game (Three.js + Cannon-es)

A browser-based 3D open-world game with:
- On-foot movement
- Enter/exit car mechanics
- Physics-based driving
- Third-person camera
- Obstacles and collisions
- PWA support (installable + offline-capable app shell)

## Controls

### On Foot
- `WASD`: Move
- `Shift`: Sprint
- `Mouse`: Camera look
- `E`: Enter vehicle

### In Car
- `W/S`: Accelerate / Reverse
- `A/D`: Steer
- `Space`: Handbrake
- `E`: Exit vehicle (only at low speed)
- `R`: Reset car if overturned

### Global
- `P`: Pause / Resume
- `Pause` button: Pause / Resume
- `Restart` button: Restart scene state

## Run Locally

Because this uses ES modules and service worker, run it with a local static server.

### Option 1 (Python)
```bash
python -m http.server 8080
```
Then open: `http://localhost:8080`

### Option 2 (Node)
```bash
npx serve .
```
Then open the shown URL.

## PWA
- Manifest: `manifest.json`
- Service Worker: `sw.js`
- App shell + essential assets are cached
- Install prompt availability depends on browser engagement heuristics

# Update Home Positions + Cursor/3D Guidance

## Part 1: Update Home Positions (the code change)

Update `src/config/servoConfig.ts` so the `home` value of each servo matches your physical robot's calibration. The arms will still look vertical because the new values are very close to the originals.

**Left arm (pins 0–5):**
| Pin | Name | Old Home | New Home |
|-----|------|----------|----------|
| 0 | Base | 90 | **85** |
| 1 | Shoulder | 80 | **88** |
| 2 | Elbow | 80 | **85** |
| 3 | Wrist | 90 | **90** |
| 4 | Gripper Rotate | 90 | **89** |
| 5 | Claw | 80 | **80** |

**Right arm (pins 10–15):**
| Pin | Name | Old Home | New Home |
|-----|------|----------|----------|
| 10 | Base | 90 | **93** |
| 11 | Shoulder | 80 | **90** |
| 12 | Elbow | 80 | **92** |
| 13 | Wrist | 90 | **100** |
| 14 | Gripper Rotate | 90 | **101** |
| 15 | Claw | 80 | **80** |

This is the only file that needs editing. Every "Home All" press, page load, and `getHomePositions()` call will use these new values automatically.

## Part 2: Opening the project in Cursor (when `npm` does not work)

Cursor is just a code editor — it does not run `npm` for you. "npm doesn't work" almost always means **Node.js is not installed** on your machine. Steps:

1. **Install Node.js (LTS)** from https://nodejs.org — this gives you both `node` and `npm`.
2. Restart Cursor (and your terminal) so it picks up the new PATH.
3. In Cursor: `File → Open Folder…` → select your cloned project folder (the one containing `package.json`).
4. Open the built-in terminal: `Ctrl + ` ` (backtick) or `View → Terminal`.
5. Run:
   ```
   npm install
   npm run dev
   ```
6. Open the URL it prints (usually `http://localhost:8080`).

If `npm` still says "command not found" after installing Node, check `node -v` and `npm -v` in the terminal — if those fail, the installer didn't add Node to your PATH (reinstall and tick "Add to PATH", or restart your computer).

Alternative if you don't want to install anything: use **bun** (also a JS runtime) — `bun install && bun run dev`. The project already has a `bun.lock`.

## Part 3: Files responsible for the 3D Particle Visualization

To replicate the 3D feature in another project, copy these:

**Required files:**
- `src/components/ParticleArm3D.tsx` — the entire 3D scene (particles, energy lines, joint orbs, ambient particles, hand particles, auto-rotate camera).

**Required dependencies** (install with exact versions — newer ones break on React 18):
```
npm install three@^0.160 @react-three/fiber@^8.18 @react-three/drei@^9.122
npm install -D @types/three
```

**How it's wired into the app** (see `src/pages/Index.tsx`):
```tsx
<ParticleArm3D
  positions={servo.positions}   // Record<pinNumber, angle 0–180>
  landmarks={handTracking.landmarks} // optional, can pass { left: null, right: null }
/>
```

`positions` is the only required input — an object mapping each pin number to its current angle. The component handles everything else (kinematics, particles, glow, camera).

**Reusable prompt for another Lovable project:**

> Add a 3D particle visualization of two 6-DOF robotic arms using `@react-three/fiber@^8.18`, `@react-three/drei@^9.122`, and `three@^0.160`. Create a component `ParticleArm3D` that takes a `positions: Record<number, number>` prop mapping servo pins (0–5 for the left arm, 10–15 for the right arm) to angles in degrees. For each arm, compute base → shoulder → elbow → wrist → claw key points using forward kinematics (base rotation around Y, shoulder/elbow tilts, wrist tilt, gripper rotation around the wrist axis using `Vector3.applyAxisAngle`, and a claw-open spread). Render each arm as ~120 additive-blended particles distributed along the segments, plus glowing energy lines (`CatmullRomCurve3`), pulsing joint orbs, ambient floating dust particles, a subtle floor grid, and `OrbitControls` that auto-rotate after 3 seconds idle. Color the left arm `#3b82f6` (blue) and the right arm `#f97316` (orange). Mount it inside a 400px-tall dark container.

## Files modified

- `src/config/servoConfig.ts` — update the 12 `home` values listed above.

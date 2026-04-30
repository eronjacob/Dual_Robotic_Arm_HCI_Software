# Three Fixes: Particle Color, Home Angles, Claude Rebuild Prompt

## 1. Fix gray-looking particle arms (restore blue + orange)

**Why they look gray now:** The 3D viewport stacks two full-screen overlay layers on top of the canvas inside `ParticleArm3D.tsx`:

- A radial gradient using `--primary` and `--accent`
- A vertical `linear-gradient(... background/0.12 → background/0.65)` darkening overlay

Combined with `additive blending` on the particles and a dark backdrop, the saturated blue/orange points get washed into a low-contrast neutral, reading as gray on screen.

**Fix in `src/components/ParticleArm3D.tsx`:**
- Lower the opacity of both overlay layers significantly (or remove the bottom darkening overlay entirely so the canvas isn't tinted).
- Keep `pointer-events-none` so orbit controls still work.
- Bump particle visibility:
  - Increase `pointsMaterial` `size` from `0.1` to `~0.14`
  - Increase `opacity` from `0.85` to `1.0`
  - Boost `EnergyLines` opacity from `0.5` to `~0.8`
- Use brighter, more saturated arm colors so additive blending still reads correctly:
  - Left arm: `hsl(210 100% 65%)`
  - Right arm: `hsl(25 100% 62%)`

Result: the left arm reads clearly blue, the right arm clearly orange, and the hero framing still feels cinematic.

## 2. Update home position angles (Arduino-accurate)

Update `src/config/servoConfig.ts` `home` values for all 12 servos:

Left arm:
- Pin 0 Base: 90 → **85**
- Pin 1 Shoulder: 80 → **88**
- Pin 2 Elbow: 80 → **85**
- Pin 3 Wrist: 90 → **90** (unchanged)
- Pin 4 Gripper Rotate: 90 → **89**
- Pin 5 Claw: 80 → **80** (unchanged)

Right arm:
- Pin 10 Base: 90 → **93**
- Pin 11 Shoulder: 80 → **90**
- Pin 12 Elbow: 80 → **92**
- Pin 13 Wrist: 90 → **100**
- Pin 14 Gripper Rotate: 90 → **101**
- Pin 15 Claw: 80 → **80** (unchanged)

Also update the `ArduinoGuide.tsx` example arrays (lines 59 and 62) so the generated Arduino sketch reflects the same home values, and update the `mem://features/servo-config` memory file with the new home numbers.

This affects: initial state, "Home All", "Home Arm", and per-slider home button — all read from `getHomePositions()`. Since the arms are still vertical at home, the visualization geometry is unaffected.

## 3. Detailed Claude rebuild prompt

Create a new file `CLAUDE_REBUILD_PROMPT.md` at the project root containing a clean, structured prompt that Claude (or any AI builder) can use to recreate this exact project. It will cover:

- Project identity and goal (dual 6-DOF robotic arm controller, Arduino UNO R4 WiFi + PCA9685, WebSocket on port 81)
- Tech stack (React 18 + Vite + Tailwind + TypeScript, three.js / @react-three/fiber, MediaPipe Hands)
- Design system (dark theme, JetBrains Mono, blue=left / orange=right, glassmorphism, grid+noise backdrop)
- Full servo configuration table with the new home values, min/max, pickUp angles, mirroring rule
- Sequential-movement safety constraint (5V 15A PSU — never move multiple servos simultaneously)
- Page hierarchy (command header → 3D hero viewport → dual control decks → hand gesture monitor → workflow tools → Arduino guide)
- Component-by-component spec: `ConnectionBar`, `MovementSettings`, `ParticleArm3D`, `ArmPanel`, `ServoSlider`, `HandGestureControl`, `SavedPoses`, `SequenceRecorder`, `ArduinoGuide`
- 3D visualization spec (particle arm geometry, joint orbs, energy lines, ambient particles, auto-orbit idle, hand landmark particles)
- Hand gesture mapping spec (which finger/landmark drives which joint, smoothing, deadzones, live monitor UI)
- Saved poses + sequence recorder behavior (record, playback, delay timing)
- Arduino sketch reference embedded as a code block
- File/folder structure list
- Strict formatting rules (no overlapping button labels, consistent spacing, accessible focus states, mobile: 3D above sliders with reduced height)
- Acceptance checklist

The file will be written as clean Markdown with fenced code blocks and headings — no smart quotes, no emoji, no special characters that could collide with button labels or break copy/paste.

## Files to change

- `src/components/ParticleArm3D.tsx` — overlay opacity, particle size/opacity, brighter arm colors
- `src/config/servoConfig.ts` — new home angles for all 12 servos
- `src/components/ArduinoGuide.tsx` — update sketch example home arrays
- `mem://features/servo-config` — record new home values
- `CLAUDE_REBUILD_PROMPT.md` — new file with the full rebuild prompt

## Result

- Live arms render in clear blue (left) and orange (right) instead of washed gray
- Sliders and "Home" buttons land on the exact Arduino-tuned home angles you provided
- You get a single, copy-paste-ready Claude prompt that captures everything we have built so the project can be recreated faithfully

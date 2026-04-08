

# Fix 3D Particle Arms to Stand Vertically at Home Position

## Problem
The current forward kinematics in `armSegmentPoints` produces arms that extend outward/diagonally at home positions (base=90, shoulder=80, elbow=80). Looking at your photo, the arms should stand tall and vertical at their default home pose — base on the table, segments stacking straight up with the claw at the top.

## Root Cause
The math maps shoulder and elbow angles using `sin`/`cos` in a way that pushes segments horizontally. At home angles (shoulder=80, elbow=80), the arm should be nearly vertical, but the current formulas treat these as forward-leaning angles.

## Fix — `src/components/ParticleArm3D.tsx`

Rewrite `armSegmentPoints` with correct forward kinematics:

- **Base** sits at ground level. Base rotation (0–140, home=90) rotates the arm around the Y axis. At home (90), the arm faces forward.
- **Shoulder** (0–155, home=80): At home ~80, the upper arm should point almost straight up. Map so that 0=tilted back, 155=tilted far forward, and 80≈vertical.
- **Elbow** (0–150, home=80): At home ~80, the forearm continues upward. Map so that 0=folded forward (down), 150=folded backward, 80≈straight continuation.
- **Wrist/Claw** segment extends from the forearm tip, also roughly vertical at home.

The key change: each segment's direction is computed relative to the previous segment (cumulative angle), and the home angles map to ~vertical orientation. The segments should represent the actual physical structure: spider-leg base → rotating turret → upper arm → forearm → wrist → claw.

Additionally, add small visual details:
- A wider particle cluster at the base to represent the spider-leg platform
- A claw representation at the top (two small diverging lines for open/close based on claw servo)

## Camera angle
Adjust the default camera to `[6, 5, 6]` looking at `[0, 3, 0]` so both vertical arms are clearly visible side by side.

## Files changed
- `src/components/ParticleArm3D.tsx` — rewrite `armSegmentPoints` with physically accurate vertical FK, add base platform particles, adjust camera


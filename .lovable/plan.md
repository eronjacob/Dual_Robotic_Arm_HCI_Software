

# Fix Gripper Rotate Slider in 3D Visualization

## Problem
The Gripper Rotate servo (`pins[4]` / pin 4 or 14) is completely ignored in the 3D visualization. The `ArmParticles` component reads `pins[0-3]` and `pins[5]` but skips `pins[4]`. The `computeArmKeyPoints` function has no parameter for gripper rotation.

## What the Gripper Rotate does
On the real arm, Gripper Rotate (pin 4/14) rotates the claw assembly around the forearm axis — like twisting your wrist. It should rotate the claw prongs around the `wristDir` axis.

## Fix (single file: `src/components/ParticleArm3D.tsx`)

1. **Read `pins[4]`** in `ArmParticles`: add `const gripperRotateAngle = positions[pins[4]] ?? 90;`

2. **Add `gripperRotateAngle` parameter** to `computeArmKeyPoints` signature

3. **Apply rotation to claw prongs**: After computing `clawBase`, rotate the perpendicular vector (`perpX`) around `wristDir` by the gripper rotate angle. This will twist the two prong positions around the arm's end axis, visually showing the claw rotating when the slider moves.

4. The rotation math: use an angle derived from `(gripperRotateAngle - 90)`, apply it as a rotation of the `perpX` vector around `wristDir` using Rodrigues' rotation formula or `THREE.Vector3.applyAxisAngle`.


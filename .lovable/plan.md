

# Hand Gesture Control with 3D Particle Visualization

## Overview
Add a new section to the controller that uses your webcam + MediaPipe Hands to track hand gestures in real-time and map them to servo commands. A React Three Fiber 3D particle system provides a visual representation of both hands and the arm states.

## How It Works

**Hand Tracking → Servo Mapping:**
- MediaPipe Hands detects 21 landmarks per hand at ~30fps
- Left hand controls left arm (pins 0-5), right hand controls right arm (pins 10-15)
- Toggle modes: left-only, right-only, or both hands
- Gesture mappings:
  - **Wrist X position** → Base rotation (pin 10/0)
  - **Wrist Y position** → Shoulder angle (pin 11/1)
  - **Elbow angle** (wrist-to-middle-finger vs wrist-to-index) → Elbow servo (pin 12/2)
  - **Hand rotation/tilt** → Wrist servo (pin 13/3)
  - **Hand pitch** → Gripper rotate (pin 14/4)
  - **Pinch distance** (thumb tip to index tip) → Claw open/close (pin 15/5)

**Sequential movement protection:** Hand tracking updates are throttled — only the servo with the largest change since last command is sent per cycle (respecting the movement delay setting). This ensures one servo moves at a time.

**3D Particle System:**
- A Three.js canvas shows two robotic arm silhouettes made of glowing particles
- Particles react to the current servo positions in real-time
- Hand landmark points are rendered as floating particle clouds
- Color-coded: blue particles for left arm, orange for right arm

## New Files

1. **`src/hooks/useHandTracking.ts`** — MediaPipe Hands setup, webcam stream, landmark extraction, gesture-to-angle mapping
2. **`src/components/HandGestureControl.tsx`** — UI panel with webcam preview, mode toggle (left/right/both), enable/disable button, sensitivity settings
3. **`src/components/ParticleArm3D.tsx`** — React Three Fiber canvas with particle system rendering both arms and hand landmarks

## Dependencies to Add
- `@mediapipe/hands` + `@mediapipe/camera_utils` — Hand tracking
- `@react-three/fiber@^8.18` + `three` + `@react-three/drei@^9.122.0` — 3D particle rendering

## UI Integration
- New collapsible "Hand Gesture Control" section on the main page between Movement Settings and Arm Panels
- Toggle button to enable/disable camera
- Small webcam preview with hand landmark overlay
- 3D particle canvas (resizable, ~400px tall) showing the arm visualization
- Mode selector: "Left Hand → Left Arm", "Right Hand → Right Arm", "Both"

## Safety
- Gesture control respects the existing sequential movement queue — commands are funneled through `setSingleServo` with heavy throttling (~200ms between updates)
- "Deadzone" threshold so tiny hand tremors don't trigger servo jitter
- Kill switch button to instantly stop gesture control


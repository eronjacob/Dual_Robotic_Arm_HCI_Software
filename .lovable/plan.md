

# Dual Robotic Arm Controller — Updated Plan

## Key Change: Sequential Servo Movement

To protect your 5V 15A power supply from overload, **all multi-servo movements will be sequential, not simultaneous**. When recalling a saved pose, playing a sequence, or hitting "Home All", servos move one at a time with a configurable delay between each (default ~200ms).

This applies to:
- **"Home All" / "Home Arm"** buttons — moves each servo to home one by one
- **Saved pose recall** — sends commands servo-by-servo in order (Base → Shoulder → Elbow → Wrist → Gripper Rotate → Claw)
- **Sequence playback** — each recorded step moves servos sequentially
- **Preset buttons** (e.g., "Pick Up Object") — same sequential behavior
- **Individual slider control** — already moves one servo at a time, no change needed

A "Movement Delay" slider (50ms–500ms) lets you tune the gap between each servo command to balance speed vs. power safety.

## Implementation Structure

### Files to create:
1. **`src/config/servoConfig.ts`** — Servo definitions (pins, names, home, min, max) for both arms
2. **`src/hooks/useWebSocket.ts`** — WebSocket connection management, command sending with sequential queue
3. **`src/hooks/useServoControl.ts`** — Servo state, sequential movement logic with configurable delay
4. **`src/hooks/usePoseManager.ts`** — Save/load/delete poses in localStorage
5. **`src/hooks/useSequenceRecorder.ts`** — Record, save, playback sequences with speed control
6. **`src/components/ConnectionBar.tsx`** — IP input, connect/disconnect, status indicator
7. **`src/components/ArmPanel.tsx`** — 6 sliders for one arm with per-servo home buttons
8. **`src/components/ServoSlider.tsx`** — Individual servo slider with label, value, min/max
9. **`src/components/SavedPoses.tsx`** — List of saved poses with recall and delete
10. **`src/components/SequenceRecorder.tsx`** — Record/stop/play controls, speed slider, loop toggle
11. **`src/components/MovementSettings.tsx`** — Movement delay slider, smooth interpolation toggle
12. **`src/components/ArduinoGuide.tsx`** — Collapsible section with Arduino WebSocket server code
13. **`src/pages/Index.tsx`** — Main layout assembling all components

### Sequential Movement Implementation
- A command queue processes one servo command at a time
- Each command waits for the configured delay before sending the next
- WebSocket sends JSON: `{"pin": 10, "angle": 90}`
- Individual slider changes send immediately (single servo, no queue needed)
- Multi-servo actions (pose recall, home all, presets) queue all commands sequentially

### UI Layout
- **Top**: Connection bar (IP, status, connect button)
- **Middle**: Two arm panels side by side (Left=blue, Right=orange), movement delay setting
- **Below**: Saved poses grid, preset buttons (Home All, Pick Up)
- **Bottom**: Sequence recorder with playback controls
- **Collapsible**: Arduino firmware guide

### Design
- Dark theme, color-coded arms (blue left, orange right)
- Large sliders for easy control
- Visual queue indicator showing which servo is currently moving
- Power warning badge reminding about sequential movement


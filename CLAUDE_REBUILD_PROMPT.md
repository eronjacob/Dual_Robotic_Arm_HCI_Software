# Dual Robotic Arm Controller — Rebuild Prompt

Use this prompt to recreate the Dual Robotic Arm Controller web app from scratch. Follow every section precisely. Do not substitute libraries, fonts, or color identity. Keep button labels short and free of overlapping icons or stacked text.

---

## 1. Project Identity

Build a single-page web application that controls two physical 6-DOF robotic arms over WebSocket. The hardware is an Arduino UNO R4 WiFi paired with a PCA9685 16-channel PWM driver and a 5V 15A power supply. The web UI must look and feel like a professional "Robotics Command Center" — cinematic, technical, and dark-themed.

The two arms are mirrored:
- Left arm uses PCA9685 channels 0 to 5
- Right arm uses PCA9685 channels 10 to 15

The arms communicate with the browser via a raw WebSocket on port 81. Each command is a small JSON payload of the form `{"pin": <number>, "angle": <number>}`.

---

## 2. Tech Stack (exact versions matter)

- React 18 + Vite 5 + TypeScript 5
- Tailwind CSS v3 with shadcn/ui components
- three.js with `@react-three/fiber@^8.18` and `@react-three/drei@^9.122.0`
- `three@>=0.133`
- MediaPipe Hands for webcam-based hand tracking
- `lucide-react` for icons
- `framer-motion` for any motion polish
- No backend. All state is client-side. The Arduino is the only "server".

Do not use Next.js, Vue, Angular, or Svelte.

---

## 3. Design System

Dark, technical, minimal — closer to a flight console than a SaaS dashboard.

- Background: deep slate, around `hsl(220 25% 6%)`
- Surface cards: `hsl(220 20% 9%)` with 1px inner borders at `hsl(220 15% 18%)`
- Foreground text: `hsl(210 20% 92%)`
- Muted text: `hsl(220 10% 60%)`
- Left arm accent (blue): `hsl(210 100% 65%)`
- Right arm accent (orange): `hsl(25 100% 62%)`
- Success: `hsl(142 70% 45%)`
- Warning: `hsl(38 95% 55%)`
- Danger: `hsl(0 75% 55%)`

Typography:
- Body and UI: `JetBrains Mono` (monospace, technical feel)
- Headings: same monospace, heavier weight

Surface treatments:
- Glassmorphism on hero panels: `bg-card/70` + `backdrop-blur-md` + inner border
- Subtle background grid (1px lines, very low opacity) plus a faint noise texture
- Section "kickers" (small uppercase labels) above each major panel
- Status pills with rounded-full borders, monospace, 11–12px

All colors must be defined as HSL CSS variables in `src/index.css` and consumed via Tailwind semantic tokens (`bg-background`, `text-foreground`, `bg-card`, `text-arm-left`, `text-arm-right`, etc.). Never hardcode color hex values in components.

---

## 4. Servo Configuration (authoritative)

These are the Arduino-tuned values. The browser must initialize and "home" to exactly these angles.

| Side  | Pin | Joint          | Home | Min | Max | PickUp |
|-------|-----|----------------|------|-----|-----|--------|
| Left  | 0   | Base           | 85   | 0   | 140 | -      |
| Left  | 1   | Shoulder       | 88   | 0   | 155 | 117    |
| Left  | 2   | Elbow          | 85   | 0   | 150 | 20     |
| Left  | 3   | Wrist          | 90   | 0   | 160 | -      |
| Left  | 4   | Gripper Rotate | 89   | 30  | 150 | 30     |
| Left  | 5   | Claw           | 80   | 0   | 80  | -      |
| Right | 10  | Base           | 93   | 0   | 140 | -      |
| Right | 11  | Shoulder       | 90   | 0   | 155 | 117    |
| Right | 12  | Elbow          | 92   | 0   | 150 | 20     |
| Right | 13  | Wrist          | 100  | 0   | 160 | -      |
| Right | 14  | Gripper Rotate | 101  | 30  | 150 | 30     |
| Right | 15  | Claw           | 80   | 0   | 80  | -      |

Joint semantics:
- Base: 0 = left, max = right
- Shoulder: 0 = back, max = forward
- Elbow: 0 = forward, max = backward
- Wrist: 0 = left, max = right
- Gripper Rotate: 0 = backward, max = forward
- Claw: 0 = closed, max = open

Expose these in `src/config/servoConfig.ts` with helpers `getAllServos()`, `getHomePositions()`, and `getPickUpPositions()`.

---

## 5. Critical Safety Constraint

The 5V 15A PSU cannot drive multiple servos simultaneously. **All servo movement must be sequential.** The control hook (`useServoControl`) must serialize commands through a queue so that only one `{pin, angle}` packet is sent at a time, with a configurable inter-command delay (default 50–100 ms). When the user moves a slider rapidly, debounce or coalesce to the latest target before sending. When applying a saved pose, iterate pins one by one with the configured delay.

This rule is non-negotiable. Show a small system notice in the UI labeled "Sequential mode active" so the user always sees that simultaneous movement is intentionally prevented.

---

## 6. Page Hierarchy (`src/pages/Index.tsx`)

Render top-to-bottom in this order:

1. **Command Header** — app title, subtitle, IP/WebSocket status, "Home All" button, sequential-mode badge, live telemetry chips
2. **Connection Bar** — input for Arduino IP, Connect/Disconnect, link state indicator
3. **3D Hero Viewport** — full-width `ParticleArm3D` panel
4. **Dual Control Decks** — two `ArmPanel` components side-by-side on desktop, stacked on mobile (Left blue on the left, Right orange on the right)
5. **Hand Gesture Monitor** — `HandGestureControl` styled as a live subsystem
6. **Workflow Tools** — `SavedPoses` and `SequenceRecorder` in a 2-column grid
7. **Arduino Guide** — collapsible, visually de-emphasized

Mobile rule: the 3D viewport must always render **above** the sliders, with reduced height (~360px), so the user can see the arm react while dragging.

---

## 7. Component Specs

### `ConnectionBar.tsx`
Single row. IP input, Connect button, status dot. On connect, open WebSocket to `ws://<ip>:81`. Auto-reconnect on drop with exponential backoff capped at 5s.

### `MovementSettings.tsx`
A slim notice panel (not a loud warning). Slider for inter-command delay (50–500 ms, default 100). Read-only label confirming "Sequential movement enforced — one servo at a time".

### `ParticleArm3D.tsx`
Three.js canvas wrapped in a hero panel:
- Title row with kicker "Simulation viewport" and chips: "Mirrored 6-DOF", "<n> hands tracked", "Auto orbit idle mode", "Live particles"
- Inner canvas frame with subtle radial accents (very low opacity, max ~0.06) so the saturated particle colors are not washed out
- Render two `ArmParticles` instances:
  - Left: pins `[0,1,2,3,4,5]`, color `hsl(210 100% 65%)`, offsetX `-2`
  - Right: pins `[10,11,12,13,14,15]`, color `hsl(25 100% 62%)`, offsetX `+2`
- Particle material: `size: 0.14`, `opacity: 1.0`, additive blending, depthWrite false
- Joint orbs (pulsing) at base, elbow, wrist, claw base
- Energy lines (Catmull-Rom curve) along the arm at opacity ~0.8
- Ambient floating particles, low-opacity floor grid
- `OrbitControls` with auto-rotate after 3s of idle
- Hand landmark particles overlayed (left blue, right orange) when MediaPipe detects hands

The arm geometry (`computeArmKeyPoints`) takes `baseAngle, shoulderAngle, elbowAngle, wristAngle, gripperRotateAngle, clawAngle, offsetX` and returns `{origin, baseTop, elbowPos, wristPos, clawBase, prong1, prong2}`. The gripper rotate angle twists the perpendicular vector around the wrist direction using `applyAxisAngle`.

### `ArmPanel.tsx`
One panel per arm. Header strip in the arm's accent color, arm label (Left/Right), summary of joint values, "Home Arm" button, "Pick Up" button. Below: a `ServoSlider` per joint.

### `ServoSlider.tsx`
Dense row layout: joint name, current angle (animated `value-pop` on change), small `Home` icon button, slider (min/max from config), description label below. Send updates through the sequential queue.

### `HandGestureControl.tsx`
Live monitor aesthetic:
- Webcam frame with corner brackets, scanline overlay, "LIVE" pill
- Mode segmented control: Off / Left arm / Right arm / Both
- Sensitivity slider
- Side legend mapping landmarks to joints:
  - Wrist X position → Base
  - Wrist Y position → Shoulder
  - Index finger Y → Elbow
  - Hand roll → Wrist
  - Thumb-index spread → Claw
  - Hand yaw → Gripper Rotate
- Smoothing: exponential moving average, alpha ~0.25
- Deadzone: ignore changes < 2 degrees
- All output goes through the same sequential queue

### `SavedPoses.tsx`
Tile grid. Each tile shows pose name, joint count, "Apply" and "Delete". Persist to `localStorage` under `dual-arm.poses`. "Save current" captures the full `positions` map.

### `SequenceRecorder.tsx`
Record button toggles capture. While recording, every committed slider change appends `{pin, angle, t}` to the sequence. Play button replays through the sequential queue at the recorded timing (or the configured min delay, whichever is larger). Persist to `localStorage` under `dual-arm.sequences`.

### `ArduinoGuide.tsx`
Collapsible. Includes the wiring diagram description and a copy-paste Arduino sketch using the home values above.

---

## 8. Arduino Sketch (reference)

```cpp
#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>
#include <WiFiS3.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver();
WebSocketsServer webSocket = WebSocketsServer(81);

void setServoAngle(int pin, int angle) {
  int pulse = map(angle, 0, 180, 150, 600);
  pwm.setPWM(pin, 0, pulse);
}

void setup() {
  pwm.begin();
  pwm.setPWMFreq(50);
  int pins[]  = {0,1,2,3,4,5,10,11,12,13,14,15};
  int homes[] = {85,88,85,90,89,80,93,90,92,100,101,80};
  for (int i = 0; i < 12; i++) {
    setServoAngle(pins[i], homes[i]);
    delay(200); // sequential startup
  }
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
}
```

---

## 9. File / Folder Structure

```
src/
  config/
    servoConfig.ts
  hooks/
    useServoControl.ts
    useWebSocket.ts
    useHandTracking.ts
  components/
    ConnectionBar.tsx
    MovementSettings.tsx
    ParticleArm3D.tsx
    ArmPanel.tsx
    ServoSlider.tsx
    HandGestureControl.tsx
    SavedPoses.tsx
    SequenceRecorder.tsx
    ArduinoGuide.tsx
    ui/...        (shadcn primitives)
  pages/
    Index.tsx
    NotFound.tsx
  index.css
  main.tsx
```

---

## 10. Formatting and UI Hygiene Rules

- Buttons: never stack icon and label vertically. Always horizontal: `<Icon /> Label`. Keep labels under 12 characters.
- Never place two buttons so close that their hover rings touch. Minimum gap: `gap-2`.
- Never overlap text on top of the 3D canvas without a `pointer-events-none` container.
- Status pills must be single-line and not wrap mid-word.
- All numeric values use the monospace font and are right-aligned in tables.
- Sliders must show the live numeric value to the right of the track, not below.
- Use semantic Tailwind tokens only. No raw `text-white`, `bg-gray-900`, or hex values inside components.
- Mobile breakpoint: `md` (768px). Below it: stacked layout, 3D viewport above sliders, reduced canvas height.

---

## 11. Acceptance Checklist

- [ ] Connecting to the Arduino IP opens a WebSocket on port 81 and the status dot turns green
- [ ] Pressing "Home All" sends the 12 home angles sequentially with the configured delay
- [ ] Moving any slider sends exactly one `{pin, angle}` packet at a time
- [ ] Left arm particles render in saturated blue, right arm in saturated orange — never gray
- [ ] The 3D arm geometry visibly twists when the Gripper Rotate slider moves
- [ ] Hand tracking, when enabled, drives the selected arm's joints with smoothing and deadzones
- [ ] Saved poses and recorded sequences persist across page reloads
- [ ] On a 375px-wide mobile viewport, the 3D viewport sits above the control decks at a reduced height
- [ ] No button labels are clipped, wrapped mid-word, or overlapping icons

Build to this spec exactly. Do not improvise on the safety queue, color identity, or servo home values.

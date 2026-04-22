
## Figma-Aligned Redesign Plan

### Goal
Upgrade the Dual Robotic Arm Controller into a more polished, Figma-quality “robotics command center” while preserving the current dark theme, blue/orange arm identity, monospace technical feel, mobile behavior, and sequential-movement safety messaging.

## What will be built

### 1. Establish a stronger design system that feels Figma-quality
Create a more intentional visual language across the app so it looks designed rather than assembled from default cards:
- Refine surface hierarchy with layered dark panels, subtle glass treatment, inner borders, and cleaner spacing
- Standardize section headers, helper text, badges, corner radii, and panel shadows
- Introduce premium panel treatments for hero areas only, while keeping controls readable and practical
- Keep the current left-arm blue and right-arm orange identity, but use those accents more selectively and professionally

### 2. Redesign the main page into a clearer command-center layout
Restructure `src/pages/Index.tsx` into a more impressive product-style composition:
- Top command header with title, subtitle, live system badges, and primary actions
- Large “Live Simulation” hero area for the 3D visualization
- Dual arm control section with clearer grouping and better scanability
- Hand Gesture Control styled as a distinct live subsystem
- Workflow tools section for Saved Poses and Sequences
- Arduino Guide visually de-emphasized as setup/support material

### 3. Turn the 3D visualization into the visual centerpiece
Upgrade the current `ParticleArm3D` container so it feels like a designed showcase panel:
- Add a titled hero shell with telemetry chips and subtle framing
- Use a stronger visual backdrop around the canvas: vignette, radial glow, layered border, surface depth
- Preserve the current particle effects, but improve presentation around them
- Keep mobile behavior compact so the visualization still sits above the sliders without dominating the full screen

### 4. Upgrade the arm controls from generic cards to premium control consoles
Refine `ArmPanel.tsx` and `ServoSlider.tsx` to feel more like a professional robotics interface:
- Add a clearer arm header with colored accent strip and compact summary values
- Improve slider grouping, spacing, labeling, and separation between joints
- Keep the glow behaviors already added, but make the surrounding panel design more deliberate
- Ensure the UI still supports quick servo edits without extra complexity

### 5. Redesign Hand Gesture Control as a live monitoring module
Polish `HandGestureControl.tsx` so it looks closer to a high-end prototype or Figma exploration:
- Add a stronger subsystem header and status row
- Replace the current mode buttons with a cleaner segmented-control treatment
- Add a compact on-screen gesture legend so mappings feel understandable
- Improve the camera frame with a more refined monitor aesthetic, while keeping the current landmark overlay and LIVE status

### 6. Refine Saved Poses and Sequence Recorder into workflow tools
Restyle `SavedPoses.tsx` and `SequenceRecorder.tsx` as part of a production workflow area:
- Place them in a more cohesive section with stronger titles and clearer actions
- Improve the list/tile treatment for saved items
- Make metadata, record/play states, and empty states feel more deliberate
- Preserve all current functionality and keep actions easy to reach

### 7. Slim down secondary utilities so they don’t compete with the hero UI
Improve supporting components without letting them dominate:
- `ConnectionBar.tsx`: convert into a tighter system status/control bar
- `MovementSettings.tsx`: present sequential mode as a clean system notice rather than a loud warning block
- `ArduinoGuide.tsx`: keep collapsible, but make it visually secondary and easier to scan

## Figma usage options
If there is an actual Figma file to match, the redesign can follow either of these paths:

### Option A — Figma-inspired redesign directly in code
Implement a Figma-quality interface using the existing theme and app structure, without requiring a live Figma file.

### Option B — Match an actual Figma design
If a Figma design exists, use it as the reference source for spacing, panel hierarchy, typography, and component styling.
Because live Figma access is not currently connected, the matching flow would be:
1. Connect Figma locally through the Lovable Desktop app and Figma Dev Mode, or
2. Provide screenshots/exports of the Figma frames as fallback references

## Files likely to change
- `src/pages/Index.tsx` — overall page hierarchy and section composition
- `src/components/ParticleArm3D.tsx` — premium hero framing around the 3D canvas
- `src/components/ArmPanel.tsx` — redesigned arm console headers and summaries
- `src/components/ServoSlider.tsx` — cleaner slider layout and information density
- `src/components/HandGestureControl.tsx` — live monitor styling and gesture legend
- `src/components/SavedPoses.tsx` — improved workflow card/tile styling
- `src/components/SequenceRecorder.tsx` — stronger recording/playback presentation
- `src/components/ConnectionBar.tsx` — refined command/status bar treatment
- `src/components/MovementSettings.tsx` — slimmer safety notice styling
- `src/components/ArduinoGuide.tsx` — secondary support-panel styling
- `src/index.css` — shared surface, background, glow, and panel utilities
- `tailwind.config.ts` — any extra tokens/animations needed for the redesign

## Technical details
- Keep the current React + Tailwind architecture and follow existing component patterns
- Preserve functional behavior: WebSocket control, sequential movement, hand tracking, servo sliders, saved poses, and sequence playback
- Maintain current robotics identity from project memory: dark theme, blue/orange arm coding, monospace technical styling
- Respect the earlier mobile requirement: on mobile, the 3D view remains above the sliders with reduced height
- Focus first on layout hierarchy and surface design, then on micro-polish and motion

## Implementation order
1. Redesign shared surfaces and page layout structure
2. Upgrade the 3D hero container and top command header
3. Refine arm control panels and sliders
4. Redesign Hand Gesture Control as a premium live subsystem
5. Polish workflow sections and secondary utilities
6. If Figma references are provided, align spacing and visual details to those references in a second pass

## Result
The finished site will feel closer to a polished Figma prototype brought to life: cinematic at the top, structured and professional in the middle, and still practical for real robotic arm control.

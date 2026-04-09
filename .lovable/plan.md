

# Visual Effects Enhancement Plan

## Overview
Add polished visual effects across the 3D visualization, hand gesture control, and servo sliders to make the interface feel more dynamic and professional.

## Changes

### 1. 3D Particle Visualization (`ParticleArm3D.tsx`)
- **Glowing energy lines** between arm segments using `THREE.Line` with gradient opacity — connects the particles visually so the arm reads as a structure, not scattered dots
- **Pulsing joint orbs** at each joint (base, elbow, wrist) — small spheres that pulse with a glow effect
- **Floating ambient particles** — 50-80 tiny particles drifting slowly around the scene for atmosphere (like dust motes)
- **Dynamic particle size** — particles near joints are slightly larger, creating visual weight at articulation points
- **Subtle auto-rotation** when idle — the scene slowly rotates if the user hasn't interacted with OrbitControls recently

### 2. Servo Sliders (`ServoSlider.tsx` + `slider.tsx`)
- **Colored slider tracks** — the filled range actually renders in blue (left arm) or orange (right arm) instead of the current broken dynamic class
- **Glow effect on active slider** — when dragging, the thumb and track get a colored box-shadow/glow
- **Animated value display** — the degree number uses a subtle scale animation when changing
- **Moving indicator pulse** — when `isMoving` is true, add a pulsing glow border animation instead of just a color change

### 3. Hand Gesture Control (`HandGestureControl.tsx`)
- **Pulsing "LIVE" indicator** — the green LIVE badge gets a breathing pulse animation
- **Glowing camera border** — when camera is active, the video container gets an animated gradient border (blue/orange)
- **Hand detection status with animated icons** — replace emoji checkmarks with animated dot indicators

### 4. Global Animations (`tailwind.config.ts` + `index.css`)
- Add keyframes for `pulse-glow`, `border-glow`, and `breathe` animations
- Add utility classes for the glow effects

## Files to modify
- `src/components/ParticleArm3D.tsx` — energy lines, joint orbs, ambient particles
- `src/components/ServoSlider.tsx` — colored tracks, glow effects, pulse animation
- `src/components/ui/slider.tsx` — support arm-color prop for track coloring
- `src/components/HandGestureControl.tsx` — animated LIVE badge, glowing border
- `tailwind.config.ts` — new keyframes and animations
- `src/index.css` — glow utility classes


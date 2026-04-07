import { useRef, useState, useCallback, useEffect } from 'react';
import { Hands, Results, NormalizedLandmarkList } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

export type HandMode = 'left' | 'right' | 'both';

export interface HandLandmarks {
  left: NormalizedLandmarkList | null;
  right: NormalizedLandmarkList | null;
}

interface GestureAngles {
  base: number;
  shoulder: number;
  elbow: number;
  wrist: number;
  gripperRotate: number;
  claw: number;
}

const DEADZONE = 3; // degrees — ignore changes smaller than this

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function mapRange(val: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  return outMin + ((val - inMin) / (inMax - inMin)) * (outMax - outMin);
}

function distance3D(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
}

function angle2D(a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }) {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const magAB = Math.sqrt(ab.x ** 2 + ab.y ** 2);
  const magCB = Math.sqrt(cb.x ** 2 + cb.y ** 2);
  if (magAB * magCB === 0) return 0;
  return Math.acos(clamp(dot / (magAB * magCB), -1, 1)) * (180 / Math.PI);
}

function landmarksToAngles(landmarks: NormalizedLandmarkList, sensitivity: number): GestureAngles {
  const wrist = landmarks[0];
  const indexMcp = landmarks[5];
  const middleMcp = landmarks[9];
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];

  // Base: wrist X position (0=right side of camera, 1=left) → 0-140
  const base = clamp(mapRange(wrist.x, 0.2, 0.8, 140, 0) * sensitivity, 0, 140);

  // Shoulder: wrist Y position (0=top, 1=bottom) → 0-155
  const shoulder = clamp(mapRange(wrist.y, 0.2, 0.8, 155, 0) * sensitivity, 0, 155);

  // Elbow: angle at wrist between index MCP and middle MCP → 0-150
  const elbowAngle = angle2D(indexMcp, wrist, middleMcp);
  const elbow = clamp(mapRange(elbowAngle, 10, 60, 0, 150), 0, 150);

  // Wrist rotation: hand tilt (difference in Y between index and pinky MCP) → 0-160
  const pinkyMcp = landmarks[17];
  const tilt = indexMcp.y - pinkyMcp.y;
  const wristAngle = clamp(mapRange(tilt, -0.15, 0.15, 0, 160), 0, 160);

  // Gripper rotate: hand pitch (wrist Z relative to middle finger MCP Z) → 30-150
  const zDiff = wrist.z - middleMcp.z;
  const gripperRotate = clamp(mapRange(zDiff, -0.1, 0.1, 30, 150), 30, 150);

  // Claw: pinch distance thumb tip to index tip → 0 (closed) to 80 (open)
  const pinchDist = distance3D(thumbTip, indexTip);
  const claw = clamp(mapRange(pinchDist, 0.03, 0.15, 0, 80), 0, 80);

  return { base, shoulder, elbow, wrist: wristAngle, gripperRotate, claw };
}

export const useHandTracking = (
  setSingleServo: (pin: number, angle: number) => void,
  movementDelay: number
) => {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<HandMode>('both');
  const [sensitivity, setSensitivity] = useState(1);
  const [landmarks, setLandmarks] = useState<HandLandmarks>({ left: null, right: null });
  const handsRef = useRef<Hands | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const lastAnglesRef = useRef<Record<number, number>>({});

  const applyAngles = useCallback((angles: GestureAngles, armPins: number[]) => {
    const now = Date.now();
    if (now - lastUpdateRef.current < movementDelay) return;

    const angleMap: [number, number][] = [
      [armPins[0], Math.round(angles.base)],
      [armPins[1], Math.round(angles.shoulder)],
      [armPins[2], Math.round(angles.elbow)],
      [armPins[3], Math.round(angles.wrist)],
      [armPins[4], Math.round(angles.gripperRotate)],
      [armPins[5], Math.round(angles.claw)],
    ];

    // Find the servo with the largest change — only send that one (sequential safety)
    let maxDelta = 0;
    let bestPin = -1;
    let bestAngle = 0;

    for (const [pin, angle] of angleMap) {
      const prev = lastAnglesRef.current[pin] ?? angle;
      const delta = Math.abs(angle - prev);
      if (delta > DEADZONE && delta > maxDelta) {
        maxDelta = delta;
        bestPin = pin;
        bestAngle = angle;
      }
    }

    if (bestPin >= 0) {
      setSingleServo(bestPin, bestAngle);
      lastAnglesRef.current[bestPin] = bestAngle;
      lastUpdateRef.current = now;
    }
  }, [setSingleServo, movementDelay]);

  const onResults = useCallback((results: Results) => {
    const newLandmarks: HandLandmarks = { left: null, right: null };

    if (results.multiHandLandmarks && results.multiHandedness) {
      for (let i = 0; i < results.multiHandLandmarks.length; i++) {
        const lm = results.multiHandLandmarks[i];
        // MediaPipe mirrors: "Left" label = user's left hand
        const label = results.multiHandedness[i].label.toLowerCase();
        // Mirror: MediaPipe "Right" = user's left hand (camera is mirrored)
        if (label === 'right') {
          newLandmarks.left = lm;
        } else {
          newLandmarks.right = lm;
        }
      }
    }

    setLandmarks(newLandmarks);

    // Apply to servos based on mode
    if (newLandmarks.left && (mode === 'left' || mode === 'both')) {
      const angles = landmarksToAngles(newLandmarks.left, sensitivity);
      applyAngles(angles, [0, 1, 2, 3, 4, 5]);
    }
    if (newLandmarks.right && (mode === 'right' || mode === 'both')) {
      const angles = landmarksToAngles(newLandmarks.right, sensitivity);
      applyAngles(angles, [10, 11, 12, 13, 14, 15]);
    }
  }, [mode, sensitivity, applyAngles]);

  const startTracking = useCallback(async (videoElement: HTMLVideoElement) => {
    videoRef.current = videoElement;

    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5,
    });

    hands.onResults(onResults);
    handsRef.current = hands;

    const camera = new Camera(videoElement, {
      onFrame: async () => {
        if (handsRef.current) {
          await handsRef.current.send({ image: videoElement });
        }
      },
      width: 640,
      height: 480,
    });

    cameraRef.current = camera;
    await camera.start();
    setEnabled(true);
  }, [onResults]);

  const stopTracking = useCallback(() => {
    cameraRef.current?.stop();
    cameraRef.current = null;
    handsRef.current?.close();
    handsRef.current = null;
    setEnabled(false);
    setLandmarks({ left: null, right: null });
    lastAnglesRef.current = {};
  }, []);

  // Update onResults callback when mode/sensitivity changes
  useEffect(() => {
    if (handsRef.current) {
      handsRef.current.onResults(onResults);
    }
  }, [onResults]);

  return {
    enabled,
    mode,
    setMode,
    sensitivity,
    setSensitivity,
    landmarks,
    startTracking,
    stopTracking,
    videoRef,
  };
};

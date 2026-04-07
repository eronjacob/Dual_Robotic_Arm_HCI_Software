import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { HandLandmarks } from '@/hooks/useHandTracking';

interface ParticleArmProps {
  positions: Record<number, number>;
  landmarks: HandLandmarks;
}

// Generate arm particle positions from servo angles
function armSegmentPoints(
  baseAngle: number,
  shoulderAngle: number,
  elbowAngle: number,
  wristAngle: number,
  offsetX: number
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const baseRad = ((baseAngle - 90) / 180) * Math.PI;
  const shoulderRad = ((shoulderAngle - 90) / 180) * Math.PI;
  const elbowRad = ((elbowAngle - 90) / 180) * Math.PI;

  // Base
  const base = new THREE.Vector3(offsetX, 0, 0);
  points.push(base.clone());

  // Shoulder joint
  const shoulderLen = 1.5;
  const shoulder = base.clone().add(
    new THREE.Vector3(
      Math.sin(baseRad) * 0.3,
      shoulderLen,
      Math.cos(baseRad) * 0.3
    )
  );

  // Upper arm
  const upperLen = 1.8;
  const elbow = shoulder.clone().add(
    new THREE.Vector3(
      Math.sin(baseRad) * Math.cos(shoulderRad) * upperLen,
      Math.sin(shoulderRad) * upperLen,
      Math.cos(baseRad) * Math.cos(shoulderRad) * upperLen * 0.3
    )
  );

  // Forearm
  const foreLen = 1.5;
  const wristPos = elbow.clone().add(
    new THREE.Vector3(
      Math.sin(baseRad) * Math.cos(elbowRad) * foreLen * 0.5,
      Math.sin(elbowRad) * foreLen,
      Math.cos(baseRad) * Math.cos(elbowRad) * foreLen * 0.3
    )
  );

  // Interpolate particles along each segment
  const addSegParticles = (a: THREE.Vector3, b: THREE.Vector3, count: number) => {
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      points.push(a.clone().lerp(b.clone(), t));
    }
  };

  addSegParticles(base, shoulder, 8);
  addSegParticles(shoulder, elbow, 10);
  addSegParticles(elbow, wristPos, 8);

  // Add some scatter around joints
  [base, shoulder, elbow, wristPos].forEach(joint => {
    for (let i = 0; i < 6; i++) {
      points.push(joint.clone().add(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2
        )
      ));
    }
  });

  return points;
}

function ArmParticles({ pins, color, positions }: {
  pins: number[];
  color: string;
  positions: Record<number, number>;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const timeRef = useRef(0);

  const offsetX = pins[0] === 0 ? -2 : 2;
  const baseAngle = positions[pins[0]] ?? 90;
  const shoulderAngle = positions[pins[1]] ?? 80;
  const elbowAngle = positions[pins[2]] ?? 80;
  const wristAngle = positions[pins[3]] ?? 90;

  const particleCount = 80;

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(particleCount * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);

  useFrame((_, delta) => {
    timeRef.current += delta;
    const points = armSegmentPoints(baseAngle, shoulderAngle, elbowAngle, wristAngle, offsetX);

    const posArr = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < particleCount; i++) {
      const pt = points[i % points.length];
      const jitter = Math.sin(timeRef.current * 3 + i) * 0.03;
      posArr[i * 3] = pt.x + jitter;
      posArr[i * 3 + 1] = pt.y + jitter;
      posArr[i * 3 + 2] = pt.z + jitter;
    }
    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        color={color}
        size={0.12}
        transparent
        opacity={0.85}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function HandParticles({ landmarks, side }: {
  landmarks: { x: number; y: number; z: number }[] | null;
  side: 'left' | 'right';
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const color = side === 'left' ? '#60a5fa' : '#fb923c';
  const offsetX = side === 'left' ? -2 : 2;

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(21 * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);

  useFrame(() => {
    if (!landmarks) return;
    const posArr = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < 21; i++) {
      const lm = landmarks[i];
      if (!lm) continue;
      // Map normalized coords to 3D space above the arm
      posArr[i * 3] = (lm.x - 0.5) * 4 + offsetX;
      posArr[i * 3 + 1] = (1 - lm.y) * 4 + 4;
      posArr[i * 3 + 2] = -lm.z * 2;
    }
    geometry.attributes.position.needsUpdate = true;
  });

  if (!landmarks) return null;

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        color={color}
        size={0.08}
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function FloatingGrid() {
  return (
    <gridHelper args={[12, 24, '#1e293b', '#0f172a']} position={[0, -0.5, 0]} />
  );
}

export const ParticleArm3D = ({ positions, landmarks }: ParticleArmProps) => {
  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border border-border/30 bg-black/50">
      <Canvas
        camera={{ position: [0, 4, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[5, 10, 5]} intensity={0.5} />

        {/* Left arm particles (blue) */}
        <ArmParticles
          pins={[0, 1, 2, 3, 4, 5]}
          color="#3b82f6"
          positions={positions}
        />

        {/* Right arm particles (orange) */}
        <ArmParticles
          pins={[10, 11, 12, 13, 14, 15]}
          color="#f97316"
          positions={positions}
        />

        {/* Hand landmark clouds */}
        <HandParticles landmarks={landmarks.left as any} side="left" />
        <HandParticles landmarks={landmarks.right as any} side="right" />

        <FloatingGrid />
        <OrbitControls
          enablePan={false}
          minDistance={4}
          maxDistance={15}
          target={[0, 2, 0]}
        />
      </Canvas>
    </div>
  );
};

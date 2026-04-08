import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { HandLandmarks } from '@/hooks/useHandTracking';

interface ParticleArmProps {
  positions: Record<number, number>;
  landmarks: HandLandmarks;
}

function armSegmentPoints(
  baseAngle: number,
  shoulderAngle: number,
  elbowAngle: number,
  wristAngle: number,
  clawAngle: number,
  gripperRotate: number,
  offsetX: number
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];

  // Base rotation around Y axis. Home=90 → faces forward (negative Z)
  const baseRad = ((baseAngle - 90) / 180) * Math.PI;

  // Shoulder: home=80 should be nearly vertical (slight forward tilt)
  // Map so 80 → ~5° from vertical. 0=tilted back, 155=tilted far forward
  const shoulderTilt = ((shoulderAngle - 80) / 155) * Math.PI * 0.8;

  // Elbow: home=80 should continue straight. 0=folded forward, 150=folded back
  const elbowTilt = ((elbowAngle - 80) / 150) * Math.PI * 0.7;

  const origin = new THREE.Vector3(offsetX, 0, 0);

  // Base platform height
  const baseTop = origin.clone().add(new THREE.Vector3(0, 0.6, 0));

  // Shoulder direction (cumulative from base rotation + shoulder tilt)
  const shoulderDir = new THREE.Vector3(
    Math.sin(baseRad) * Math.sin(shoulderTilt),
    Math.cos(shoulderTilt),
    Math.cos(baseRad) * Math.sin(shoulderTilt)
  ).normalize();

  const upperLen = 2.0;
  const elbowPos = baseTop.clone().add(shoulderDir.clone().multiplyScalar(upperLen));

  // Elbow direction (relative to shoulder direction)
  const cumulativeTilt = shoulderTilt + elbowTilt;
  const elbowDir = new THREE.Vector3(
    Math.sin(baseRad) * Math.sin(cumulativeTilt),
    Math.cos(cumulativeTilt),
    Math.cos(baseRad) * Math.sin(cumulativeTilt)
  ).normalize();

  const foreLen = 1.6;
  const wristPos = elbowPos.clone().add(elbowDir.clone().multiplyScalar(foreLen));

  // Wrist segment
  const wristTilt = ((wristAngle - 90) / 180) * Math.PI * 0.3;
  const wristCumulTilt = cumulativeTilt + wristTilt;
  const wristDir = new THREE.Vector3(
    Math.sin(baseRad) * Math.sin(wristCumulTilt),
    Math.cos(wristCumulTilt),
    Math.cos(baseRad) * Math.sin(wristCumulTilt)
  ).normalize();

  const wristLen = 0.8;
  const clawBase = wristPos.clone().add(wristDir.clone().multiplyScalar(wristLen));

  // Interpolate particles along segments
  const addSeg = (a: THREE.Vector3, b: THREE.Vector3, count: number) => {
    for (let i = 0; i <= count; i++) {
      points.push(a.clone().lerp(b.clone(), i / count));
    }
  };

  addSeg(origin, baseTop, 4);
  addSeg(baseTop, elbowPos, 12);
  addSeg(elbowPos, wristPos, 10);
  addSeg(wristPos, clawBase, 5);

  // Base platform particles (wider cluster)
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const r = 0.4 + Math.random() * 0.2;
    points.push(new THREE.Vector3(
      offsetX + Math.cos(angle) * r,
      Math.random() * 0.15,
      Math.sin(angle) * r
    ));
  }

  // Joint scatter
  [baseTop, elbowPos, wristPos].forEach(joint => {
    for (let i = 0; i < 4; i++) {
      points.push(joint.clone().add(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.15,
          (Math.random() - 0.5) * 0.15,
          (Math.random() - 0.5) * 0.15
        )
      ));
    }
  });

  // Claw visualization (two prongs)
  const clawOpen = (clawAngle / 80) * 0.3; // 0=closed, 80=open
  const perpX = new THREE.Vector3(1, 0, 0).cross(wristDir).normalize();
  if (perpX.length() < 0.01) perpX.set(1, 0, 0);
  perpX.normalize();

  const prong1 = clawBase.clone().add(wristDir.clone().multiplyScalar(0.4)).add(perpX.clone().multiplyScalar(clawOpen));
  const prong2 = clawBase.clone().add(wristDir.clone().multiplyScalar(0.4)).add(perpX.clone().multiplyScalar(-clawOpen));

  addSeg(clawBase, prong1, 3);
  addSeg(clawBase, prong2, 3);

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
  const gripperRotate = positions[pins[4]] ?? 90;
  const clawAngle = positions[pins[5]] ?? 80;

  const particleCount = 120;

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(particleCount * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);

  useFrame((_, delta) => {
    timeRef.current += delta;
    const pts = armSegmentPoints(baseAngle, shoulderAngle, elbowAngle, wristAngle, clawAngle, gripperRotate, offsetX);

    const posArr = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < particleCount; i++) {
      const pt = pts[i % pts.length];
      const jitter = Math.sin(timeRef.current * 3 + i) * 0.02;
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
        size={0.1}
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
      posArr[i * 3] = (lm.x - 0.5) * 4 + offsetX;
      posArr[i * 3 + 1] = (1 - lm.y) * 4 + 5;
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
    <gridHelper args={[12, 24, '#1e293b', '#0f172a']} position={[0, -0.1, 0]} />
  );
}

export const ParticleArm3D = ({ positions, landmarks }: ParticleArmProps) => {
  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border border-border/30 bg-black/50">
      <Canvas
        camera={{ position: [6, 5, 6], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[5, 10, 5]} intensity={0.5} />

        <ArmParticles pins={[0, 1, 2, 3, 4, 5]} color="#3b82f6" positions={positions} />
        <ArmParticles pins={[10, 11, 12, 13, 14, 15]} color="#f97316" positions={positions} />

        <HandParticles landmarks={landmarks.left as any} side="left" />
        <HandParticles landmarks={landmarks.right as any} side="right" />

        <FloatingGrid />
        <OrbitControls
          enablePan={false}
          minDistance={4}
          maxDistance={15}
          target={[0, 3, 0]}
        />
      </Canvas>
    </div>
  );
};

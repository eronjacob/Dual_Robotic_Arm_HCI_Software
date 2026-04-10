import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { HandLandmarks } from '@/hooks/useHandTracking';

interface ParticleArmProps {
  positions: Record<number, number>;
  landmarks: HandLandmarks;
}

interface ArmKeyPoints {
  origin: THREE.Vector3;
  baseTop: THREE.Vector3;
  elbowPos: THREE.Vector3;
  wristPos: THREE.Vector3;
  clawBase: THREE.Vector3;
  prong1: THREE.Vector3;
  prong2: THREE.Vector3;
}

function computeArmKeyPoints(
  baseAngle: number,
  shoulderAngle: number,
  elbowAngle: number,
  wristAngle: number,
  gripperRotateAngle: number,
  clawAngle: number,
  offsetX: number
): ArmKeyPoints {
  const baseRad = ((baseAngle - 90) / 180) * Math.PI;
  const shoulderTilt = ((shoulderAngle - 80) / 155) * Math.PI * 0.8;
  const elbowTilt = ((elbowAngle - 80) / 150) * Math.PI * 0.7;

  const origin = new THREE.Vector3(offsetX, 0, 0);
  const baseTop = origin.clone().add(new THREE.Vector3(0, 0.6, 0));

  const shoulderDir = new THREE.Vector3(
    Math.sin(baseRad) * Math.sin(shoulderTilt),
    Math.cos(shoulderTilt),
    Math.cos(baseRad) * Math.sin(shoulderTilt)
  ).normalize();

  const upperLen = 2.0;
  const elbowPos = baseTop.clone().add(shoulderDir.clone().multiplyScalar(upperLen));

  const cumulativeTilt = shoulderTilt + elbowTilt;
  const elbowDir = new THREE.Vector3(
    Math.sin(baseRad) * Math.sin(cumulativeTilt),
    Math.cos(cumulativeTilt),
    Math.cos(baseRad) * Math.sin(cumulativeTilt)
  ).normalize();

  const foreLen = 1.6;
  const wristPos = elbowPos.clone().add(elbowDir.clone().multiplyScalar(foreLen));

  const wristTilt = ((wristAngle - 90) / 180) * Math.PI * 0.3;
  const wristCumulTilt = cumulativeTilt + wristTilt;
  const wristDir = new THREE.Vector3(
    Math.sin(baseRad) * Math.sin(wristCumulTilt),
    Math.cos(wristCumulTilt),
    Math.cos(baseRad) * Math.sin(wristCumulTilt)
  ).normalize();

  const wristLen = 0.8;
  const clawBase = wristPos.clone().add(wristDir.clone().multiplyScalar(wristLen));

  const clawOpen = (clawAngle / 80) * 0.3;
  const perpX = new THREE.Vector3(1, 0, 0).cross(wristDir).normalize();
  if (perpX.length() < 0.01) perpX.set(1, 0, 0);
  perpX.normalize();

  // Apply gripper rotation around the wrist axis
  const gripperRad = ((gripperRotateAngle - 90) / 180) * Math.PI;
  perpX.applyAxisAngle(wristDir, gripperRad);

  const prong1 = clawBase.clone().add(wristDir.clone().multiplyScalar(0.4)).add(perpX.clone().multiplyScalar(clawOpen));
  const prong2 = clawBase.clone().add(wristDir.clone().multiplyScalar(0.4)).add(perpX.clone().multiplyScalar(-clawOpen));

  return { origin, baseTop, elbowPos, wristPos, clawBase, prong1, prong2 };
}

function armSegmentPoints(keyPoints: ArmKeyPoints): THREE.Vector3[] {
  const { origin, baseTop, elbowPos, wristPos, clawBase, prong1, prong2 } = keyPoints;
  const points: THREE.Vector3[] = [];

  const addSeg = (a: THREE.Vector3, b: THREE.Vector3, count: number) => {
    for (let i = 0; i <= count; i++) {
      points.push(a.clone().lerp(b.clone(), i / count));
    }
  };

  addSeg(origin, baseTop, 4);
  addSeg(baseTop, elbowPos, 12);
  addSeg(elbowPos, wristPos, 10);
  addSeg(wristPos, clawBase, 5);

  // Base platform particles
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const r = 0.4 + Math.random() * 0.2;
    points.push(new THREE.Vector3(
      origin.x + Math.cos(angle) * r,
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

  addSeg(clawBase, prong1, 3);
  addSeg(clawBase, prong2, 3);

  return points;
}

/* ── Energy Lines ── */
function EnergyLines({ keyPoints, color }: { keyPoints: ArmKeyPoints; color: string }) {
  const lineRef = useRef<THREE.Line>(null);
  const timeRef = useRef(0);

  const geometry = useMemo(() => new THREE.BufferGeometry(), []);
  const material = useMemo(() => new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    linewidth: 1,
  }), [color]);

  useFrame((_, delta) => {
    timeRef.current += delta;
    const { baseTop, elbowPos, wristPos, clawBase, prong1, prong2 } = keyPoints;
    const segments = [baseTop, elbowPos, wristPos, clawBase];
    
    // Create smooth curve through key points
    const curve = new THREE.CatmullRomCurve3(segments);
    const curvePoints = curve.getPoints(40);
    
    // Add prong lines
    const allPoints = [...curvePoints, clawBase.clone(), prong1.clone(), clawBase.clone(), prong2.clone()];
    geometry.setFromPoints(allPoints);
  });

  return <primitive object={new THREE.Line(geometry, material)} />;
}

/* ── Pulsing Joint Orbs ── */
function JointOrbs({ keyPoints, color }: { keyPoints: ArmKeyPoints; color: string }) {
  const joints = [keyPoints.baseTop, keyPoints.elbowPos, keyPoints.wristPos, keyPoints.clawBase];
  
  return (
    <>
      {joints.map((pos, i) => (
        <PulsingOrb key={i} position={pos} color={color} delay={i * 0.5} />
      ))}
    </>
  );
}

function PulsingOrb({ position, color, delay }: { position: THREE.Vector3; color: string; delay: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(delay);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (meshRef.current) {
      const pulse = 0.8 + Math.sin(timeRef.current * 2.5) * 0.3;
      meshRef.current.scale.setScalar(pulse);
      meshRef.current.position.copy(position);
      (meshRef.current.material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(timeRef.current * 2.5) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.12, 12, 12]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ── Floating Ambient Particles ── */
function AmbientParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 60;
  const timeRef = useRef(0);

  const { geometry, speeds } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = Math.random() * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      spd[i] = 0.2 + Math.random() * 0.5;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return { geometry: geo, speeds: spd };
  }, []);

  useFrame((_, delta) => {
    timeRef.current += delta;
    const posArr = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      posArr[i * 3 + 1] += speeds[i] * delta * 0.3;
      posArr[i * 3] += Math.sin(timeRef.current * 0.5 + i) * delta * 0.05;
      posArr[i * 3 + 2] += Math.cos(timeRef.current * 0.3 + i) * delta * 0.05;
      // Reset if too high
      if (posArr[i * 3 + 1] > 7) {
        posArr[i * 3 + 1] = -0.5;
        posArr[i * 3] = (Math.random() - 0.5) * 10;
        posArr[i * 3 + 2] = (Math.random() - 0.5) * 10;
      }
    }
    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        color="#4488aa"
        size={0.04}
        transparent
        opacity={0.35}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ── Arm Particles (enhanced with dynamic sizing) ── */
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
  const gripperRotateAngle = positions[pins[4]] ?? 90;
  const clawAngle = positions[pins[5]] ?? 80;

  const keyPoints = computeArmKeyPoints(baseAngle, shoulderAngle, elbowAngle, wristAngle, gripperRotateAngle, clawAngle, offsetX);

  const particleCount = 120;

  const { geometry, sizes } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(particleCount * 3);
    const sz = new Float32Array(particleCount);
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sz, 1));
    return { geometry: geo, sizes: sz };
  }, []);

  useFrame((_, delta) => {
    timeRef.current += delta;
    const pts = armSegmentPoints(keyPoints);

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
    <>
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
      <EnergyLines keyPoints={keyPoints} color={color} />
      <JointOrbs keyPoints={keyPoints} color={color} />
    </>
  );
}

/* ── Hand Particles ── */
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

/* ── Grid ── */
function FloatingGrid() {
  return (
    <gridHelper args={[12, 24, '#1e293b', '#0f172a']} position={[0, -0.1, 0]} />
  );
}

/* ── Auto-rotating controls ── */
function AutoRotateControls() {
  const controlsRef = useRef<any>(null);
  const idleTimeRef = useRef(0);
  const [isIdle, setIsIdle] = useState(true);

  useFrame((_, delta) => {
    if (!controlsRef.current) return;
    if (isIdle) {
      idleTimeRef.current += delta;
      controlsRef.current.autoRotate = idleTimeRef.current > 3;
      controlsRef.current.autoRotateSpeed = 0.5;
    }
    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      minDistance={4}
      maxDistance={15}
      target={[0, 3, 0]}
      onStart={() => { setIsIdle(false); idleTimeRef.current = 0; }}
      onEnd={() => setIsIdle(true)}
    />
  );
}

/* ── Main Component ── */
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

        <AmbientParticles />
        <FloatingGrid />
        <AutoRotateControls />
      </Canvas>
    </div>
  );
};

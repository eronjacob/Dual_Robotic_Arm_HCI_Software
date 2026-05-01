export interface ServoConfig {
  pin: number;
  name: string;
  home: number;
  min: number;
  max: number;
  description: string;
  pickUpAngle?: number;
}

export interface ArmConfig {
  id: 'left' | 'right';
  label: string;
  servos: ServoConfig[];
}

const rightArmServos: ServoConfig[] = [
  { pin: 10, name: 'Base', home: 93, min: 0, max: 180, description: '0=left, 180=right' },
  { pin: 11, name: 'Shoulder', home: 90, min: 0, max: 180, description: '0=back, 180=forward', pickUpAngle: 117 },
  { pin: 12, name: 'Elbow', home: 92, min: 0, max: 180, description: '0=forward, 180=backward', pickUpAngle: 20 },
  { pin: 13, name: 'Wrist', home: 100, min: 0, max: 180, description: '0=left, 180=right' },
  { pin: 14, name: 'Gripper Rotate', home: 101, min: 0, max: 180, description: '0=backward, 180=forward', pickUpAngle: 30 },
  { pin: 15, name: 'Claw', home: 80, min: 0, max: 180, description: '0=close, 180=open' },
];

const leftArmServos: ServoConfig[] = [
  { pin: 0, name: 'Base', home: 85, min: 0, max: 180, description: '0=left, 180=right' },
  { pin: 1, name: 'Shoulder', home: 88, min: 0, max: 180, description: '0=back, 180=forward', pickUpAngle: 117 },
  { pin: 2, name: 'Elbow', home: 85, min: 0, max: 180, description: '0=forward, 180=backward', pickUpAngle: 20 },
  { pin: 3, name: 'Wrist', home: 90, min: 0, max: 180, description: '0=left, 180=right' },
  { pin: 4, name: 'Gripper Rotate', home: 89, min: 0, max: 180, description: '0=backward, 180=forward', pickUpAngle: 30 },
  { pin: 5, name: 'Claw', home: 80, min: 0, max: 180, description: '0=close, 180=open' },
];

export const arms: ArmConfig[] = [
  { id: 'left', label: 'Left Arm (Pins 0–5)', servos: leftArmServos },
  { id: 'right', label: 'Right Arm (Pins 10–15)', servos: rightArmServos },
];

export const getAllServos = () => [...arms[0].servos, ...arms[1].servos];

export const getHomePositions = (): Record<number, number> => {
  const positions: Record<number, number> = {};
  getAllServos().forEach(s => { positions[s.pin] = s.home; });
  return positions;
};

export const getPickUpPositions = (): Record<number, number> => {
  const positions: Record<number, number> = {};
  getAllServos().forEach(s => {
    positions[s.pin] = s.pickUpAngle ?? s.home;
  });
  return positions;
};

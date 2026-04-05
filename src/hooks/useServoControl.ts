import { useState, useRef, useCallback } from 'react';
import { getHomePositions, getAllServos } from '@/config/servoConfig';

export const useServoControl = (
  sendCommand: (pin: number, angle: number) => void
) => {
  const [positions, setPositions] = useState<Record<number, number>>(getHomePositions());
  const [movementDelay, setMovementDelay] = useState(200);
  const [movingPin, setMovingPin] = useState<number | null>(null);
  const queueRef = useRef<{ pin: number; angle: number }[]>([]);
  const isProcessingRef = useRef(false);
  const debounceRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const processQueue = useCallback(async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    while (queueRef.current.length > 0) {
      const cmd = queueRef.current.shift()!;
      setMovingPin(cmd.pin);
      sendCommand(cmd.pin, cmd.angle);
      setPositions(prev => ({ ...prev, [cmd.pin]: cmd.angle }));
      await new Promise(r => setTimeout(r, movementDelay));
    }

    setMovingPin(null);
    isProcessingRef.current = false;
  }, [sendCommand, movementDelay]);

  const setSingleServo = useCallback((pin: number, angle: number) => {
    // Debounce individual slider changes to 50ms
    if (debounceRef.current[pin]) clearTimeout(debounceRef.current[pin]);
    debounceRef.current[pin] = setTimeout(() => {
      sendCommand(pin, angle);
    }, 50);
    setPositions(prev => ({ ...prev, [pin]: angle }));
  }, [sendCommand]);

  const moveToPositions = useCallback((targetPositions: Record<number, number>) => {
    // Queue commands sequentially — one servo at a time
    const allServos = getAllServos();
    const commands = allServos
      .filter(s => targetPositions[s.pin] !== undefined && targetPositions[s.pin] !== positions[s.pin])
      .map(s => ({ pin: s.pin, angle: targetPositions[s.pin] }));

    queueRef.current.push(...commands);
    processQueue();
  }, [positions, processQueue]);

  const homeAll = useCallback(() => {
    moveToPositions(getHomePositions());
  }, [moveToPositions]);

  const homeArm = useCallback((pins: number[]) => {
    const homePos = getHomePositions();
    const target: Record<number, number> = {};
    pins.forEach(p => { target[p] = homePos[p]; });
    moveToPositions(target);
  }, [moveToPositions]);

  return {
    positions,
    movementDelay,
    setMovementDelay,
    movingPin,
    setSingleServo,
    moveToPositions,
    homeAll,
    homeArm,
  };
};

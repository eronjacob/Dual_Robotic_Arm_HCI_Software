import { useState, useRef, useCallback, useEffect } from 'react';

export interface SequenceStep {
  positions: Record<number, number>;
  timestamp: number;
}

export interface SavedSequence {
  id: string;
  name: string;
  steps: SequenceStep[];
  createdAt: number;
}

const STORAGE_KEY = 'robot-arm-sequences';

export const useSequenceRecorder = (
  currentPositions: Record<number, number>,
  moveToPositions: (positions: Record<number, number>) => void
) => {
  const [sequences, setSequences] = useState<SavedSequence[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [loop, setLoop] = useState(false);
  const stepsRef = useRef<SequenceStep[]>([]);
  const startTimeRef = useRef(0);
  const playAbortRef = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setSequences(JSON.parse(stored));
  }, []);

  const startRecording = useCallback(() => {
    stepsRef.current = [{ positions: { ...currentPositions }, timestamp: 0 }];
    startTimeRef.current = Date.now();
    setIsRecording(true);
  }, [currentPositions]);

  const captureStep = useCallback(() => {
    if (!isRecording) return;
    stepsRef.current.push({
      positions: { ...currentPositions },
      timestamp: Date.now() - startTimeRef.current,
    });
  }, [isRecording, currentPositions]);

  const stopRecording = useCallback((name: string) => {
    setIsRecording(false);
    const seq: SavedSequence = {
      id: crypto.randomUUID(),
      name,
      steps: stepsRef.current,
      createdAt: Date.now(),
    };
    setSequences(prev => {
      const updated = [...prev, seq];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    stepsRef.current = [];
  }, []);

  const playSequence = useCallback(async (sequence: SavedSequence) => {
    if (isPlaying) return;
    setIsPlaying(true);
    playAbortRef.current = false;

    const play = async () => {
      for (let i = 0; i < sequence.steps.length; i++) {
        if (playAbortRef.current) break;
        const step = sequence.steps[i];
        moveToPositions(step.positions);
        if (i < sequence.steps.length - 1) {
          const delay = (sequence.steps[i + 1].timestamp - step.timestamp) / speed;
          await new Promise(r => setTimeout(r, Math.max(delay, 50)));
        }
      }
    };

    do {
      await play();
    } while (loop && !playAbortRef.current);

    setIsPlaying(false);
  }, [isPlaying, moveToPositions, speed, loop]);

  const stopPlayback = useCallback(() => {
    playAbortRef.current = true;
  }, []);

  const deleteSequence = useCallback((id: string) => {
    setSequences(prev => {
      const updated = prev.filter(s => s.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    sequences,
    isRecording,
    isPlaying,
    speed,
    setSpeed,
    loop,
    setLoop,
    startRecording,
    captureStep,
    stopRecording,
    playSequence,
    stopPlayback,
    deleteSequence,
  };
};

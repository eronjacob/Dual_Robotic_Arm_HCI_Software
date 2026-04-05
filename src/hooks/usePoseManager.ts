import { useState, useEffect } from 'react';

export interface SavedPose {
  id: string;
  name: string;
  positions: Record<number, number>;
  createdAt: number;
}

const STORAGE_KEY = 'robot-arm-poses';

export const usePoseManager = () => {
  const [poses, setPoses] = useState<SavedPose[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setPoses(JSON.parse(stored));
  }, []);

  const save = (positions: Record<number, number>) => {
    setPoses(prev => {
      const updated = prev;
      return updated;
    });
  };

  const savePose = (name: string, positions: Record<number, number>) => {
    const pose: SavedPose = {
      id: crypto.randomUUID(),
      name,
      positions: { ...positions },
      createdAt: Date.now(),
    };
    setPoses(prev => {
      const updated = [...prev, pose];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const deletePose = (id: string) => {
    setPoses(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return { poses, savePose, deletePose };
};

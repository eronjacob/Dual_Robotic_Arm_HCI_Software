import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SavedPose } from '@/hooks/usePoseManager';
import { Save, Trash2, Play } from 'lucide-react';

interface SavedPosesProps {
  poses: SavedPose[];
  onSave: (name: string, positions: Record<number, number>) => void;
  onRecall: (positions: Record<number, number>) => void;
  onDelete: (id: string) => void;
  currentPositions: Record<number, number>;
}

export const SavedPoses = ({ poses, onSave, onRecall, onDelete, currentPositions }: SavedPosesProps) => {
  const [name, setName] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim(), currentPositions);
    setName('');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Saved Poses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-2">
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Pose name..."
            className="text-sm"
            onKeyDown={e => e.key === 'Enter' && handleSave()}
          />
          <Button size="sm" onClick={handleSave} disabled={!name.trim()}>
            <Save className="mr-1 h-4 w-4" /> Save
          </Button>
        </div>
        {poses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No saved poses yet. Move the sliders and save a pose above.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {poses.map(pose => (
              <div
                key={pose.id}
                className="flex items-center justify-between rounded-md border bg-secondary/50 px-3 py-2"
              >
                <span className="truncate text-sm font-medium">{pose.name}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRecall(pose.positions)}>
                    <Play className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(pose.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

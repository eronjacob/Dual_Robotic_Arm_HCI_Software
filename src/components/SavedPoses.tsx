import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SavedPose } from '@/hooks/usePoseManager';
import { Play, Save, Trash2 } from 'lucide-react';

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
    <Card className="panel-shell">
      <CardHeader className="pb-3">
        <div className="section-kicker">Pose library</div>
        <CardTitle className="text-xl">Saved poses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Pose name..."
            className="h-10 border-border/70 bg-background/50 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <Button className="h-10 sm:min-w-[120px]" onClick={handleSave} disabled={!name.trim()}>
            <Save className="mr-2 h-4 w-4" /> Save Pose
          </Button>
        </div>
        {poses.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/70 bg-background/30 px-4 py-8 text-center text-sm text-muted-foreground">
            No saved poses yet. Dial in a stance with the sliders, then store it here for fast recall.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {poses.map((pose) => (
              <div key={pose.id} className="rounded-lg border border-border/70 bg-background/35 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground">{pose.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">Instant recall for the full 12-servo pose map</div>
                  </div>
                  <span className="status-pill">Pose</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => onRecall(pose.positions)}>
                    <Play className="mr-2 h-3.5 w-3.5" /> Recall
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 border border-border/60" onClick={() => onDelete(pose.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
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

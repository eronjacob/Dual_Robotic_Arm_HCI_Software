import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { SavedSequence } from '@/hooks/useSequenceRecorder';
import { Circle, Play, Repeat, Square, Trash2 } from 'lucide-react';

interface SequenceRecorderProps {
  sequences: SavedSequence[];
  isRecording: boolean;
  isPlaying: boolean;
  speed: number;
  loop: boolean;
  onStartRecording: () => void;
  onCaptureStep: () => void;
  onStopRecording: (name: string) => void;
  onPlay: (sequence: SavedSequence) => void;
  onStopPlayback: () => void;
  onSetSpeed: (speed: number) => void;
  onSetLoop: (loop: boolean) => void;
  onDelete: (id: string) => void;
}

export const SequenceRecorder = ({
  sequences, isRecording, isPlaying, speed, loop,
  onStartRecording, onCaptureStep, onStopRecording,
  onPlay, onStopPlayback, onSetSpeed, onSetLoop, onDelete,
}: SequenceRecorderProps) => {
  const [seqName, setSeqName] = useState('');

  const handleStop = () => {
    const name = seqName.trim() || `Sequence ${sequences.length + 1}`;
    onStopRecording(name);
    setSeqName('');
  };

  return (
    <Card className="panel-shell">
      <CardHeader className="pb-3">
        <div className="section-kicker">Motion sequencer</div>
        <CardTitle className="text-xl">Sequence recorder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-border/70 bg-background/35 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              {isRecording ? (
                <>
                  <Input
                    value={seqName}
                    onChange={(e) => setSeqName(e.target.value)}
                    placeholder="Sequence name..."
                    className="h-10 w-full border-border/70 bg-background/50 text-sm lg:w-52"
                  />
                  <Button size="sm" variant="outline" className="h-10" onClick={onCaptureStep}>
                    <Circle className="mr-2 h-3 w-3 fill-destructive text-destructive" /> Capture Step
                  </Button>
                  <Button size="sm" variant="destructive" className="h-10" onClick={handleStop}>
                    <Square className="mr-2 h-3.5 w-3.5" /> Stop & Save
                  </Button>
                </>
              ) : (
                <Button size="sm" className="h-10" onClick={onStartRecording} disabled={isPlaying}>
                  <Circle className="mr-2 h-3 w-3 fill-destructive text-destructive" /> Start Recording
                </Button>
              )}
              {isRecording && <span className="status-pill text-destructive">● Recording live</span>}
              {isPlaying && !isRecording && <span className="status-pill">Playback active</span>}
            </div>

            {isPlaying && (
              <Button size="sm" variant="destructive" className="h-10" onClick={onStopPlayback}>
                <Square className="mr-2 h-3.5 w-3.5" /> Stop Playback
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div className="rounded-lg border border-border/70 bg-background/35 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Playback speed</Label>
              <span className="font-mono text-sm text-foreground">{speed}x</span>
            </div>
            <Slider
              value={[speed]}
              min={0.5}
              max={2}
              step={0.25}
              onValueChange={([v]) => onSetSpeed(v)}
            />
          </div>
          <div className="rounded-lg border border-border/70 bg-background/35 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <Repeat className="h-4 w-4 text-primary" /> Loop playback
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Repeat saved motion continuously</span>
              <Switch checked={loop} onCheckedChange={onSetLoop} />
            </div>
          </div>
        </div>

        {sequences.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/70 bg-background/30 px-4 py-8 text-center text-sm text-muted-foreground">
            No saved sequences yet. Record a motion path by capturing key steps while adjusting the servo decks.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {sequences.map((seq) => (
              <div key={seq.id} className="rounded-lg border border-border/70 bg-background/35 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-foreground">{seq.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{seq.steps.length} captured steps</div>
                  </div>
                  <span className="status-pill">Sequence</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => onPlay(seq)}
                    disabled={isPlaying || isRecording}
                  >
                    <Play className="mr-2 h-3.5 w-3.5" /> Play
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 border border-border/60" onClick={() => onDelete(seq.id)}>
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

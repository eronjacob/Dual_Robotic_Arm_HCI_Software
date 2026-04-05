import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { SavedSequence } from '@/hooks/useSequenceRecorder';
import { Circle, Square, Play, Trash2, Repeat } from 'lucide-react';

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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Sequence Recorder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {isRecording ? (
            <>
              <Input
                value={seqName}
                onChange={e => setSeqName(e.target.value)}
                placeholder="Sequence name..."
                className="w-48 text-sm"
              />
              <Button size="sm" variant="outline" onClick={onCaptureStep}>
                <Circle className="mr-1 h-3 w-3 fill-destructive text-destructive" /> Capture Step
              </Button>
              <Button size="sm" variant="destructive" onClick={handleStop}>
                <Square className="mr-1 h-3.5 w-3.5" /> Stop & Save
              </Button>
              <span className="text-xs text-destructive animate-pulse font-semibold">● RECORDING</span>
            </>
          ) : (
            <Button size="sm" onClick={onStartRecording} disabled={isPlaying}>
              <Circle className="mr-1 h-3 w-3 fill-destructive text-destructive" /> Start Recording
            </Button>
          )}
        </div>

        {/* Playback settings */}
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <Label className="text-xs text-muted-foreground">Speed:</Label>
            <Slider
              value={[speed]}
              min={0.5}
              max={2}
              step={0.25}
              onValueChange={([v]) => onSetSpeed(v)}
              className="w-24"
            />
            <span className="text-sm font-mono">{speed}x</span>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={loop} onCheckedChange={onSetLoop} />
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <Repeat className="h-3 w-3" /> Loop
            </Label>
          </div>
          {isPlaying && (
            <Button size="sm" variant="destructive" onClick={onStopPlayback}>
              <Square className="mr-1 h-3.5 w-3.5" /> Stop
            </Button>
          )}
        </div>

        {/* Saved sequences */}
        {sequences.length === 0 ? (
          <p className="text-sm text-muted-foreground">No saved sequences. Record one by moving the sliders and capturing steps.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {sequences.map(seq => (
              <div
                key={seq.id}
                className="flex items-center justify-between rounded-md border bg-secondary/50 px-3 py-2"
              >
                <div className="truncate">
                  <span className="text-sm font-medium">{seq.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{seq.steps.length} steps</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onPlay(seq)}
                    disabled={isPlaying || isRecording}
                  >
                    <Play className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(seq.id)}>
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

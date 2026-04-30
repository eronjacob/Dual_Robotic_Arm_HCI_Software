import { useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Camera, CameraOff, ChevronDown, Hand, Zap } from 'lucide-react';
import type { HandMode, HandLandmarks } from '@/hooks/useHandTracking';

interface HandGestureControlProps {
  enabled: boolean;
  mode: HandMode;
  sensitivity: number;
  landmarks: HandLandmarks;
  onSetMode: (mode: HandMode) => void;
  onSetSensitivity: (val: number) => void;
  onStart: (video: HTMLVideoElement) => void;
  onStop: () => void;
}

const MODES: { value: HandMode; label: string; icon: string }[] = [
  { value: 'left', label: 'Left Hand → Left Arm', icon: '🤚' },
  { value: 'right', label: 'Right Hand → Right Arm', icon: '✋' },
  { value: 'both', label: 'Both Hands → Both Arms', icon: '🙌' },
];

export const HandGestureControl = ({
  enabled,
  mode,
  sensitivity,
  landmarks,
  onSetMode,
  onSetSensitivity,
  onStart,
  onStop,
}: HandGestureControlProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleToggle = useCallback(() => {
    if (enabled) {
      onStop();
    } else if (videoRef.current) {
      onStart(videoRef.current);
    }
  }, [enabled, onStart, onStop]);

  // Draw landmarks overlay on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawHand = (lm: { x: number; y: number }[], color: string) => {
      ctx.fillStyle = color;
      for (const point of lm) {
        ctx.beginPath();
        ctx.arc(point.x * canvas.width, point.y * canvas.height, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4],
        [0, 5], [5, 6], [6, 7], [7, 8],
        [0, 9], [9, 10], [10, 11], [11, 12],
        [0, 13], [13, 14], [14, 15], [15, 16],
        [0, 17], [17, 18], [18, 19], [19, 20],
        [5, 9], [9, 13], [13, 17],
      ];
      for (const [a, b] of connections) {
        ctx.beginPath();
        ctx.moveTo(lm[a].x * canvas.width, lm[a].y * canvas.height);
        ctx.lineTo(lm[b].x * canvas.width, lm[b].y * canvas.height);
        ctx.stroke();
      }
    };

    if (landmarks.left) drawHand(landmarks.left as any, 'hsl(210, 100%, 60%)');
    if (landmarks.right) drawHand(landmarks.right as any, 'hsl(25, 100%, 60%)');
  }, [landmarks]);

  return (
    <Collapsible defaultOpen>
      <Card className="border-border/50 bg-card/80">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Hand className="h-5 w-5 text-primary" />
              Hand Gesture Control
              <span className="ml-auto flex items-center gap-2">
                {enabled && (
                  <span className="flex items-center gap-1 text-xs font-normal text-green-400 animate-breathe">
                    <Zap className="h-3 w-3" /> LIVE
                  </span>
                )}
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </span>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Controls row */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant={enabled ? 'destructive' : 'default'}
                size="sm"
                onClick={handleToggle}
              >
                {enabled ? (
                  <><CameraOff className="mr-1 h-4 w-4" /> Kill Switch</>
                ) : (
                  <><Camera className="mr-1 h-4 w-4" /> Enable Camera</>
                )}
              </Button>

              {/* Mode selector */}
              <div className="flex gap-1">
                {MODES.map(m => (
                  <Button
                    key={m.value}
                    variant={mode === m.value ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => onSetMode(m.value)}
                    className="text-xs"
                  >
                    {m.icon} {m.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Sensitivity */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-20 shrink-0">Sensitivity</span>
              <Slider
                value={[sensitivity * 100]}
                onValueChange={([v]) => onSetSensitivity(v / 100)}
                min={50}
                max={150}
                step={5}
                className="flex-1"
              />
              <span className="text-xs font-mono text-foreground w-10 text-right">
                {Math.round(sensitivity * 100)}%
              </span>
            </div>

            {/* Webcam + overlay */}
            <div className={`relative w-full max-w-sm mx-auto rounded-lg overflow-hidden border-2 bg-black aspect-[4/3] transition-all duration-500 ${
              enabled ? 'animate-border-glow border-arm-left' : 'border-border/30'
            }`}>
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                playsInline
                muted
              />
              <canvas
                ref={canvasRef}
                width={640}
                height={480}
                className="absolute inset-0 w-full h-full scale-x-[-1]"
              />
              {!enabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                  <p className="text-sm text-muted-foreground">Camera off — click Enable to start</p>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className={`inline-block h-2 w-2 rounded-full ${landmarks.left ? 'bg-arm-left animate-breathe' : 'bg-muted'}`} />
                Left hand: {landmarks.left ? 'Detected' : 'Not detected'}
              </span>
              <span className="flex items-center gap-1.5">
                <span className={`inline-block h-2 w-2 rounded-full ${landmarks.right ? 'bg-arm-right animate-breathe' : 'bg-muted'}`} />
                Right hand: {landmarks.right ? 'Detected' : 'Not detected'}
              </span>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

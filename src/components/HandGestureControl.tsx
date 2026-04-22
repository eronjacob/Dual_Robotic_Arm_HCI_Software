import { useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Camera, CameraOff, ChevronDown, Hand, Radar, Sparkles, Zap } from 'lucide-react';
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

const MODES: { value: HandMode; label: string; short: string }[] = [
  { value: 'left', label: 'Left arm', short: 'L' },
  { value: 'right', label: 'Right arm', short: 'R' },
  { value: 'both', label: 'Dual sync', short: 'LR' },
];

const GESTURE_LEGEND = [
  { label: 'Wrist X/Y', value: 'Base · Shoulder' },
  { label: 'Palm angle', value: 'Elbow · Wrist' },
  { label: 'Hand twist', value: 'Gripper rotate' },
  { label: 'Pinch width', value: 'Claw open' },
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

    if (landmarks.left) drawHand(landmarks.left as any, 'hsl(210 100% 55%)');
    if (landmarks.right) drawHand(landmarks.right as any, 'hsl(25 95% 55%)');
  }, [landmarks]);

  return (
    <Collapsible defaultOpen>
      <Card className="panel-shell overflow-hidden">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer pb-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="section-kicker">Gesture subsystem</div>
                <CardTitle className="mt-1 flex items-center gap-2 text-xl">
                  <Hand className="h-5 w-5 text-primary" />
                  Hand motion control
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {enabled && (
                  <span className="status-pill">
                    <Zap className="h-3.5 w-3.5 text-success" /> LIVE
                  </span>
                )}
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 [&[data-state=open]]:rotate-180" />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant={enabled ? 'destructive' : 'default'} className="h-10" onClick={handleToggle}>
                    {enabled ? (
                      <><CameraOff className="mr-2 h-4 w-4" /> Kill Switch</>
                    ) : (
                      <><Camera className="mr-2 h-4 w-4" /> Enable Camera</>
                    )}
                  </Button>

                  <div className="segmented-control">
                    {MODES.map((m) => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => onSetMode(m.value)}
                        className={`segmented-option ${mode === m.value ? 'segmented-option-active' : ''}`}
                      >
                        <span className="font-semibold">{m.short}</span>
                        <span>{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-border/70 bg-background/40 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Tracking sensitivity</span>
                    <span className="font-mono text-sm text-foreground">{Math.round(sensitivity * 100)}%</span>
                  </div>
                  <Slider
                    value={[sensitivity * 100]}
                    onValueChange={([v]) => onSetSensitivity(v / 100)}
                    min={50}
                    max={150}
                    step={5}
                  />
                </div>

                <div className={`monitor-frame ${enabled ? 'monitor-frame-live' : ''}`}>
                  <div className="monitor-overlay" />
                  <div className="monitor-corners" />
                  <div className="absolute left-3 top-3 z-20 flex gap-2">
                    <span className="status-pill">
                      <Radar className="h-3.5 w-3.5 text-primary" />
                      {enabled ? 'Camera live' : 'Camera idle'}
                    </span>
                    <span className="status-pill">
                      <Sparkles className="h-3.5 w-3.5 text-accent" />
                      {landmarks.left || landmarks.right ? 'Tracking' : 'Awaiting hands'}
                    </span>
                  </div>
                  <video
                    ref={videoRef}
                    className="absolute inset-0 h-full w-full scale-x-[-1] object-cover"
                    playsInline
                    muted
                  />
                  <canvas
                    ref={canvasRef}
                    width={640}
                    height={480}
                    className="absolute inset-0 h-full w-full scale-x-[-1]"
                  />
                  {!enabled && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                      <p className="text-sm text-muted-foreground">Camera off — enable live tracking to stream gestures.</p>
                    </div>
                  )}
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <span className="status-pill justify-center">
                    <span className={`inline-block h-2 w-2 rounded-full ${landmarks.left ? 'bg-arm-left animate-breathe' : 'bg-muted'}`} />
                    Left hand {landmarks.left ? 'detected' : 'offline'}
                  </span>
                  <span className="status-pill justify-center">
                    <span className={`inline-block h-2 w-2 rounded-full ${landmarks.right ? 'bg-arm-right animate-breathe' : 'bg-muted'}`} />
                    Right hand {landmarks.right ? 'detected' : 'offline'}
                  </span>
                </div>
              </div>

              <aside className="rounded-lg border border-border/70 bg-background/40 p-4">
                <div className="section-kicker">Mapping legend</div>
                <h3 className="mt-1 text-sm font-semibold text-foreground">Gesture → motion matrix</h3>
                <div className="mt-4 space-y-3">
                  {GESTURE_LEGEND.map((item) => (
                    <div key={item.label} className="rounded-md border border-border/60 bg-card/60 p-3">
                      <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{item.label}</div>
                      <div className="mt-1 text-sm font-medium text-foreground">{item.value}</div>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

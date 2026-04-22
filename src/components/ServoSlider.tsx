import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { ServoConfig } from '@/config/servoConfig';

interface ServoSliderProps {
  servo: ServoConfig;
  value: number;
  onChange: (pin: number, angle: number) => void;
  isMoving: boolean;
  armColor: 'left' | 'right';
}

export const ServoSlider = ({ servo, value, onChange, isMoving, armColor }: ServoSliderProps) => {
  const colorClass = armColor === 'left' ? 'text-arm-left' : 'text-arm-right';
  const toneClass = armColor === 'left' ? 'border-arm-left/20 bg-arm-left/5' : 'border-arm-right/20 bg-arm-right/5';
  const [animateValue, setAnimateValue] = useState(false);
  const [prevValue, setPrevValue] = useState(value);

  useEffect(() => {
    if (value !== prevValue) {
      setAnimateValue(true);
      setPrevValue(value);
      const t = setTimeout(() => setAnimateValue(false), 200);
      return () => clearTimeout(t);
    }
  }, [value, prevValue]);

  const glowClass = armColor === 'left' ? 'glow-left' : 'glow-right';

  return (
    <div
      className={`rounded-lg border px-3 py-3 transition-all duration-300 ${toneClass} ${
        isMoving ? `border-warning animate-pulse-glow ${glowClass}` : 'border-border/70'
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <span>Pin {servo.pin}</span>
            <span className={`h-1 w-1 rounded-full ${armColor === 'left' ? 'bg-arm-left' : 'bg-arm-right'}`} />
            <span>{servo.min}–{servo.max}</span>
          </div>
          <div className={`truncate text-sm font-semibold ${colorClass}`}>{servo.name}</div>
          <p className="text-xs text-muted-foreground">{servo.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`min-w-[56px] rounded-md border border-border/70 bg-background/60 px-2 py-1 text-right font-mono text-lg font-bold text-foreground transition-transform ${
              animateValue ? 'animate-value-pop' : ''
            }`}
          >
            {value}°
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 border border-border/70 bg-background/40"
            onClick={() => onChange(servo.pin, servo.home)}
            title="Home"
          >
            <Home className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-8 text-xs text-muted-foreground">{servo.min}°</span>
        <Slider
          value={[value]}
          min={servo.min}
          max={servo.max}
          step={1}
          onValueChange={([v]) => onChange(servo.pin, v)}
          armColor={armColor}
          className="flex-1"
        />
        <span className="w-8 text-right text-xs text-muted-foreground">{servo.max}°</span>
      </div>
    </div>
  );
};

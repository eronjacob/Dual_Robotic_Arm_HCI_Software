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
    <div className={`rounded-md border p-3 transition-all duration-300 ${
      isMoving
        ? `border-warning animate-pulse-glow ${glowClass}`
        : 'border-border'
    }`}>
      <div className="mb-2 flex items-center justify-between">
        <div>
          <span className={`text-sm font-semibold ${colorClass}`}>
            Pin {servo.pin}: {servo.name}
          </span>
          <p className="text-xs text-muted-foreground">{servo.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`min-w-[3ch] text-right font-mono text-lg font-bold text-foreground transition-transform ${
            animateValue ? 'animate-value-pop' : ''
          }`}>
            {value}°
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onChange(servo.pin, servo.home)}
            title="Home"
          >
            <Home className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground w-8">{servo.min}°</span>
        <Slider
          value={[value]}
          min={servo.min}
          max={servo.max}
          step={1}
          onValueChange={([v]) => onChange(servo.pin, v)}
          armColor={armColor}
          className="flex-1"
        />
        <span className="text-xs text-muted-foreground w-8 text-right">{servo.max}°</span>
      </div>
    </div>
  );
};

import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';

interface MovementSettingsProps {
  delay: number;
  onDelayChange: (delay: number) => void;
}

export const MovementSettings = ({ delay, onDelayChange }: MovementSettingsProps) => {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-warning/30 bg-warning/5 p-3">
      <div className="flex items-center gap-2 text-warning">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase">Sequential Mode</span>
      </div>
      <div className="flex items-center gap-3">
        <Label className="text-xs text-muted-foreground whitespace-nowrap">Movement Delay:</Label>
        <Slider
          value={[delay]}
          min={50}
          max={500}
          step={25}
          onValueChange={([v]) => onDelayChange(v)}
          className="w-32"
        />
        <span className="text-sm font-mono min-w-[4ch]">{delay}ms</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Servos move one at a time to protect the 5V 15A power supply from overload.
      </p>
    </div>
  );
};

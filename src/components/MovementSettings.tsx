import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Gauge, ShieldAlert } from 'lucide-react';

interface MovementSettingsProps {
  delay: number;
  onDelayChange: (delay: number) => void;
}

export const MovementSettings = ({ delay, onDelayChange }: MovementSettingsProps) => {
  return (
    <section className="panel-shell p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="section-kicker">Safety timing</div>
          <h3 className="text-lg font-semibold text-foreground">Sequential motion guard</h3>
        </div>
        <span className="status-pill">
          <ShieldAlert className="h-3.5 w-3.5 text-warning" />
          One servo at a time
        </span>
      </div>

      <div className="rounded-lg border border-border/70 bg-background/40 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Movement delay</Label>
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Gauge className="h-4 w-4 text-primary" />
            {delay}ms
          </div>
        </div>
        <Slider
          value={[delay]}
          min={50}
          max={500}
          step={25}
          onValueChange={([v]) => onDelayChange(v)}
        />
      </div>

      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        Commands are serialized to protect the 5V 15A supply from current spikes while preserving stable motion playback.
      </p>
    </section>
  );
};

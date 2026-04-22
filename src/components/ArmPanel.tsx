import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ServoSlider } from '@/components/ServoSlider';
import { ArmConfig } from '@/config/servoConfig';
import { Home } from 'lucide-react';

interface ArmPanelProps {
  arm: ArmConfig;
  positions: Record<number, number>;
  movingPin: number | null;
  onServoChange: (pin: number, angle: number) => void;
  onHomeArm: (pins: number[]) => void;
}

export const ArmPanel = ({ arm, positions, movingPin, onServoChange, onHomeArm }: ArmPanelProps) => {
  const borderColor = arm.id === 'left' ? 'border-arm-left/30' : 'border-arm-right/30';
  const titleColor = arm.id === 'left' ? 'text-arm-left' : 'text-arm-right';
  const mutedTone = arm.id === 'left' ? 'bg-arm-left/10' : 'bg-arm-right/10';
  const pins = arm.servos.map((s) => s.pin);
  const summaryServos = [arm.servos[0], arm.servos[1], arm.servos[5]].filter(Boolean);

  return (
    <Card className={`panel-shell ${borderColor} border`}>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className={`h-8 w-1 rounded-full ${mutedTone}`} />
              <div>
                <div className="section-kicker">{arm.id === 'left' ? 'Primary deck' : 'Mirrored deck'}</div>
                <CardTitle className={`text-xl ${titleColor}`}>{arm.label}</CardTitle>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {summaryServos.map((servo) => (
                <div key={servo.pin} className="telemetry-card min-w-[96px]">
                  <span className="telemetry-label">{servo.name}</span>
                  <span className="telemetry-value">{positions[servo.pin] ?? servo.home}°</span>
                </div>
              ))}
            </div>
          </div>

          <Button variant="outline" size="sm" className="h-10" onClick={() => onHomeArm(pins)}>
            <Home className="mr-2 h-4 w-4" /> Home Arm
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {arm.servos.map((servo) => (
          <ServoSlider
            key={servo.pin}
            servo={servo}
            value={positions[servo.pin] ?? servo.home}
            onChange={onServoChange}
            isMoving={movingPin === servo.pin}
            armColor={arm.id}
          />
        ))}
      </CardContent>
    </Card>
  );
};

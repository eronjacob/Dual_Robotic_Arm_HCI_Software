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
  const pins = arm.servos.map(s => s.pin);

  return (
    <Card className={`${borderColor} border-2`}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className={`text-lg ${titleColor}`}>{arm.label}</CardTitle>
        <Button variant="outline" size="sm" onClick={() => onHomeArm(pins)}>
          <Home className="mr-1 h-4 w-4" /> Home Arm
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {arm.servos.map(servo => (
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

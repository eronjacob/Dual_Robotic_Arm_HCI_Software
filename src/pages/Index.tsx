import { useWebSocket } from '@/hooks/useWebSocket';
import { useServoControl } from '@/hooks/useServoControl';
import { usePoseManager } from '@/hooks/usePoseManager';
import { useSequenceRecorder } from '@/hooks/useSequenceRecorder';
import { useHandTracking } from '@/hooks/useHandTracking';
import { arms, getHomePositions, getPickUpPositions } from '@/config/servoConfig';
import { ConnectionBar } from '@/components/ConnectionBar';
import { ArmPanel } from '@/components/ArmPanel';
import { SavedPoses } from '@/components/SavedPoses';
import { SequenceRecorder } from '@/components/SequenceRecorder';
import { MovementSettings } from '@/components/MovementSettings';
import { ArduinoGuide } from '@/components/ArduinoGuide';
import { HandGestureControl } from '@/components/HandGestureControl';
import { ParticleArm3D } from '@/components/ParticleArm3D';
import { Button } from '@/components/ui/button';
import { Home, Hand } from 'lucide-react';

const Index = () => {
  const ws = useWebSocket();
  const servo = useServoControl(ws.sendCommand);
  const poseManager = usePoseManager();
  const sequencer = useSequenceRecorder(servo.positions, servo.moveToPositions);
  const handTracking = useHandTracking(servo.setSingleServo, servo.movementDelay);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Dual Robotic Arm Controller
            </h1>
            <p className="text-sm text-muted-foreground">
              6-DOF × 2 — Arduino UNO R4 WiFi + PCA9685
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={servo.homeAll}>
              <Home className="mr-1 h-4 w-4" /> Home All
            </Button>
            <Button variant="outline" size="sm" onClick={() => servo.moveToPositions(getPickUpPositions())}>
              <Hand className="mr-1 h-4 w-4" /> Pick Up
            </Button>
          </div>
        </div>

        {/* Connection */}
        <ConnectionBar status={ws.status} onConnect={ws.connect} onDisconnect={ws.disconnect} />

        {/* Movement Settings */}
        <MovementSettings delay={servo.movementDelay} onDelayChange={servo.setMovementDelay} />

        {/* Hand Gesture Control */}
        <HandGestureControl
          enabled={handTracking.enabled}
          mode={handTracking.mode}
          sensitivity={handTracking.sensitivity}
          landmarks={handTracking.landmarks}
          onSetMode={handTracking.setMode}
          onSetSensitivity={handTracking.setSensitivity}
          onStart={handTracking.startTracking}
          onStop={handTracking.stopTracking}
        />

        {/* 3D Visualization + Arm Sliders side by side */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 3D Particle Visualization - sticky on desktop */}
          <div className="w-full lg:w-1/2 lg:sticky lg:top-4 lg:self-start">
            <ParticleArm3D
              positions={servo.positions}
              landmarks={handTracking.landmarks}
            />
          </div>

          {/* Arm Panels */}
          <div className="w-full lg:w-1/2 space-y-4">
            {arms.map(arm => (
              <ArmPanel
                key={arm.id}
                arm={arm}
                positions={servo.positions}
                movingPin={servo.movingPin}
                onServoChange={servo.setSingleServo}
                onHomeArm={servo.homeArm}
              />
            ))}
          </div>
        </div>

        {/* Saved Poses */}
        <SavedPoses
          poses={poseManager.poses}
          onSave={poseManager.savePose}
          onRecall={servo.moveToPositions}
          onDelete={poseManager.deletePose}
          currentPositions={servo.positions}
        />

        {/* Sequence Recorder */}
        <SequenceRecorder
          sequences={sequencer.sequences}
          isRecording={sequencer.isRecording}
          isPlaying={sequencer.isPlaying}
          speed={sequencer.speed}
          loop={sequencer.loop}
          onStartRecording={sequencer.startRecording}
          onCaptureStep={sequencer.captureStep}
          onStopRecording={sequencer.stopRecording}
          onPlay={sequencer.playSequence}
          onStopPlayback={sequencer.stopPlayback}
          onSetSpeed={sequencer.setSpeed}
          onSetLoop={sequencer.setLoop}
          onDelete={sequencer.deleteSequence}
        />

        {/* Arduino Guide */}
        <ArduinoGuide />
      </div>
    </div>
  );
};

export default Index;

import { useWebSocket } from '@/hooks/useWebSocket';
import { useServoControl } from '@/hooks/useServoControl';
import { usePoseManager } from '@/hooks/usePoseManager';
import { useSequenceRecorder } from '@/hooks/useSequenceRecorder';
import { useHandTracking } from '@/hooks/useHandTracking';
import { arms, getPickUpPositions } from '@/config/servoConfig';
import { ConnectionBar } from '@/components/ConnectionBar';
import { ArmPanel } from '@/components/ArmPanel';
import { SavedPoses } from '@/components/SavedPoses';
import { SequenceRecorder } from '@/components/SequenceRecorder';
import { MovementSettings } from '@/components/MovementSettings';
import { ArduinoGuide } from '@/components/ArduinoGuide';
import { HandGestureControl } from '@/components/HandGestureControl';
import { ParticleArm3D } from '@/components/ParticleArm3D';
import { Button } from '@/components/ui/button';
import { Activity, Bot, Hand, Home, Radar, Workflow } from 'lucide-react';

const Index = () => {
  const ws = useWebSocket();
  const servo = useServoControl(ws.sendCommand);
  const poseManager = usePoseManager();
  const sequencer = useSequenceRecorder(servo.positions, servo.moveToPositions);
  const handTracking = useHandTracking(servo.setSingleServo, servo.movementDelay);

  const detectedHands = Number(Boolean(handTracking.landmarks.left)) + Number(Boolean(handTracking.landmarks.right));

  return (
    <div className="min-h-screen bg-background">
      <div className="app-shell mx-auto max-w-7xl px-4 py-4 md:px-6 md:py-6">
        <header className="hero-panel mb-4 p-4 md:p-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="section-kicker">Dual Robotics Command Center</div>
              <div className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                  Dual Robotic Arm Controller
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                  Live servo control, gesture guidance, and motion workflows for a mirrored 6-DOF arm pair running on Arduino UNO R4 WiFi + PCA9685.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="status-pill">
                  <Activity className="h-3.5 w-3.5 text-primary" />
                  Socket {ws.status}
                </span>
                <span className="status-pill">
                  <Radar className="h-3.5 w-3.5 text-accent" />
                  {handTracking.enabled ? 'Gesture live' : 'Gesture standby'}
                </span>
                <span className="status-pill">
                  <Bot className="h-3.5 w-3.5 text-arm-left" />
                  Sequential servo mode
                </span>
                <span className="status-pill">
                  <Workflow className="h-3.5 w-3.5 text-arm-right" />
                  {detectedHands} hand{detectedHands === 1 ? '' : 's'} detected
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 xl:min-w-[300px] xl:items-end">
              <div className="grid w-full gap-2 sm:grid-cols-2 xl:w-auto">
                <Button className="h-11 px-5" onClick={servo.homeAll}>
                  <Home className="mr-2 h-4 w-4" /> Home All
                </Button>
                <Button variant="secondary" className="h-11 px-5" onClick={() => servo.moveToPositions(getPickUpPositions())}>
                  <Hand className="mr-2 h-4 w-4" /> Pick Up
                </Button>
              </div>
              <div className="grid w-full grid-cols-3 gap-2 text-left xl:w-[360px]">
                <div className="telemetry-card">
                  <span className="telemetry-label">Left arm</span>
                  <span className="telemetry-value">Pins 0-5</span>
                </div>
                <div className="telemetry-card">
                  <span className="telemetry-label">Right arm</span>
                  <span className="telemetry-value">Pins 10-15</span>
                </div>
                <div className="telemetry-card">
                  <span className="telemetry-label">Delay</span>
                  <span className="telemetry-value">{servo.movementDelay}ms</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <ConnectionBar status={ws.status} onConnect={ws.connect} onDisconnect={ws.disconnect} />

        <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div>
                <div className="section-kicker">Live Simulation</div>
                <p className="text-sm text-muted-foreground">Cinematic particle model with mirrored arm telemetry and gesture overlays.</p>
              </div>
            </div>
            <ParticleArm3D positions={servo.positions} landmarks={handTracking.landmarks} />
          </div>

          <div className="space-y-4 xl:pt-8">
            <MovementSettings delay={servo.movementDelay} onDelayChange={servo.setMovementDelay} />
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
          </div>
        </section>

        <section className="mt-6 space-y-4">
          <div className="flex flex-col gap-2 px-1 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="section-kicker">Servo Console</div>
              <h2 className="text-2xl font-semibold text-foreground">Dual arm control decks</h2>
            </div>
            <p className="max-w-xl text-sm text-muted-foreground">
              Tight, scan-friendly panels for rapid joint edits while preserving single-servo power safety.
            </p>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {arms.map((arm) => (
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
        </section>

        <section className="mt-6 space-y-4">
          <div className="px-1">
            <div className="section-kicker">Workflow</div>
            <h2 className="text-2xl font-semibold text-foreground">Saved motion tools</h2>
          </div>
          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <SavedPoses
              poses={poseManager.poses}
              onSave={poseManager.savePose}
              onRecall={servo.moveToPositions}
              onDelete={poseManager.deletePose}
              currentPositions={servo.positions}
            />
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
          </div>
        </section>

        <section className="mt-6">
          <ArduinoGuide />
        </section>
      </div>
    </div>
  );
};

export default Index;

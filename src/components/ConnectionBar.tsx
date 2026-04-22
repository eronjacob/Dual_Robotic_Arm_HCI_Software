import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wifi, WifiOff, Loader2, Router, ShieldCheck } from 'lucide-react';
import { ConnectionStatus } from '@/hooks/useWebSocket';

interface ConnectionBarProps {
  status: ConnectionStatus;
  onConnect: (ip: string) => void;
  onDisconnect: () => void;
}

const statusConfig: Record<ConnectionStatus, { label: string; tone: string; helper: string }> = {
  disconnected: { label: 'Disconnected', tone: 'bg-muted', helper: 'Controller is idle until an Arduino target is connected.' },
  connecting: { label: 'Connecting', tone: 'bg-warning animate-breathe', helper: 'Negotiating WebSocket link to the arm controller.' },
  connected: { label: 'Connected', tone: 'bg-success animate-breathe', helper: 'Live commands are ready to stream to the robotic arms.' },
  error: { label: 'Error', tone: 'bg-destructive', helper: 'Connection failed. Verify IP, power, and Wi-Fi reachability.' },
};

export const ConnectionBar = ({ status, onConnect, onDisconnect }: ConnectionBarProps) => {
  const [ip, setIp] = useState('192.168.1.100');
  const cfg = statusConfig[status];

  return (
    <section className="panel-shell px-4 py-3 md:px-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-md border border-border/70 bg-background/60 p-2 text-muted-foreground">
              <Router className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <span className={`h-2.5 w-2.5 rounded-full ${cfg.tone}`} />
                {cfg.label}
              </div>
              <p className="text-xs text-muted-foreground">{cfg.helper}</p>
            </div>
          </div>
          <span className="status-pill w-fit">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" />
            Port 81 · protected sequential movement
          </span>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="Arduino IP"
            className="h-10 w-full border-border/70 bg-background/50 font-mono text-sm sm:w-52"
          />
          {status === 'connected' ? (
            <Button variant="outline" className="h-10" onClick={onDisconnect}>
              <WifiOff className="mr-2 h-4 w-4" /> Disconnect
            </Button>
          ) : (
            <Button className="h-10" onClick={() => onConnect(ip)} disabled={status === 'connecting'}>
              {status === 'connecting' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wifi className="mr-2 h-4 w-4" />
              )}
              Connect Controller
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { ConnectionStatus } from '@/hooks/useWebSocket';

interface ConnectionBarProps {
  status: ConnectionStatus;
  onConnect: (ip: string) => void;
  onDisconnect: () => void;
}

const statusConfig: Record<ConnectionStatus, { label: string; color: string }> = {
  disconnected: { label: 'Disconnected', color: 'bg-muted-foreground' },
  connecting: { label: 'Connecting...', color: 'bg-warning animate-pulse' },
  connected: { label: 'Connected', color: 'bg-success' },
  error: { label: 'Error', color: 'bg-destructive' },
};

export const ConnectionBar = ({ status, onConnect, onDisconnect }: ConnectionBarProps) => {
  const [ip, setIp] = useState('192.168.1.100');
  const cfg = statusConfig[status];

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      <div className="flex items-center gap-2">
        <div className={`h-3 w-3 rounded-full ${cfg.color}`} />
        <span className="text-sm text-muted-foreground">{cfg.label}</span>
      </div>
      <Input
        value={ip}
        onChange={e => setIp(e.target.value)}
        placeholder="Arduino IP"
        className="w-48 font-mono text-sm"
      />
      {status === 'connected' ? (
        <Button variant="outline" size="sm" onClick={onDisconnect}>
          <WifiOff className="mr-1 h-4 w-4" /> Disconnect
        </Button>
      ) : (
        <Button size="sm" onClick={() => onConnect(ip)} disabled={status === 'connecting'}>
          {status === 'connecting' ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            <Wifi className="mr-1 h-4 w-4" />
          )}
          Connect
        </Button>
      )}
    </div>
  );
};

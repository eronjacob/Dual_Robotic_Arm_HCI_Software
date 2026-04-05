import { useState, useRef, useCallback } from 'react';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export const useWebSocket = () => {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback((ip: string) => {
    if (wsRef.current) wsRef.current.close();
    setStatus('connecting');
    try {
      const ws = new WebSocket(`ws://${ip}:81`);
      ws.onopen = () => setStatus('connected');
      ws.onclose = () => setStatus('disconnected');
      ws.onerror = () => setStatus('error');
      wsRef.current = ws;
    } catch {
      setStatus('error');
    }
  }, []);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
    setStatus('disconnected');
  }, []);

  const sendCommand = useCallback((pin: number, angle: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ pin, angle }));
    }
  }, []);

  return { status, connect, disconnect, sendCommand };
};

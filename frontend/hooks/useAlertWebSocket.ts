import { useState, useEffect, useRef } from 'react';
import { Alert, DetectionEvent } from '../lib/types';

interface WebSocketMessage {
  type: 'ALERT' | 'DETECTION' | 'PING';
  data: Alert | DetectionEvent | any;
}

export function useAlertWebSocket(onNewAlert?: (alert: Alert) => void, onDetection?: (detection: DetectionEvent) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastAlert, setLastAlert] = useState<Alert | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let reconnectTimer: NodeJS.Timeout;

    const connectWS = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const token = typeof window !== 'undefined' ? (localStorage.getItem('sentinel_token') || localStorage.getItem('token') || '') : '';
        const queryParam = token ? `?token=${encodeURIComponent(token)}` : '';
        const wsUrl = `${protocol}//${window.location.hostname}:8000/ws/alerts${queryParam}`;
        
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;


        ws.onopen = () => {
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const msg: WebSocketMessage = JSON.parse(event.data);
            if (msg.type === 'ALERT') {
              const alert = msg.data as Alert;
              setLastAlert(alert);
              if (onNewAlert) onNewAlert(alert);
            } else if (msg.type === 'DETECTION') {
              const detection = msg.data as DetectionEvent;
              if (onDetection) onDetection(detection);
            }
          } catch (e) {
            console.error('Error parsing WebSocket message:', e);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          // Try reconnecting after 3 seconds
          reconnectTimer = setTimeout(connectWS, 3000);
        };

        ws.onerror = () => {
          setIsConnected(false);
        };
      } catch (err) {
        setIsConnected(false);
        reconnectTimer = setTimeout(connectWS, 3000);
      }
    };

    connectWS();

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return { isConnected, lastAlert };
}

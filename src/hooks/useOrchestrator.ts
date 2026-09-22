import { useState, useEffect, useCallback, useRef } from 'react';
import { ControllerStatusResponse } from '../types/orchestrator.js';
import { fetchControllerStatus } from '../services/api.js';

export function useOrchestrator() {
  const [status, setStatus] = useState<ControllerStatusResponse | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const wsRef = useRef<WebSocket | null>(null);

  const fetchManual = useCallback(async () => {
    try {
      const data = await fetchControllerStatus();
      setStatus(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to poll controller');
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchManual();

    // WebSocket connection
    let isMounted = true;
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connect = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/runtime`;
        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (isMounted) {
            setIsConnected(true);
            setError(null);
          }
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'STATUS_UPDATE' && msg.data) {
              setStatus(msg.data);
              setLastUpdated(new Date());
            }
          } catch (e) {
            console.error('Error parsing WS message', e);
          }
        };

        ws.onerror = (e) => {
          if (isMounted) {
            setIsConnected(false);
          }
        };

        ws.onclose = () => {
          if (isMounted) {
            setIsConnected(false);
            // Reconnect after 3s
            reconnectTimeout = setTimeout(connect, 3000);
          }
        };
      } catch (err) {
        if (isMounted) {
          setIsConnected(false);
          reconnectTimeout = setTimeout(connect, 3000);
        }
      }
    };

    connect();

    // Secondary safety poll every 2.5 seconds in case of WS delay or missed packet
    const pollInterval = setInterval(() => {
      if (isMounted) {
        fetchManual();
      }
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, [fetchManual]);

  return {
    status,
    isConnected,
    error,
    lastUpdated,
    refresh: fetchManual
  };
}

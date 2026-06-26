import { useEffect, useRef, useCallback } from "react";

interface WsMessage {
  type: string;
  [key: string]: unknown;
}

type Handler = (msg: WsMessage) => void;

export function useWebSocket(token: string | null, handlers: Record<string, Handler>) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const connect = useCallback(() => {
    if (!token || token === "demo-token") return;
    const proto = location.protocol === "https:" ? "wss:" : "ws:";
    const url = `${proto}//${location.host}/ws?token=${encodeURIComponent(token)}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.debug("[ws] connected");
    };

    ws.onmessage = (event) => {
      try {
        const msg: WsMessage = JSON.parse(event.data);
        const handler = handlersRef.current[msg.type];
        if (handler) handler(msg);
      } catch {
        /* ignore malformed messages */
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
      reconnectRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [token]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };
  }, [connect]);

  return wsRef;
}

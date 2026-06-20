import { useEffect, useRef, useCallback, useState } from 'react'
import { useAuthStore } from './use-auth'
import { toast } from 'sonner'

export interface WSMessage {
  type: string
  [key: string]: unknown
}

export function useWebSocket(onMessage?: (msg: WSMessage) => void) {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const { accessToken } = useAuthStore()
  const [connected, setConnected] = useState(false)

  const connect = useCallback(() => {
    if (!accessToken) return

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/ws?token=${accessToken}`

    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send('ping')
        }
      }, 30000)
    }

    ws.onmessage = (event) => {
      const msg: WSMessage = JSON.parse(event.data)
      if (msg.type === 'low_stock_alert') {
        toast.warning(
          `Low Stock: ${msg.product_name} (SKU: ${msg.sku})`,
          { description: `Only ${msg.current_stock} units remaining in warehouse` },
        )
      }
      onMessage?.(msg)
    }

    ws.onclose = () => {
      setConnected(false)
      clearInterval(pingIntervalRef.current)
      reconnectTimeoutRef.current = setTimeout(connect, 5000)
    }

    ws.onerror = () => {
      ws.close()
    }
  }, [accessToken, onMessage])

  useEffect(() => {
    connect()
    return () => {
      wsRef.current?.close()
      clearTimeout(reconnectTimeoutRef.current)
      clearInterval(pingIntervalRef.current)
    }
  }, [connect])

  return { wsRef, connected }
}

import { useEffect, useRef, useState } from 'react'
import * as signalR from '@microsoft/signalr'
import { AUTH_URL } from '../../../lib/auth-client'

export function useNotarizationSignal(sessionId: string) {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null)
  const [isJoined, setIsJoined] = useState(false)
  const onSignalRef = useRef<(signal: any) => void>(() => {})
  const onUserJoinedRef = useRef<() => void>(() => {})

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${AUTH_URL}/hubs/notarization`, {
        // SignalR authorization often needs the token explicitly in the query or header
        // Since we are using cookies with Better Auth, it might just work if we set credentials
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build()

    setConnection(newConnection)
  }, [])

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          console.log('[SignalR] Connected')
          
          connection.on('ReceiveSignal', (signal: string) => {
            onSignalRef.current(JSON.parse(signal))
          })

          connection.on('UserJoined', () => {
            onUserJoinedRef.current()
          })

          connection.invoke('JoinSession', sessionId).then(() => {
            setIsJoined(true)
          })
        })
        .catch((err) => console.error('[SignalR] Connection Error: ', err))

      return () => {
        connection.stop()
      }
    }
  }, [connection, sessionId])

  const sendSignal = async (signal: any) => {
    if (connection && isJoined) {
      await connection.invoke('SendSignal', sessionId, JSON.stringify(signal))
    }
  }

  return {
    sendSignal,
    onSignal: (cb: (signal: any) => void) => { onSignalRef.current = cb },
    onUserJoined: (cb: () => void) => { onUserJoinedRef.current = cb },
    isJoined
  }
}

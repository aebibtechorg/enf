import SumsubWebSdk from '@sumsub/websdk-react'
import { useState, useEffect } from 'react'
import { fetchApi, API_URL } from '../../../lib/api'
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr'

interface SumsubEkycProps {
  onSuccess: (inspectionId: string) => void
  onMessage?: (type: string, payload: any) => void
  onError?: (error: any) => void
}

export function SumsubEkyc({ onSuccess, onMessage, onError }: SumsubEkycProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [connection, setConnection] = useState<HubConnection | null>(null)

  useEffect(() => {
    async function getEkycToken() {
      try {
        const data = await fetchApi<{ token: string }>('/api/users/me/ekyc-token', {
          method: 'POST'
        })
        setAccessToken(data.token)
      } catch (err) {
        console.error('Failed to get eKYC token', err)
        setError('Failed to initialize identity verification.')
        onError?.(err)
      }
    }

    getEkycToken()

    const newConnection = new HubConnectionBuilder()
      .withUrl(`${API_URL}/hubs/notarization`, { withCredentials: true })
      .withAutomaticReconnect()
      .build()

    newConnection.start().then(() => {
      console.log('[SignalR] Connected to NotarizationHub for eKYC updates')
      
      newConnection.on('EkycVerified', (_userId: string, inspectionId: string) => {
        console.log('[eKYC] Verified via SignalR:', inspectionId)
        onSuccess(inspectionId)
      })
      
      newConnection.on('EkycRejected', () => {
        console.warn('[eKYC] Rejected via SignalR')
        setError('Verification rejected. Please check your documents and try again.')
      })
    }).catch(err => console.error('[SignalR] Connection Error: ', err))

    setConnection(newConnection)

    return () => {
      newConnection.stop()
    }
  }, [onSuccess, onError])

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-lg border border-red-200 max-w-md mx-auto my-8">
        <h3 className="font-bold text-lg mb-2">Verification Error</h3>
        <p className="mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!accessToken) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
        <p className="text-slate-600 font-medium">Initializing secure verification session...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden my-8">
      <div className="bg-slate-50 p-4 border-b border-slate-200">
        <h2 className="text-xl font-semibold text-slate-800">Identity Verification</h2>
        <p className="text-sm text-slate-500">Secured by Sumsub. Required for Remote Electronic Notarization.</p>
      </div>
      <div className="min-h-[600px]">
        <SumsubWebSdk
          accessToken={accessToken}
          expirationHandler={() => Promise.resolve(accessToken)}
          onMessage={(type, payload) => {
            console.log('[Sumsub SDK Message]:', type, payload)
            onMessage?.(type, payload)
          }}
          onError={(err) => {
            console.error('[Sumsub SDK Error]:', err)
            setError('The verification component failed to load.')
            onError?.(err)
          }}
          config={{
            lang: 'en',
            i18n: {
              en: {
                'step.personal-details.title': 'Identity Verification',
              }
            },
            uiConf: {
              customCssStr: ':root { --accent-color: #0f172a; }'
            }
          }}
        />
      </div>
    </div>
  )
}

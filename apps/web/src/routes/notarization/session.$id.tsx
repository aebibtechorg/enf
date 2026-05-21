import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { useSession, useJoinSession, useSignDocument, useCompleteNotarization } from '../../features/notarization/hooks/useNotarization'
import { useNotarizationSignal } from '../../features/notarization/hooks/useNotarizationSignal'
import { useAuth } from '../../features/auth/hooks/useAuth'
import Peer from 'simple-peer'

export const Route = createFileRoute('/notarization/session/$id')({
  component: SessionPage,
})

function SessionPage() {
  const { id } = Route.useParams()
  const { user } = useAuth()
  const { data: session, isLoading } = useSession(id)
  const joinSession = useJoinSession()
  const signDocument = useSignDocument()
  const completeNotarization = useCompleteNotarization()
  const [hasJoined, setHasJoined] = useState(false)
  const [location, setLocation] = useState<string | null>(null)
  
  // Real-time & WebRTC
  const { sendSignal, onSignal, onUserJoined, isJoined: signalRJoined } = useNotarizationSignal(id)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const peerRef = useRef<Peer.Instance | null>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  
  // Recording
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    if (session?.geolocationVerified) {
      setHasJoined(true)
    }
  }, [session])

  useEffect(() => {
    if (hasJoined) {
      void startLocalStream()
    }
    return () => {
      stream?.getTracks().forEach(track => track.stop())
    }
  }, [hasJoined])

  const startLocalStream = async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 }, // Rule VII, Sec 2, h
        audio: true
      })
      setStream(media)
      if (localVideoRef.current) localVideoRef.current.srcObject = media
    } catch (err) {
      console.error('Failed to get local stream', err)
    }
  }

  useEffect(() => {
    if (stream && signalRJoined) {
      onUserJoined(() => {
        // I am the initiator because someone else just joined
        console.log('[WebRTC] User joined, initiating peer connection')
        initiatePeer(true)
      })

      onSignal((signal) => {
        console.log('[WebRTC] Received signal')
        if (!peerRef.current) {
          // I am not the initiator, but I got a signal, so I'll create peer
          initiatePeer(false)
        }
        peerRef.current?.signal(signal)
      })
    }
  }, [stream, signalRJoined])

  const initiatePeer = (initiator: boolean) => {
    if (peerRef.current) peerRef.current.destroy()

    const peer = new Peer({
      initiator,
      trickle: false,
      stream: stream!
    })

    peer.on('signal', (data) => {
      void sendSignal(data)
    })

    peer.on('stream', (remoteMediaStream) => {
      console.log('[WebRTC] Received remote stream')
      setRemoteStream(remoteMediaStream)
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteMediaStream
    })

    peer.on('error', (err) => console.error('[WebRTC] Peer error', err))

    peerRef.current = peer
  }

  const startRecording = () => {
    if (!stream) return
    recordedChunksRef.current = []
    
    // In a real app, we might want to capture both local and remote streams
    // For now, we'll record the local stream as a baseline implementation
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' })
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data)
    }
    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `notarization-session-${id}.webm`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    }
    recorder.start()
    mediaRecorderRef.current = recorder
    setIsRecording(true)
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  const handleJoin = async () => {
    const mockLocation = "14.5995° N, 120.9842° E (Manila, Philippines)"
    setLocation(mockLocation)
    await joinSession.mutateAsync({ id, location: mockLocation })
    setHasJoined(true)
  }

  if (isLoading) return <div className="p-10 text-center">Loading session...</div>
  if (!session) return <div className="p-10 text-center">Session not found.</div>

  const isEnp = user?.id === session.enpId

  if (!hasJoined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 p-6">
        <div className="w-full max-w-md space-y-8 rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">Join Notarization Session</h1>
          <p className="text-stone-600">
            To proceed, we must verify your current geolocation as required by the Supreme Court Rules on Electronic Notarization.
          </p>
          <button
            onClick={handleJoin}
            disabled={joinSession.isPending}
            className="w-full rounded-2xl bg-stone-900 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
          >
            {joinSession.isPending ? 'Verifying...' : 'Verify Location & Join'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-stone-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-stone-800 px-6 py-4">
        <div className="flex items-center gap-4">
          <span className="rounded-full bg-red-500 px-2 py-1 text-[10px] font-bold uppercase">Live</span>
          <h1 className="text-sm font-medium">Session: {session.id.slice(0, 8)}...</h1>
        </div>
        <div className="flex items-center gap-4 text-xs text-stone-400">
          <span>{isEnp ? 'Acting as Electronic Notary Public' : 'Acting as Principal'}</span>
          <div className="h-4 w-px bg-stone-800"></div>
          <span>{location || session.principalLocation}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Video Area */}
        <div className="relative flex flex-1 flex-col items-center justify-center bg-black p-4">
          <div className="grid h-full w-full gap-4 md:grid-cols-2">
            {/* ENP Video */}
            <div className="relative flex items-center justify-center overflow-hidden rounded-3xl bg-stone-800">
              <video 
                ref={isEnp ? localVideoRef : remoteVideoRef}
                autoPlay 
                playsInline 
                className="h-full w-full object-cover grayscale-[0.2] brightness-90"
              />
              {! (isEnp ? stream : remoteStream) && <span className="absolute text-stone-500">Waiting for ENP...</span>}
              <div className="absolute bottom-4 left-4 rounded-lg bg-black/40 px-2 py-1 text-[10px]">
                {session.enpId === user?.id ? 'You (ENP)' : 'Electronic Notary Public'}
              </div>
            </div>
            {/* Principal Video */}
            <div className="relative flex items-center justify-center overflow-hidden rounded-3xl bg-stone-800">
              <video 
                ref={!isEnp ? localVideoRef : remoteVideoRef}
                autoPlay 
                playsInline 
                className="h-full w-full object-cover grayscale-[0.2] brightness-90"
              />
              {! (!isEnp ? stream : remoteStream) && <span className="absolute text-stone-500">Waiting for Principal...</span>}
              <div className="absolute bottom-4 left-4 rounded-lg bg-black/40 px-2 py-1 text-[10px]">
                {session.principalId === user?.id ? 'You (Principal)' : 'Principal'}
              </div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="absolute bottom-10 flex gap-4">
             <button className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-800 hover:bg-stone-700">
                <MicIcon />
             </button>
             <button className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-800 hover:bg-stone-700">
                <VideoIcon />
             </button>
             <button 
                onClick={isRecording ? stopRecording : startRecording}
                className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-stone-800 hover:bg-stone-700'}`}
             >
                <CircleIcon fill={isRecording ? 'currentColor' : 'none'} />
             </button>
             <button className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 hover:bg-red-500">
                <PhoneOffIcon />
             </button>
          </div>
        </div>

        {/* Sidebar / Document Viewer */}
        <div className="flex w-96 flex-col border-l border-stone-800 bg-stone-900">
          <div className="p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">Documents</h2>
            <div className="mt-4 space-y-4">
              {session.documents.map((doc) => (
                <div key={doc.id} className="rounded-2xl border border-stone-800 bg-stone-800/50 p-4">
                  <div className="flex items-center gap-3">
                    <FileIcon />
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium">{doc.fileName}</p>
                      <p className="text-[10px] text-stone-500 uppercase">
                        Status: {getDocumentStatusLabel(doc.status)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-col gap-2">
                    <button className="w-full rounded-xl bg-stone-700 py-2 text-xs font-medium hover:bg-stone-600">
                      View Document
                    </button>
                    
                    {!isEnp && doc.status === 0 && (
                      <button
                        onClick={() => signDocument.mutate(doc.id)}
                        disabled={signDocument.isPending}
                        className="w-full rounded-xl bg-blue-600 py-2 text-xs font-medium hover:bg-blue-500 disabled:opacity-50"
                      >
                        {signDocument.isPending ? 'Signing...' : 'Sign Document'}
                      </button>
                    )}

                    {isEnp && doc.status === 1 && (
                      <button
                        onClick={() => completeNotarization.mutate(doc.id)}
                        disabled={completeNotarization.isPending}
                        className="w-full rounded-xl bg-green-600 py-2 text-xs font-medium hover:bg-green-500 disabled:opacity-50"
                      >
                        {completeNotarization.isPending ? 'Sealing...' : 'Finalize & Seal'}
                      </button>
                    )}

                    {doc.status === 3 && (
                        <a 
                          href={`/api/files/${doc.pdfAFileId}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="w-full rounded-xl bg-stone-200 py-2 text-center text-xs font-medium text-stone-900 hover:bg-white"
                        >
                          Download Certificate
                        </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-auto border-t border-stone-800 p-6">
            <p className="text-[10px] text-stone-500">
              Rule IV, Sec 8: All electronic notarial sessions are recorded and may be downloaded by the principal.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

function getDocumentStatusLabel(status: number) {
  switch (status) {
    case 0: return 'Uploaded'
    case 1: return 'Signed by Principal'
    case 2: return 'Signed by ENP'
    case 3: return 'Completed'
    case 4: return 'Rejected'
    default: return 'Unknown'
  }
}

// Icons
function MicIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg> }
function VideoIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg> }
function CircleIcon({ fill = 'none' }: { fill?: string }) { return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg> }
function PhoneOffIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.62A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="23" x2="1" y1="1" y2="23"/></svg> }
function FileIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg> }

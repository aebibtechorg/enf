import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useVerifyDocument } from '../features/notarization/hooks/useNotarization'

export const Route = createFileRoute('/verify')({
  component: VerifyPage,
})

function VerifyPage() {
  const [docId, setDocId] = useState('')
  const [searchId, setSearchId] = useState<string | null>(null)
  const { data: result, isLoading, isError, error } = useVerifyDocument(searchId || '')

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault()
    if (docId.trim()) {
      setSearchId(docId.trim())
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 p-6 md:p-12">
      <div className="mx-auto w-full max-w-2xl space-y-12">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-stone-900 text-white">
            <ShieldCheckIcon />
          </div>
          <h1 className="text-4xl font-bold text-stone-900">Document Verification</h1>
          <p className="mt-4 text-lg text-stone-600">
            Verify the authenticity and status of documents electronically notarized in the Philippines.
          </p>
        </div>

        <form onSubmit={handleVerify} className="flex gap-4">
          <input
            type="text"
            className="flex-1 rounded-2xl border border-stone-200 bg-white px-6 py-4 text-stone-900 outline-none transition focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
            placeholder="Enter Document ID (UUID)..."
            value={docId}
            onChange={(e) => setDocId(e.target.value)}
          />
          <button
            type="submit"
            disabled={isLoading || !docId.trim()}
            className="rounded-2xl bg-stone-900 px-8 py-4 font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </button>
        </form>

        {result && result.verified && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="rounded-3xl border border-green-200 bg-green-50 p-8">
              <div className="flex items-center gap-4 text-green-700">
                <CheckCircleIcon />
                <h2 className="text-2xl font-bold">Document Verified</h2>
              </div>
              
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <Detail label="Document Title" value={result.fileName} />
                <Detail label="Principal" value={result.principalName} />
                <Detail label="Notary Public" value={result.enpName} />
                <Detail label="Notarization Date" value={new Date(result.completedAt).toLocaleString()} />
              </div>

              <div className="mt-8 border-t border-green-200 pt-6">
                <a 
                  href={`/api/files/${result.certificateId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 font-bold text-green-700 hover:underline"
                >
                  <DownloadIcon />
                  Download Official Certificate (PDF/A)
                </a>
              </div>
            </div>
          </div>
        )}

        {searchId && !isLoading && (isError || (result && !result.verified)) && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
             <h2 className="text-xl font-bold">Verification Failed</h2>
             <p className="mt-2 text-sm">
                The document ID provided could not be verified. Ensure the ID is correct and the notarization process has been completed.
             </p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
           <InfoCard 
             title="How it works" 
             text="Each electronically notarized document is assigned a unique tracking ID. This portal validates that ID against the Supreme Court's secure records." 
           />
           <InfoCard 
             title="Tamper-Evidence" 
             text="Documents are converted to PDF/A format with embedded digital signatures. Any alteration to the document will invalidate its digital seal." 
           />
        </div>
      </div>
    </div>
  )
}

function Detail({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-green-800/50">{label}</p>
      <p className="mt-1 text-sm font-medium text-stone-900">{value}</p>
    </div>
  )
}

function InfoCard({ title, text }: { title: string, text: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-bold uppercase tracking-widest text-stone-900">{title}</h3>
      <p className="mt-2 text-xs text-stone-500 leading-relaxed">{text}</p>
    </div>
  )
}

function ShieldCheckIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg> }
function CheckCircleIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> }
function DownloadIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg> }

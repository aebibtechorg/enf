import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { fetchApi } from '../../lib/api'

export const Route = createFileRoute('/schedule/$enpId')({
  component: PublicSchedulingPage,
})

function PublicSchedulingPage() {
  const { enpId } = Route.useParams()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // In a real implementation, we would upload the file first if present
      let fileId = null
      if (file) {
        // Mock file upload
        console.log('Uploading draft document:', file.name)
        fileId = `draft-${Date.now()}`
      }

      await fetchApi('/api/notarization/public-schedule', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          enpId,
          draftFileId: fileId,
        }),
      })

      setIsSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule session')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 p-6">
        <div className="w-full max-w-md space-y-6 rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckIcon />
          </div>
          <h1 className="text-2xl font-semibold text-stone-900">Session Requested</h1>
          <p className="text-stone-600">
            Your request for a notarization session has been sent. Check your email (<strong>{formData.email}</strong>) for a Magic Link and further instructions once the ENP confirms your appointment.
          </p>
          <Link 
            to="/" 
            className="inline-block text-sm font-medium text-stone-500 hover:text-stone-900"
          >
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 p-6 md:p-12">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-stone-900">Schedule Notarization</h1>
          <p className="text-stone-600">
            Request a secure Remote Electronic Notarization (REN) session.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <div className="grid gap-6 md:grid-cols-2">
            <InputField
              label="Full Name"
              required
              value={formData.name}
              onChange={(v: string) => setFormData({ ...formData, name: v })}
            />
            <InputField
              label="Email Address"
              type="email"
              required
              value={formData.email}
              onChange={(v: string) => setFormData({ ...formData, email: v })}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <InputField
              label="Mobile Number (for OTP)"
              required
              placeholder="+63"
              value={formData.phone}
              onChange={(v: string) => setFormData({ ...formData, phone: v })}
            />
            <div className="grid grid-cols-2 gap-2">
              <InputField
                label="Date"
                type="date"
                required
                value={formData.date}
                onChange={(v: string) => setFormData({ ...formData, date: v })}
              />
              <InputField
                label="Time"
                type="time"
                required
                value={formData.time}
                onChange={(v: string) => setFormData({ ...formData, time: v })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Upload Draft Document (Optional)
            </label>
            <div className="relative rounded-2xl border-2 border-dashed border-stone-200 p-8 text-center transition hover:border-stone-400">
              <input
                type="file"
                accept=".pdf"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <div className="space-y-2">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-500">
                  <UploadIcon />
                </div>
                <p className="text-sm text-stone-600">
                  {file ? file.name : 'Click or drag PDF to upload a draft'}
                </p>
                <p className="text-[10px] text-stone-400 uppercase">PDF up to 10MB</p>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-stone-900 py-4 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting Request...' : 'Request Session'}
          </button>
        </form>

        <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-6 text-center">
           <p className="text-xs text-stone-400 leading-relaxed">
             A.M. No. 24-10-14-SC Compliance: This facility ensures that both In-Person and Remote Electronic Notarization (REN) sessions are conducted through secure, accredited infrastructure with synchronous audio-video interaction.
           </p>
        </div>
      </div>
    </div>
  )
}

function InputField({ label, value, onChange, type = 'text', required = false, placeholder = '' }: any) {
  return (
    <label className="block space-y-1 text-left">
      <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-900 focus:bg-white"
      />
    </label>
  )
}

function CheckIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
}

function UploadIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
}

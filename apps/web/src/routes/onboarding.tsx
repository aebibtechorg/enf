import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '../features/auth/hooks/useAuth'
import { fetchApi } from '../lib/api'

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
})

function OnboardingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    commissionNumber: '',
    commissionExpiry: '',
    rollNumber: '',
    ibpNumber: '',
    regularPlaceOfBusiness: '',
    watchedInstructionalVideo: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleApplyEnp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      await fetchApi('/api/users/apply-enp', {
        method: 'POST',
        body: JSON.stringify(formData),
      })
      void navigate({ to: '/dashboard' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Application failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 p-6">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-stone-900">
            ENP Application
          </h1>
          <p className="mt-2 text-stone-600">
            Provide your commission details to apply for Electronic Notary Public status.
          </p>
        </div>

        <form onSubmit={handleApplyEnp} className="mt-8 space-y-4">
          <div className="rounded-2xl bg-stone-900 p-6 text-white">
             <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest">Instructional Video</h3>
                {formData.watchedInstructionalVideo && (
                  <span className="text-[10px] bg-green-500 px-2 py-1 rounded-full font-bold">CERTIFIED</span>
                )}
             </div>
             <p className="mt-2 text-xs text-stone-400 leading-relaxed">
                Rule VI, Sec 2, g: You must view the on-demand instructional video before applying. This facility will certify your completion to the ENA.
             </p>
             <button 
               type="button"
               onClick={() => {
                 alert('Playing Instructional Video...')
                 setFormData({ ...formData, watchedInstructionalVideo: true })
               }}
               className="mt-4 w-full rounded-xl bg-white py-2 text-xs font-bold text-stone-900 hover:bg-stone-100"
             >
               Watch Video
             </button>
          </div>

          <InputField
            label="Commission Number"
            value={formData.commissionNumber}
            onChange={(v) => setFormData({ ...formData, commissionNumber: v })}
            required
          />
          <InputField
            label="Commission Expiry"
            type="date"
            value={formData.commissionExpiry}
            onChange={(v) => setFormData({ ...formData, commissionExpiry: v })}
            required
          />
          <InputField
            label="Roll Number"
            value={formData.rollNumber}
            onChange={(v) => setFormData({ ...formData, rollNumber: v })}
            required
          />
          <InputField
            label="IBP Number"
            value={formData.ibpNumber}
            onChange={(v) => setFormData({ ...formData, ibpNumber: v })}
            required
          />
          <InputField
            label="Regular Place of Business"
            value={formData.regularPlaceOfBusiness}
            onChange={(v) => setFormData({ ...formData, regularPlaceOfBusiness: v })}
            required
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting || !formData.watchedInstructionalVideo}
            className="mt-4 w-full rounded-2xl bg-stone-900 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Apply for ENP Status'}
          </button>
        </form>
      </div>
    </div>
  )
}

function InputField({ label, value, onChange, type = 'text', required = false }: any) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-stone-500">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-stone-200 px-4 py-2 text-sm outline-none transition focus:border-stone-900"
      />
    </label>
  )
}

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  )
}

function ScaleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>
  )
}

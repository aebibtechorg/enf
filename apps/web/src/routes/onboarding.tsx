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
  const [role, setRole] = useState<'principal' | 'enp' | null>(null)
  const [formData, setFormData] = useState({
    commissionNumber: '',
    commissionExpiry: '',
    rollNumber: '',
    ibpNumber: '',
    regularPlaceOfBusiness: '',
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

  const handlePrincipalVerify = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      // SC Rules Phase: Trigger identity verification and certificate issuance
      await fetchApi('/api/users/verify-identity', {
          method: 'POST'
      })
      void navigate({ to: '/dashboard' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 p-6">
        <div className="w-full max-w-2xl space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-stone-900">Welcome to the ENF</h1>
            <p className="mt-2 text-stone-600">Please select your primary role to continue.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <button
              onClick={() => setRole('principal')}
              className="group flex flex-col items-center rounded-3xl border border-stone-200 bg-white p-8 text-center transition hover:border-stone-900 hover:shadow-lg"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 group-hover:bg-stone-900 group-hover:text-white">
                <UserIcon />
              </div>
              <h2 className="text-xl font-semibold">I am a Principal</h2>
              <p className="mt-2 text-sm text-stone-500">I need to have documents notarized electronically.</p>
            </button>

            <button
              onClick={() => setRole('enp')}
              className="group flex flex-col items-center rounded-3xl border border-stone-200 bg-white p-8 text-center transition hover:border-stone-900 hover:shadow-lg"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 group-hover:bg-stone-900 group-hover:text-white">
                <ScaleIcon />
              </div>
              <h2 className="text-xl font-semibold">I am a Notary Public</h2>
              <p className="mt-2 text-sm text-stone-500">I am a commissioned ENP authorized to perform electronic notarization.</p>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 p-6">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <button onClick={() => setRole(null)} className="text-sm text-stone-500 hover:text-stone-900">
          ← Back
        </button>

        <div className="text-center">
          <h1 className="text-2xl font-semibold text-stone-900">
            {role === 'enp' ? 'ENP Application' : 'Principal Verification'}
          </h1>
          <p className="mt-2 text-stone-600">
            {role === 'enp' 
              ? 'Provide your commission details to apply for ENP status.' 
              : 'Complete your identity verification to start using the facility.'}
          </p>
        </div>

        {role === 'enp' ? (
          <form onSubmit={handleApplyEnp} className="mt-8 space-y-4">
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
              disabled={isSubmitting}
              className="mt-4 w-full rounded-2xl bg-stone-900 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Apply for ENP Status'}
            </button>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="rounded-2xl bg-stone-50 p-6 text-center">
              <p className="text-sm text-stone-600">
                You will be redirected to our e-KYC partner to verify your identity using a government-issued ID and liveness check.
              </p>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              onClick={handlePrincipalVerify}
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-stone-900 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
            >
              {isSubmitting ? 'Verifying...' : 'Begin Verification'}
            </button>
          </div>
        )}
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

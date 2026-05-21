import { createFileRoute } from '@tanstack/react-router'
import { useNotarialBook } from '../../features/notarization/hooks/useNotarization'
import { requireAuth } from '../../features/auth/lib/routeGuards'

export const Route = createFileRoute('/notarization/book')({
  beforeLoad: async ({ location }) => {
    await requireAuth(location.href)
  },
  component: NotarialBookPage,
})

function NotarialBookPage() {
  const { data: entries, isLoading } = useNotarialBook()

  if (isLoading) return <div className="p-10 text-center">Loading notarial book...</div>

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Electronic Notarial Book</h1>
          <p className="mt-1 text-stone-500">Official chronological record of your electronic notarial acts (Rule VIII).</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-stone-500">
            <tr>
              <th className="px-6 py-4 font-bold uppercase tracking-widest">Entry #</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest">Date & Time</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest">Notarial Act</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest">Document Title</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest">Principal</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest">Fee</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {entries?.map((entry) => (
              <tr key={entry.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-stone-900">{entry.entryNumber.toString().padStart(4, '0')}</td>
                <td className="px-6 py-4 text-stone-600">
                  {new Date(entry.performedAt).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-stone-100 px-2 py-1 text-[10px] font-bold uppercase text-stone-600">
                    {entry.notarialAct}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-stone-900">{entry.documentTitle}</td>
                <td className="px-6 py-4">
                   <p className="text-stone-900">Verified Principal</p>
                   <p className="text-[10px] text-stone-500">{entry.principalIdentityEvidence}</p>
                </td>
                <td className="px-6 py-4 font-medium">PHP {entry.feeCharged.toFixed(2)}</td>
                <td className="px-6 py-4">
                   <a 
                     href={`/api/files/${entry.notarizedFileId}`} 
                     target="_blank" 
                     rel="noreferrer"
                     className="text-stone-900 font-medium hover:underline"
                   >
                     View Certificate
                   </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {(!entries || entries.length === 0) && (
          <div className="p-20 text-center">
            <p className="text-stone-500">No entries in your notarial book yet.</p>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6">
        <h3 className="text-sm font-bold text-stone-900 uppercase tracking-widest">Compliance Note</h3>
        <p className="mt-2 text-xs text-stone-500 leading-relaxed">
          Rule VIII, Sec 3: During the Transitional Period, you must forward a certified electronic copy of this book to the ENA within the first 10 days of each month. This facility automatically archives and prepares these reports for your submission.
        </p>
      </div>
    </div>
  )
}

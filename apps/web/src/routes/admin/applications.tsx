import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '../../features/auth/lib/routeGuards'

export const Route = createFileRoute('/admin/applications')({
  beforeLoad: async ({ location }) => {
    await requireAuth(location.href)
  },
  component: AdminApplicationsPage,
})

function AdminApplicationsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">ENP Applications</h1>
        <p className="mt-1 text-stone-500">Review and commission new Electronic Notaries Public (Rule VI).</p>
      </div>

      <div className="rounded-3xl border border-stone-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
            <tr>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Applicant Details</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Commission Info</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Proficiency</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {[1, 2, 3, 4, 5].map(i => (
              <tr key={i} className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4">
                   <p className="font-bold text-stone-900">Atty. Maria Santos</p>
                   <p className="text-[10px] text-stone-400">Roll No. 7890{i}</p>
                   <p className="text-[10px] text-stone-400">IBP No. 12345{i}</p>
                </td>
                <td className="px-6 py-4">
                   <p className="text-xs text-stone-600">Pending Hearing</p>
                   <p className="text-[10px] text-stone-400 font-mono italic">Submitted: May {15 + i}, 2026</p>
                </td>
                <td className="px-6 py-4">
                   <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 uppercase">
                      <div className="h-1 w-1 rounded-full bg-green-600"></div>
                      Video Viewed
                   </span>
                </td>
                <td className="px-6 py-4">
                   <div className="flex gap-2">
                      <button className="rounded-lg bg-stone-900 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-stone-800 transition-colors uppercase tracking-widest">
                         Schedule Hearing
                      </button>
                      <button className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-[10px] font-bold text-stone-500 hover:bg-stone-50 transition-colors uppercase tracking-widest">
                         Review Certs
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

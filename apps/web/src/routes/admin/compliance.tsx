import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '../../features/auth/lib/routeGuards'

export const Route = createFileRoute('/admin/compliance')({
  beforeLoad: async ({ location }) => {
    await requireAuth(location.href)
  },
  component: AdminCompliancePage,
})

function AdminDirectoryPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Compliance & Audit</h1>
        <p className="mt-1 text-stone-500">Review monthly reports and security incidents (Rule VIII, Sec 3).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold text-stone-900">Monthly Notarial Book Submissions</h2>
          <div className="rounded-3xl border border-stone-200 bg-white overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">ENP</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Reporting Period</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Files</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {[1, 2, 3].map(i => (
                  <tr key={i} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4 font-bold">Atty. Elena Garcia</td>
                    <td className="px-6 py-4 text-xs text-stone-600">April 2026</td>
                    <td className="px-6 py-4 text-[10px] text-stone-400 uppercase">24 Notarizations</td>
                    <td className="px-6 py-4">
                       <button className="text-stone-900 font-bold hover:underline">Review Submission</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-stone-900">Incident Reports</h2>
          <div className="rounded-3xl border border-red-100 bg-red-50 p-6 space-y-4">
             <div className="flex items-start gap-3">
                <AlertIcon />
                <div>
                   <p className="text-sm font-bold text-red-900">No active incidents</p>
                   <p className="text-xs text-red-700">72-hour notifications for book damage or loss (Rule VIII, Sec 6) will appear here.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AdminCompliancePage() {
    return <AdminDirectoryPage />
}

function AlertIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
}

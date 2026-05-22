import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '../../features/auth/lib/routeGuards'

export const Route = createFileRoute('/admin/directory')({
  beforeLoad: async ({ location }) => {
    await requireAuth(location.href)
  },
  component: AdminDirectoryPage,
})

function AdminDirectoryPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">ENP Directory</h1>
          <p className="mt-1 text-stone-500">Search and manage commissioned Electronic Notaries Public (Rule V, Sec 3).</p>
        </div>
        <button className="rounded-2xl border border-stone-200 bg-white px-6 py-3 text-sm font-medium text-stone-900 hover:bg-stone-50 transition-colors">
          Export Public Directory
        </button>
      </div>

      <div className="flex gap-4">
         <input 
           type="text" 
           placeholder="Search by name, roll number, or IBP number..." 
           className="flex-1 rounded-2xl border border-stone-200 bg-white px-6 py-3 text-sm outline-none focus:border-stone-900 transition-colors"
         />
         <select className="rounded-2xl border border-stone-200 bg-white px-6 py-3 text-sm outline-none focus:border-stone-900">
            <option>All Statuses</option>
            <option>Active</option>
            <option>Suspended</option>
            <option>Revoked</option>
            <option>Resigned</option>
         </select>
      </div>

      <div className="rounded-3xl border border-stone-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
            <tr>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Electronic Notary Public</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Commission Term</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Jurisdiction</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {[1, 2, 3, 4, 5].map(i => (
              <tr key={i} className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4">
                   <p className="font-bold text-stone-900">Atty. Ricardo Dimagiba</p>
                   <p className="text-[10px] text-stone-400 font-mono">ENA-2026-000{i}</p>
                </td>
                <td className="px-6 py-4">
                   <p className="text-xs text-stone-600">Jan 1, 2026 - Dec 31, 2027</p>
                   <span className="mt-1 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 uppercase">Active</span>
                </td>
                <td className="px-6 py-4">
                   <p className="text-xs text-stone-600">Manila / Nationwide</p>
                   <p className="text-[10px] text-stone-400">Rule IV, Sec 9</p>
                </td>
                <td className="px-6 py-4">
                   <div className="flex gap-2">
                      <button className="rounded-lg bg-red-50 px-3 py-1.5 text-[10px] font-bold text-red-600 hover:bg-red-100 transition-colors uppercase tracking-widest">
                         Suspend
                      </button>
                      <button className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-[10px] font-bold text-stone-500 hover:bg-stone-50 transition-colors uppercase tracking-widest">
                         View Log
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

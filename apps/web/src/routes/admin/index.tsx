import { createFileRoute, Link } from '@tanstack/react-router'
import { requireAuth } from '../../features/auth/lib/routeGuards'

export const Route = createFileRoute('/admin/index')({
  beforeLoad: async ({ location }) => {
    await requireAuth(location.href)
  },
  component: AdminDashboard,
})

function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">ENA Administrator Dashboard</h1>
        <p className="mt-1 text-stone-500">Official Supreme Court oversight for electronic notarization (Rule V).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard title="Pending Applications" value="24" link="/admin/applications" />
        <AdminStatCard title="Active ENPs" value="1,240" link="/admin/directory" />
        <AdminStatCard title="Monthly Reports Due" value="15" link="/admin/compliance" />
        <AdminStatCard title="Incident Alerts" value="0" link="/admin/compliance" color="text-green-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-stone-900">Recent Applications</h2>
          <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
             <table className="w-full text-left text-sm">
                <thead className="bg-stone-50 text-stone-500">
                  <tr>
                    <th className="px-6 py-3 font-bold uppercase tracking-widest text-[10px]">Applicant</th>
                    <th className="px-6 py-3 font-bold uppercase tracking-widest text-[10px]">Date</th>
                    <th className="px-6 py-3 font-bold uppercase tracking-widest text-[10px]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {[1, 2, 3].map(i => (
                    <tr key={i} className="hover:bg-stone-50">
                      <td className="px-6 py-4">Atty. Juan Dela Cruz</td>
                      <td className="px-6 py-4">May {20 + i}, 2026</td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-bold text-yellow-700 uppercase">Pending Hearing</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
             <div className="p-4 bg-stone-50 border-t border-stone-100">
                <Link to="/admin/applications" className="text-xs font-bold text-stone-900 hover:underline uppercase tracking-widest">View all applications →</Link>
             </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-stone-900">System Oversight</h2>
          <div className="rounded-2xl border border-stone-200 bg-stone-900 p-8 text-white space-y-4">
             <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                   <ShieldIcon />
                </div>
                <div>
                   <h3 className="font-bold">Security Integrity Check</h3>
                   <p className="text-sm text-stone-400">All ENF providers are currently reporting 100% compliance with ISO/PDF-A standards.</p>
                </div>
             </div>
             <button className="w-full rounded-xl bg-white py-3 text-sm font-bold text-stone-900 hover:bg-stone-100">
                Run Global Audit
             </button>
          </div>
        </section>
      </div>
    </div>
  )
}

function AdminStatCard({ title, value, link, color = 'text-stone-900' }: any) {
  return (
    <Link to={link} className="p-6 border border-stone-200 rounded-3xl bg-white shadow-sm hover:border-stone-400 transition-colors">
      <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">{title}</p>
      <h2 className={`text-3xl font-bold mt-2 ${color}`}>{value}</h2>
    </Link>
  )
}

function ShieldIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
}

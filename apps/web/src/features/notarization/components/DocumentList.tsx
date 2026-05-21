import { useMyDocuments } from '../hooks/useNotarization'

export function DocumentList() {
  const { data: documents, isLoading } = useMyDocuments()

  if (isLoading) return <div className="text-sm text-stone-500">Loading documents...</div>

  if (!documents || documents.length === 0) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-8 text-center">
        <p className="text-sm text-stone-500">No documents found.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-stone-200 bg-stone-50 text-stone-500">
          <tr>
            <th className="px-6 py-3 font-medium uppercase tracking-wider">File Name</th>
            <th className="px-6 py-3 font-medium uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 font-medium uppercase tracking-wider">Created</th>
            <th className="px-6 py-3 font-medium uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200">
          {documents.map((doc) => (
            <tr key={doc.id} className="hover:bg-stone-50">
              <td className="px-6 py-4 font-medium text-stone-900">{doc.fileName}</td>
              <td className="px-6 py-4">
                <StatusBadge status={doc.status} />
              </td>
              <td className="px-6 py-4 text-stone-500">
                {new Date(doc.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <button className="text-stone-900 hover:underline">View</button>
                  {doc.pdfAFileId && (
                    <a 
                      href={`/api/files/${doc.pdfAFileId}`} 
                      className="text-stone-900 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Download
                    </a>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StatusBadge({ status }: { status: number }) {
  const config: Record<number, { label: string, color: string }> = {
    0: { label: 'Uploaded', color: 'bg-stone-100 text-stone-600' },
    1: { label: 'Signed', color: 'bg-blue-100 text-blue-600' },
    2: { label: 'Sealed', color: 'bg-green-100 text-green-600' },
    3: { label: 'Completed', color: 'bg-green-100 text-green-600' },
    4: { label: 'Rejected', color: 'bg-red-100 text-red-600' },
  }

  const { label, color } = config[status] || { label: 'Unknown', color: 'bg-stone-100 text-stone-600' }

  return (
    <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${color}`}>
      {label}
    </span>
  )
}

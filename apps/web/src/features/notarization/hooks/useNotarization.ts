import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchApi } from '../../../lib/api'

export interface NotarizationDocument {
  id: string
  fileName: string
  fileId: string
  status: 0 | 1 | 2 | 3 | 4 // Uploaded, SignedByPrincipal, SignedByEnp, Completed, Rejected
  principalId: string
  enpId?: string
  createdAt: string
  completedAt?: string
  pdfAFileId?: string
}

export interface NotarizationWitness {
  id: string
  fullName: string
  address: string
  identityEvidence: string
  signature?: string
}

export interface NotarizationSession {
  id: string
  type: 0 | 1 // Ien, Ren
  scheduledAt: string
  startedAt?: string
  endedAt?: string
  principalId: string
  enpId: string
  meetingUrl?: string
  recordingFileId?: string
  principalLocation?: string
  principalLocationType: 0 | 1 | 2 // Philippines, EmbassyConsulate, Other
  enpLocation?: string
  enpLocationType: 0 | 1 | 2
  geolocationVerified: boolean
  documents: NotarizationDocument[]
  witnesses: NotarizationWitness[]
}

export interface ElectronicNotarialBookEntry {
  id: string
  notarialAct: string
  performedAt: string
  documentTitle: string
  principalId: string
  principalAddress: string
  principalIdentityEvidence: string
  feeCharged: number
  mode: 0 | 1
  principalLocationType: 0 | 1 | 2
  principalActualLocation: string
  remarks?: string
  enpId: string
  notarizedFileId: string
  entryNumber: number
  witnesses: NotarizationWitness[]
}

export function useMyDocuments() {
  return useQuery({
    queryKey: ['notarization', 'documents'],
    queryFn: () => fetchApi<NotarizationDocument[]>('/api/notarization/documents'),
  })
}

export function useSession(id: string) {
  return useQuery({
    queryKey: ['notarization', 'sessions', id],
    queryFn: () => fetchApi<NotarizationSession>(`/api/notarization/sessions/${id}`),
    enabled: !!id,
  })
}

export function useNotarialBook() {
  return useQuery({
    queryKey: ['notarization', 'notarial-book'],
    queryFn: () => fetchApi<ElectronicNotarialBookEntry[]>('/api/notarization/notarial-book'),
  })
}

export function useVerifyDocument(id: string) {
  return useQuery({
    queryKey: ['notarization', 'verify', id],
    queryFn: () => fetchApi<any>(`/api/notarization/verify/${id}`),
    enabled: !!id,
    retry: false,
  })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ fileId, fileName }: { fileId: string; fileName: string }) => {
      return fetchApi<NotarizationDocument>('/api/notarization/documents', {
        method: 'POST',
        body: JSON.stringify({ fileId, fileName }),
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notarization', 'documents'] })
    },
  })
}

export function useCreateSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { type: 0 | 1; enpId: string; scheduledAt: string }) => {
      return fetchApi<NotarizationSession>('/api/notarization/sessions', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notarization', 'sessions'] })
    },
  })
}

export function useJoinSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, location, locationType }: { id: string; location: string; locationType: 0 | 1 | 2 }) => {
      return fetchApi<NotarizationSession>(`/api/notarization/sessions/${id}/join`, {
        method: 'POST',
        body: JSON.stringify({ location, locationType }),
      })
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['notarization', 'sessions', variables.id] })
    },
  })
}

export function useUploadRecording() {
  return useMutation({
    mutationFn: async ({ id, fileId }: { id: string; fileId: string }) => {
      return fetchApi(`/api/notarization/sessions/${id}/recording`, {
        method: 'POST',
        body: JSON.stringify({ fileId }),
      })
    },
  })
}

export function useSignDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      return fetchApi<NotarizationDocument>(`/api/notarization/documents/${id}/sign`, {
        method: 'POST',
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notarization'] })
    },
  })
}

export function useCompleteNotarization() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      return fetchApi<{ document: NotarizationDocument; entry: any }>(`/api/notarization/documents/${id}/complete`, {
        method: 'POST',
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notarization'] })
    },
  })
}

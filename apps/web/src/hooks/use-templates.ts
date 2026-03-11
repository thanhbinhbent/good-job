import { useQuery } from '@tanstack/react-query'
import { templatesApi } from '@/lib/api'
import { queryKeys } from '@/lib/query'
import type { DocumentType } from '@binh-tran/shared'

export function useTemplates(type: DocumentType) {
  return useQuery({
    queryKey: queryKeys.templates.byType(type),
    queryFn: () => templatesApi.list(type),
    select: (res) => res.data,
    enabled: Boolean(type),
  })
}

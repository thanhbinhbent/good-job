import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '../lib/api';
import { queryKeys } from '../lib/query';
import type { CreateDocumentDto, UpdateDocumentDto } from '@binh-tran/shared';

export function useDocuments() {
  return useQuery({
    queryKey: queryKeys.documents.all,
    queryFn: () => documentsApi.list(),
    select: (res) =>
      [...res.data].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: queryKeys.documents.byId(id),
    queryFn: () => documentsApi.get(id),
    select: (res) => res.data,
    enabled: Boolean(id),
  });
}

export function useCreateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateDocumentDto) => documentsApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.documents.all }),
  });
}

export function useUpdateDocument(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateDocumentDto) => documentsApi.update(id, body),
    onSuccess: (res) => {
      qc.setQueryData(queryKeys.documents.byId(id), res);
      qc.invalidateQueries({ queryKey: queryKeys.documents.all });
    },
  });
}

export function usePatchSection(documentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sectionKey, data }: { sectionKey: string; data: unknown }) =>
      documentsApi.patchSection(documentId, sectionKey, data),
    onMutate: async ({ sectionKey, data }) => {
      await qc.cancelQueries({ queryKey: queryKeys.documents.byId(documentId) });
      const prev = qc.getQueryData(queryKeys.documents.byId(documentId));
      qc.setQueryData(queryKeys.documents.byId(documentId), (old: unknown) => {
        if (!old) return old;
        const doc = old as { data: { content: string } };
        const content = JSON.parse(doc.data.content) as Record<string, unknown>;
        content[sectionKey] = data;
        return { ...doc, data: { ...doc.data, content: JSON.stringify(content) } };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.documents.byId(documentId), ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.documents.byId(documentId) });
    },
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.documents.all }),
  });
}

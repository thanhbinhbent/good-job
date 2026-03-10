import { useMutation, useQuery } from '@tanstack/react-query';
import { shareApi } from '../lib/api';
import { queryKeys } from '../lib/query';
import { useAuthStore } from '../stores/auth.store';
import type { CreateShareLinkDto } from '@binh-tran/shared';

export function useShareLink(id: string) {
  return useQuery({
    queryKey: queryKeys.share.byId(id),
    queryFn: () => shareApi.get(id),
    select: (res) => res.data,
    enabled: Boolean(id),
    retry: false,
  });
}

export function useShareLinksByDocument(documentId: string) {
  return useQuery({
    queryKey: queryKeys.share.byDocument(documentId),
    queryFn: () => shareApi.listByDocument(documentId),
    select: (res) => res.data,
    enabled: Boolean(documentId),
  });
}

export function useCreateShareLink() {
  return useMutation({
    mutationFn: (body: CreateShareLinkDto) => shareApi.create(body),
  });
}

export function useUnlockShare() {
  const grantShareAccess = useAuthStore((s) => s.grantShareAccess);
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      shareApi.unlock(id, password),
    onSuccess: (res) => {
      grantShareAccess(res.data.token);
    },
  });
}

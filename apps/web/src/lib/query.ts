import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Query keys — centralized to avoid typos
export const queryKeys = {
  documents: {
    all: ['documents'] as const,
    byId: (id: string) => ['documents', id] as const,
  },
  share: {
    byDocument: (documentId: string) => ['share', 'document', documentId] as const,
    byId: (id: string) => ['share', id] as const,
  },
  auth: {
    me: ['auth', 'me'] as const,
    loginUrl: ['auth', 'login-url'] as const,
  },
  templates: {
    all: ['templates'] as const,
  },
} as const;

import ky from 'ky';
import type {
  ApiResponse,
  Document,
  CreateDocumentDto,
  UpdateDocumentDto,
  ShareLink,
  CreateShareLinkDto,
  Template,
} from '@binh-tran/shared';

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string ?? 'http://localhost:3000/api/v1';

// In-memory share token (never localStorage)
let _shareToken: string | null = null;

export function setShareToken(token: string): void {
  _shareToken = token;
}

export function clearShareToken(): void {
  _shareToken = null;
}

const client = ky.create({
  prefixUrl: BASE_URL,
  credentials: 'include',
  hooks: {
    beforeRequest: [
      (request) => {
        if (_shareToken) {
          request.headers.set('x-share-token', _shareToken);
        }
      },
    ],
  },
});

// ─── Documents ───────────────────────────────────────────────────────────────

export const documentsApi = {
  list: (): Promise<ApiResponse<Document[]>> =>
    client.get('documents').json(),

  get: (id: string): Promise<ApiResponse<Document>> =>
    client.get(`documents/${id}`).json(),

  create: (body: CreateDocumentDto): Promise<ApiResponse<Document>> =>
    client.post('documents', { json: body }).json(),

  update: (id: string, body: UpdateDocumentDto): Promise<ApiResponse<Document>> =>
    client.patch(`documents/${id}`, { json: body }).json(),

  patchSection: (id: string, sectionKey: string, data: unknown): Promise<ApiResponse<Document>> =>
    client.patch(`documents/${id}/sections/${sectionKey}`, { json: data }).json(),

  remove: (id: string): Promise<void> =>
    client.delete(`documents/${id}`).then(() => undefined),
};

// ─── Share Links ─────────────────────────────────────────────────────────────

export const shareApi = {
  listByDocument: (documentId: string): Promise<ApiResponse<ShareLink[]>> =>
    client.get(`share/document/${documentId}`).json(),

  create: (body: CreateShareLinkDto): Promise<ApiResponse<ShareLink>> =>
    client.post('share', { json: body }).json(),

  get: (id: string): Promise<ApiResponse<ShareLink & { hasPassword: boolean }>> =>
    client.get(`share/${id}`).json(),

  unlock: (id: string, password: string): Promise<ApiResponse<{ token: string }>> =>
    client.post(`share/${id}/unlock`, { json: { password } }).json(),

  delete: (id: string): Promise<void> =>
    client.delete(`share/${id}`).then(() => undefined),
};

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  me: (): Promise<{ role: string }> => client.get('auth/me').json(),
  loginUrl: (): Promise<{ url: string }> => client.get('auth/login-url').json(),
  logout: (): string => `${BASE_URL}/auth/logout`,
};

// ─── Templates ───────────────────────────────────────────────────────────────

export const templatesApi = {
  list: (type?: 'resume' | 'portfolio' | 'cover_letter'): Promise<ApiResponse<Template[]>> =>
    client.get('templates', type ? { searchParams: { type } } : undefined).json(),
};

// ─── Export ──────────────────────────────────────────────────────────────────

export const exportApi = {
  docxUrl: (id: string): string => `${BASE_URL}/export/documents/${id}/docx`,
};

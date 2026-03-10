import { create } from 'zustand';
import { setShareToken, clearShareToken } from '../lib/api';

type AuthState = {
  isAdmin: boolean;
  hasShareAccess: boolean;
  shareToken: string | null;
  setAdmin: (isAdmin: boolean) => void;
  grantShareAccess: (token: string) => void;
  revokeShareAccess: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAdmin: false,
  hasShareAccess: false,
  shareToken: null,

  setAdmin: (isAdmin) => set({ isAdmin }),

  grantShareAccess: (token) => {
    setShareToken(token);
    set({ hasShareAccess: true, shareToken: token });
  },

  revokeShareAccess: () => {
    clearShareToken();
    set({ hasShareAccess: false, shareToken: null });
  },
}));

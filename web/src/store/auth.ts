import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** Authenticated user shape (matches the frozen API contract — 12_API_Specification.md). */
export interface User {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
}

interface AuthState {
  token: string | null;
  user: User | null;
  /** Set after a successful login/register (14/15_*.md). */
  setAuth: (token: string, user: User) => void;
  /** Clear on logout or any 401 (called by the fetch wrapper). */
  clearAuth: () => void;
}

/**
 * The ONE global store — auth only (14_State_Management.md). Sanctum Bearer token +
 * user, persisted to localStorage so sessions survive reload. `skipHydration` keeps the
 * server and first client render identical (both start empty); the provider rehydrates on
 * mount, so there is no SSR/localStorage hydration mismatch. No component reads storage
 * directly — the fetch wrapper reads `token` via getState().
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null }),
    }),
    {
      name: "stackmart-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
      skipHydration: true,
    },
  ),
);

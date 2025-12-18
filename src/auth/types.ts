import { createContext } from "react";
import type { AppwriteUser } from "../shared/types/auth/types.ts";

export type AuthContextValue = {
  user: AppwriteUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

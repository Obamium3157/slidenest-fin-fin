import { type ReactNode, useEffect, useState } from "react";
import { account } from "../shared/lib/appwrite/appwrite.ts";
import { AuthContext } from "./types.ts";
import type { AppwriteUser } from "../shared/types/auth/types.ts";

function getAppwriteCode(e: unknown): number | null {
  const code = (e as { code?: unknown } | null)?.code;
  return typeof code === "number" ? code : null;
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppwriteUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const acc = await account.get();
      setUser(acc);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await account.createEmailPasswordSession({ email, password });
      const acc = await account.get();
      setUser(acc);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      await account.create({
        userId: "unique()",
        email,
        password,
        name,
      });

      await account.createEmailPasswordSession({ email, password });
      const acc = await account.get();
      setUser(acc);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      try {
        await account.deleteSessions();
      } catch (e) {
        const code = getAppwriteCode(e);
        if (code !== 401 && code !== 403) {
          console.warn("logout: Appwrite error:", e);
        }
      }
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

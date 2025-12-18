import { useContext } from "react";
import { AuthContext } from "./types.ts";

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within UserProvider");
  }
  return ctx;
}

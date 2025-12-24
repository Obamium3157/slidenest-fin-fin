export const APPWRITE_ENDPOINT = String(
  import.meta.env.VITE_APPWRITE_ENDPOINT || "",
);
export const APPWRITE_PROJECT_ID = String(
  import.meta.env.VITE_APPWRITE_PROJECT_ID || "",
);

export const APPWRITE_DATABASE_ID = String(
  import.meta.env.VITE_APPWRITE_DATABASE_ID || "",
);
export const APPWRITE_PRESENTATIONS_TABLE_ID = String(
  import.meta.env.VITE_APPWRITE_PRESENTATIONS_TABLE_ID || "",
);

export const APPWRITE_STORAGE_BUCKET_ID = String(
  import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID || "",
);

export function assertAppwriteEnv(): void {
  const missing: string[] = [];

  if (!APPWRITE_ENDPOINT) missing.push("VITE_APPWRITE_ENDPOINT");
  if (!APPWRITE_PROJECT_ID) missing.push("VITE_APPWRITE_PROJECT_ID");
  if (!APPWRITE_DATABASE_ID) missing.push("VITE_APPWRITE_DATABASE_ID");
  if (!APPWRITE_PRESENTATIONS_TABLE_ID)
    missing.push("VITE_APPWRITE_PRESENTATIONS_TABLE_ID");
  if (!APPWRITE_STORAGE_BUCKET_ID)
    missing.push("VITE_APPWRITE_STORAGE_BUCKET_ID");

  if (missing.length > 0) {
    throw new Error(`Missing Appwrite env vars: ${missing.join(", ")}`);
  }
}

const MAX_APPWRITE_ID_LEN = 36;
const APPWRITE_ID_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,35}$/;

function base64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  const b64 = btoa(bin);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function randomIdFallback(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const id = base64Url(bytes).slice(0, MAX_APPWRITE_ID_LEN);
  const first = id[0];
  const safeFirst = /[A-Za-z0-9]/.test(first) ? first : "a";
  return safeFirst + id.slice(1);
}

export function generateId(): string {
  const id =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : randomIdFallback();
  if (APPWRITE_ID_RE.test(id) && id.length <= MAX_APPWRITE_ID_LEN) return id;
  return randomIdFallback();
}

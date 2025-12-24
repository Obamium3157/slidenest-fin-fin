import { account } from "../appwrite";

type UserPrefs = {
  presentationIds?: unknown;
};

const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === "string");

export async function getMyPresentationIds(): Promise<string[]> {
  const prefs = (await account.getPrefs()) as UserPrefs;

  if (!isStringArray(prefs.presentationIds)) return [];

  return Array.from(new Set(prefs.presentationIds));
}

export async function addMyPresentationId(id: string): Promise<string[]> {
  const prefs = (await account.getPrefs()) as Record<string, unknown>;
  const existing = isStringArray(prefs.presentationIds)
    ? prefs.presentationIds
    : [];

  const next = existing.includes(id) ? existing : [...existing, id];

  await account.updatePrefs({
    prefs: {
      ...prefs,
      presentationIds: next,
    },
  });
  return next;
}

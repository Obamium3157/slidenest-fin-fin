import { ID, Query } from "appwrite";
import { account, storage, tablesDB } from "../appwrite.ts";
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_PRESENTATIONS_TABLE_ID,
  APPWRITE_STORAGE_BUCKET_ID,
} from "../appwriteIds.ts";
import type { Presentation } from "../../../../entities/presentation/model/types.ts";
import type { SlideObj } from "../../../../entities/slide/model/types.ts";
import { parseAndValidatePresentation } from "../../validation/presentationValidation.ts";

export type SaveResult = {
  etag: string;
  rowId: string;
};

export type PresentationMeta = {
  rowId: string;
  presentationId: string;
  title: string;
  updatedAt: string;
};

type PresentationRow = {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  title?: string;
  content: string;
  presentationId: string;
};

const MAX_APPWRITE_ID_LEN = 36;
const APPWRITE_ID_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,35}$/;

const PREFS_PRESENTATION_IDS_KEY = "presentationIds";
const MAX_QUERY_EQUAL_VALUES = 100;

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  const b64 = btoa(bin);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sha256Base64Url(input: string): Promise<string> {
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(input));
  return toBase64Url(new Uint8Array(digest));
}

async function stableRowIdFromPresentationId(
  presentationId: string,
): Promise<string> {
  if (
    APPWRITE_ID_RE.test(presentationId) &&
    presentationId.length <= MAX_APPWRITE_ID_LEN
  ) {
    return presentationId;
  }

  const hash = await sha256Base64Url(presentationId);
  const candidate = `p_${hash}`.slice(0, MAX_APPWRITE_ID_LEN);
  return candidate.length > 0
    ? candidate
    : `p_${ID.unique()}`.slice(0, MAX_APPWRITE_ID_LEN);
}

function urlToString(u: unknown): string {
  if (typeof u === "string") return u;
  if (u && typeof u === "object" && "href" in u)
    return String((u as { href: unknown }).href);
  return String(u);
}

function isDataUrl(src: string): boolean {
  return src.startsWith("data:");
}

async function dataUrlToFile(
  dataUrl: string,
  fallbackName: string,
): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const ext = blob.type?.includes("/") ? blob.type.split("/")[1] : "bin";
  return new File([blob], `${fallbackName}.${ext}`, {
    type: blob.type || "application/octet-stream",
  });
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

function uniqStrings(ids: string[]): string[] {
  const set = new Set<string>();
  for (const id of ids) if (id) set.add(id);
  return Array.from(set);
}

async function getPrefsObject(): Promise<Record<string, unknown>> {
  const prefs = (await account.getPrefs()) as unknown;
  if (prefs && typeof prefs === "object")
    return prefs as Record<string, unknown>;
  return {};
}

export async function getMyPresentationIds(): Promise<string[]> {
  const prefs = await getPrefsObject();
  const raw = prefs[PREFS_PRESENTATION_IDS_KEY];
  if (!isStringArray(raw)) return [];
  return uniqStrings(raw);
}

export async function addMyPresentationId(
  presentationId: string,
): Promise<string[]> {
  const prefs = await getPrefsObject();
  const current = isStringArray(prefs[PREFS_PRESENTATION_IDS_KEY])
    ? (prefs[PREFS_PRESENTATION_IDS_KEY] as string[])
    : [];

  const next = uniqStrings([...current, presentationId]);

  await account.updatePrefs({
    prefs: {
      ...prefs,
      [PREFS_PRESENTATION_IDS_KEY]: next,
    },
  });

  return next;
}

export async function uploadImageToStorage(file: File): Promise<string> {
  const created = await storage.createFile({
    bucketId: APPWRITE_STORAGE_BUCKET_ID,
    fileId: ID.unique(),
    file,
  });

  const view = storage.getFileView({
    bucketId: APPWRITE_STORAGE_BUCKET_ID,
    fileId: created.$id,
  });

  return urlToString(view);
}

async function preparePresentationForSave(
  presentation: Presentation,
): Promise<Presentation> {
  const clone = JSON.parse(JSON.stringify(presentation)) as Presentation;

  const cache = new Map<string, string>();

  for (const slideId of clone.slides.order) {
    const slide = clone.slides.collection[slideId];
    if (!slide) continue;

    for (const objId of slide.slideObjects.order) {
      const obj = slide.slideObjects.collection[objId] as SlideObj | undefined;
      if (!obj || obj.type !== "image") continue;

      const src = obj.src;
      if (!isDataUrl(src)) continue;

      const key = await sha256Base64Url(src);
      const cached = cache.get(key);
      if (cached) {
        obj.src = cached;
        continue;
      }

      const file = await dataUrlToFile(src, `slide-${slideId}-obj-${objId}`);
      const viewUrl = await uploadImageToStorage(file);
      cache.set(key, viewUrl);
      obj.src = viewUrl;
    }
  }

  return clone;
}

export async function savePresentationToAppwrite(
  presentation: Presentation,
): Promise<SaveResult> {
  const rowId = await stableRowIdFromPresentationId(presentation.id);

  const prepared = await preparePresentationForSave(presentation);
  const content = JSON.stringify(prepared);
  const etag = await sha256Base64Url(content);

  await tablesDB.upsertRow({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: APPWRITE_PRESENTATIONS_TABLE_ID,
    rowId,
    data: {
      presentationId: prepared.id,
      title: prepared.title,
      content,
    },
  });

  try {
    await addMyPresentationId(prepared.id);
  } catch {
    /* ... */
  }

  return { etag, rowId };
}

export async function loadPresentationByPresentationId(
  presentationId: string,
): Promise<Presentation> {
  const res = await tablesDB.listRows({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: APPWRITE_PRESENTATIONS_TABLE_ID,
    queries: [
      Query.equal("presentationId", [presentationId]),
      Query.select(["content", "presentationId", "$id", "$updatedAt"]),
      Query.limit(1),
    ],
  });

  if (!res.rows || res.rows.length === 0) {
    throw new Error(`Presentation not found: ${presentationId}`);
  }

  const row = res.rows[0] as unknown as {
    content: string;
    presentationId: string;
  };

  return parseAndValidatePresentation(row.content, row.presentationId);
}

async function listPresentationsByIdsInternal(
  presentationIds: string[],
): Promise<PresentationMeta[]> {
  const ids = uniqStrings(presentationIds);
  if (ids.length === 0) return [];

  const metas: PresentationMeta[] = [];

  for (let i = 0; i < ids.length; i += MAX_QUERY_EQUAL_VALUES) {
    const chunk = ids.slice(i, i + MAX_QUERY_EQUAL_VALUES);

    const res = await tablesDB.listRows({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: APPWRITE_PRESENTATIONS_TABLE_ID,
      queries: [
        Query.equal("presentationId", chunk),
        Query.select(["$id", "$updatedAt", "title", "presentationId"]),
        Query.limit(Math.min(chunk.length, 200)),
      ],
    });

    const rows = (res.rows ?? []) as unknown as Array<
      Pick<PresentationRow, "$id" | "$updatedAt" | "title" | "presentationId">
    >;

    for (const r of rows) {
      metas.push({
        rowId: r.$id,
        presentationId: r.presentationId,
        title: r.title ?? "",
        updatedAt: r.$updatedAt,
      });
    }
  }

  metas.sort((a, b) =>
    a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : 0,
  );
  return metas;
}

export async function listMyPresentations(
  limit: number = 200,
): Promise<PresentationMeta[]> {
  const safeLimit = Math.max(1, Math.min(200, Math.floor(limit)));

  const ids = await getMyPresentationIds();
  if (ids.length === 0) return [];

  const metas = await listPresentationsByIdsInternal(ids);

  return metas.slice(0, safeLimit);
}

import { ID, Query } from "appwrite";
import { storage, tablesDB } from "../appwrite.ts";
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

export async function listMyPresentations(
  limit: number = 100,
): Promise<PresentationMeta[]> {
  const safeLimit = Math.max(1, Math.min(200, Math.floor(limit)));

  const res = await tablesDB.listRows({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: APPWRITE_PRESENTATIONS_TABLE_ID,
    queries: [
      Query.orderDesc("$updatedAt"),
      Query.select(["$id", "$updatedAt", "title", "presentationId"]),
      Query.limit(safeLimit),
    ],
  });

  const rows = (res.rows ?? []) as unknown as Array<
    Pick<PresentationRow, "$id" | "$updatedAt" | "title" | "presentationId">
  >;

  return rows.map((r) => ({
    rowId: r.$id,
    presentationId: r.presentationId,
    title: r.title ?? "",
    updatedAt: r.$updatedAt,
  }));
}

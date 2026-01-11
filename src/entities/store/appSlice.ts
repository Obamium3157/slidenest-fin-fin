import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Presentation } from "../presentation/model/types.ts";
import type { Select } from "../select/model/types.ts";
import { hydrateEditor } from "./undoableReducer.ts";
import {
  getMyPresentationIds,
  listMyPresentations,
  loadPresentationByPresentationId,
  savePresentationToAppwrite,
} from "../../shared/lib/appwrite/repo/presentationRepo.ts";
import { createDefaultPresentation } from "../presentation/model/createDefaultPresentation.ts";
import { account } from "../../shared/lib/appwrite/appwrite.ts";

type AppState = {
  status: "idle" | "loading" | "ready" | "error";
  activePresentationId: string | null;
  error: string | null;
};

const initialState: AppState = {
  status: "idle",
  activePresentationId: null,
  error: null,
};

function selectionForPresentation(p: Presentation): Select {
  const first = p.slides.order[0];
  return first
    ? { selectedSlideIds: [first], selectedSlideObjIds: [] }
    : { selectedSlideIds: [], selectedSlideObjIds: [] };
}

type BootstrapArg = {
  presentationId?: string | null;
};

export const ACTIVE_PRESENTATION_STORAGE_KEY_PREFIX =
  "slidenest.activePresentationId";
const URL_QUERY_KEY = "p";

function getActivePresentationStorageKey(userId: string | null): string {
  return userId
    ? `${ACTIVE_PRESENTATION_STORAGE_KEY_PREFIX}.${userId}`
    : ACTIVE_PRESENTATION_STORAGE_KEY_PREFIX;
}

export function clearActivePresentationCache(): void {
  try {
    window.localStorage.removeItem(ACTIVE_PRESENTATION_STORAGE_KEY_PREFIX);

    const toRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key) continue;
      if (key.startsWith(`${ACTIVE_PRESENTATION_STORAGE_KEY_PREFIX}.`)) {
        toRemove.push(key);
      }
    }
    for (const k of toRemove) window.localStorage.removeItem(k);
  } catch {
    /* ... */
  }
}

export const bootstrapPresentation = createAsyncThunk<void, BootstrapArg>(
  "app/bootstrapPresentation",
  async (arg, thunkApi) => {
    let userId: string | null;
    try {
      const acc = await account.get();
      const id = (acc as { $id?: unknown }).$id;
      userId = typeof id === "string" ? id : null;
    } catch {
      userId = null;
    }

    const storageKey = getActivePresentationStorageKey(userId);

    const fromRoute = arg?.presentationId ?? null;

    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get(URL_QUERY_KEY);

    const fromLocal =
      window.localStorage.getItem(storageKey) ??
      window.localStorage.getItem(ACTIVE_PRESENTATION_STORAGE_KEY_PREFIX);

    if (fromLocal) {
      try {
        window.localStorage.removeItem(ACTIVE_PRESENTATION_STORAGE_KEY_PREFIX);
      } catch {
        /* ... */
      }
    }

    const candidates = [fromRoute, fromUrl, fromLocal].filter(
      (x): x is string => typeof x === "string" && x.length > 0,
    );

    const myIds = new Set<string>(await getMyPresentationIds());

    let presentation: Presentation | null = null;

    for (const id of candidates) {
      if (!myIds.has(id)) continue;

      try {
        presentation = await loadPresentationByPresentationId(id);
        window.localStorage.setItem(storageKey, id);
        break;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(
          `[presentation] ошибка при загрузке кандидата с id="${id}": ${msg}`,
          err,
        );
      }
    }

    if (!presentation) {
      try {
        const list = await listMyPresentations(100);
        if (list.length > 0) {
          const id = list[0].presentationId;
          presentation = await loadPresentationByPresentationId(id);
          window.localStorage.setItem(storageKey, id);
        } else {
          console.info(
            "[presentation] listMyPresentations вернула пустой список",
          );
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(
          `[presentation] ошибка при загрузке резервного файла через listMyPresentations: ${msg}`,
          err,
        );
      }
    }

    if (!presentation) {
      presentation = createDefaultPresentation("Название презентации");
      window.localStorage.setItem(storageKey, presentation.id);

      try {
        await savePresentationToAppwrite(presentation);
      } catch (e) {
        console.error("Failed to create initial presentation in Appwrite:", e);
      }
    }

    thunkApi.dispatch(
      hydrateEditor({
        presentation,
        selection: selectionForPresentation(presentation),
      }),
    );
  },
);

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    resetApp: () => initialState,
  },
  extraReducers: (b) => {
    b.addCase(bootstrapPresentation.pending, (s) => {
      s.status = "loading";
      s.error = null;
    });
    b.addCase(bootstrapPresentation.fulfilled, (s) => {
      s.status = "ready";
      s.error = null;
    });
    b.addCase(bootstrapPresentation.rejected, (s, a) => {
      s.status = "error";
      s.error = a.error.message ?? "bootstrap failed";
    });
  },
});

export const { resetApp } = appSlice.actions;
export default appSlice.reducer;

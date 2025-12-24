import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Presentation } from "../presentation/model/types.ts";
import type { Select } from "../select/model/types.ts";
import { hydrateEditor } from "./undoableReducer.ts";
import {
  listMyPresentations,
  loadPresentationByPresentationId,
  savePresentationToAppwrite,
} from "../../shared/lib/appwrite/repo/presentationRepo.ts";
import { createDefaultPresentation } from "../presentation/model/createDefaultPresentation.ts";

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

export const bootstrapPresentation = createAsyncThunk<void, void>(
  "app/bootstrapPresentation",
  async (_arg, thunkApi) => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("p");

    const storageKey = "slidenest.activePresentationId";
    const fromLocal = window.localStorage.getItem(storageKey);

    const candidates = [fromUrl, fromLocal].filter((x): x is string => !!x);

    let presentation: Presentation | null = null;

    for (const id of candidates) {
      try {
        presentation = await loadPresentationByPresentationId(id);
        window.localStorage.setItem(storageKey, id);
        break;
      } catch {
        /* ... */
      }
    }

    if (!presentation) {
      const list = await listMyPresentations();
      if (list.length > 0) {
        const id = list[0].presentationId;
        presentation = await loadPresentationByPresentationId(id);
        window.localStorage.setItem(storageKey, id);
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
  reducers: {},
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

export default appSlice.reducer;

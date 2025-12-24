import type { Middleware } from "@reduxjs/toolkit";
import { savePresentationToAppwrite } from "../../shared/lib/appwrite/repo/presentationRepo.ts";
import type { RootState } from "./types.ts";

const AUTOSAVE_DEBOUNCE_MS = 800;

type ActionWithType = { type: string };
function hasStringType(action: unknown): action is ActionWithType {
  return (
    typeof action === "object" &&
    action !== null &&
    "type" in action &&
    typeof (action as { type?: unknown }).type === "string"
  );
}

export const autosaveMiddleware: Middleware<object, RootState> = (store) => {
  let timer: number | null = null;
  let saving = false;
  let queued = false;

  const flushSave = async () => {
    if (saving) {
      queued = true;
      return;
    }

    const state = store.getState();

    if (state.app.status !== "ready") return;

    const current = state.presentation.history.present;
    if (!current.id) return;

    try {
      saving = true;
      await savePresentationToAppwrite(current);
    } catch (err) {
      console.error("Appwrite autosave failed:", err);
    } finally {
      saving = false;
      if (queued) {
        queued = false;
        scheduleSave();
      }
    }
  };

  const scheduleSave = () => {
    if (timer !== null) window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      timer = null;
      void flushSave();
    }, AUTOSAVE_DEBOUNCE_MS);
  };

  return (next) => (action: unknown) => {
    if (hasStringType(action) && action.type.startsWith("@@redux/")) {
      return next(action);
    }

    if (hasStringType(action) && action.type === "EDITOR/HYDRATE") {
      return next(action);
    }

    const prev = store.getState().presentation.history.present;
    const result = next(action);
    const nextPres = store.getState().presentation.history.present;

    if (prev !== nextPres) scheduleSave();
    return result;
  };
};

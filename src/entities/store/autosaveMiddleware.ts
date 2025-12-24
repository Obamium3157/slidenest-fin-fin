import type { Middleware } from "@reduxjs/toolkit";
import { savePresentationToAppwrite } from "../../shared/lib/appwrite/repo/presentationRepo.ts";
import type { RootState } from "./types.ts";
import { getCurrentStatePresentation } from "./selectors.ts";

const AUTOSAVE_DEBOUNCE_MS = 800;

function getActionType(action: unknown): string | null {
  if (typeof action !== "object" || action === null) return null;
  if (!("type" in action)) return null;

  const maybeType = (action as { type?: unknown }).type;
  return typeof maybeType === "string" ? maybeType : null;
}

function createDebouncedTrigger(fn: () => void, delayMs: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const cancel = () => {
    if (timer !== null) {
      globalThis.clearTimeout(timer);
      timer = null;
    }
  };

  const trigger = () => {
    cancel();
    timer = globalThis.setTimeout(() => {
      timer = null;
      fn();
    }, delayMs);
  };

  return { trigger, cancel };
}

const shouldIgnoreActionType = (type: string) =>
  type.startsWith("@@redux/") || type === "EDITOR/HYDRATE";

export const autosaveMiddleware: Middleware<object, RootState> = (store) => {
  let inFlight = false;
  let pending = false;

  const performSave = async () => {
    const state = store.getState();
    if (state.app.status !== "ready") return;

    const current = getCurrentStatePresentation(state);
    if (!current.id) return;

    await savePresentationToAppwrite(current);
  };

  const trySave = async () => {
    if (inFlight) {
      pending = true;
      return;
    }

    inFlight = true;
    try {
      await performSave();
    } catch (err) {
      console.error("Appwrite autosave failed:", err);
    } finally {
      inFlight = false;
      if (pending) {
        pending = false;
        debounced.trigger();
      }
    }
  };

  const debounced = createDebouncedTrigger(() => {
    void trySave();
  }, AUTOSAVE_DEBOUNCE_MS);

  return (next) => (action: unknown) => {
    const type = getActionType(action);
    if (type && shouldIgnoreActionType(type)) {
      return next(action as never);
    }

    const prev = getCurrentStatePresentation(store.getState());
    const result = next(action as never);
    const nextPres = getCurrentStatePresentation(store.getState());

    if (prev !== nextPres) {
      debounced.trigger();
    }

    return result;
  };
};

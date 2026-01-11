import type { AppThunk, RootState } from "./types.ts";
import { getCurrentStatePresentation } from "./selectors.ts";
import { savePresentationToAppwrite } from "../../shared/lib/appwrite/repo/presentationRepo.ts";
import { ROUTES } from "../../app/router/routes.ts";

const AUTOSAVE_INTERVAL_MS = 800;

let intervalId: ReturnType<typeof setInterval> | null = null;

let lastSavedSnapshot: string | null = null;

let inFlightSave: Promise<void> | null = null;

function isEditorRouteOpen(): boolean {
  const path = window.location.pathname;
  return path === ROUTES.EDITOR || path.startsWith(`${ROUTES.EDITOR}/`);
}

function canAutosave(state: RootState): boolean {
  if (state.app.status !== "ready") return false;
  if (!isEditorRouteOpen()) return false;

  const pres = getCurrentStatePresentation(state);
  return Boolean(pres?.id);
}

function safeSnapshot(value: unknown): string | null {
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

async function saveIfNeeded(getState: () => RootState): Promise<void> {
  const state = getState();
  if (!canAutosave(state)) return;

  const current = getCurrentStatePresentation(state);
  if (!current?.id) return;

  const snapshot = safeSnapshot(current);

  if (snapshot !== null && snapshot === lastSavedSnapshot) return;

  await savePresentationToAppwrite(current);

  lastSavedSnapshot = snapshot;
}

export const autosaveTick = (): AppThunk => async (_dispatch, getState) => {
  if (inFlightSave) return;

  inFlightSave = (async () => {
    try {
      await saveIfNeeded(getState);
    } catch (err) {
      console.error("Ошибка автосохранения в Appwrite:", err);
    }
  })().finally(() => {
    inFlightSave = null;
  });

  await inFlightSave;
};

export const startAutosaveTimer = (): AppThunk => (dispatch) => {
  if (intervalId !== null) return;

  intervalId = setInterval(() => {
    void dispatch(autosaveTick());
  }, AUTOSAVE_INTERVAL_MS);
};

export const stopAutosaveTimer = (): AppThunk => () => {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }

  inFlightSave = null;
  lastSavedSnapshot = null;
};

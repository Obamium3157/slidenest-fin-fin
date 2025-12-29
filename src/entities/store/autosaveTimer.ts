import type { AppThunk, RootState } from "./types.ts";
import { getCurrentStatePresentation } from "./selectors.ts";
import { savePresentationToAppwrite } from "../../shared/lib/appwrite/repo/presentationRepo.ts";
import { ROUTES } from "../../app/router/routes.ts";

const AUTOSAVE_INTERVAL_MS = 800;

let intervalId: ReturnType<typeof setInterval> | null = null;

let lastSavedSnapshot: string | null = null;

const saveGate = {
  inFlight: false,
  again: false,
};

function isEditorRouteOpen(): boolean {
  return window.location.pathname.startsWith(`${ROUTES.EDITOR}/`);
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

async function runSerializedSave(getState: () => RootState): Promise<void> {
  if (saveGate.inFlight) {
    saveGate.again = true;
    return;
  }

  saveGate.inFlight = true;

  try {
    do {
      saveGate.again = false;

      try {
        await saveIfNeeded(getState);
      } catch (err) {
        console.error("Ошибка автосохранения в Appwrite:", err);
      }
    } while (saveGate.again);
  } finally {
    saveGate.inFlight = false;
  }
}

export const autosaveTick = (): AppThunk => async (_dispatch, getState) => {
  await runSerializedSave(getState);
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

  saveGate.inFlight = false;
  saveGate.again = false;
  lastSavedSnapshot = null;
};

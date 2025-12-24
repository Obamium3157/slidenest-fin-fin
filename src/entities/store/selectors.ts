import type { RootState } from "./types.ts";

export const getCurrentStatePresentation = (state: RootState) =>
  state.presentation.history.present;

import type { rootReducer } from "./rootReducer.ts";
import type { Action, ThunkAction } from "@reduxjs/toolkit";

export type RootState = ReturnType<typeof rootReducer>;

export type AppThunk<Return = void> = ThunkAction<
  Return,
  RootState,
  unknown,
  Action
>;

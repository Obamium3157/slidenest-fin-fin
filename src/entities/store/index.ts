import { configureStore } from "@reduxjs/toolkit";
import { rootReducer } from "./rootReducer.ts";
import { autosaveMiddleware } from "./autosaveMiddleware.ts";

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      autosaveMiddleware,
    ),
});

export type AppDispatch = typeof store.dispatch;

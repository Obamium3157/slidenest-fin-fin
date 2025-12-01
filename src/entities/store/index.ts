import { configureStore } from "@reduxjs/toolkit";
import { createUndoableReducer } from "./undoableReducer";

import presentationReducer from "./presentationSlice";
import selectionReducer from "./selectionSlice";
import { selectionSyncMiddleware } from "./selectionSyncMiddleware.ts";

const undoablePresentationReducer = createUndoableReducer(presentationReducer);

export const store = configureStore({
  reducer: {
    presentation: undoablePresentationReducer,
    selection: selectionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      selectionSyncMiddleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

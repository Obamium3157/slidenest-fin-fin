import { configureStore } from "@reduxjs/toolkit";
import { createUndoableReducer } from "./undoableReducer";

import presentationReducer from "./presentationSlice";
import selectionReducer from "./selectionSlice";

const undoablePresentationReducer = createUndoableReducer(
  presentationReducer,
  selectionReducer,
);

export const store = configureStore({
  reducer: {
    presentation: undoablePresentationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

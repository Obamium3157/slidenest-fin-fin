import { configureStore } from "@reduxjs/toolkit";
import { createUndoableReducer } from "./undoableReducer"; // Импортируем новый undoable

import presentationReducer from "./presentationSlice";
import selectionReducer from "./selectionSlice";

const undoablePresentationReducer = createUndoableReducer(presentationReducer);

export const store = configureStore({
  reducer: {
    presentation: undoablePresentationReducer,
    selection: selectionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import { combineReducers } from "@reduxjs/toolkit";
import { createUndoableReducer } from "./undoableReducer.ts";
import presentationReducer from "./presentationSlice.ts";
import selectionReducer from "./selectionSlice.ts";
import appReducer from "./appSlice.ts";

const undoablePresentationReducer = createUndoableReducer(
  presentationReducer,
  selectionReducer,
);

export const rootReducer = combineReducers({
  app: appReducer,
  presentation: undoablePresentationReducer,
});

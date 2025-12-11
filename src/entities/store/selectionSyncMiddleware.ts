import type { Middleware } from "@reduxjs/toolkit";
import type { Select } from "../select/model/types.ts";
import { redo, undo } from "./undoableReducer.ts";
import { setSelection } from "./selectionSlice.ts";

export const selectionSyncMiddleware: Middleware = (store) => {
  let past: Select[] = [];
  let future: Select[] = [];

  return (next) => (action) => {
    const isUndo = undo.match(action);
    const isRedo = redo.match(action);

    const prevPresentation = store.getState().presentation.history.present;
    const prevSelection = store.getState().selection;

    const result = next(action);

    const nextPresentation = store.getState().presentation.history.present;
    const nextSelection = store.getState().selection;
    const history = store.getState().presentation.history;

    if (!isUndo && !isRedo) {
      if (prevPresentation !== nextPresentation) {
        past.push(prevSelection);

        if (past.length > history.past.length) {
          past = past.slice(-history.past.length);
        }

        future = [];
      }

      return result;
    }

    if (isUndo) {
      if (past.length > 0) {
        const contextToRestore = past.pop()!;
        future.unshift(nextSelection);

        store.dispatch(setSelection(contextToRestore));
      }

      return result;
    }

    if (isRedo) {
      if (future.length > 0) {
        const contextToRestore = future.shift()!;
        past.push(nextSelection);

        if (past.length > history.past.length) {
          past = past.slice(-history.past.length);
        }

        store.dispatch(setSelection(contextToRestore));
      }

      return result;
    }

    return result;
  };
};

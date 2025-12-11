import { type Reducer, type Action, createAction } from "@reduxjs/toolkit";

interface History<S> {
  past: S[];
  present: S;
  future: S[];
}

const createHistory = <S>(initialState: S): History<S> => ({
  past: [],
  present: initialState,
  future: [],
});

interface UndoableState<S> {
  history: History<S>;
}

export const undo = createAction("UNDO");
export const redo = createAction("REDO");

export const createUndoableReducer = <S>(
  reducer: Reducer<S>,
): Reducer<UndoableState<S>> => {
  return (state: UndoableState<S> | undefined, action: Action) => {
    if (!state) {
      const initialChildState = reducer(undefined, action);
      return {
        history: createHistory(initialChildState),
      };
    }

    const newState: UndoableState<S> = { ...state };

    if (undo.match(action)) {
      const { past, present, future } = newState.history;
      if (past.length === 0) return newState;

      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);

      return {
        ...newState,
        history: {
          past: newPast,
          present: previous,
          future: [present, ...future],
        },
      };
    }

    if (redo.match(action)) {
      const { past, present, future } = newState.history;
      if (future.length === 0) return newState;

      const next = future[0];
      const newFuture = future.slice(1);

      return {
        ...newState,
        history: {
          past: [...past, present],
          present: next,
          future: newFuture,
        },
      };
    }

    const previousPresent = newState.history.present;
    const newPresent = reducer(previousPresent, action);

    if (newPresent === previousPresent) {
      return {
        ...newState,
        history: { ...newState.history, present: newPresent },
      };
    }

    const { past } = newState.history;
    return {
      ...newState,
      history: {
        past: [...past, previousPresent],
        present: newPresent,
        future: [],
      },
    };
  };
};

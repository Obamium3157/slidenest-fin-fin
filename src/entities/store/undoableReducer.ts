import { type Reducer, type Action, createAction } from "@reduxjs/toolkit";
import type { Presentation } from "../presentation/model/types.ts";
import type { Select } from "../select/model/types.ts";

export const undo = createAction("UNDO");
export const redo = createAction("REDO");

interface History<S> {
  past: S[];
  present: S;
  future: S[];
}

interface SelectionHistory<Sel> {
  past: Sel[];
  future: Sel[];
}

const createHistory = <S>(initialState: S): History<S> => ({
  past: [],
  present: initialState,
  future: [],
});

const createSelectionHistory = <Sel>(): SelectionHistory<Sel> => ({
  past: [],
  future: [],
});

type UndoableWithSelectionState<S, Sel> = {
  history: History<S>;
  selection: Sel;
  selectionHistory: SelectionHistory<Sel>;
};

export const createUndoableReducer = <
  S extends Presentation,
  Sel extends Select,
>(
  reducer: Reducer<S>,
  selectionReducer: Reducer<Sel>,
): Reducer<UndoableWithSelectionState<S, Sel>> => {
  return (
    state: UndoableWithSelectionState<S, Sel> | undefined,
    action: Action,
  ): UndoableWithSelectionState<S, Sel> => {
    if (!state) {
      const initialPresentation = reducer(undefined, action);
      const initialSelection = selectionReducer(undefined, action);

      return {
        history: createHistory(initialPresentation),
        selection: initialSelection,
        selectionHistory: createSelectionHistory(),
      };
    }

    const { history, selectionHistory, selection } = state;

    if (undo.match(action)) {
      if (history.past.length === 0) {
        return state;
      }

      const previousPresentation = history.past[history.past.length - 1];
      const previousSelection =
        selectionHistory.past[selectionHistory.past.length - 1];

      return {
        history: {
          past: history.past.slice(0, -1),
          present: previousPresentation,
          future: [history.present, ...history.future],
        },
        selection: previousSelection,
        selectionHistory: {
          past: selectionHistory.past.slice(0, -1),
          future: [selection, ...selectionHistory.future],
        },
      };
    }

    if (redo.match(action)) {
      if (history.future.length === 0) {
        return state;
      }

      const nextPresentation = history.future[0];
      const nextSelection = selectionHistory.future[0];

      return {
        history: {
          past: [...history.past, history.present],
          present: nextPresentation,
          future: history.future.slice(1),
        },
        selection: nextSelection,
        selectionHistory: {
          past: [...selectionHistory.past, selection],
          future: selectionHistory.future.slice(1),
        },
      };
    }

    const previousPresent = history.present;
    const newPresent = reducer(previousPresent, action);
    const newSelection = selectionReducer(selection, action);

    if (newPresent === previousPresent) {
      return {
        history,
        selection: newSelection,
        selectionHistory,
      };
    }

    return {
      history: {
        past: [...history.past, previousPresent],
        present: newPresent,
        future: [],
      },
      selection: newSelection,
      selectionHistory: {
        past: [...selectionHistory.past, selection],
        future: [],
      },
    };
  };
};

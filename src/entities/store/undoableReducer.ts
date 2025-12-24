import { createAction, type Reducer } from "@reduxjs/toolkit";
import type { Select } from "../select/model/types.ts";
import type { Presentation } from "../presentation/model/types.ts";

export const undo = createAction("UNDO");
export const redo = createAction("REDO");

export const hydrateEditor = createAction<{
  presentation: Presentation;
  selection: Select;
}>("EDITOR/HYDRATE");

type History<S> = {
  past: S[];
  present: S;
  future: S[];
};

export type UndoableWithSelectionState<P, S> = {
  history: History<P>;
  selection: S;
};

function createHistory<S>(initial: S): History<S> {
  return { past: [], present: initial, future: [] };
}

function sanitizeSelection(
  presentation: Presentation,
  selection: Select,
): Select {
  const slideIds = new Set(presentation.slides.order);
  const filteredSlides = selection.selectedSlideIds.filter((id) =>
    slideIds.has(id),
  );

  const allObjIds = new Set<string>();
  for (const sid of presentation.slides.order) {
    const s = presentation.slides.collection[sid];
    if (!s) continue;
    for (const oid of s.slideObjects.order) allObjIds.add(oid);
  }
  const filteredObjs = selection.selectedSlideObjIds.filter((id) =>
    allObjIds.has(id),
  );

  if (filteredSlides.length > 0) {
    return {
      selectedSlideIds: filteredSlides,
      selectedSlideObjIds: filteredObjs,
    };
  }

  const first = presentation.slides.order[0];
  return first
    ? { selectedSlideIds: [first], selectedSlideObjIds: [] }
    : { selectedSlideIds: [], selectedSlideObjIds: [] };
}

export function createUndoableReducer(
  presentationReducer: Reducer<Presentation>,
  selectionReducer: Reducer<Select>,
): Reducer<UndoableWithSelectionState<Presentation, Select>> {
  const initialPresentation = presentationReducer(undefined, {
    type: "@@INIT",
  });
  const initialSelection = selectionReducer(undefined, { type: "@@INIT" });

  const initialState: UndoableWithSelectionState<Presentation, Select> = {
    history: createHistory(initialPresentation),
    selection: sanitizeSelection(initialPresentation, initialSelection),
  };

  return (state = initialState, action) => {
    if (hydrateEditor.match(action)) {
      return {
        history: createHistory(action.payload.presentation),
        selection: sanitizeSelection(
          action.payload.presentation,
          action.payload.selection,
        ),
      };
    }

    if (undo.match(action)) {
      const { past, present, future } = state.history;
      if (past.length === 0) return state;

      const previous = past[past.length - 1];
      const newPast = past.slice(0, -1);

      const newHistory: History<Presentation> = {
        past: newPast,
        present: previous,
        future: [present, ...future],
      };

      return {
        history: newHistory,
        selection: sanitizeSelection(previous, state.selection),
      };
    }

    if (redo.match(action)) {
      const { past, present, future } = state.history;
      if (future.length === 0) return state;

      const next = future[0];
      const newFuture = future.slice(1);

      const newHistory: History<Presentation> = {
        past: [...past, present],
        present: next,
        future: newFuture,
      };

      return {
        history: newHistory,
        selection: sanitizeSelection(next, state.selection),
      };
    }

    const nextPresent = presentationReducer(state.history.present, action);
    const nextSelection = selectionReducer(state.selection, action);

    if (nextPresent === state.history.present) {
      if (nextSelection === state.selection) return state;
      return {
        ...state,
        selection: sanitizeSelection(state.history.present, nextSelection),
      };
    }

    const newHistory: History<Presentation> = {
      past: [...state.history.past, state.history.present],
      present: nextPresent,
      future: [],
    };

    return {
      history: newHistory,
      selection: sanitizeSelection(nextPresent, nextSelection),
    };
  };
}

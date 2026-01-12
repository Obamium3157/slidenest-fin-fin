import { createAction, type Reducer } from "@reduxjs/toolkit";
import type { Select } from "../select/model/types.ts";
import type { Presentation } from "../presentation/model/types.ts";
import { getOrderedMapElementById } from "../../shared/types/orderedMap/OrderedMap.ts";

export const undo = createAction("UNDO");
export const redo = createAction("REDO");

export const hydrateEditor = createAction<{
  presentation: Presentation;
  selection: Select;
}>("EDITOR/HYDRATE");

export const resetEditor = createAction("EDITOR/RESET");

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

function arraysEqual(a: string[], b: string[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function buildObjToSlideMap(presentation: Presentation): Map<string, string> {
  const map = new Map<string, string>();
  for (const slideId of presentation.slides.order) {
    const slide = presentation.slides.collection[slideId];
    if (!slide) continue;
    for (const objId of slide.slideObjects.order) {
      map.set(objId, slideId);
    }
  }
  return map;
}

function diffOrder(
  fromIds: string[],
  toIds: string[],
): {
  added: string[];
  removed: string[];
  moved: string[];
} {
  const fromIndex = new Map<string, number>();
  for (let i = 0; i < fromIds.length; i++) fromIndex.set(fromIds[i], i);
  const toIndex = new Map<string, number>();
  for (let i = 0; i < toIds.length; i++) toIndex.set(toIds[i], i);

  const added: string[] = [];
  const removed: string[] = [];
  const moved: string[] = [];

  for (const id of toIds) {
    if (!fromIndex.has(id)) added.push(id);
  }
  for (const id of fromIds) {
    if (!toIndex.has(id)) removed.push(id);
  }

  for (const id of toIds) {
    const fi = fromIndex.get(id);
    const ti = toIndex.get(id);
    if (fi == null || ti == null) continue;
    if (fi !== ti) moved.push(id);
  }

  return { added, removed, moved };
}

function pickNeighborSlideId(
  removedId: string,
  fromOrder: string[],
  toOrder: string[],
): string | null {
  if (toOrder.length === 0) return null;
  const idx = fromOrder.indexOf(removedId);
  if (idx < 0) return toOrder[0] ?? null;
  const clamped = Math.min(idx, toOrder.length - 1);
  return toOrder[clamped] ?? toOrder[toOrder.length - 1] ?? null;
}

function computeUndoRedoSelection(
  from: Presentation,
  to: Presentation,
  prevSelection: Select,
): Select {
  const fromSlidesOrder = from.slides.order;
  const toSlidesOrder = to.slides.order;

  const slideOrderChanged = !arraysEqual(fromSlidesOrder, toSlidesOrder);
  const slideOrderDiff = slideOrderChanged
    ? diffOrder(fromSlidesOrder, toSlidesOrder)
    : { added: [], removed: [], moved: [] };

  const affectedSlideIdsSet = new Set<string>();
  for (const id of slideOrderDiff.added) affectedSlideIdsSet.add(id);
  for (const id of slideOrderDiff.removed) affectedSlideIdsSet.add(id);
  for (const id of slideOrderDiff.moved) affectedSlideIdsSet.add(id);

  const commonSlideIds: string[] = [];
  {
    const toSet = new Set(toSlidesOrder);
    for (const sid of fromSlidesOrder)
      if (toSet.has(sid)) commonSlideIds.push(sid);
  }

  const affectedObjIds: string[] = [];
  const contentChangedSlides: string[] = [];

  for (const slideId of commonSlideIds) {
    const fromSlide = getOrderedMapElementById(from.slides, slideId);
    const toSlide = getOrderedMapElementById(to.slides, slideId);
    if (!fromSlide || !toSlide) continue;

    if (fromSlide !== toSlide) {
      contentChangedSlides.push(slideId);
      affectedSlideIdsSet.add(slideId);
    }

    const fromOrder = fromSlide.slideObjects.order;
    const toOrder = toSlide.slideObjects.order;
    if (!arraysEqual(fromOrder, toOrder)) {
      const od = diffOrder(fromOrder, toOrder);
      for (const id of od.added) affectedObjIds.push(id);
      for (const id of od.removed) affectedObjIds.push(id);
      for (const id of od.moved) affectedObjIds.push(id);
      affectedSlideIdsSet.add(slideId);
    }

    const toObjSet = new Set(toOrder);
    for (const objId of fromOrder) {
      if (!toObjSet.has(objId)) continue;
      const fromObj = fromSlide.slideObjects.collection[objId];
      const toObj = toSlide.slideObjects.collection[objId];
      if (fromObj && toObj && fromObj !== toObj) {
        affectedObjIds.push(objId);
        affectedSlideIdsSet.add(slideId);
      }
    }
  }

  const uniqObjIds: string[] = [];
  {
    const set = new Set<string>();
    for (const id of affectedObjIds) {
      if (!id || set.has(id)) continue;
      set.add(id);
      uniqObjIds.push(id);
    }
  }

  const toObjToSlide = buildObjToSlideMap(to);
  const fromObjToSlide = buildObjToSlideMap(from);

  const objIdsInTo: string[] = [];
  for (const id of uniqObjIds) {
    if (toObjToSlide.has(id)) objIdsInTo.push(id);
  }

  if (objIdsInTo.length > 0) {
    const counts = new Map<string, number>();
    for (const objId of objIdsInTo) {
      const sid = toObjToSlide.get(objId);
      if (!sid) continue;
      counts.set(sid, (counts.get(sid) ?? 0) + 1);
    }

    let bestSlideId: string | null = null;
    let bestCount = -1;
    for (const [sid, c] of counts.entries()) {
      if (c > bestCount) {
        bestSlideId = sid;
        bestCount = c;
      }
    }

    if (bestSlideId) {
      const selectedObjIds = objIdsInTo.filter(
        (oid) => toObjToSlide.get(oid) === bestSlideId,
      );
      return {
        selectedSlideIds: [bestSlideId],
        selectedSlideObjIds: selectedObjIds,
      };
    }
  }

  const affectedSlideIds = Array.from(affectedSlideIdsSet);
  const toSlidesSet = new Set(toSlidesOrder);

  for (const sid of slideOrderDiff.added) {
    if (toSlidesSet.has(sid)) {
      return { selectedSlideIds: [sid], selectedSlideObjIds: [] };
    }
  }

  if (slideOrderDiff.removed.length > 0) {
    const neighbor = pickNeighborSlideId(
      slideOrderDiff.removed[0],
      fromSlidesOrder,
      toSlidesOrder,
    );
    if (neighbor)
      return { selectedSlideIds: [neighbor], selectedSlideObjIds: [] };
  }

  for (const sid of slideOrderDiff.moved) {
    if (toSlidesSet.has(sid)) {
      return { selectedSlideIds: [sid], selectedSlideObjIds: [] };
    }
  }

  if (uniqObjIds.length > 0) {
    const counts = new Map<string, number>();
    for (const oid of uniqObjIds) {
      const sid = fromObjToSlide.get(oid);
      if (!sid) continue;
      if (!toSlidesSet.has(sid)) continue;
      counts.set(sid, (counts.get(sid) ?? 0) + 1);
    }

    let bestSlideId: string | null = null;
    let bestCount = -1;
    for (const [sid, c] of counts.entries()) {
      if (c > bestCount) {
        bestSlideId = sid;
        bestCount = c;
      }
    }

    if (bestSlideId) {
      return { selectedSlideIds: [bestSlideId], selectedSlideObjIds: [] };
    }
  }

  for (const sid of contentChangedSlides) {
    if (toSlidesSet.has(sid)) {
      return { selectedSlideIds: [sid], selectedSlideObjIds: [] };
    }
  }

  if (affectedSlideIds.length > 0) {
    for (const sid of affectedSlideIds) {
      if (toSlidesSet.has(sid)) {
        return { selectedSlideIds: [sid], selectedSlideObjIds: [] };
      }
    }
  }

  return prevSelection;
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
    if (resetEditor.match(action)) {
      return initialState;
    }

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
        selection: sanitizeSelection(
          previous,
          computeUndoRedoSelection(present, previous, state.selection),
        ),
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
        selection: sanitizeSelection(
          next,
          computeUndoRedoSelection(present, next, state.selection),
        ),
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

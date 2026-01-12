import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import {
  getNewOrderedMapWithPushed,
  getNewOrderedMapWithRemoved,
  newOrderedMap,
  findOrderedMapElementIndex,
  getOrderedMapElementById,
} from "../../shared/types/orderedMap/OrderedMap.ts";
import { generateId } from "../../shared/lib/generateId.ts";
import { MAX_PRESENTATION_TITLE_SIZE } from "../../shared/lib/constants/constants.ts";
import type { Presentation } from "../presentation/model/types.ts";
import type { Slide, SlideObj } from "../slide/model/types.ts";
import slidesReducer from "./slidesReducer.ts";
import slideObjectReducer from "./slideObjectReducer.ts";
import { createDefaultPresentation } from "../presentation/model/createDefaultPresentation.ts";
import type { AppThunk } from "./types.ts";
import { getCurrentStatePresentation } from "./selectors.ts";
import { scheduleDeleteImageIfOrphaned } from "./storageImageGc.ts";

const initialState: Presentation = createDefaultPresentation();

const presentationSlice = createSlice({
  name: "presentation",
  initialState,
  reducers: {
    setPresentationTitle: (
      state,
      action: PayloadAction<{ newTitle: string }>,
    ) => {
      const { newTitle } = action.payload;
      if (
        newTitle.length <= MAX_PRESENTATION_TITLE_SIZE &&
        state.title !== newTitle
      ) {
        state.title = newTitle;
      }
    },

    addSlide: (state) => {
      const newId = generateId();
      const newSlide: Slide = {
        id: newId,
        backgroundColor: { type: "color", color: "#ffffff" },
        slideObjects: newOrderedMap<SlideObj>(),
      };
      state.slides = getNewOrderedMapWithPushed(state.slides, newId, newSlide);
    },
    removeSlide: (state, action: PayloadAction<{ targetSlideId: string }>) => {
      const { targetSlideId } = action.payload;
      const deletedIndex = findOrderedMapElementIndex(
        state.slides,
        targetSlideId,
      );
      const newSlides = getNewOrderedMapWithRemoved(
        state.slides,
        targetSlideId,
      );
      if (deletedIndex === -1) {
        return;
      }
      state.slides = newSlides;
    },

    ...slidesReducer,
    ...slideObjectReducer,
  },
});

function isImageSrcReferencedInPresentation(
  presentation: Presentation,
  src: string,
): boolean {
  for (const slideId of presentation.slides.order) {
    const slide = getOrderedMapElementById(presentation.slides, slideId);
    if (!slide) continue;

    for (const objId of slide.slideObjects.order) {
      const obj = getOrderedMapElementById(slide.slideObjects, objId);
      if (!obj || obj.type !== "image") continue;
      if (obj.src === src) return true;
    }
  }

  return false;
}

function collectImageSrcsFromSlideObjects(
  presentation: Presentation,
  slideId: string,
  objIds: string[],
): string[] {
  const slide = getOrderedMapElementById(presentation.slides, slideId);
  if (!slide) return [];

  const srcs: string[] = [];
  for (const objId of objIds) {
    const obj = getOrderedMapElementById(slide.slideObjects, objId);
    if (!obj || obj.type !== "image") continue;
    if (obj.src) srcs.push(obj.src);
  }

  return srcs;
}

function collectImageSrcsFromSlide(
  presentation: Presentation,
  slideId: string,
): string[] {
  const slide = presentation.slides.collection[slideId];
  if (!slide) return [];

  const srcs: string[] = [];
  for (const objId of slide.slideObjects.order) {
    const obj = getOrderedMapElementById(slide.slideObjects, objId);
    if (!obj || obj.type !== "image") continue;
    if (obj.src) srcs.push(obj.src);
  }
  return srcs;
}

function uniq(values: string[]): string[] {
  const set = new Set<string>();
  for (const v of values) if (v) set.add(v);
  return Array.from(set);
}

export const removeSlideObjectsWithStorageCleanup = (payload: {
  slideId: string;
  objIds: string[];
}): AppThunk => {
  return (dispatch, getState) => {
    const before = getCurrentStatePresentation(getState());
    const srcs = uniq(
      collectImageSrcsFromSlideObjects(before, payload.slideId, payload.objIds),
    );

    dispatch(removeSlideObjects(payload));

    if (srcs.length === 0) return;

    const after = getCurrentStatePresentation(getState());
    for (const src of srcs) {
      if (isImageSrcReferencedInPresentation(after, src)) continue;
      dispatch(scheduleDeleteImageIfOrphaned(src));
    }
  };
};

export const removeSlideWithStorageCleanup = (payload: {
  targetSlideId: string;
}): AppThunk => {
  return (dispatch, getState) => {
    const before = getCurrentStatePresentation(getState());
    const srcs = uniq(collectImageSrcsFromSlide(before, payload.targetSlideId));

    dispatch(removeSlide(payload));

    if (srcs.length === 0) return;

    const after = getCurrentStatePresentation(getState());
    for (const src of srcs) {
      if (isImageSrcReferencedInPresentation(after, src)) continue;
      dispatch(scheduleDeleteImageIfOrphaned(src));
    }
  };
};

export const {
  setPresentationTitle,
  addSlide,
  removeSlide,
  moveSlide,
  moveMultipleSlides,
  updateSlideBackgroundColor,
  addTextToSlide,
  addImageToSlide,
  removeSlideObject,
  removeSlideObjects,
  updateSlideObject,
  changeSlideObjectPosition,
  changeMultipleSlideObjectsPosition,
  setSlideObjRect,
  changeSlideObjSize,
  updateTextContent,
  updateTextFont,
  changeFontFamily,
  changeFontSize,
  changeFontWeight,
  changeFontStyle,
  changeFontColor,
  changeLetterSpacing,
  changeWordSpacing,
  changeTextDecoration,
  changeTextTransform,
  updateTextHtml,
  updateTextDir,
} = presentationSlice.actions;
export default presentationSlice.reducer;

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import {
  getNewOrderedMapWithPushed,
  getNewOrderedMapWithRemoved,
  newOrderedMap,
  findOrderedMapElementIndex,
} from "../../shared/types/orderedMap/OrderedMap.ts";
import { generateId } from "../../shared/lib/generateId.ts";
import { MAX_PRESENTATION_TITLE_SIZE } from "../../shared/lib/constants/constants.ts";
import type { Presentation } from "../presentation/model/types.ts";
import type { Slide, SlideObj } from "../slide/model/types.ts";
import { getMaxEditor } from "../presentation/model/test/data.ts";
import slidesReducer from "./slidesReducer.ts";
import slideObjectReducer from "./slideObjectReducer.ts";

const initialState: Presentation = getMaxEditor().presentation;

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
} = presentationSlice.actions;
export default presentationSlice.reducer;

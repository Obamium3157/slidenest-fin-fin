import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Select } from "../select/model/types.ts";

const initialState: Select = {
  selectedSlideIds: [],
  selectedSlideObjIds: [],
};

const selectionSlice = createSlice({
  name: "selection",
  initialState,
  reducers: {
    selectSlide: (state, action: PayloadAction<{ slideId: string }>) => {
      const { slideId } = action.payload;
      if (!state.selectedSlideIds.includes(slideId)) {
        state.selectedSlideIds = [slideId];
        state.selectedSlideObjIds = [];
      }
    },
    selectSlideObj: (state, action: PayloadAction<{ objId: string }>) => {
      const { objId } = action.payload;
      const isSelected = state.selectedSlideObjIds.includes(objId);
      state.selectedSlideObjIds = isSelected
        ? state.selectedSlideObjIds.filter((id) => id !== objId)
        : [...state.selectedSlideObjIds, objId];
    },
    addSlideObjToSelection: (
      state,
      action: PayloadAction<{ objId: string }>,
    ) => {
      const { objId } = action.payload;
      if (!state.selectedSlideObjIds.includes(objId)) {
        state.selectedSlideObjIds.push(objId);
      }
    },
    deselectSlideObjects: (
      state,
      action: PayloadAction<{ objIds: string[] }>,
    ) => {
      const { objIds } = action.payload;
      state.selectedSlideObjIds = state.selectedSlideObjIds.filter(
        (id) => !objIds.includes(id),
      );
    },
    clearSelection: (state) => {
      state.selectedSlideIds = [];
      state.selectedSlideObjIds = [];
    },

    setSelection: (_state, action: PayloadAction<Select>) => {
      return action.payload;
    },

    updateSlideSelectionAfterRemoval: (
      state,
      action: PayloadAction<{ deletedIndex: number; newOrder: string[] }>,
    ) => {
      const { deletedIndex, newOrder } = action.payload;
      if (newOrder.length === 0) {
        state.selectedSlideIds = [];
        return;
      }

      let newSelectedSlideId: string | undefined;
      if (deletedIndex > 0 && deletedIndex <= newOrder.length) {
        newSelectedSlideId = newOrder[deletedIndex - 1];
      } else if (newOrder.length > 0) {
        newSelectedSlideId = newOrder[0];
      }

      if (newSelectedSlideId) {
        state.selectedSlideIds = [newSelectedSlideId];
        state.selectedSlideObjIds = [];
      }
    },
    selectSlideRange: (
      state,
      action: PayloadAction<{
        slideId: string;
        shift: boolean;
        allSlideIds: string[];
        currentSelectedSlideIds: string[];
      }>,
    ) => {
      const { slideId, shift, allSlideIds, currentSelectedSlideIds } =
        action.payload;

      if (!shift || currentSelectedSlideIds.length === 0) {
        state.selectedSlideIds = [slideId];
        state.selectedSlideObjIds = [];
        return;
      }

      const firstSelectedId = currentSelectedSlideIds[0];
      const fromIdx = Math.max(0, allSlideIds.indexOf(firstSelectedId));
      const toIdx = Math.max(0, allSlideIds.indexOf(slideId));

      if (fromIdx === -1 || toIdx === -1) {
        state.selectedSlideIds = [slideId];
        state.selectedSlideObjIds = [];
        return;
      }

      const start = Math.min(fromIdx, toIdx);
      const end = Math.max(fromIdx, toIdx);

      state.selectedSlideIds = allSlideIds.slice(start, end + 1);
      state.selectedSlideObjIds = [];
    },
  },
});

export const {
  selectSlide,
  selectSlideObj,
  addSlideObjToSelection,
  deselectSlideObjects,
  clearSelection,
  setSelection,
  updateSlideSelectionAfterRemoval,
  selectSlideRange,
} = selectionSlice.actions;
export default selectionSlice.reducer;

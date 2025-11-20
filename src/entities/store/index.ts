import { configureStore } from "@reduxjs/toolkit";

import presentationReducer from "./presentationSlice";
import selectionReducer from "./selectionSlice";

export const store = configureStore({
  reducer: {
    presentation: presentationReducer,
    selection: selectionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

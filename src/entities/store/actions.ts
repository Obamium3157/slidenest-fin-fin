import { bindActionCreators } from "redux";
import * as presentationActions from "./presentationSlice";
import * as selectionActions from "./selectionSlice";
import { useAppDispatch } from "./hooks.ts";
import { redo, undo } from "./undoableReducer.ts";

const rootActions = {
  ...presentationActions,
  ...selectionActions,
  undo,
  redo,
};

export const useAppActions = () => {
  const dispatch = useAppDispatch();
  return bindActionCreators(rootActions, dispatch);
};

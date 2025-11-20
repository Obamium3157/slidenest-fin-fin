import { bindActionCreators } from "redux";
import * as presentationActions from "./presentationSlice";
import * as selectionActions from "./selectionSlice";
import { useAppDispatch } from "./hooks.ts";

const rootActions = {
  ...presentationActions,
  ...selectionActions,
};

export const useAppActions = () => {
  const dispatch = useAppDispatch();
  return bindActionCreators(rootActions, dispatch);
};

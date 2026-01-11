import { useEffect, useRef } from "react";
import type { RootState } from "../../../../../entities/store/types.ts";
import { updateTextHtml } from "../../../../../entities/store/presentationSlice.ts";
import {
  autosaveTick,
  AUTOSAVE_INTERVAL_MS,
} from "../../../../../entities/store/autosaveTimer.ts";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../../../entities/store/hooks.ts";

export function useDebouncedTextCommit(
  slideId: string,
  objId: string,
  contentHtml: string,
) {
  const dispatch = useAppDispatch();
  const status = useAppSelector((s: RootState) => s.app.status);
  const lastCommitted = useRef<string | null>(null);
  const timerId = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (status !== "ready") return;

    if (timerId.current !== null) {
      clearTimeout(timerId.current);
      timerId.current = null;
    }

    timerId.current = setTimeout(() => {
      if (lastCommitted.current === contentHtml) return;
      lastCommitted.current = contentHtml;
      dispatch(updateTextHtml({ slideId, objId, contentHtml }));
      void dispatch(autosaveTick());
    }, AUTOSAVE_INTERVAL_MS);

    return () => {
      if (timerId.current !== null) {
        clearTimeout(timerId.current);
        timerId.current = null;

        if (lastCommitted.current !== contentHtml) {
          lastCommitted.current = contentHtml;
          dispatch(updateTextHtml({ slideId, objId, contentHtml }));
          void dispatch(autosaveTick());
        }
      }
    };
  }, [dispatch, slideId, objId, contentHtml, status]);
}

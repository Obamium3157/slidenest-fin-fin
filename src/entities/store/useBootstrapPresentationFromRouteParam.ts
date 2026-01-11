import { useEffect, useRef } from "react";

import { bootstrapPresentation } from "./appSlice.ts";
import { useAppDispatch } from "./hooks.ts";

export function useBootstrapPresentationFromRouteParam(
  presentationId: string | undefined,
): void {
  const dispatch = useAppDispatch();
  const lastRequestedIdRef = useRef<string | null>(null);

  useEffect(() => {
    const nextId = presentationId ?? null;
    if (lastRequestedIdRef.current === nextId) return;
    lastRequestedIdRef.current = nextId;

    void dispatch(bootstrapPresentation({ presentationId: nextId }));
  }, [dispatch, presentationId]);
}

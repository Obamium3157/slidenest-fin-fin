import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import styles from "./player.module.css";

import { Workspace } from "../../../widgets/workspace/ui/Workspace.tsx";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../entities/store/hooks.ts";
import { bootstrapPresentation } from "../../../entities/store/appSlice.ts";
import { useAppActions } from "../../../entities/store/actions.ts";
import { getOrderedMapOrder } from "../../../shared/types/orderedMap/OrderedMap.ts";

type RouteParams = {
  presentationId?: string;
};

const SLIDE_W = 1250;
const SLIDE_H = 700;

export function PresentationPlayer() {
  const dispatch = useAppDispatch();
  const { selectSlide } = useAppActions();

  const status = useAppSelector((s) => s.app.status);
  const error = useAppSelector((s) => s.app.error);
  const presentation = useAppSelector((s) => s.presentation.history.present);
  const selection = useAppSelector((s) => s.presentation.selection);

  const { presentationId } = useParams<RouteParams>();

  const lastRequestedIdRef = useRef<string | null>(null);

  useEffect(() => {
    const nextId = presentationId ?? null;
    if (lastRequestedIdRef.current === nextId) return;
    lastRequestedIdRef.current = nextId;
    void dispatch(bootstrapPresentation({ presentationId: nextId }));
  }, [dispatch, presentationId]);

  const slideIds = useMemo(() => {
    return getOrderedMapOrder(presentation.slides);
  }, [presentation.slides]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (slideIds.length === 0) return;

      const currentId = selection.selectedSlideIds[0];
      const currentIdx = currentId ? slideIds.indexOf(currentId) : -1;

      if (e.key === " " || e.key === "PageDown") {
        e.preventDefault();
      }

      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        const next = slideIds[Math.min(slideIds.length - 1, currentIdx + 1)];
        if (next) selectSlide({ slideId: next });
      }

      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        const prev = slideIds[Math.max(0, currentIdx - 1)];
        if (prev) selectSlide({ slideId: prev });
      }

      if (e.key === "Home") {
        selectSlide({ slideId: slideIds[0] });
      }

      if (e.key === "End") {
        selectSlide({ slideId: slideIds[slideIds.length - 1] });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectSlide, selection.selectedSlideIds, slideIds]);

  const [scale, setScale] = useState(1);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const s = Math.min(w / SLIDE_W, h / SLIDE_H) * 0.98;
      setScale(Number.isFinite(s) && s > 0 ? s : 1);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (status === "loading" || status === "idle") {
    return <div>Загрузка презентации...</div>;
  }

  if (status === "error") {
    return <div>Ошибка загрузки: {error}</div>;
  }

  return (
    <div className={styles.playerRoot}>
      <div className={styles.stage}>
        <div className={styles.scaled} style={{ transform: `scale(${scale})` }}>
          <Workspace mode="player" />
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import styles from "./player.module.css";

import { Workspace } from "../../../widgets/workspace/ui/Workspace.tsx";
import { useAppSelector } from "../../../entities/store/hooks.ts";
import { useBootstrapPresentationFromRouteParam } from "../../../entities/store/useBootstrapPresentationFromRouteParam.ts";
import { useAppActions } from "../../../entities/store/actions.ts";
import {
  SLIDE_HEIGHT,
  SLIDE_WIDTH,
} from "../../../shared/lib/constants/constants.ts";
import {
  getOrderedMapElementById,
  getOrderedMapOrder,
} from "../../../shared/types/orderedMap/OrderedMap.ts";
import type { Slide } from "../../../entities/slide/model/types.ts";

type RouteParams = {
  presentationId?: string;
};

export function PresentationPlayer() {
  const { selectSlide } = useAppActions();

  const status = useAppSelector((s) => s.app.status);
  const error = useAppSelector((s) => s.app.error);
  const presentation = useAppSelector((s) => s.presentation.history.present);
  const selection = useAppSelector((s) => s.presentation.selection);

  const { presentationId } = useParams<RouteParams>();

  useBootstrapPresentationFromRouteParam(presentationId);

  const slideIds = useMemo(() => {
    return getOrderedMapOrder(presentation.slides);
  }, [presentation.slides]);

  const activeSlideId = selection.selectedSlideIds[0] ?? slideIds[0];
  const activeSlide = (
    activeSlideId
      ? (getOrderedMapElementById(presentation.slides, activeSlideId) as Slide)
      : null
  ) as Slide | null;

  useEffect(() => {
    const first = slideIds[0];
    if (!first) return;
    if (selection.selectedSlideIds[0]) return;
    selectSlide({ slideId: first });
  }, [selectSlide, selection.selectedSlideIds, slideIds]);

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
  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const update = () => {
      const rect = stage.getBoundingClientRect();
      const s = Math.min(rect.width / SLIDE_WIDTH, rect.height / SLIDE_HEIGHT);
      setScale(Number.isFinite(s) && s > 0 ? s : 1);
    };

    update();

    const ro = new ResizeObserver(() => update());
    ro.observe(stage);
    window.addEventListener("resize", update);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  if (status === "loading" || status === "idle") {
    return <div>Загрузка презентации...</div>;
  }

  if (status === "error") {
    return <div>Ошибка загрузки: {error}</div>;
  }

  const stageBg = activeSlide?.backgroundColor?.color ?? "black";

  return (
    <div className={styles.playerRoot} style={{ background: stageBg }}>
      <div
        className={styles.stage}
        ref={stageRef}
        style={{ background: stageBg }}
      >
        <div className={styles.scaled} style={{ transform: `scale(${scale})` }}>
          <Workspace mode="player" />
        </div>
      </div>
    </div>
  );
}

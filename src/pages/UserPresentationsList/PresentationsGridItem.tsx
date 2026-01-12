import type { MouseEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  SLIDE_HEIGHT,
  SLIDE_WIDTH,
} from "../../shared/lib/constants/constants.ts";
import type { Slide } from "../../entities/slide/model/types.ts";
import { AllSlideObjects } from "../../widgets/allSlideObjects/ui/AllSlideObjects.tsx";
import styles from "./PresentationsGrid.module.css";

import trash from "./assets/tabler/trash.svg";

type PresentationsGridItemProps =
  | {
      kind: "create";
      title: string;
      disabled?: boolean;
      onClick: () => void;
    }
  | {
      kind: "presentation";
      title: string;
      to: string;
      slide: Slide | null;
      showDelete: boolean;
      deleting?: boolean;
      onDelete: (e: MouseEvent<HTMLButtonElement>) => void;
    };

const PREVIEW_SCALE_FACTOR = 5;

function PlusIcon() {
  return (
    <svg
      className={styles.createPlus}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 5v14M5 12h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PresentationsGridItem(props: PresentationsGridItemProps) {
  if (props.kind === "create") {
    return (
      <button
        type="button"
        className={`${styles.tile} ${styles.tileButton}`}
        onClick={props.onClick}
        disabled={props.disabled}
      >
        <div className={styles.preview} style={{ background: "#ffffff" }}>
          <div className={styles.createPlaceholderContent}>
            <PlusIcon />
          </div>
        </div>

        <div className={styles.titleRow}>
          <div className={styles.titleText} style={{ textAlign: "center" }}>
            {props.title}
          </div>
        </div>
      </button>
    );
  }

  const { slide } = props;

  const content: ReactNode = (
    <>
      <div
        className={styles.preview}
        style={{ background: slide?.backgroundColor?.color ?? "#ffffff" }}
      >
        {slide ? (
          <div
            className={styles.previewInner}
            style={{
              width: SLIDE_WIDTH,
              height: SLIDE_HEIGHT,
              transform: `scale(${1 / PREVIEW_SCALE_FACTOR})`,
              transformOrigin: "top left",
            }}
          >
            <AllSlideObjects slide={slide} readonly />
          </div>
        ) : (
          <div className={styles.previewPlaceholder} />
        )}
      </div>

      <div className={styles.titleRow}>
        <div className={styles.titleText}>{props.title}</div>

        {props.showDelete && (
          <button
            type="button"
            className={styles.deleteButton}
            onClick={props.onDelete}
            disabled={props.deleting}
            aria-label="Удалить презентацию"
            title="Удалить"
          >
            <img className={styles.deleteIcon} src={trash} alt={"Удалить"} />
          </button>
        )}
      </div>
    </>
  );

  return (
    <Link to={props.to} className={styles.tile}>
      {content}
    </Link>
  );
}

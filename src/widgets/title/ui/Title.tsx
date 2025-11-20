import styles from "./title.module.css";
import { useEffect, useState } from "react";
import * as React from "react";
import { useAppSelector } from "../../../entities/store/hooks.ts";
import { useAppActions } from "../../../entities/store/actions.ts";
import { PRESENTATION_TITLE_PLACEHOLDER } from "../../../shared/lib/constants/constants.ts";

export function Title() {
  const presentation = useAppSelector((state) => state.presentation);

  const { setPresentationTitle } = useAppActions();

  const [width, setWidth] = useState(presentation.title.length);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPresentationTitle({
      newTitle: e.target.value,
    });
  };

  useEffect(() => {
    const newWidth = presentation.title.length;
    setWidth(newWidth === 0 ? PRESENTATION_TITLE_PLACEHOLDER.length : newWidth);
  }, [presentation.title]);

  return (
    <input
      type={"text"}
      className={styles.title}
      value={presentation.title}
      style={{
        width: `${width + 1}ch`,
      }}
      placeholder={"Название презентации"}
      onChange={handleInputChange}
    />
  );
}

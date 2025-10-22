import styles from "./title.module.css";
import type { Editor } from "../../../entities/editor/model/types.ts";
import { useEffect, useState } from "react";
import * as React from "react";
import { dispatch } from "../../../entities/editor/lib/modifyEditor.ts";
import { changePresentationTitle } from "../../../entities/editor/lib/editor.ts";

type TitleProps = {
  editor: Editor;
};

export function Title(props: TitleProps) {
  const { editor } = props;

  const [width, setWidth] = useState(editor.presentation.title.length);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(changePresentationTitle, [e.target.value]);
  };

  useEffect(() => {
    const newWidth = editor.presentation.title.length;
    setWidth(newWidth);
  }, [editor.presentation.title]);

  return (
    <input
      type={"text"}
      className={styles.title}
      value={editor.presentation.title}
      style={{
        width: `${width + 1}ch`,
      }}
      onChange={handleInputChange}
    />
  );
}

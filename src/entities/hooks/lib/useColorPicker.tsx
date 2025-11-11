import { useCallback } from "react";
import * as React from "react";

export function useColorPicker(
  inputRef?: React.RefObject<HTMLInputElement | null>,
) {
  const pickColor = useCallback((): Promise<string | null> => {
    const input = inputRef?.current;
    if (!input) {
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      const onInput = (event: Event) => {
        const val = (event.target as HTMLInputElement).value;
        resolve(val);
      };

      input.addEventListener("input", onInput, { once: true });
      input.click();
    });
  }, [inputRef]);

  return { pickColor };
}

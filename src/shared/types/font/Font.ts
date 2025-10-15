import type { Color } from "../color/Color.ts";

export type Font = {
  type: "font";
  fontFamily: string;
  fontSize: string;
  fontWeight?: "normal" | "bold" | "bolder" | "lighter" | number;
  fontStyle?: Set<"normal" | "bold" | "italic">;
  letterSpacing?: string;
  wordSpacing?: string;
  color?: Color;
  textDecoration?: Set<"underline" | "underline dotted" | "underline wavy">;
  textTransform?: "none" | "uppercase" | "lowercase";
};

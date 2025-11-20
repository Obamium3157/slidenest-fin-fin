import type { Color } from "../color/Color.ts";

export type FontStyle = "normal" | "italic";
export type TextDecoration =
  | "none"
  | "underline"
  | "underline dotted"
  | "underline wavy";

export type Font = {
  type: "font";
  fontFamily: string;
  fontSize: string;
  fontWeight?: "normal" | "bold" | "bolder" | "lighter" | number;
  fontStyle?: FontStyle;
  letterSpacing?: string;
  wordSpacing?: string;
  color?: Color;
  textDecoration?: TextDecoration;
  textTransform?: "none" | "uppercase" | "lowercase";
};

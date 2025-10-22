import type { Font } from "../../../shared/types/font/Font.ts";
import * as React from "react";

export function getStyleFromFont(font: Font): React.CSSProperties {
  const fontStyle = font?.fontStyle
    ? Array.from(font.fontStyle).join(" ")
    : "normal";

  const textDecoration = font?.textDecoration
    ? Array.from(font.textDecoration).join(" ")
    : "none";

  let fontStyleValue: React.CSSProperties["fontStyle"] = undefined;
  if (fontStyle && fontStyle.length > 0) {
    fontStyleValue = fontStyle.includes("italic") ? "italic" : "normal";
  }

  return {
    fontFamily: font?.fontFamily ?? "SST",
    fontSize: font.fontSize,
    fontWeight: font?.fontWeight,
    fontStyle: fontStyleValue,
    letterSpacing: font?.letterSpacing,
    wordSpacing: font?.wordSpacing,
    color: font?.color?.color ?? "inherit",
    textDecoration,
    textTransform: font?.textTransform,
    whiteSpace: "pre-wrap",
    overflow: "hidden",
  };
}

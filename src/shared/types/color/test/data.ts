import type { Color } from "../Color.ts";

export function makeColor(hex = "#FFFFFF"): Color {
  return {
    type: "color",
    color: hex,
  };
}

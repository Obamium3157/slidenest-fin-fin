import { makeColor } from "../../color/test/data.ts";
import type { Font } from "../Font.ts";

export function defaultFont(): Font {
  return {
    type: "font",
    fontFamily: "SST",
    fontSize: "30px",
    fontWeight: "normal",
    fontStyle: new Set([]),
    letterSpacing: "0px",
    wordSpacing: "5px",
    color: makeColor("#222222"),
    textDecoration: new Set(),
    textTransform: "none",
  };
}

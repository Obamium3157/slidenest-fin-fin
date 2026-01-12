export type FontPreset = {
  id: string;
  label: string;
  fontFamily: string;
};

export const FONT_PRESETS: FontPreset[] = [
  {
    id: "sst",
    label: "SST",
    fontFamily: "SST",
  },
  {
    id: "roboto",
    label: "Roboto",
    fontFamily: "Roboto",
  },
  {
    id: "comic_relief",
    label: "Comic Relief",
    fontFamily: "ComicRelief",
  },
  {
    id: "google_sans",
    label: "Google Sans",
    fontFamily: "GoogleSans",
  },
  {
    id: "noto_sans_js",
    label: "Noto Sans JP",
    fontFamily: "NotoSansJP",
  },
  {
    id: "yuji_boku",
    label: "湯治穆",
    fontFamily: "YujiBoku",
  },
  {
    id: "rubik",
    label: "Rubik",
    fontFamily: "Rubik",
  },
  {
    id: "amiri",
    label: "Amiri",
    fontFamily: "Amiri",
  },
];

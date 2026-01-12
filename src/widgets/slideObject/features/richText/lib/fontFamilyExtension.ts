import { Mark, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontFamily: {
      setFontFamily: (family: string) => ReturnType;
      unsetFontFamily: () => ReturnType;
    };
  }
}

function normalizeFontFamily(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  if (!v) return null;
  return v;
}

export const FontFamily = Mark.create({
  name: "fontFamily",
  inclusive: true,

  addAttributes() {
    return {
      family: {
        default: null,
        renderHTML: (attributes) => {
          const family = normalizeFontFamily(attributes.family);
          if (!family) return {};
          return { style: `font-family: ${family}` };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[style]",
        getAttrs: (element) => {
          const el = element as HTMLElement;
          const family = normalizeFontFamily(el.style.fontFamily);
          if (!family) return false;
          return { family };
        },
      },
      {
        style: "font-family",
        getAttrs: (value) => {
          const family = normalizeFontFamily(value);
          if (!family) return false;
          return { family };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setFontFamily:
        (family: string) =>
        ({ commands }) =>
          commands.setMark(this.name, { family: normalizeFontFamily(family) }),
      unsetFontFamily:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    };
  },
});

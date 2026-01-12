import { Mark, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

function normalizeFontSize(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  if (!v) return null;

  const px = v.match(/^(-?\d+(?:\.\d+)?)px$/i);
  if (px) return `${Number(px[1])}px`;

  const num = v.match(/^(-?\d+(?:\.\d+)?)$/);
  if (num) return `${Number(num[1])}px`;

  return v;
}

export const FontSize = Mark.create({
  name: "fontSize",
  inclusive: true,

  addAttributes() {
    return {
      size: {
        default: null,
        renderHTML: (attributes) => {
          const size = normalizeFontSize(attributes.size);
          if (!size) return {};
          return { style: `font-size: ${size}` };
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
          const size = normalizeFontSize(el.style.fontSize);
          if (!size) return false;
          return { size };
        },
      },
      {
        style: "font-size",
        getAttrs: (value) => {
          const size = normalizeFontSize(value);
          if (!size) return false;
          return { size };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setFontSize:
        (size: string) =>
        ({ commands }) =>
          commands.setMark(this.name, { size: normalizeFontSize(size) }),
      unsetFontSize:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    };
  },
});

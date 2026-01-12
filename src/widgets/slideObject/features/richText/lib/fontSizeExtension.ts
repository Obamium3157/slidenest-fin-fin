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
        parseHTML: (element) =>
          normalizeFontSize((element as HTMLElement).style.fontSize),
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
        style: "font-size",
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

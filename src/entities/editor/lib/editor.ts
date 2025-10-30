import {
  findOrderedMapElementIndex,
  getNewOrderedMapWithMoved,
  getNewOrderedMapWithPushed,
  getNewOrderedMapWithRemoved,
  getOrderedMapElementById,
  getOrderedMapOrder,
  newOrderedMap,
  type OrderedMap,
} from "../../../shared/types/orderedMap/OrderedMap.ts";
import type { Color } from "../../../shared/types/color/Color.ts";
import type { Slide, SlideObj } from "../../slide/model/types.ts";
import type { SlideText } from "../../slideText/model/types.ts";
import type { Rect } from "../../../shared/types/rect/Rect.ts";
import type { Font } from "../../../shared/types/font/Font.ts";
import type { Select } from "../../select/model/types.ts";
import { generateId } from "../../../shared/lib/generateId.ts";
import type { SlideImage } from "../../slideImage/model/types.ts";
import type { Presentation } from "../../presentation/model/types.ts";
import type { Editor } from "../model/types.ts";
import { defaultTextObjectParameters } from "../../slideText/model/test/data.ts";
import {
  SLIDE_HEIGHT,
  SLIDE_WIDTH,
} from "../../../shared/lib/constants/constants.ts";

const MAX_PRESENTATION_TITLE_SIZE: number = 70;
export const PRESENTATION_TITLE_PLACEHOLDER: string = "Название презентации";
const SLIDE_SIZE = {
  w: 1250,
  h: 700,
};

export function changePresentationTitle(
  editor: Editor,
  newTitle: string,
): Editor {
  const { presentation, select } = editor;

  if (
    newTitle !== presentation.title &&
    0 <= newTitle.length &&
    newTitle.length <= MAX_PRESENTATION_TITLE_SIZE
  ) {
    return {
      presentation: { ...presentation, title: newTitle },
      select,
    };
  }

  return editor;
}

export function addSlide(editor: Editor): Editor {
  const { presentation } = editor;
  const col: Color = { type: "color", color: "#ffffff" };
  const newId: string = generateId();
  const newSlide: Slide = {
    id: newId,
    backgroundColor: col,
    slideObjects: newOrderedMap<SlideObj>(),
  };

  const newSlides = getNewOrderedMapWithPushed(
    presentation.slides,
    newId,
    newSlide,
  );
  const newPresentation = {
    ...presentation,
    slides: newSlides,
  };

  const newSelect: Select = {
    selectedSlideId: [newSlide.id],
    selectedSlideObjId: [],
  };

  return { presentation: newPresentation, select: newSelect };
}

export function removeSlide(editor: Editor, targetSlideId: string): Editor {
  const { presentation, select } = editor;

  const deletedIndex = findOrderedMapElementIndex(
    presentation.slides,
    targetSlideId,
  );

  const newSlides: OrderedMap<Slide> = getNewOrderedMapWithRemoved(
    presentation.slides,
    targetSlideId,
  );

  const newSlidesOrder = getOrderedMapOrder(newSlides);

  const newPresentation = {
    ...presentation,
    slides: newSlides,
  };

  // select.selectedSlideId = [];
  // select.selectedSlideObjId = [];
  const newSelect: Select = { selectedSlideId: [], selectedSlideObjId: [] };

  if (deletedIndex === -1) {
    return { presentation, select };
  } else if (deletedIndex > 0) {
    newSelect.selectedSlideId = [newSlidesOrder[deletedIndex - 1]];
  } else {
    // === 0
    if (newSlidesOrder.length > 0) {
      newSelect.selectedSlideId = [newSlidesOrder[0]];
    }
  }

  return { presentation: newPresentation, select: newSelect };
}

export function moveSlide(
  editor: Editor,
  slideId: string,
  toIdx: number,
): Editor {
  const { presentation, select } = editor;

  return {
    presentation: {
      ...presentation,
      slides: getNewOrderedMapWithMoved(presentation.slides, slideId, toIdx),
    },
    select,
  };
}

export function removeSlideObj(
  editor: Editor,
  slideId: string,
  objId: string,
): Editor {
  const { presentation, select } = editor;

  const slide = getOrderedMapElementById(presentation.slides, slideId);
  if (!slide) {
    return {
      presentation: presentation,
      select,
    };
  }

  const newSlide: Slide = {
    ...slide,
    slideObjects: getNewOrderedMapWithRemoved(slide.slideObjects, objId),
  };

  const newPresentation: Presentation = {
    ...presentation,
    slides: getNewOrderedMapWithPushed(presentation.slides, slideId, newSlide),
  };

  const newSelect: Select = {
    ...select,
    selectedSlideObjId: select.selectedSlideObjId.filter((id) => id !== objId),
  };

  return {
    presentation: newPresentation,
    select: newSelect,
  };
}

export function addText(editor: Editor, slideId: string): Editor {
  const { presentation, select } = editor;

  const slide = getOrderedMapElementById(presentation.slides, slideId);
  if (!slide) {
    return {
      presentation: presentation,
      select,
    };
  }

  const id: string = generateId();
  const rect: Rect = {
    x: 15,
    y: 15,
    w: 220,
    h: 50,
  };
  const textObj: SlideText = {
    type: "text",
    id,
    ...defaultTextObjectParameters(),
    rect,
  };

  const newSlide: Slide = {
    ...slide,
    slideObjects: getNewOrderedMapWithPushed(slide.slideObjects, id, textObj),
  };

  const newPresentation: Presentation = {
    ...presentation,
    slides: getNewOrderedMapWithPushed(presentation.slides, slideId, newSlide),
  };

  const newSelect: Select = { ...select, selectedSlideObjId: [id] };

  return { presentation: newPresentation, select: newSelect };
}

export function addImage(
  editor: Editor,
  slideId: string,
  src: string,
  w: number,
  h: number,
): Editor {
  const { presentation, select } = editor;

  const slide = getOrderedMapElementById(presentation.slides, slideId);

  if (!slide) {
    return {
      presentation: presentation,
      select,
    };
  }

  const id: string = generateId();

  const scale = Math.min(1, SLIDE_WIDTH / w, SLIDE_HEIGHT / h);
  w = Math.round(w * scale);
  h = Math.round(h * scale);

  const rect: Rect = {
    x: 20,
    y: 20,
    w,
    h,
  };

  const imageObject: SlideImage = {
    type: "image",
    id,
    src,
    rect,
  };

  const newSlide: Slide = {
    ...slide,
    slideObjects: getNewOrderedMapWithPushed(
      slide.slideObjects,
      id,
      imageObject,
    ),
  };
  const newPresentation = {
    ...presentation,
    slides: getNewOrderedMapWithPushed(presentation.slides, slideId, newSlide),
  };

  const newSelect: Select = { ...select, selectedSlideObjId: [id] };

  return { presentation: newPresentation, select: newSelect };
}

export function updateSlideObj<T extends SlideObj>(
  editor: Editor,
  slideId: string,
  objId: string,
  updates: (obj: T) => Partial<Omit<T, "id" | "type">>,
): Editor {
  const { presentation, select } = editor;

  const slide = getOrderedMapElementById(presentation.slides, slideId);
  if (!slide) return editor;

  const slideObj = getOrderedMapElementById(slide.slideObjects, objId) as
    | T
    | undefined;
  if (!slideObj) return editor;

  const newObj = { ...slideObj, ...updates(slideObj) } as T;

  return {
    presentation: {
      ...presentation,
      slides: getNewOrderedMapWithPushed(presentation.slides, slideId, {
        ...slide,
        slideObjects: getNewOrderedMapWithPushed(
          slide.slideObjects,
          objId,
          newObj,
        ),
      }),
    },
    select,
  };
}

export function changeSlideObjectPosition(
  editor: Editor,
  slideId: string,
  objId: string,
  newX: number,
  newY: number,
): Editor {
  const { presentation } = editor;

  const slide = getOrderedMapElementById(presentation.slides, slideId);
  if (!slide) {
    return editor;
  }

  const obj = getOrderedMapElementById(slide.slideObjects, objId);
  if (!obj) {
    return editor;
  }

  const newRect = { ...obj.rect, x: newX, y: newY };

  if (newX < 0) newRect.x = 0;
  if (newY < 0) newRect.y = 0;
  if (newX + newRect.w > SLIDE_SIZE.w) newRect.x = SLIDE_SIZE.w - newRect.w;
  if (newY + newRect.h > SLIDE_SIZE.h) newRect.y = SLIDE_SIZE.h - newRect.h;

  return updateSlideObj<typeof obj>(editor, slideId, objId, () => ({
    rect: newRect,
  }));
}

export function changeSlideObjSize(
  editor: Editor,
  slideId: string,
  objId: string,
  newW: number,
  newH: number,
): Editor {
  const { presentation } = editor;

  const slide = getOrderedMapElementById(presentation.slides, slideId);
  if (!slide) {
    return editor;
  }

  const obj = getOrderedMapElementById(slide.slideObjects, objId);
  if (!obj) {
    return editor;
  }

  const newRect = { ...obj.rect, w: newW, h: newH };

  const MIN_SIZE = 20;

  if (newW <= MIN_SIZE || newW > SLIDE_SIZE.w) {
    return editor;
  }
  if (newH <= MIN_SIZE || newH > SLIDE_SIZE.h) {
    return editor;
  }

  return updateSlideObj(editor, slideId, objId, () => ({
    rect: newRect,
  }));
}

function updateSlideTextFont(
  editor: Editor,
  slideId: string,
  textObjId: string,
  updater: (oldFont: Font) => Font,
): Editor {
  const { presentation } = editor;

  const slide = getOrderedMapElementById(presentation.slides, slideId);
  if (!slide) {
    return editor;
  }

  const obj = getOrderedMapElementById(slide.slideObjects, textObjId);
  if (!obj || obj.type !== "text") {
    return editor;
  }

  const textObj = obj as SlideText;
  const newObj: SlideText = {
    ...textObj,
    font: updater(textObj.font),
  };

  return updateSlideObj<SlideText>(editor, slideId, textObjId, () => ({
    font: newObj.font,
  }));
}

export function changeSlideTextString(
  editor: Editor,
  slideId: string,
  textObjId: string,
  newTextString: string,
): Editor {
  return updateSlideObj<SlideText>(editor, slideId, textObjId, () => ({
    text: newTextString,
  }));
}

export function changeFontFamily(
  editor: Editor,
  slideId: string,
  textObjId: string,
  newFamily: string,
): Editor {
  return updateSlideTextFont(editor, slideId, textObjId, (old) => ({
    ...old,
    fontFamily: newFamily,
  }));
}

export function changeFontSize(
  editor: Editor,
  slideId: string,
  textObjId: string,
  newSize: string,
): Editor {
  return updateSlideTextFont(editor, slideId, textObjId, (old) => ({
    ...old,
    fontSize: newSize,
  }));
}

export function changeFontWeight(
  editor: Editor,
  slideId: string,
  textObjId: string,
  newWeight: Font["fontWeight"],
): Editor {
  return updateSlideTextFont(editor, slideId, textObjId, (old) => ({
    ...old,
    fontWeight: newWeight,
  }));
}

export function changeFontStyle(
  editor: Editor,
  slideId: string,
  textObjId: string,
  newStyle: Font["fontStyle"],
): Editor {
  return updateSlideTextFont(editor, slideId, textObjId, (old) => ({
    ...old,
    fontStyle: newStyle,
  }));
}

export function changeFontColor(
  editor: Editor,
  slideId: string,
  textObjId: string,
  newColor: Color,
): Editor {
  return updateSlideTextFont(editor, slideId, textObjId, (old) => ({
    ...old,
    color: newColor,
  }));
}

export function changeLetterSpacing(
  editor: Editor,
  slideId: string,
  textObjId: string,
  spacing: string,
): Editor {
  return updateSlideTextFont(editor, slideId, textObjId, (old) => ({
    ...old,
    letterSpacing: spacing,
  }));
}

export function changeWordSpacing(
  editor: Editor,
  slideId: string,
  textObjId: string,
  spacing: string,
): Editor {
  return updateSlideTextFont(editor, slideId, textObjId, (old) => ({
    ...old,
    wordSpacing: spacing,
  }));
}

export function changeTextDecoration(
  editor: Editor,
  slideId: string,
  textObjId: string,
  decoration: Font["textDecoration"],
): Editor {
  return updateSlideTextFont(editor, slideId, textObjId, (old) => ({
    ...old,
    textDecoration: decoration,
  }));
}

export function changeTextTransform(
  editor: Editor,
  slideId: string,
  textObjId: string,
  transform: Font["textTransform"],
): Editor {
  return updateSlideTextFont(editor, slideId, textObjId, (old) => ({
    ...old,
    textTransform: transform,
  }));
}

export function changeSlideBackgroundColor(
  editor: Editor,
  slideId: string,
  newColor: string,
): Editor {
  const { presentation, select } = editor;

  const slide = getOrderedMapElementById(presentation.slides, slideId);
  if (!slide) {
    return editor;
  }
  if (slide.backgroundColor.color === newColor) {
    return editor;
  }

  const newSlide: Slide = {
    ...slide,
    backgroundColor: { type: "color", color: newColor },
  };

  return {
    presentation: {
      ...presentation,
      slides: getNewOrderedMapWithPushed(
        presentation.slides,
        slideId,
        newSlide,
      ),
    },
    select,
  };
}

export function selectSlide(editor: Editor, slideId: string): Editor {
  const { presentation, select } = editor;

  if (select.selectedSlideId.includes(slideId)) {
    return editor;
  }

  return {
    presentation,
    // select: {
    //   selectedSlideId: [...select.selectedSlideId, slideId],
    //   selectedSlideObjId: [],
    // },
    select: {
      selectedSlideId: [slideId],
      selectedSlideObjId: [],
    },
  };
}

export function selectSlideObj(editor: Editor, objId: string): Editor {
  const { presentation, select } = editor;

  const isSelected = select.selectedSlideObjId.includes(objId);
  return {
    presentation,
    select: {
      selectedSlideId: [],
      selectedSlideObjId: isSelected
        ? select.selectedSlideObjId.filter((id) => id !== objId)
        : [...select.selectedSlideObjId, objId],
    },
  };
}

export function removeLastSelectedObject(editor: Editor): Editor {
  const { presentation, select } = editor;
  const selectedSlideObjIds = select.selectedSlideObjId;

  const newSelect: Select = {
    ...select,
    selectedSlideObjId: selectedSlideObjIds.splice(
      selectedSlideObjIds.length - 1,
      1,
    ),
  };

  return {
    presentation,
    select: newSelect,
  };
}

export function clearSelection(editor: Editor): Editor {
  const { presentation } = editor;
  return {
    presentation,
    select: {
      selectedSlideId: [],
      selectedSlideObjId: [],
    },
  };
}

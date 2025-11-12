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

export const MIN_FONT_SIZE = 8;

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
    selectedSlideIds: [newSlide.id],
    selectedSlideObjIds: [],
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

  const newSelect: Select = { selectedSlideIds: [], selectedSlideObjIds: [] };

  if (deletedIndex === -1) {
    return { presentation, select };
  } else if (deletedIndex > 0) {
    newSelect.selectedSlideIds = [newSlidesOrder[deletedIndex - 1]];
  } else {
    if (newSlidesOrder.length > 0) {
      newSelect.selectedSlideIds = [newSlidesOrder[0]];
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

export function moveSlides(
  editor: Editor,
  slideIds: string[],
  toIdx: number,
): Editor {
  const { presentation, select } = editor;

  const order = getOrderedMapOrder(presentation.slides);
  if (slideIds.length === 0) return editor;

  const idSet = new Set(slideIds);

  const movingOrdered: string[] = order.filter((id) => idSet.has(id));
  if (movingOrdered.length === 0) return editor;

  const remaining = order.filter((id) => !idSet.has(id));

  const clampedIdx = Math.max(0, Math.min(remaining.length, toIdx));

  const newOrder = [
    ...remaining.slice(0, clampedIdx),
    ...movingOrdered,
    ...remaining.slice(clampedIdx),
  ];

  const newSlidesMap = newOrderedMap(presentation.slides.collection, newOrder);

  return {
    presentation: {
      ...presentation,
      slides: newSlidesMap,
    },
    select: {
      ...select,
      selectedSlideIds: movingOrdered,
    },
  };
}

export function removeSlideObject(
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
    selectedSlideObjIds: select.selectedSlideObjIds.filter(
      (id) => id !== objId,
    ),
  };

  return {
    presentation: newPresentation,
    select: newSelect,
  };
}

export function removeSlideObjects(
  editor: Editor,
  slideId: string,
  objIds: string[],
): Editor {
  const { presentation, select } = editor;

  const slide = getOrderedMapElementById(presentation.slides, slideId);
  if (!slide) {
    return editor;
  }

  let newSlideObjects = slide.slideObjects;
  let changed = false;

  for (const objId of objIds) {
    if (objId in newSlideObjects.collection) {
      newSlideObjects = getNewOrderedMapWithRemoved(newSlideObjects, objId);
      changed = true;
    }
  }

  if (!changed) {
    return editor;
  }

  const newSlide: Slide = {
    ...slide,
    slideObjects: newSlideObjects,
  };

  const newPresentation: Presentation = {
    ...presentation,
    slides: getNewOrderedMapWithPushed(presentation.slides, slideId, newSlide),
  };

  const newSelectedSlideObjIds = select.selectedSlideObjIds.filter(
    (id) => !objIds.includes(id),
  );

  const newSelect: Select = {
    ...select,
    selectedSlideObjIds: newSelectedSlideObjIds,
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

  const newSelect: Select = { ...select, selectedSlideObjIds: [id] };

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

  const newSelect: Select = { ...select, selectedSlideObjIds: [id] };

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

export function changeMultipleSlideObjectsPosition(
  editor: Editor,
  slideId: string,
  updates: Record<string, { x: number; y: number }>,
): Editor {
  const { presentation, select } = editor;
  const slide = getOrderedMapElementById(presentation.slides, slideId);
  if (!slide) return editor;

  let newSlideObjects = slide.slideObjects;

  for (const id of Object.keys(updates)) {
    const obj = getOrderedMapElementById(newSlideObjects, id);
    if (!obj) continue;

    let newX = updates[id].x;
    let newY = updates[id].y;

    if (newX < 0) newX = 0;
    if (newY < 0) newY = 0;
    if (newX + obj.rect.w > SLIDE_SIZE.w) newX = SLIDE_SIZE.w - obj.rect.w;
    if (newY + obj.rect.h > SLIDE_SIZE.h) newY = SLIDE_SIZE.h - obj.rect.h;

    const newRect = { ...obj.rect, x: newX, y: newY };
    const newObj = { ...obj, rect: newRect };
    newSlideObjects = getNewOrderedMapWithPushed(newSlideObjects, id, newObj);
  }

  const newSlide = { ...slide, slideObjects: newSlideObjects };
  const newPresentation = {
    ...presentation,
    slides: getNewOrderedMapWithPushed(presentation.slides, slideId, newSlide),
  };

  return { presentation: newPresentation, select };
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

  const MIN_SIZE = 20;

  if (newW <= MIN_SIZE) newW = MIN_SIZE;
  if (newW > SLIDE_SIZE.w) newW = SLIDE_SIZE.w;
  if (newH <= MIN_SIZE) newH = MIN_SIZE;
  if (newH > SLIDE_SIZE.h) newH = SLIDE_SIZE.h;

  const newRect = { ...obj.rect, w: newW, h: newH };

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

  if (select.selectedSlideIds.includes(slideId)) {
    return editor;
  }

  return {
    presentation,
    select: {
      selectedSlideIds: [slideId],
      selectedSlideObjIds: [],
    },
  };
}

export function selectSlideObj(editor: Editor, objId: string): Editor {
  const { presentation, select } = editor;

  const isSelected = select.selectedSlideObjIds.includes(objId);
  return {
    presentation,
    select: {
      ...select,
      selectedSlideObjIds: isSelected
        ? select.selectedSlideObjIds.filter((id) => id !== objId)
        : [...select.selectedSlideObjIds, objId],
    },
  };
}

export function addSlideObjToSelection(editor: Editor, objId: string): Editor {
  const { presentation, select } = editor;

  return {
    presentation,
    select: {
      ...select,
      selectedSlideObjIds: [...select.selectedSlideObjIds, objId],
    },
  };
}

export function deselectSlideObjects(editor: Editor, objIds: string[]): Editor {
  const { presentation, select } = editor;

  if (select.selectedSlideObjIds.length <= 0) return editor;

  const objIdSet = new Set(objIds);
  const newSelectedSlideObjIds = select.selectedSlideObjIds.filter(
    (id) => !objIdSet.has(id),
  );

  if (newSelectedSlideObjIds.length === select.selectedSlideObjIds.length) {
    return editor;
  }

  const newSelect: Select = {
    ...select,
    selectedSlideObjIds: newSelectedSlideObjIds,
  };

  return {
    presentation,
    select: newSelect,
  };
}

export function selectSlideRange(
  editor: Editor,
  slideId: string,
  shift: boolean,
): Editor {
  const { presentation, select } = editor;

  const order = getOrderedMapOrder(presentation.slides);

  if (!shift || select.selectedSlideIds.length === 0) {
    return {
      presentation,
      select: {
        selectedSlideIds: [slideId],
        selectedSlideObjIds: [],
      },
    };
  }

  const firstSelectedId = select.selectedSlideIds[0];
  const fromIdx = Math.max(
    0,
    findOrderedMapElementIndex(presentation.slides, firstSelectedId),
  );
  const toIdx = Math.max(
    0,
    findOrderedMapElementIndex(presentation.slides, slideId),
  );

  if (fromIdx === -1 || toIdx === -1) {
    return {
      presentation,
      select: {
        selectedSlideIds: [slideId],
        selectedSlideObjIds: [],
      },
    };
  }

  const start = Math.min(fromIdx, toIdx);
  const end = Math.max(fromIdx, toIdx);

  const newSelected = order.slice(start, end + 1);

  return {
    presentation,
    select: {
      selectedSlideIds: newSelected,
      selectedSlideObjIds: [],
    },
  };
}

export function clearSelection(editor: Editor): Editor {
  const { presentation } = editor;
  return {
    presentation,
    select: {
      selectedSlideIds: [],
      selectedSlideObjIds: [],
    },
  };
}

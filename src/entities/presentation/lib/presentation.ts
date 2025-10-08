import type { Presentation } from "../model/types.ts";
import {
  getNewOrderedMapWithMoved,
  getNewOrderedMapWithPushed,
  getNewOrderedMapWithRemoved,
  getOrderedMapElementById,
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

const MAX_PRESENTATION_TITLE_SIZE: number = 70;
const SLIDE_SIZE = {
  w: 1400,
  h: 900,
};

export function changePresentationTitle(
  p: Presentation,
  newTitle: string,
): Presentation {
  if (
    newTitle !== p.title &&
    0 < newTitle.length &&
    newTitle.length <= MAX_PRESENTATION_TITLE_SIZE
  ) {
    return {
      ...p,
      title: newTitle,
    };
  }

  return p;
}

export function addSlide(
  p: Presentation,
  backgroundColor: Color,
  select: Select,
): { presentation: Presentation; select: Select } {
  const newId: string = generateId();
  const newSlide: Slide = {
    id: newId,
    backgroundColor: backgroundColor,
    slideObjects: newOrderedMap<SlideObj>(),
  };

  const newSlides = getNewOrderedMapWithPushed(p.slides, newId, newSlide);
  const newPresentation = {
    ...p,
    slides: newSlides,
  };

  const newSelect: Select = { ...select, selectedSlideObjId: [] };

  return { presentation: newPresentation, select: newSelect };
}

export function removeSlide(
  p: Presentation,
  targetSlideId: string,
  select: Select,
): { presentation: Presentation; select: Select } {
  const newSlides: OrderedMap<Slide> = getNewOrderedMapWithRemoved(
    p.slides,
    targetSlideId,
  );

  const newPresentation = {
    ...p,
    slides: newSlides,
  };

  select.selectedSlideId = select.selectedSlideId.filter(
    (id: string) => id !== targetSlideId,
  );
  select.selectedSlideObjId = [];

  return { presentation: newPresentation, select };
}

export function moveSlide(
  p: Presentation,
  slideId: string,
  toIdx: number,
  select: Select,
): { presentation: Presentation; select: Select } {
  return {
    presentation: {
      ...p,
      slides: getNewOrderedMapWithMoved(p.slides, slideId, toIdx),
    },
    select,
  };
}

export function removeSlideObj(
  p: Presentation,
  slideId: string,
  objId: string,
  select: Select,
): { presentation: Presentation; select: Select } {
  const slide = getOrderedMapElementById(p.slides, slideId);
  if (!slide) {
    return {
      presentation: p,
      select,
    };
  }

  const newSlide: Slide = {
    ...slide,
    slideObjects: getNewOrderedMapWithRemoved(slide.slideObjects, objId),
  };

  const newPresentation: Presentation = {
    ...p,
    slides: getNewOrderedMapWithPushed(p.slides, slideId, newSlide),
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

export function addText(
  p: Presentation,
  slideId: string,
  textProps: { text: string; font: Font; rect: Rect },
  select: Select,
): { presentation: Presentation; select: Select } {
  const slide = getOrderedMapElementById(p.slides, slideId);
  if (!slide) {
    return {
      presentation: p,
      select,
    };
  }

  const id: string = generateId();
  const textObj: SlideText = { type: "text", id, ...textProps };

  const newSlide: Slide = {
    ...slide,
    slideObjects: getNewOrderedMapWithPushed(slide.slideObjects, id, textObj),
  };

  const newPresentation: Presentation = {
    ...p,
    slides: getNewOrderedMapWithPushed(p.slides, slideId, newSlide),
  };

  const newSelect: Select = { selectedSlideId: [], selectedSlideObjId: [id] };

  return { presentation: newPresentation, select: newSelect };
}

export function addImage(
  p: Presentation,
  slideId: string,
  src: string,
  rect: Rect,
  select: Select,
): { presentation: Presentation; select: Select } {
  const slide = getOrderedMapElementById(p.slides, slideId);
  if (!slide) {
    return {
      presentation: p,
      select,
    };
  }

  const id: string = generateId();
  const imageObj: SlideImage = { id, type: "image", src, rect };
  const newSlide: Slide = {
    ...slide,
    slideObjects: getNewOrderedMapWithPushed(slide.slideObjects, id, imageObj),
  };
  const newPresentation = {
    ...p,
    slides: getNewOrderedMapWithPushed(p.slides, slideId, newSlide),
  };

  const newSelect: Select = { selectedSlideId: [], selectedSlideObjId: [id] };

  return { presentation: newPresentation, select: newSelect };
}

export function updateSlideObj<T extends SlideObj>(
  presentation: Presentation,
  slideId: string,
  objId: string,
  updates: (obj: T) => Partial<Omit<T, "id" | "type">>,
): Presentation {
  const slide = getOrderedMapElementById(presentation.slides, slideId);
  if (!slide) return presentation;

  const slideObj = getOrderedMapElementById(slide.slideObjects, objId) as
    | T
    | undefined;
  if (!slideObj) return presentation;

  const newObj = { ...slideObj, ...updates(slideObj) } as T;

  return {
    ...presentation,
    slides: getNewOrderedMapWithPushed(presentation.slides, slideId, {
      ...slide,
      slideObjects: getNewOrderedMapWithPushed(
        slide.slideObjects,
        objId,
        newObj,
      ),
    }),
  };
}

export function changeSlideObjectPosition(
  p: Presentation,
  slideId: string,
  objId: string,
  newX: number,
  newY: number,
): Presentation {
  const slide = getOrderedMapElementById(p.slides, slideId);
  if (!slide) {
    return p;
  }

  const obj = getOrderedMapElementById(slide.slideObjects, objId);
  if (!obj) {
    return p;
  }

  const newRect = { ...obj.rect, x: newX, y: newY };

  if (
    newX < 0 ||
    newY < 0 ||
    newX + newRect.w > SLIDE_SIZE.w ||
    newY + newRect.h > SLIDE_SIZE.h
  ) {
    return p;
  }

  return updateSlideObj(p, slideId, objId, () => ({ rect: newRect }));
}

export function changeSlideObjSize(
  p: Presentation,
  slideId: string,
  objId: string,
  newW: number,
  newH: number,
): Presentation {
  const slide = getOrderedMapElementById(p.slides, slideId);
  if (!slide) {
    return p;
  }

  const obj = getOrderedMapElementById(slide.slideObjects, objId);
  if (!obj) {
    return p;
  }

  const newRect = { ...obj.rect, w: newW, h: newH };

  if (newW <= 0 || newH <= 0 || newW > SLIDE_SIZE.w || newH > SLIDE_SIZE.h) {
    return p;
  }

  return updateSlideObj(p, slideId, objId, () => ({ rect: newRect }));
}

function updateSlideTextFont(
  p: Presentation,
  slideId: string,
  textObjId: string,
  updater: (oldFont: Font) => Font,
): Presentation {
  const slide = getOrderedMapElementById(p.slides, slideId);
  if (!slide) {
    return p;
  }

  const obj = getOrderedMapElementById(slide.slideObjects, textObjId);
  if (!obj || obj.type !== "text") {
    return p;
  }

  const textObj = obj as SlideText;
  const newObj: SlideText = {
    ...textObj,
    font: updater(textObj.font),
  };

  return updateSlideObj<SlideText>(p, slideId, textObjId, () => ({
    font: newObj.font,
  }));
}

export function changeSlideTextString(
  p: Presentation,
  slideId: string,
  textObjId: string,
  newTextString: string,
): Presentation {
  return updateSlideObj<SlideText>(p, slideId, textObjId, () => ({
    text: newTextString,
  }));
}

export function changeFontFamily(
  p: Presentation,
  slideId: string,
  textObjId: string,
  newFamily: string,
): Presentation {
  return updateSlideTextFont(p, slideId, textObjId, (old) => ({
    ...old,
    fontFamily: newFamily,
  }));
}

export function changeFontSize(
  p: Presentation,
  slideId: string,
  textObjId: string,
  newSize: string,
): Presentation {
  return updateSlideTextFont(p, slideId, textObjId, (old) => ({
    ...old,
    fontSize: newSize,
  }));
}

export function changeFontWeight(
  p: Presentation,
  slideId: string,
  textObjId: string,
  newWeight: Font["fontWeight"],
): Presentation {
  return updateSlideTextFont(p, slideId, textObjId, (old) => ({
    ...old,
    fontWeight: newWeight,
  }));
}

export function changeFontStyle(
  p: Presentation,
  slideId: string,
  textObjId: string,
  newStyle: Font["fontStyle"],
): Presentation {
  return updateSlideTextFont(p, slideId, textObjId, (old) => ({
    ...old,
    fontStyle: newStyle,
  }));
}

export function changeFontColor(
  p: Presentation,
  slideId: string,
  textObjId: string,
  newColor: Color,
): Presentation {
  return updateSlideTextFont(p, slideId, textObjId, (old) => ({
    ...old,
    color: newColor,
  }));
}

export function changeLetterSpacing(
  p: Presentation,
  slideId: string,
  textObjId: string,
  spacing: string,
): Presentation {
  return updateSlideTextFont(p, slideId, textObjId, (old) => ({
    ...old,
    letterSpacing: spacing,
  }));
}

export function changeWordSpacing(
  p: Presentation,
  slideId: string,
  textObjId: string,
  spacing: string,
): Presentation {
  return updateSlideTextFont(p, slideId, textObjId, (old) => ({
    ...old,
    wordSpacing: spacing,
  }));
}

export function changeTextDecoration(
  p: Presentation,
  slideId: string,
  textObjId: string,
  decoration: Font["textDecoration"],
): Presentation {
  return updateSlideTextFont(p, slideId, textObjId, (old) => ({
    ...old,
    textDecoration: decoration,
  }));
}

export function changeTextTransform(
  p: Presentation,
  slideId: string,
  textObjId: string,
  transform: Font["textTransform"],
): Presentation {
  return updateSlideTextFont(p, slideId, textObjId, (old) => ({
    ...old,
    textTransform: transform,
  }));
}

export function changeSlideBackgroundColor(
  p: Presentation,
  slideId: string,
  newColor: Color,
): Presentation {
  const slide = getOrderedMapElementById(p.slides, slideId);
  if (!slide) {
    return p;
  }
  if (slide.backgroundColor.color === newColor.color) {
    return p;
  }

  const newSlide: Slide = { ...slide, backgroundColor: newColor };

  return {
    ...p,
    slides: getNewOrderedMapWithPushed(p.slides, slideId, newSlide),
  };
}

export function selectSlide(select: Select, slideId: string): Select {
  if (select.selectedSlideId.includes(slideId)) {
    return select;
  }
  return {
    selectedSlideId: [...select.selectedSlideId, slideId],
    selectedSlideObjId: [],
  };
}

export function selectSlideObj(select: Select, objId: string): Select {
  const isSelected = select.selectedSlideObjId.includes(objId);
  return {
    selectedSlideId: [],
    selectedSlideObjId: isSelected
      ? select.selectedSlideObjId.filter((id) => id !== objId)
      : [...select.selectedSlideObjId, objId],
  };
}

export function clearSelection(): Select {
  return { selectedSlideId: [], selectedSlideObjId: [] };
}

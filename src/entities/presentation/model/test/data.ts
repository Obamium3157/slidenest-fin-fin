import type { Select } from "../../../select/model/types.ts";
import type { Presentation } from "../types.ts";
import { generateId } from "../../../../shared/lib/generateId.ts";
import {
  getNewOrderedMapWithPushed,
  newOrderedMap,
  type OrderedMap,
} from "../../../../shared/types/orderedMap/OrderedMap.ts";
import type { Slide, SlideObj } from "../../../slide/model/types.ts";
import type { Rect } from "../../../../shared/types/rect/Rect.ts";
import { makeColor } from "../../../../shared/types/color/test/data.ts";
import { makeFont } from "../../../../shared/types/font/test/data.ts";

export function minPresentation(): {
  presentation: Presentation;
  select: Select;
} {
  const presentation = {
    id: generateId(),
    title: "minPresentation title",
    slides: newOrderedMap<Slide>(),
  };
  const select: Select = { selectedSlideId: [], selectedSlideObjId: [] };

  return { presentation, select };
}

export function maxPresentation(): {
  presentation: Presentation;
  select: Select;
} {
  const s1Id = generateId();
  const s2Id = generateId();

  const rect1: Rect = {
    x: 15,
    y: 9,
    w: 150,
    h: 30,
  };
  const rect2: Rect = {
    x: 100,
    y: 200,
    w: 123,
    h: 322,
  };

  const textId1 = generateId();
  const imageId1 = generateId();

  let slideObjectsSlide1: OrderedMap<SlideObj> = newOrderedMap<SlideObj>();
  slideObjectsSlide1 = getNewOrderedMapWithPushed(slideObjectsSlide1, textId1, {
    id: textId1,
    type: "text",
    text: "Hello from slide 1!",
    font: makeFont("SST"),
    rect: rect1,
  });
  slideObjectsSlide1 = getNewOrderedMapWithPushed(
    slideObjectsSlide1,
    imageId1,
    {
      id: imageId1,
      type: "image",
      src: "https://www.w3schools.com/images/w3schools_green.jpg",
      rect: rect2,
    },
  );

  const slide1: Slide = {
    id: s1Id,
    backgroundColor: makeColor("#FFF012"),
    slideObjects: slideObjectsSlide1,
  };

  const textId20 = generateId();
  const textId21 = generateId();

  let slideObjectsSlide2: OrderedMap<SlideObj> = newOrderedMap();
  slideObjectsSlide2 = getNewOrderedMapWithPushed(
    slideObjectsSlide2,
    textId20,
    {
      id: textId20,
      type: "text",
      text: "Hello from textbox1!!!",
      font: makeFont("SST"),
      rect: rect1,
    },
  );
  slideObjectsSlide2 = getNewOrderedMapWithPushed(
    slideObjectsSlide2,
    textId21,
    {
      id: textId21,
      type: "text",
      text: "こんにちは世界！これはテキストボックスだよ！俺はとても大切よ〜〜〜",
      font: makeFont("SST"),
      rect: rect2,
    },
  );

  const slide2 = {
    id: s2Id,
    backgroundColor: makeColor("#123514"),
    slideObjects: slideObjectsSlide2,
  };

  const presentation: Presentation = {
    id: generateId(),
    // title: "maxPresentation title",
    // title: "الحد الأقصى للعرض",
    title: "テキスト",
    slides: newOrderedMap<Slide>(),
  };
  presentation.slides = getNewOrderedMapWithPushed(
    presentation.slides,
    s1Id,
    slide1,
  );
  presentation.slides = getNewOrderedMapWithPushed(
    presentation.slides,
    s2Id,
    slide2,
  );

  const select: Select = {
    selectedSlideId: [s1Id],
    selectedSlideObjId: [textId1],
  };
  return { presentation, select };
}

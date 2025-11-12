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
import { defaultFont } from "../../../../shared/types/font/test/data.ts";
import { newTextObj } from "../../../slideText/model/test/data.ts";
import type { Editor } from "../../../editor/model/types.ts";

export function getMinEditor(): Editor {
  const presentation = {
    id: generateId(),
    title: "minPresentation title",
    slides: newOrderedMap<Slide>(),
  };
  const select: Select = { selectedSlideIds: [], selectedSlideObjIds: [] };

  return { presentation, select };
}

export function getMaxEditor(): Editor {
  const s1Id = generateId();
  const s2Id = generateId();

  const rect1: Rect = {
    x: 615,
    y: 80,
    w: 350,
    h: 60,
  };
  const rect2: Rect = {
    x: 100,
    y: 100,
    w: 500,
    h: 600,
  };

  const textId1 = generateId();
  const imageId1 = generateId();

  const arabicText = newTextObj(
    {
      x: 615,
      y: 230,
      w: 80,
      h: 40,
    },
    "!مرحبًا",
  );

  const hebrewText = newTextObj(
    {
      x: 615,
      y: 330,
      w: 80,
      h: 40,
    },
    "!שלום",
  );

  const chineseText = newTextObj(
    {
      x: 615,
      y: 430,
      w: 100,
      h: 50,
    },
    "你好！",
  );

  const koreanText = newTextObj(
    {
      x: 615,
      y: 530,
      w: 160,
      h: 50,
    },
    "안녕하세요!",
  );

  const hindiText = newTextObj(
    {
      x: 800,
      y: 430,
      w: 80,
      h: 40,
    },
    "नमस्ते!",
  );

  const farsiText = newTextObj(
    {
      x: 800,
      y: 330,
      w: 80,
      h: 50,
    },
    "!سلام",
  );

  let slideObjectsSlide1: OrderedMap<SlideObj> = newOrderedMap<SlideObj>();
  slideObjectsSlide1 = getNewOrderedMapWithPushed(slideObjectsSlide1, textId1, {
    id: textId1,
    type: "text",
    text: "Hello from slide 1!",
    font: defaultFont(),
    rect: rect1,
  });
  slideObjectsSlide1 = getNewOrderedMapWithPushed(
    slideObjectsSlide1,
    imageId1,
    {
      id: imageId1,
      type: "image",
      src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJoFQYlPTIN4DVEc0gByg8GHfwEVv1eiJcjA&s",
      rect: rect2,
    },
  );
  slideObjectsSlide1 = getNewOrderedMapWithPushed(
    slideObjectsSlide1,
    arabicText.id,
    arabicText,
  );
  slideObjectsSlide1 = getNewOrderedMapWithPushed(
    slideObjectsSlide1,
    hebrewText.id,
    hebrewText,
  );
  slideObjectsSlide1 = getNewOrderedMapWithPushed(
    slideObjectsSlide1,
    chineseText.id,
    chineseText,
  );
  slideObjectsSlide1 = getNewOrderedMapWithPushed(
    slideObjectsSlide1,
    koreanText.id,
    koreanText,
  );
  slideObjectsSlide1 = getNewOrderedMapWithPushed(
    slideObjectsSlide1,
    hindiText.id,
    hindiText,
  );
  slideObjectsSlide1 = getNewOrderedMapWithPushed(
    slideObjectsSlide1,
    farsiText.id,
    farsiText,
  );

  const slide1: Slide = {
    id: s1Id,
    backgroundColor: makeColor("#0FFFFF"),
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
      text: "Wenamecha in sama!!!",
      font: defaultFont(),
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
      font: defaultFont(),
      rect: {
        x: 100,
        y: 100,
        w: 300,
        h: 200,
      },
    },
  );

  const slide2 = {
    id: s2Id,
    backgroundColor: makeColor("#FFFFFF"),
    slideObjects: slideObjectsSlide2,
  };

  const presentation: Presentation = {
    id: generateId(),
    // title: "かっこいいタイトル(数日かかった)",
    title: "Название презентации",
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
    selectedSlideIds: [s1Id],
    selectedSlideObjIds: [
      arabicText.id,
      chineseText.id,
      farsiText.id,
      koreanText.id,
    ],
  };
  // const select: Select = {
  //   selectedSlideId: [s2Id],
  //   selectedSlideObjId: [],
  // };
  return { presentation, select };
}

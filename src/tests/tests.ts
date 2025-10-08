import { assert, assertEqual, run, summary } from "../shared/lib/testUtils.ts";
import {
  maxPresentation,
  minPresentation,
} from "../entities/presentation/model/test/data.ts";
import {
  addImage,
  addSlide,
  addText,
  changeFontColor,
  changeFontFamily,
  changeFontSize,
  changeFontStyle,
  changeFontWeight,
  changeLetterSpacing,
  changePresentationTitle,
  changeSlideBackgroundColor,
  changeSlideObjectPosition,
  changeSlideObjSize,
  changeSlideTextString,
  changeTextDecoration,
  changeTextTransform,
  changeWordSpacing,
  clearSelection,
  moveSlide,
  removeSlide,
  removeSlideObj,
  selectSlide,
  selectSlideObj,
} from "../entities/presentation/lib/presentation.ts";
import type { Color } from "../shared/types/color/Color.ts";
import {
  getOrderedMapElementById,
  getOrderedMapOrder,
  orderedMapLength,
} from "../shared/types/orderedMap/OrderedMap.ts";
import type { Rect } from "../shared/types/rect/Rect.ts";
import type { Font } from "../shared/types/font/Font.ts";
import type { SlideText } from "../entities/slideText/model/types.ts";

function testChangePresentationTitle() {
  const { presentation: minP } = minPresentation();
  const newTitle = "New Title";
  const resMin = changePresentationTitle(minP, newTitle);
  assert(
    resMin.title !== minP.title,
    "Минимальная: заголовок должен обновиться на новый",
  );

  const resEmpty = changePresentationTitle(minP, "");
  assertEqual(resEmpty, minP, "Пустая строка не должна менять заголовок");

  const tooLong = "o".repeat(100);
  const resTooLong = changePresentationTitle(minP, tooLong);
  assertEqual(
    resTooLong.title,
    minP.title,
    "Слишком длинный заголовок презентации",
  );

  const { presentation: maxP } = maxPresentation();
  const anotherTitle = "AnotherNewTitle";
  const resMax = changePresentationTitle(maxP, anotherTitle);
  assertEqual(
    resMax.title,
    anotherTitle,
    "Максимальная: заголовок должен обновиться на новый",
  );

  const resSame = changePresentationTitle(maxP, maxP.title);
  assertEqual(
    resSame.title,
    maxP.title,
    "Установка того же самого заголовка запрещена",
  );
}

function testAddSlide() {
  const color: Color = { type: "color", color: "#123456" };

  const { presentation: minP, select: minSelect } = minPresentation();
  const { presentation: resMin, select: selMin } = addSlide(
    minP,
    color,
    minSelect,
  );
  assert(
    orderedMapLength(resMin.slides) === orderedMapLength(minP.slides) + 1,
    "Минимальная: число слайдов должно увеличиться на 1",
  );
  assert(
    selMin.selectedSlideObjId.length === 0,
    "Минимальная: выбор объектов должен быть очищен",
  );

  const { presentation: maxP, select: maxSelect } = maxPresentation();
  const { presentation: resMax, select: selMax } = addSlide(
    maxP,
    color,
    maxSelect,
  );
  assert(
    orderedMapLength(resMax.slides) === orderedMapLength(maxP.slides) + 1,
    "Максимальная: число слайдов должно увеличиться на 1",
  );
  assert(
    selMax.selectedSlideObjId.length === 0,
    "Максимальная: выбор объектов должен быть очищен",
  );
}

function testRemoveSlide() {
  const { presentation: minP, select: minSelect } = minPresentation();
  const minSlideId = getOrderedMapOrder(minP.slides)[0];
  const { presentation: resMin, select: selMin } = removeSlide(
    minP,
    minSlideId,
    minSelect,
  );
  assert(
    !getOrderedMapOrder(resMin.slides).includes(minSlideId),
    "Минимальная: слайд должен быть удален",
  );
  assert(
    selMin.selectedSlideId.every((id) => id !== minSlideId),
    "Минимальная: удаленный слайд не выбран",
  );

  const { presentation: maxP, select: maxSelect } = maxPresentation();
  const maxSlideId = getOrderedMapOrder(maxP.slides)[0];
  const { presentation: resMax, select: selMax } = removeSlide(
    maxP,
    maxSlideId,
    maxSelect,
  );
  assert(
    !getOrderedMapOrder(resMax.slides).includes(maxSlideId),
    "Максимальная: слайд должен быть удален",
  );
  assert(
    selMax.selectedSlideId.every((id) => id !== maxSlideId),
    "Максимальная: удаленный слайд не выбран",
  );
}

function testMoveSlide() {
  const { presentation: minP, select: minSelect } = minPresentation();
  const minSlidesOrder = getOrderedMapOrder(minP.slides);
  if (minSlidesOrder.length > 1) {
    const { presentation: resMin } = moveSlide(
      minP,
      minSlidesOrder[0],
      1,
      minSelect,
    );
    assert(
      getOrderedMapOrder(resMin.slides)[1] === minSlidesOrder[0],
      "Минимальная: слайд должен быть перемещен",
    );
  }

  const { presentation: maxP, select: maxSelect } = maxPresentation();
  const maxSlidesOrder = getOrderedMapOrder(maxP.slides);
  const { presentation: resMax } = moveSlide(
    maxP,
    maxSlidesOrder[0],
    maxSlidesOrder.length - 1,
    maxSelect,
  );
  assert(
    getOrderedMapOrder(resMax.slides)[maxSlidesOrder.length - 1] ===
      maxSlidesOrder[0],
    "Максимальная: слайд должен быть перемещен",
  );
}

function testRemoveSlideObj() {
  const { presentation: minP, select: minSelect } = minPresentation();
  const minSlideOrder = getOrderedMapOrder(minP.slides);
  if (minSlideOrder.length > 1) {
    const minSlideId = minSlideOrder[0];
    const minSlide = getOrderedMapElementById(minP.slides, minSlideId)!;
    const minObjId = getOrderedMapOrder(minSlide.slideObjects)[0];

    const { presentation: resMin, select: selMin } = removeSlideObj(
      minP,
      minSlideId,
      minObjId,
      minSelect,
    );

    assert(
      !getOrderedMapOrder(
        getOrderedMapElementById(resMin.slides, minSlideId)!.slideObjects,
      ).includes(minObjId),
      "Минимальная: объект слайда должен быть удален",
    );

    assert(
      !selMin.selectedSlideObjId.includes(minObjId),
      "Минимальная: удаленный объект не должен быть выбран",
    );
  }

  const { presentation: maxP, select: maxSelect } = maxPresentation();
  const maxSlideId = getOrderedMapOrder(maxP.slides)[0];
  const maxSlide = getOrderedMapElementById(maxP.slides, maxSlideId)!;
  const maxObjId = getOrderedMapOrder(maxSlide.slideObjects)[0];

  const { presentation: resMax, select: selMax } = removeSlideObj(
    maxP,
    maxSlideId,
    maxObjId,
    maxSelect,
  );

  assert(
    !getOrderedMapOrder(
      getOrderedMapElementById(resMax.slides, maxSlideId)!.slideObjects,
    ).includes(maxObjId),
    "Максимальная: объект слайда должен быть удален",
  );

  assert(
    !selMax.selectedSlideObjId.includes(maxObjId),
    "Максимальная: удаленный объект не должен быть выбран",
  );
}

function testAddTextAndImage() {
  const rect: Rect = { x: 0, y: 0, w: 100, h: 50 };
  const font: Font = {
    type: "font",
    fontString: "Arial",
    fontFamily: "Arial",
    fontSize: "14px",
  };

  const { presentation: minP, select: minSelect } = minPresentation();
  const minOrder = getOrderedMapOrder(minP.slides);
  if (minOrder.length === 0) {
    const res = addText(
      minP,
      "no-slide",
      { text: "Hello", font, rect },
      minSelect,
    );
    assertEqual(
      res.presentation,
      minP,
      "Минимальная: при отсутствии слайда презентация не меняется",
    );
    assertEqual(res.select, minSelect, "Минимальная: select не меняется");
  } else {
    const minSlideId = minOrder[0];
    const { presentation: p1, select: s1 } = addText(
      minP,
      minSlideId,
      { text: "Hello", font, rect },
      minSelect,
    );
    assert(s1.selectedSlideObjId.length === 1, "Минимальная: текст добавлен");
    const { select: s2 } = addImage(p1, minSlideId, "img.png", rect, s1);
    assert(
      s2.selectedSlideObjId.length === 1,
      "Минимальная: изображение добавлено",
    );
  }

  const { presentation: maxP, select: maxSelect } = maxPresentation();
  const maxSlideId = getOrderedMapOrder(maxP.slides)[0];
  const { presentation: p3, select: s3 } = addText(
    maxP,
    maxSlideId,
    { text: "Hello Max", font, rect },
    maxSelect,
  );
  assert(s3.selectedSlideObjId.length === 1, "Максимальная: текст добавлен");
  const { select: s4 } = addImage(p3, maxSlideId, "img_max.png", rect, s3);
  assert(
    s4.selectedSlideObjId.length === 1,
    "Максимальная: изображение добавлено",
  );
}

// function testAddJunkToSlideObject() {
//   const { presentation: maxP } = maxPresentation();
//   const maxSlideId = getOrderedMapOrder(maxP.slides)[0];
//   const maxSlide = getOrderedMapElementById(maxP.slides, maxSlideId);
//   if (!maxSlide) {
//     console.log("hmmm");
//     return;
//   }
//   const slideObj = getOrderedMapElementById(
//     maxSlide.slideObjects,
//     getOrderedMapOrder(maxSlide.slideObjects)[0],
//   );
//
//   if (slideObj) {
//     if (slideObj.type == "text") {
//     }
//   }
// }

function testChangeSlideObjectPositionAndSize() {
  const { presentation: minP } = minPresentation();
  const minOrder = getOrderedMapOrder(minP.slides);
  if (minOrder.length === 0) {
    const resPosMin = changeSlideObjectPosition(
      minP,
      "no-slide",
      "no-obj",
      10,
      10,
    );
    assert(
      resPosMin === minP,
      "Минимальная: при отсутствии слайдов позиция не меняется",
    );
    const resSizeMin = changeSlideObjSize(minP, "no-slide", "no-obj", 50, 60);
    assert(
      resSizeMin === minP,
      "Минимальная: при отсутствии слайдов размер не меняется",
    );
  } else {
    const minSlideId = minOrder[0];
    const minSlide = getOrderedMapElementById(minP.slides, minSlideId)!;
    const minObjs = getOrderedMapOrder(minSlide.slideObjects);
    if (minObjs.length === 0) {
      const resPosMin = changeSlideObjectPosition(
        minP,
        minSlideId,
        "no-obj",
        10,
        10,
      );
      assert(
        resPosMin === minP,
        "Минимальная: при отсутствии объектов позиция не меняется",
      );
      const resSizeMin = changeSlideObjSize(minP, minSlideId, "no-obj", 50, 60);
      assert(
        resSizeMin === minP,
        "Минимальная: при отсутствии объектов размер не меняется",
      );
    } else {
      const minObjId = minObjs[0];
      const resPosMin = changeSlideObjectPosition(
        minP,
        minSlideId,
        minObjId,
        10,
        10,
      );

      const rectMin: Rect = getOrderedMapElementById(
        getOrderedMapElementById(resPosMin.slides, minSlideId)!.slideObjects,
        minObjId,
      )!.rect;
      assert(
        rectMin.x === 10 && rectMin.y === 10,
        "Минимальная: позиция изменена",
      );
      const resSizeMin = changeSlideObjSize(
        resPosMin,
        minSlideId,
        minObjId,
        50,
        60,
      );

      const rectSizeMin = getOrderedMapElementById(
        getOrderedMapElementById(resSizeMin.slides, minSlideId)!.slideObjects,
        minObjId,
      )!.rect;
      assert(
        rectSizeMin.w === 50 && rectSizeMin.h === 60,
        "Минимальная: размер изменен",
      );
    }
  }

  const { presentation: maxP } = maxPresentation();
  const maxSlideId = getOrderedMapOrder(maxP.slides)[0];
  const maxObjId = getOrderedMapOrder(
    getOrderedMapElementById(maxP.slides, maxSlideId)!.slideObjects,
  )[0];
  const resPosMax = changeSlideObjectPosition(
    maxP,
    maxSlideId,
    maxObjId,
    20,
    20,
  );
  const rectMax = getOrderedMapElementById(
    getOrderedMapElementById(resPosMax.slides, maxSlideId)!.slideObjects,
    maxObjId,
  )!.rect;
  assert(
    rectMax.x === 20 && rectMax.y === 20,
    "Максимальная: позиция изменена",
  );
  const resSizeMax = changeSlideObjSize(
    resPosMax,
    maxSlideId,
    maxObjId,
    80,
    90,
  );
  const rectSizeMax = getOrderedMapElementById(
    getOrderedMapElementById(resSizeMax.slides, maxSlideId)!.slideObjects,
    maxObjId,
  )!.rect;
  assert(
    rectSizeMax.w === 80 && rectSizeMax.h === 90,
    "Максимальная: размер изменен",
  );
}

function testTextFontChanges() {
  const { presentation: minP } = minPresentation();
  const minOrder = getOrderedMapOrder(minP.slides);
  if (minOrder.length === 0) {
    const resMin = changeSlideTextString(
      minP,
      "no-slide",
      "no-obj",
      "Updated Text",
    );
    assert(
      resMin === minP,
      "Минимальная: при отсутствии слайдов текст не меняется",
    );
  } else {
    const minSlideId = minOrder[0];
    const minSlide = getOrderedMapElementById(minP.slides, minSlideId)!;
    const minObjs = getOrderedMapOrder(minSlide.slideObjects);
    if (minObjs.length === 0) {
      const resMin = changeSlideTextString(
        minP,
        minSlideId,
        "no-obj",
        "Updated Text",
      );
      assert(
        resMin === minP,
        "Минимальная: при отсутствии объектов текст не меняется",
      );
    } else {
      const minObjId = minObjs[0];
      const resText = changeSlideTextString(
        minP,
        minSlideId,
        minObjId,
        "Updated Text",
      );
      const obj = getOrderedMapElementById(
        getOrderedMapElementById(resText.slides, minSlideId)!.slideObjects,
        minObjId,
      )!;
      assert(
        obj.type === "text" && obj.text === "Updated Text",
        "Минимальная: текст изменен",
      );
    }
  }

  const { presentation: maxP } = maxPresentation();
  const maxSlideId = getOrderedMapOrder(maxP.slides)[0];
  const maxObjId = getOrderedMapOrder(
    getOrderedMapElementById(maxP.slides, maxSlideId)!.slideObjects,
  )[0];
  const resTextMax = changeSlideTextString(
    maxP,
    maxSlideId,
    maxObjId,
    "Max Text",
  );
  const objMax = getOrderedMapElementById(
    getOrderedMapElementById(resTextMax.slides, maxSlideId)!.slideObjects,
    maxObjId,
  )!;
  assert(
    objMax.type === "text" && objMax.text === "Max Text",
    "Максимальная: текст изменен",
  );
}

function testIndividualFontChanges() {
  const { presentation: minP } = minPresentation();
  const minOrder = getOrderedMapOrder(minP.slides);
  if (minOrder.length === 0) {
    const resMin = changeFontFamily(minP, "no-slide", "no-obj", "Courier New");
    assert(
      resMin === minP,
      "Минимальная: при отсутствии слайдов fontFamily не меняется",
    );
  } else {
    const minSlideId = minOrder[0];
    const minSlide = getOrderedMapElementById(minP.slides, minSlideId)!;
    const minObjs = getOrderedMapOrder(minSlide.slideObjects);
    if (minObjs.length === 0) {
      const resMin = changeFontFamily(
        minP,
        minSlideId,
        "no-obj",
        "Courier New",
      );
      assert(
        resMin === minP,
        "Минимальная: при отсутствии объектов fontFamily не меняется",
      );
    } else {
      const minObjId = minObjs[0];
      let res = changeFontFamily(minP, minSlideId, minObjId, "Courier New");
      let obj = getOrderedMapElementById(
        getOrderedMapElementById(res.slides, minSlideId)!.slideObjects,
        minObjId,
      )! as SlideText;
      assert(
        obj.type === "text" && obj.font.fontFamily === "Courier New",
        "Минимальная: fontFamily изменен",
      );

      res = changeFontSize(res, minSlideId, minObjId, "24px");
      obj = getOrderedMapElementById(
        getOrderedMapElementById(res.slides, minSlideId)!.slideObjects,
        minObjId,
      )! as SlideText;
      assert(obj.font.fontSize === "24px", "Минимальная: fontSize изменен");

      res = changeFontWeight(res, minSlideId, minObjId, "bold");
      obj = getOrderedMapElementById(
        getOrderedMapElementById(res.slides, minSlideId)!.slideObjects,
        minObjId,
      )! as SlideText;
      assert(obj.font.fontWeight === "bold", "Минимальная: fontWeight изменен");

      res = changeFontStyle(res, minSlideId, minObjId, new Set(["italic"]));
      obj = getOrderedMapElementById(
        getOrderedMapElementById(res.slides, minSlideId)!.slideObjects,
        minObjId,
      )! as SlideText;
      const fsMin = obj.font.fontStyle;
      assert(fsMin && fsMin.has("italic"), "Минимальная: fontStyle изменен");

      const color: Color = { type: "color", color: "#123456" };
      res = changeFontColor(res, minSlideId, minObjId, color);
      obj = getOrderedMapElementById(
        getOrderedMapElementById(res.slides, minSlideId)!.slideObjects,
        minObjId,
      )! as SlideText;
      assert(
        obj.font.color !== undefined && obj.font.color.color === "#123456",
        "Минимальная: fontColor изменен",
      );

      res = changeLetterSpacing(res, minSlideId, minObjId, "2px");
      obj = getOrderedMapElementById(
        getOrderedMapElementById(res.slides, minSlideId)!.slideObjects,
        minObjId,
      )! as SlideText;
      assert(
        obj.font.letterSpacing === "2px",
        "Минимальная: letterSpacing изменен",
      );

      res = changeWordSpacing(res, minSlideId, minObjId, "4px");
      obj = getOrderedMapElementById(
        getOrderedMapElementById(res.slides, minSlideId)!.slideObjects,
        minObjId,
      )! as SlideText;
      assert(
        obj.font.wordSpacing === "4px",
        "Минимальная: wordSpacing изменен",
      );

      res = changeTextDecoration(
        res,
        minSlideId,
        minObjId,
        new Set(["underline"]),
      );
      obj = getOrderedMapElementById(
        getOrderedMapElementById(res.slides, minSlideId)!.slideObjects,
        minObjId,
      )! as SlideText;
      const tdMin = obj.font.textDecoration;
      assert(
        tdMin && tdMin.has("underline"),
        "Минимальная: textDecoration изменен",
      );

      res = changeTextTransform(res, minSlideId, minObjId, "uppercase");
      obj = getOrderedMapElementById(
        getOrderedMapElementById(res.slides, minSlideId)!.slideObjects,
        minObjId,
      )! as SlideText;
      assert(
        obj.font.textTransform === "uppercase",
        "Минимальная: textTransform изменен",
      );
    }
  }

  const { presentation: maxP } = maxPresentation();
  const maxSlideId = getOrderedMapOrder(maxP.slides)[0];
  const maxObjId = getOrderedMapOrder(
    getOrderedMapElementById(maxP.slides, maxSlideId)!.slideObjects,
  )[0];

  let resMax = changeFontFamily(maxP, maxSlideId, maxObjId, "Times New Roman");
  let objMax = getOrderedMapElementById(
    getOrderedMapElementById(resMax.slides, maxSlideId)!.slideObjects,
    maxObjId,
  )! as SlideText;
  assert(
    objMax.type === "text" && objMax.font.fontFamily === "Times New Roman",
    "Максимальная: fontFamily изменен",
  );

  resMax = changeFontSize(resMax, maxSlideId, maxObjId, "30px");
  objMax = getOrderedMapElementById(
    getOrderedMapElementById(resMax.slides, maxSlideId)!.slideObjects,
    maxObjId,
  )! as SlideText;
  assert(objMax.font.fontSize === "30px", "Максимальная: fontSize изменен");

  resMax = changeFontWeight(resMax, maxSlideId, maxObjId, "lighter");
  objMax = getOrderedMapElementById(
    getOrderedMapElementById(resMax.slides, maxSlideId)!.slideObjects,
    maxObjId,
  )! as SlideText;
  assert(
    objMax.font.fontWeight === "lighter",
    "Максимальная: fontWeight изменен",
  );

  resMax = changeFontStyle(resMax, maxSlideId, maxObjId, new Set(["italic"]));
  objMax = getOrderedMapElementById(
    getOrderedMapElementById(resMax.slides, maxSlideId)!.slideObjects,
    maxObjId,
  )! as SlideText;
  const fsMax = objMax.font.fontStyle;
  assert(
    fsMax && fsMax.has("italic"),
    "Максимальная: fontStyle должен быть изменен",
  );

  const newColor: Color = { type: "color", color: "#abcdef" };
  resMax = changeFontColor(resMax, maxSlideId, maxObjId, newColor);
  objMax = getOrderedMapElementById(
    getOrderedMapElementById(resMax.slides, maxSlideId)!.slideObjects,
    maxObjId,
  )! as SlideText;
  assert(
    objMax.font.color !== undefined && objMax.font.color.color === "#abcdef",
    "Максимальная: fontColor изменен",
  );

  resMax = changeLetterSpacing(resMax, maxSlideId, maxObjId, "1em");
  objMax = getOrderedMapElementById(
    getOrderedMapElementById(resMax.slides, maxSlideId)!.slideObjects,
    maxObjId,
  )! as SlideText;
  assert(
    objMax.font.letterSpacing === "1em",
    "Максимальная: letterSpacing изменен",
  );

  resMax = changeWordSpacing(resMax, maxSlideId, maxObjId, "0.5em");
  objMax = getOrderedMapElementById(
    getOrderedMapElementById(resMax.slides, maxSlideId)!.slideObjects,
    maxObjId,
  )! as SlideText;
  assert(
    objMax.font.wordSpacing === "0.5em",
    "Максимальная: wordSpacing изменен",
  );

  resMax = changeTextDecoration(
    resMax,
    maxSlideId,
    maxObjId,
    new Set(["underline dotted"]),
  );

  objMax = getOrderedMapElementById(
    getOrderedMapElementById(resMax.slides, maxSlideId)!.slideObjects,
    maxObjId,
  )! as SlideText;
  const tdMax = objMax.font.textDecoration;
  assert(
    tdMax && tdMax.has("underline dotted"),
    "Максимальная: textDecoration изменен",
  );

  resMax = changeTextTransform(resMax, maxSlideId, maxObjId, "uppercase");
  objMax = getOrderedMapElementById(
    getOrderedMapElementById(resMax.slides, maxSlideId)!.slideObjects,
    maxObjId,
  )! as SlideText;
  assert(
    objMax.font.textTransform === "uppercase",
    "Максимальная: textTransform изменен",
  );
}

function testSlideBackgroundColor() {
  const color: Color = { type: "color", color: "#abcdef" };

  const { presentation: minP } = minPresentation();
  const minOrder = getOrderedMapOrder(minP.slides);
  if (minOrder.length === 0) {
    const resMin = changeSlideBackgroundColor(minP, "no-slide", color);
    assert(
      resMin === minP,
      "Минимальная: при отсутствии слайдов цвет не меняется",
    );
  } else {
    const minSlideId = minOrder[0];
    const resMin = changeSlideBackgroundColor(minP, minSlideId, color);
    const bgMin = getOrderedMapElementById(resMin.slides, minSlideId)!
      .backgroundColor.color;
    assert(bgMin === color.color, "Минимальная: цвет слайда изменен");
  }

  const { presentation: maxP } = maxPresentation();
  const maxSlideId = getOrderedMapOrder(maxP.slides)[0];
  const resMax = changeSlideBackgroundColor(maxP, maxSlideId, color);
  const bgMax = getOrderedMapElementById(resMax.slides, maxSlideId)!
    .backgroundColor.color;
  assert(bgMax === color.color, "Максимальная: цвет слайда изменен");
}

function testSelectFunctions() {
  const { select: minSelect } = minPresentation();
  const slideId = "slide1";
  const objId = "obj1";
  const sel1 = selectSlide(minSelect, slideId);
  assert(sel1.selectedSlideId.includes(slideId), "Минимальная: слайд выбран");
  const sel2 = selectSlideObj(sel1, objId);
  assert(sel2.selectedSlideObjId.includes(objId), "Минимальная: объект выбран");
  const cleared = clearSelection();
  assert(
    cleared.selectedSlideId.length === 0 &&
      cleared.selectedSlideObjId.length === 0,
    "Минимальная: выбор очищен",
  );
}

run("changePresentationTitle (min & max)", testChangePresentationTitle);
run("addSlide (min & max)", testAddSlide);
run("removeSlide (min & max)", testRemoveSlide);
run("moveSlide (min & max)", testMoveSlide);
run("removeSlideObj (min & max)", testRemoveSlideObj);
run("addTextAndImage (min & max)", testAddTextAndImage);
run(
  "changeSlideObjectPositionAndSize (min & max)",
  testChangeSlideObjectPositionAndSize,
);
run("textFontChanges (min & max)", testTextFontChanges);
run("test individual font changes (min & max)", testIndividualFontChanges);
run("slideBackgroundColor (min & max)", testSlideBackgroundColor);
run("selectFunctions (min & max)", testSelectFunctions);
summary();

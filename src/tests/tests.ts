import { assert, assertEqual, run, summary } from "../shared/lib/testUtils";
import {
  getMaxEditor,
  getMinEditor,
} from "../entities/presentation/model/test/data";
import type { Color } from "../shared/types/color/Color";
import {
  getOrderedMapElementById,
  getOrderedMapOrder,
  orderedMapLength,
} from "../shared/types/orderedMap/OrderedMap";
import type { Rect } from "../shared/types/rect/Rect";
import type { SlideText } from "../entities/slideText/model/types";
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
  moveSlide,
  removeSlide,
  removeSlideObject,
  selectSlide,
  selectSlideObj,
  clearSelection,
} from "../entities/editor/lib/editor";

function testChangePresentationTitle() {
  const editor = getMinEditor();
  const minP = editor.presentation;

  const newTitle = "New Title";
  const resMin = changePresentationTitle(editor, newTitle).presentation;
  assert(
    resMin.title !== minP.title,
    "Минимальная: заголовок должен обновиться на новый",
  );

  const resEmpty = changePresentationTitle(editor, "");
  assertEqual(resEmpty, editor, "Пустая строка не должна менять заголовок");

  const tooLong = "o".repeat(100);
  const resTooLong = changePresentationTitle(editor, tooLong).presentation;
  assertEqual(
    resTooLong.title,
    minP.title,
    "Слишком длинный заголовок презентации",
  );

  const maxEditor = getMaxEditor();
  const { presentation: maxP } = maxEditor;
  const anotherTitle = "AnotherNewTitle";
  const resMax = changePresentationTitle(maxEditor, anotherTitle).presentation;
  assertEqual(
    resMax.title,
    anotherTitle,
    "Максимальная: заголовок должен обновиться на новый",
  );

  const resSame = changePresentationTitle(maxEditor, maxP.title).presentation;
  assertEqual(
    resSame.title,
    maxP.title,
    "Установка того же самого заголовка запрещена",
  );
}

function testAddSlide() {
  const minEditor = getMaxEditor();
  const { presentation: minP } = minEditor;
  const resMinEditor = addSlide(minEditor);
  const { presentation: resMin, select: selMin } = resMinEditor;
  assert(
    orderedMapLength(resMin.slides) === orderedMapLength(minP.slides) + 1,
    "Минимальная: число слайдов должно увеличиться на 1",
  );
  assert(
    selMin.selectedSlideObjIds.length === 0,
    "Минимальная: выбор объектов должен быть очищен",
  );

  const maxEditor = getMaxEditor();
  const { presentation: maxP } = maxEditor;
  const resMaxEditor = addSlide(maxEditor);
  const { presentation: resMax, select: selMax } = resMaxEditor;
  assert(
    orderedMapLength(resMax.slides) === orderedMapLength(maxP.slides) + 1,
    "Максимальная: число слайдов должно увеличиться на 1",
  );
  assert(
    selMax.selectedSlideObjIds.length === 0,
    "Максимальная: выбор объектов должен быть очищен",
  );
}

function testRemoveSlide() {
  const minEditor = getMaxEditor();
  const { presentation: minP } = minEditor;
  const minSlideId = getOrderedMapOrder(minP.slides)[0];
  const resMinEditor = removeSlide(minEditor, minSlideId);
  const { presentation: resMin, select: selMin } = resMinEditor;
  assert(
    !getOrderedMapOrder(resMin.slides).includes(minSlideId),
    "Минимальная: слайд должен быть удален",
  );
  assert(
    selMin.selectedSlideIds.every((id) => id !== minSlideId),
    "Минимальная: удаленный слайд не выбран",
  );

  const maxEditor = getMaxEditor();
  const { presentation: maxP } = maxEditor;
  const maxSlideId = getOrderedMapOrder(maxP.slides)[0];
  const resMaxEditor = removeSlide(maxEditor, maxSlideId);
  const { presentation: resMax, select: selMax } = resMaxEditor;
  assert(
    !getOrderedMapOrder(resMax.slides).includes(maxSlideId),
    "Максимальная: слайд должен быть удален",
  );
  assert(
    selMax.selectedSlideIds.every((id) => id !== maxSlideId),
    "Максимальная: удаленный слайд не выбран",
  );
}

function testMoveSlide() {
  const minEditor = getMaxEditor();
  const { presentation: minP } = minEditor;
  const minSlidesOrder = getOrderedMapOrder(minP.slides);
  if (minSlidesOrder.length > 1) {
    const resMinEditor = moveSlide(minEditor, minSlidesOrder[0], 1);
    const { presentation: resMin } = resMinEditor;
    assert(
      getOrderedMapOrder(resMin.slides)[1] === minSlidesOrder[0],
      "Минимальная: слайд должен быть перемещен",
    );
  }

  const maxEditor = getMaxEditor();
  const { presentation: maxP } = maxEditor;
  const maxSlidesOrder = getOrderedMapOrder(maxP.slides);
  const resMaxEditor = moveSlide(
    maxEditor,
    maxSlidesOrder[0],
    maxSlidesOrder.length - 1,
  );
  const { presentation: resMax } = resMaxEditor;
  assert(
    getOrderedMapOrder(resMax.slides)[maxSlidesOrder.length - 1] ===
      maxSlidesOrder[0],
    "Максимальная: слайд должен быть перемещен",
  );
}

function testRemoveSlideObj() {
  const minEditor = getMaxEditor();
  const { presentation: minP } = minEditor;
  const minSlideOrder = getOrderedMapOrder(minP.slides);
  if (minSlideOrder.length > 1) {
    const minSlideId = minSlideOrder[0];
    const minSlide = getOrderedMapElementById(minP.slides, minSlideId)!;
    const minObjId = getOrderedMapOrder(minSlide.slideObjects)[0];

    const resMinEditor = removeSlideObject(minEditor, minSlideId, minObjId);
    const { presentation: resMin, select: selMin } = resMinEditor;

    assert(
      !getOrderedMapOrder(
        getOrderedMapElementById(resMin.slides, minSlideId)!.slideObjects,
      ).includes(minObjId),
      "Минимальная: объект слайда должен быть удален",
    );

    assert(
      !selMin.selectedSlideObjIds.includes(minObjId),
      "Минимальная: удаленный объект не должен быть выбран",
    );
  }

  const maxEditor = getMaxEditor();
  const { presentation: maxP } = maxEditor;
  const maxSlideId = getOrderedMapOrder(maxP.slides)[0];
  const maxSlide = getOrderedMapElementById(maxP.slides, maxSlideId)!;
  const maxObjId = getOrderedMapOrder(maxSlide.slideObjects)[0];

  const resMaxEditor = removeSlideObject(maxEditor, maxSlideId, maxObjId);
  const { presentation: resMax, select: selMax } = resMaxEditor;

  assert(
    !getOrderedMapOrder(
      getOrderedMapElementById(resMax.slides, maxSlideId)!.slideObjects,
    ).includes(maxObjId),
    "Максимальная: объект слайда должен быть удален",
  );

  assert(
    !selMax.selectedSlideObjIds.includes(maxObjId),
    "Максимальная: удаленный объект не должен быть выбран",
  );
}

function testAddTextAndImage() {
  const rect: Rect = { x: 0, y: 0, w: 100, h: 50 };

  const minEditor = getMaxEditor();
  const { presentation: minP } = minEditor;
  const minOrder = getOrderedMapOrder(minP.slides);
  if (minOrder.length === 0) {
    const res = addText(minEditor, "no-slide");
    assertEqual(
      res,
      minEditor,
      "Минимальная: при отсутствии слайда презентация не меняется",
    );
  } else {
    const minSlideId = minOrder[0];
    const res1 = addText(minEditor, minSlideId);
    const { select: s1 } = res1;
    assert(s1.selectedSlideObjIds.length === 1, "Минимальная: текст добавлен");
    const res2 = addImage(res1, minSlideId, "img.png", rect.w, rect.h);
    const { select: s2 } = res2;
    assert(
      s2.selectedSlideObjIds.length === 1,
      "Минимальная: изображение добавлено",
    );
  }

  const maxEditor = getMaxEditor();
  const { presentation: maxP } = maxEditor;
  const maxSlideId = getOrderedMapOrder(maxP.slides)[0];
  const res3 = addText(maxEditor, maxSlideId);
  const { select: s3 } = res3;
  assert(s3.selectedSlideObjIds.length === 1, "Максимальная: текст добавлен");
  const res4 = addImage(res3, maxSlideId, "img_max.png", rect.w, rect.h);
  const { select: s4 } = res4;
  assert(
    s4.selectedSlideObjIds.length === 1,
    "Максимальная: изображение добавлено",
  );
}

function testChangeSlideObjectPositionAndSize() {
  const minEditor = getMinEditor();
  const { presentation: minP } = minEditor;
  const minOrder = getOrderedMapOrder(minP.slides);
  if (minOrder.length === 0) {
    const resPosMin = changeSlideObjectPosition(
      minEditor,
      "no-slide",
      "no-obj",
      10,
      10,
    );
    assert(
      resPosMin === minEditor,
      "Минимальная: при отсутствии слайдов позиция не меняется",
    );
    const resSizeMin = changeSlideObjSize(
      minEditor,
      "no-slide",
      "no-obj",
      50,
      60,
    );
    assert(
      resSizeMin === minEditor,
      "Минимальная: при отсутствии слайдов размер не меняется",
    );
  } else {
    const minSlideId = minOrder[0];
    const minSlide = getOrderedMapElementById(minP.slides, minSlideId)!;
    const minObjs = getOrderedMapOrder(minSlide.slideObjects);
    if (minObjs.length === 0) {
      const resPosMin = changeSlideObjectPosition(
        minEditor,
        minSlideId,
        "no-obj",
        10,
        10,
      );
      assert(
        resPosMin === minEditor,
        "Минимальная: при отсутствии объектов позиция не меняется",
      );
      const resSizeMin = changeSlideObjSize(
        minEditor,
        minSlideId,
        "no-obj",
        50,
        60,
      );
      assert(
        resSizeMin === minEditor,
        "Минимальная: при отсутствии объектов размер не меняется",
      );
    } else {
      const minObjId = minObjs[0];
      const resPosMin = changeSlideObjectPosition(
        minEditor,
        minSlideId,
        minObjId,
        10,
        10,
      );
      const rectMin: Rect = getOrderedMapElementById(
        getOrderedMapElementById(resPosMin.presentation.slides, minSlideId)!
          .slideObjects,
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
        getOrderedMapElementById(resSizeMin.presentation.slides, minSlideId)!
          .slideObjects,
        minObjId,
      )!.rect;
      assert(
        rectSizeMin.w === 50 && rectSizeMin.h === 60,
        "Минимальная: размер изменен",
      );
    }
  }

  const maxEditor = getMaxEditor();
  const { presentation: maxP } = maxEditor;
  const maxSlideId = getOrderedMapOrder(maxP.slides)[0];
  const maxObjId = getOrderedMapOrder(
    getOrderedMapElementById(maxP.slides, maxSlideId)!.slideObjects,
  )[0];
  const resPosMax = changeSlideObjectPosition(
    maxEditor,
    maxSlideId,
    maxObjId,
    20,
    20,
  );
  const rectMax = getOrderedMapElementById(
    getOrderedMapElementById(resPosMax.presentation.slides, maxSlideId)!
      .slideObjects,
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
    getOrderedMapElementById(resSizeMax.presentation.slides, maxSlideId)!
      .slideObjects,
    maxObjId,
  )!.rect;
  assert(
    rectSizeMax.w === 80 && rectSizeMax.h === 90,
    "Максимальная: размер изменен",
  );
}

function testTextFontChanges() {
  const minEditor = getMinEditor();
  const { presentation: minP } = minEditor;
  const minOrder = getOrderedMapOrder(minP.slides);
  if (minOrder.length === 0) {
    const resMin = changeSlideTextString(
      minEditor,
      "no-slide",
      "no-obj",
      "Updated Text",
    );
    assert(
      resMin === minEditor,
      "Минимальная: при отсутствии слайдов текст не меняется",
    );
  } else {
    const minSlideId = minOrder[0];
    const minSlide = getOrderedMapElementById(minP.slides, minSlideId)!;
    const minObjs = getOrderedMapOrder(minSlide.slideObjects);
    if (minObjs.length === 0) {
      const resMin = changeSlideTextString(
        minEditor,
        minSlideId,
        "no-obj",
        "Updated Text",
      );
      assert(
        resMin === minEditor,
        "Минимальная: при отсутствии объектов текст не меняется",
      );
    } else {
      const minObjId = minObjs[0];
      const resText = changeSlideTextString(
        minEditor,
        minSlideId,
        minObjId,
        "Updated Text",
      );
      const obj = getOrderedMapElementById(
        getOrderedMapElementById(resText.presentation.slides, minSlideId)!
          .slideObjects,
        minObjId,
      )!;
      assert(
        obj.type === "text" && obj.text === "Updated Text",
        "Минимальная: текст изменен",
      );
    }
  }

  const maxEditor = getMaxEditor();
  const { presentation: maxP } = maxEditor;
  const maxSlideId = getOrderedMapOrder(maxP.slides)[0];
  const maxObjId = getOrderedMapOrder(
    getOrderedMapElementById(maxP.slides, maxSlideId)!.slideObjects,
  )[0];
  const resTextMax = changeSlideTextString(
    maxEditor,
    maxSlideId,
    maxObjId,
    "Max Text",
  );
  const objMax = getOrderedMapElementById(
    getOrderedMapElementById(resTextMax.presentation.slides, maxSlideId)!
      .slideObjects,
    maxObjId,
  )!;
  assert(
    objMax.type === "text" && objMax.text === "Max Text",
    "Максимальная: текст изменен",
  );
}

function testIndividualFontChanges() {
  const minEditor = getMinEditor();
  const { presentation: minP } = minEditor;
  const minOrder = getOrderedMapOrder(minP.slides);
  if (minOrder.length === 0) {
    const resMin = changeFontFamily(
      minEditor,
      "no-slide",
      "no-obj",
      "Courier New",
    );
    assert(
      resMin === minEditor,
      "Минимальная: при отсутствии слайдов fontFamily не меняется",
    );
  } else {
    const minSlideId = minOrder[0];
    const minSlide = getOrderedMapElementById(minP.slides, minSlideId)!;
    const minObjs = getOrderedMapOrder(minSlide.slideObjects);
    if (minObjs.length === 0) {
      const resMin = changeFontFamily(
        minEditor,
        minSlideId,
        "no-obj",
        "Courier New",
      );
      assert(
        resMin === minEditor,
        "Минимальная: при отсутствии объектов fontFamily не меняется",
      );
    } else {
      const minObjId = minObjs[0];
      let res = changeFontFamily(
        minEditor,
        minSlideId,
        minObjId,
        "Courier New",
      );
      let obj = getOrderedMapElementById(
        getOrderedMapElementById(res.presentation.slides, minSlideId)!
          .slideObjects,
        minObjId,
      )! as SlideText;
      assert(
        obj.type === "text" && obj.font.fontFamily === "Courier New",
        "Минимальная: fontFamily изменен",
      );

      res = changeFontSize(res, minSlideId, minObjId, "24px");
      obj = getOrderedMapElementById(
        getOrderedMapElementById(res.presentation.slides, minSlideId)!
          .slideObjects,
        minObjId,
      )! as SlideText;
      assert(obj.font.fontSize === "24px", "Минимальная: fontSize изменен");

      res = changeFontWeight(res, minSlideId, minObjId, "bold");
      obj = getOrderedMapElementById(
        getOrderedMapElementById(res.presentation.slides, minSlideId)!
          .slideObjects,
        minObjId,
      )! as SlideText;
      assert(obj.font.fontWeight === "bold", "Минимальная: fontWeight изменен");

      res = changeFontStyle(res, minSlideId, minObjId, new Set(["italic"]));
      obj = getOrderedMapElementById(
        getOrderedMapElementById(res.presentation.slides, minSlideId)!
          .slideObjects,
        minObjId,
      )! as SlideText;
      const fsMin = obj.font.fontStyle;
      assert(fsMin && fsMin.has("italic"), "Минимальная: fontStyle изменен");

      const color: Color = { type: "color", color: "#123456" };
      res = changeFontColor(res, minSlideId, minObjId, color);
      obj = getOrderedMapElementById(
        getOrderedMapElementById(res.presentation.slides, minSlideId)!
          .slideObjects,
        minObjId,
      )! as SlideText;
      assert(
        obj.font.color !== undefined && obj.font.color.color === "#123456",
        "Минимальная: fontColor изменен",
      );

      res = changeLetterSpacing(res, minSlideId, minObjId, "2px");
      obj = getOrderedMapElementById(
        getOrderedMapElementById(res.presentation.slides, minSlideId)!
          .slideObjects,
        minObjId,
      )! as SlideText;
      assert(
        obj.font.letterSpacing === "2px",
        "Минимальная: letterSpacing изменен",
      );

      res = changeWordSpacing(res, minSlideId, minObjId, "4px");
      obj = getOrderedMapElementById(
        getOrderedMapElementById(res.presentation.slides, minSlideId)!
          .slideObjects,
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
        getOrderedMapElementById(res.presentation.slides, minSlideId)!
          .slideObjects,
        minObjId,
      )! as SlideText;
      const tdMin = obj.font.textDecoration;
      assert(
        tdMin && tdMin.has("underline"),
        "Минимальная: textDecoration изменен",
      );

      res = changeTextTransform(res, minSlideId, minObjId, "uppercase");
      obj = getOrderedMapElementById(
        getOrderedMapElementById(res.presentation.slides, minSlideId)!
          .slideObjects,
        minObjId,
      )! as SlideText;
      assert(
        obj.font.textTransform === "uppercase",
        "Минимальная: textTransform изменен",
      );
    }
  }

  const maxEditor = getMaxEditor();
  const { presentation: maxP } = maxEditor;
  const maxSlideId = getOrderedMapOrder(maxP.slides)[0];
  const maxObjId = getOrderedMapOrder(
    getOrderedMapElementById(maxP.slides, maxSlideId)!.slideObjects,
  )[0];

  let resMax = changeFontFamily(
    maxEditor,
    maxSlideId,
    maxObjId,
    "Times New Roman",
  );
  let objMax = getOrderedMapElementById(
    getOrderedMapElementById(resMax.presentation.slides, maxSlideId)!
      .slideObjects,
    maxObjId,
  )! as SlideText;
  assert(
    objMax.type === "text" && objMax.font.fontFamily === "Times New Roman",
    "Максимальная: fontFamily изменен",
  );

  resMax = changeFontSize(resMax, maxSlideId, maxObjId, "30px");
  objMax = getOrderedMapElementById(
    getOrderedMapElementById(resMax.presentation.slides, maxSlideId)!
      .slideObjects,
    maxObjId,
  )! as SlideText;
  assert(objMax.font.fontSize === "30px", "Максимальная: fontSize изменен");

  resMax = changeFontWeight(resMax, maxSlideId, maxObjId, "lighter");
  objMax = getOrderedMapElementById(
    getOrderedMapElementById(resMax.presentation.slides, maxSlideId)!
      .slideObjects,
    maxObjId,
  )! as SlideText;
  assert(
    objMax.font.fontWeight === "lighter",
    "Максимальная: fontWeight изменен",
  );

  resMax = changeFontStyle(resMax, maxSlideId, maxObjId, new Set(["italic"]));
  objMax = getOrderedMapElementById(
    getOrderedMapElementById(resMax.presentation.slides, maxSlideId)!
      .slideObjects,
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
    getOrderedMapElementById(resMax.presentation.slides, maxSlideId)!
      .slideObjects,
    maxObjId,
  )! as SlideText;
  assert(
    objMax.font.color !== undefined && objMax.font.color.color === "#abcdef",
    "Максимальная: fontColor изменен",
  );

  resMax = changeLetterSpacing(resMax, maxSlideId, maxObjId, "1em");
  objMax = getOrderedMapElementById(
    getOrderedMapElementById(resMax.presentation.slides, maxSlideId)!
      .slideObjects,
    maxObjId,
  )! as SlideText;
  assert(
    objMax.font.letterSpacing === "1em",
    "Максимальная: letterSpacing изменен",
  );

  resMax = changeWordSpacing(resMax, maxSlideId, maxObjId, "0.5em");
  objMax = getOrderedMapElementById(
    getOrderedMapElementById(resMax.presentation.slides, maxSlideId)!
      .slideObjects,
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
    getOrderedMapElementById(resMax.presentation.slides, maxSlideId)!
      .slideObjects,
    maxObjId,
  )! as SlideText;
  const tdMax = objMax.font.textDecoration;
  assert(
    tdMax && tdMax.has("underline dotted"),
    "Максимальная: textDecoration изменен",
  );

  resMax = changeTextTransform(resMax, maxSlideId, maxObjId, "uppercase");
  objMax = getOrderedMapElementById(
    getOrderedMapElementById(resMax.presentation.slides, maxSlideId)!
      .slideObjects,
    maxObjId,
  )! as SlideText;
  assert(
    objMax.font.textTransform === "uppercase",
    "Максимальная: textTransform изменен",
  );
}

function testSlideBackgroundColor() {
  const color: Color = { type: "color", color: "#abcdef" };

  const minEditor = getMinEditor();
  const { presentation: minP } = minEditor;
  const minOrder = getOrderedMapOrder(minP.slides);
  if (minOrder.length === 0) {
    const resMin = changeSlideBackgroundColor(
      minEditor,
      "no-slide",
      color.color,
    );
    assert(
      resMin === minEditor,
      "Минимальная: при отсутствии слайдов цвет не меняется",
    );
  } else {
    const minSlideId = minOrder[0];
    const resMin = changeSlideBackgroundColor(
      minEditor,
      minSlideId,
      color.color,
    );
    const bgMin = getOrderedMapElementById(
      resMin.presentation.slides,
      minSlideId,
    )!.backgroundColor.color;
    assert(bgMin === color.color, "Минимальная: цвет слайда изменен");
  }

  const maxEditor = getMaxEditor();
  const { presentation: maxP } = maxEditor;
  const maxSlideId = getOrderedMapOrder(maxP.slides)[0];
  const resMax = changeSlideBackgroundColor(maxEditor, maxSlideId, color.color);
  const bgMax = getOrderedMapElementById(
    resMax.presentation.slides,
    maxSlideId,
  )!.backgroundColor.color;
  assert(bgMax === color.color, "Максимальная: цвет слайда изменен");
}

function testSelectFunctions() {
  const minEditor = getMinEditor();
  const slideId = "slide1";
  const objId = "obj1";
  const sel1Editor = selectSlide(minEditor, slideId);
  const sel1 = sel1Editor.select;
  assert(sel1.selectedSlideIds.includes(slideId), "Минимальная: слайд выбран");
  const sel2Editor = selectSlideObj(sel1Editor, objId);
  const sel2 = sel2Editor.select;
  assert(
    sel2.selectedSlideObjIds.includes(objId),
    "Минимальная: объект выбран",
  );
  const clearedEditor = clearSelection(minEditor);
  const cleared = clearedEditor.select;
  assert(
    cleared.selectedSlideIds.length === 0 &&
      cleared.selectedSlideObjIds.length === 0,
    "Минимальная: выбор очищен",
  );
}

// function testRemoveSlideObjects() {
//   const maxEdiror = maxEditor();
// }

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

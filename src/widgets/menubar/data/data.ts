import type { MenuBarItemType } from "../../../entities/menuBarItem/model/types.ts";
import { newMenuBarItem } from "../../../entities/menuBarItem/lib/menuBarItem.ts";

export function getMenuBarItems(): Array<MenuBarItemType> {
  return [
    newMenuBarItem("Файл", [
      "Создать",
      "Открыть",
      "Создать копию",
      "Экспорт в PDF",
    ]),
    newMenuBarItem("Правка", ["Отменить", "Повторить"]),
    newMenuBarItem("Вид", ["Слайд-шоу", "Сменить фон слайда"]),
  ];
}

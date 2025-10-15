import type { Presentation } from "../../presentation/model/types.ts";
import type { Select } from "../../select/model/types.ts";

export type Editor = {
  presentation: Presentation;
  select: Select;
};

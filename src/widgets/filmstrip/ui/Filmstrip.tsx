import {
  getOrderedMapElementById,
  getOrderedMapOrder,
  type OrderedMap,
} from "../../../shared/types/orderedMap/OrderedMap.ts";
import type { Slide } from "../../../entities/slide/model/types.ts";
import { SlideView } from "../../../entities/slide/ui/SlideView.tsx";

import styles from "./filmstrip.module.css";

export type FilmstripProps = {
  slides: OrderedMap<Slide>;
};

export function FilmStrip(props: FilmstripProps) {
  const { slides } = props;
  const order = getOrderedMapOrder(slides);

  return (
    <div className={styles.filmstrip}>
      {order.map((id, idx) => {
        const s = getOrderedMapElementById(slides, id);
        if (s) {
          return <SlideView key={idx} slide={s} idx={idx} />;
        }
      })}
    </div>
  );
}

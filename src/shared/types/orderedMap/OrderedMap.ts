import type { Collection } from "./Collection.ts";

export interface OrderedMap<T> {
  collection: Collection<T>;
  order: string[];
}

export function newOrderedMap<T>(
  collection: Collection<T> = {},
  order: string[] = [],
) {
  return {
    collection: { ...collection },
    order: [...order],
  };
}

export function getOrderedMapElementById<T>(
  map: OrderedMap<T>,
  id: string,
): T | undefined {
  return map.collection[id];
}

export function getOrderedMapCollection<T>(map: OrderedMap<T>): Collection<T> {
  return { ...map.collection };
}

export function getOrderedMapOrder<T>(map: OrderedMap<T>): string[] {
  return [...map.order];
}

export function getNewOrderedMapWithRemoved<T>(
  map: OrderedMap<T>,
  id: string,
): OrderedMap<T> {
  if (!(id in map.collection)) {
    return map;
  }

  const newColl: Collection<T> = { ...map.collection };
  delete newColl[id];

  const newOrder = map.order.filter((x) => x !== id);

  return newOrderedMap(newColl, newOrder);
}

export function getNewOrderedMapWithPushed<T>(
  map: OrderedMap<T>,
  id: string,
  element: T,
): OrderedMap<T> {
  const newColl: Collection<T> = { ...map.collection };
  const newOrder = [...map.order];

  if (!(id in newColl)) {
    newOrder.push(id);
  }

  newColl[id] = element;

  return newOrderedMap(newColl, newOrder);
}

export function getNewOrderedMapWithMoved<T>(
  map: OrderedMap<T>,
  id: string,
  toIdx: number,
): OrderedMap<T> {
  const newOrder = [...map.order];
  const fromIdx = newOrder.indexOf(id);

  if (
    fromIdx === -1 ||
    toIdx < 0 ||
    toIdx > newOrder.length ||
    fromIdx === toIdx
  ) {
    return map;
  }

  newOrder.splice(fromIdx, 1);
  newOrder.splice(toIdx, 0, id);

  return newOrderedMap({ ...map.collection }, newOrder);
}

export function orderedMapLength<T>(map: OrderedMap<T>): number {
  return map.order.length;
}

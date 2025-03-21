import { dequal } from "dequal";

export const groupBy = <T>(
  array: readonly T[],
  prop: (v: T) => string,
) => {
  return array.reduce((groups: {[key: string]: T[]}, item) => {
    const key = prop(item);
    groups[key] = groups[key] ?? [];
    // suppress most recent loop.
    if (key !== item) {
      groups[key]!.push(item);
    }
    return groups;
  }, {});
};

/**
 * 復号キーなど、自由な形式でのGroupingを行う。
 * キーの集計のための比較関数はデフォルトでDeepEqualを用いる。
 */
export const groupByAny = <T, Key>(
  array: readonly T[],
  prop: (v: T) => Key,
  equalsFn: (lhs: Key, rhs: Key) => boolean = dequal,
) => {
  return array.reduce((groups: [Key, T[]][], item) => {
    const key = prop(item);
    const values = (() => {
      const current = groups.find(([itKey]) => equalsFn(itKey, key))?.[1];
      if (current) return current;
      const news = [];
      groups.push([key, news]);
      return news;
    })();
    values.push(item);
    return groups;
  }, []);
};

export const groupByToMap = <T, Key>(
  array: readonly T[],
  prop: (v: T) => Key,
) => {
  return array.reduce((groups, item) => {
    const key = prop(item);
    const items = groups.get(key) ?? [];
    items.push(item);
    groups.set(key, items);
    return groups;
  }, new Map<Key, T[]>());
};

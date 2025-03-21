type RangeOptions = {
  /** 始点 */
  from?: number;
  /** 終点を超過して指定数分拡張する */
  backwardExpansion?: number;
};
const rangeTo = (size: number) => [...Array(size)].map((_, i) => i);
const rangeFromTo = (to: number, options?: RangeOptions) => {
  const from = options?.from ?? 0;
  const diff = Math.abs(to - from);
  const direction = (() => {
    if (to === from && to < 0) return -1;
    return from <= to ? 1 : -1;
  })();
  const expansion = options?.backwardExpansion ?? 0;
  const size = diff + expansion;
  return rangeTo(size).map((it) => (it * direction) + from);
};

/**
 * 数値列を生成する関数
 */
export const range = (
  /** 終点 */
  to: number | undefined,
  /** オプション群をオブジェクト（Key-Value）として与えられる */
  options?: RangeOptions,
) => {
  return rangeFromTo(to ?? 0, options);
};

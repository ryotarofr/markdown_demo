export type NestedValueOf<T, Keys, Unions extends unknown[] = []> =
  T extends NonNullable<T>
  ? NestedValueOfInner<T, Keys, Unions>
  : NestedValueOfInner<T, Keys, Unions> | undefined;

type NestedValueOfInner<T, Keys, Unions extends unknown[] = []> =
  Keys extends [infer Head, ...infer Tails]
  ? Head extends keyof NonNullable<T>
  ? Tails extends []
  ? NonNullable<T>[Head] | Unions[number]
  : NestedValueOf<
    Required<NonNullable<T>>[Head],
    Tails,
    [...Unions, Exclude<NonNullable<T>[Head], object>]
  >
  : T
  : T;

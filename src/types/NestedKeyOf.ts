export type NestedKeyOf<T> =
  T extends Record<PropertyKey, unknown>
  ? {
    [Key in keyof T]: Required<T>[Key] extends object
    ? [Key, ...NestedKeyOf<Required<T>[Key]>]
    : [Key]
  }[keyof T]
  : T extends unknown[]
  ? T[number] extends object
  ? [number, ...NestedKeyOf<T[keyof T]>]
  : [number]
  : [];

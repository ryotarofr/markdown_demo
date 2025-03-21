import { Dispatch, SetStateAction } from "react";

import { NestedKeyOf } from "./NestedKeyOf";
import { NestedValueOf } from "./NestedValueOf";
import { PartializedTuple } from "./PartializedTuple";

export type Setter<T> = Dispatch<SetStateAction<T>>;

export const Setter = (() => {
  const toValue = <T>(setStateAction: SetStateAction<T>, prev: T) =>
    setStateAction instanceof Function
      ? setStateAction(prev)
      : setStateAction;

  const from = <T>(use: (getNext: (prev: T) => T) => void): Setter<T> =>
    (setStateAction) => use((prev) => toValue(setStateAction, prev));

  const partialOnce = <T>(setState: Setter<T>) =>
    <Key extends keyof T>(key: Key): Setter<T[Key] | undefined> =>
      from((use) => setState((prev) => {
        const next = use(prev?.[key]);
        return {
          ...prev,
          [key]: next,
        };
      }));

  return {
    toValue,
    from,
    /** Get partialized. */
    partial: <T>(setState: Setter<T>) =>
      <Keys extends PartializedTuple<NestedKeyOf<T>>>(
        ...keys: Keys
      ): Setter<NestedValueOf<T, Keys>> =>
        (keys as unknown[]).reduce(
          (it, key) => partialOnce(it as Setter<any>)(key as any),
          setState as Setter<unknown>,
        ) as Setter<NestedValueOf<T, Keys>>,
  };
})();

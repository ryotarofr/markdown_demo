import { useCallback, useLayoutEffect, useRef } from "react";

/**
 * https://github.com/reactjs/rfcs/blob/c5217c9dcf1ad46790ce6614976a65a35ed92b2e/text/0000-useevent.md#internal-implementation
 *
 * polyfill. (!) Approximate behavior
 */
export const useEffectEvent = <T extends (...args: never[]) => unknown>(fn: T) => {
  const ref = useRef<T | null>(null);

  // In a real implementation, this would run before layout effects
  useLayoutEffect(() => {
    ref.current = fn;
  }, [fn]);

  return useCallback((...args: Parameters<T>): ReturnType<T> => {
    // In a real implementation, this would throw if called during render
    const f = ref.current;
    return f?.(...args) as ReturnType<T>;
  }, []);
};

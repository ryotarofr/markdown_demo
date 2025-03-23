export const partializeSetStateDeep = (setState) => (...keys) =>
  keys.reduce((prev, it) => partializeSetState(prev)(it), setState);

export const partializeSetState = (setState) => (key) => (setStateAction) =>
  setState((prev) => {
    const next =
      typeof setStateAction === "function"
        ? setStateAction(prev?.[key])
        : setStateAction;
    if (Array.isArray(prev) && typeof key === "number") {
      const prevArray = [...prev];
      prevArray[key] = next;
      return [...prevArray];
    } else {
      return {
        ...prev,
        [key]: next,
      };
    }
  });

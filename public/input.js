// public/input.jsx
var Input = window.React.forwardRef(function Input2(props, _ref) {
  const {
    value: propsValue,
    setValue: propsSetValue,
    valueMapper = (it) => it,
    setRawValue,
    deps: initDeps = [],
    children,
    containerProps,
    stretch = false,
    simplified = false,
    suppressWheelPropergation = false,
    showClearButton: propsShowClearButton = true,
    customValidations,
    readOnly = false,
    cooldownDuration = 0,
    onInvalid,
    autoComplete = "off",
    ...wrappedProps
  } = props;
  const inputId = window.React.useId();
  const ref = window.React.useRef(null);
  window.React.useImperativeHandle(_ref, () => ref.current);
  const [value, setValue] = [propsValue, propsSetValue];
  const [currentValue, setCurrentValue] = window.React.useState(value ?? "");
  window.React.useEffect(() => setCurrentValue(value ?? ""), [value]);
  window.React.useEffect(() => {
    if (setRawValue)
      setRawValue(currentValue);
  }, [setRawValue, currentValue]);
  window.React.useEffect(() => {
    if (setValue)
      setValue(currentValue);
  }, [currentValue]);
  const suppressScroll = (event) => event.stopPropagation();
  const containerRef = window.React.useRef(null);
  window.React.useEffect(() => {
    if (!suppressWheelPropergation)
      return;
    const current = containerRef.current;
    if (!current)
      return;
    current.addEventListener("wheel", suppressScroll, { passive: false });
    return () => current.removeEventListener("wheel", suppressScroll);
  }, [suppressWheelPropergation, containerRef]);
  const resetValue = () => setCurrentValue(
    wrappedProps.defaultValue?.toString() ?? value ?? ""
  );
  window.React.useEffect(() => {
    resetValue();
  }, initDeps);
  const [coolingDown, setCoolingDown] = window.React.useState(false);
  const onChange = (event) => {
    if (readOnly)
      return;
    if (wrappedProps.disabled)
      return;
    if (cooldownDuration) {
      if (coolingDown)
        return;
      setCoolingDown(true);
      setTimeout(() => {
        setCoolingDown(false);
      }, cooldownDuration);
    }
    if (wrappedProps.onChange) {
      wrappedProps.onChange(event);
    }
    setCurrentValue(event.currentTarget.value);
  };
  return window.jsxRuntime.jsx(
    "fieldset",
    Object.assign({}, containerProps, {
      "data-testid": "inputRoot",
      ref: containerRef,
      className: containerProps && containerProps.className || ""
    }, {
      children: window.jsxRuntime.jsx("div", {
        children: [
          stretch && window.jsxRuntime.jsx("div", Object.assign({
            className: wrappedProps.className,
            "data-placeholder": wrappedProps.placeholder,
            children: currentValue
          })),
          window.jsxRuntime.jsx("input", Object.assign({}, wrappedProps, {
            "data-testid": "rawInput",
            ref,
            id: inputId,
            value: valueMapper(currentValue),
            className: wrappedProps.className,
            onChange,
            onInvalid: (event) => onInvalid && onInvalid(event, {
              setRawValue: setCurrentValue
            }),
            onKeyDown: (event) => {
              if (readOnly === true && event.key !== "Tab") {
                event.preventDefault();
                return;
              }
              if (wrappedProps.onKeyDown) {
                wrappedProps.onKeyDown(event);
              }
            },
            title: wrappedProps.title || "",
            autoComplete
          })),
          children
        ]
      })
    })
  );
});
export {
  Input
};

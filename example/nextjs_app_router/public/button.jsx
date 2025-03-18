// public/button.jsx
const Button = window.React.forwardRef(function Button(props, _ref) {
  const {
    tabIndex,
    simplified = false,
    denyReadOnly = false,
    disabled: propsDisabled,
    children,
    ...wrappedProps
  } = props;
  const disabled = propsDisabled;
  const [active, setActive] = window.React.useState(false);

  const onClick = (event) => {
    if (disabled) return;
    if (wrappedProps.onClick) {
      wrappedProps.onClick(event);
    }
  };

  const onKeyDown = (event) => {
    if (disabled) return;
    if (wrappedProps.onKeyDown) {
      wrappedProps.onKeyDown(event);
    }
    if (event.defaultPrevented) return;
    if (event.key === "Enter") {
      event.preventDefault();
      setActive(true);
    }
  };

  const onKeyUp = (event) => {
    if (disabled) return;
    if (wrappedProps.onKeyUp) {
      wrappedProps.onKeyUp(event);
    }
    if (event.defaultPrevented) return;
    if (event.key === "Enter" && active) {
      event.preventDefault();
      setActive(false);
      if (event.currentTarget && event.currentTarget.click) {
        event.currentTarget.click();
      }
    }
  };

  const onBlur = (event) => {
    setActive(false);
    if (wrappedProps.onBlur) {
      wrappedProps.onBlur(event);
    }
  };

  return window.jsxRuntime.jsx(
    "button",
    Object.assign({}, wrappedProps, {
      ref: _ref,
      type: "button",
      // className: window.clsx(
      //   wrappedProps.className
      // ),
      "aria-disabled": disabled,
      onKeyDown: onKeyDown,
      onKeyUp: onKeyUp,
      onBlur: onBlur,
      onClick: onClick,
      children: children,
    })
  );
});

export { Button };

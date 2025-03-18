import clsx from "clsx";
import {
  ComponentPropsWithoutRef,
  FocusEvent,
  ForwardedRef,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  forwardRef,
  useState,
} from "react";

import { useAuth } from "@/fn/context/AuthContext";
import { TabIndex, TabIndexes } from "@/fn/state/useTabIndexes";
import { Override } from "@/type/Override";

import styles from "./Button.module.scss";

/**
 * ボタン入力
 *
 * `<button />`ラッパー。
 */
export const Button = forwardRef(function Button({
  tabIndex,
  simplified = false,
  denyReadOnly = false,
  disabled: propsDisabled,
  children,
  ...wrappedProps
}: Override<
  /** `<button />`要素に渡す */
  ComponentPropsWithoutRef<"button">,
  {
    tabIndex?: TabIndex;
    simplified?: boolean;
    /** trueなら、参照モード時に非活性化 */
    denyReadOnly?: boolean;
    /** disabled 時にもfocusableにするなどの為に取得 */
    disabled?: boolean;
    /** 子要素 */
    children?: ReactNode;
  }
>, _ref: ForwardedRef<HTMLButtonElement>): ReactNode {
  const tabIndexes = TabIndexes.from(tabIndex);
  const auth = useAuth();
  const userIsReadOnly = auth.authUser()
    ?.authorities?.includes("MODE_READONLY")
    ?? true /* fail safe. */;
  const disabledByReadOnly = denyReadOnly && userIsReadOnly;
  const disabled = disabledByReadOnly || propsDisabled;
  const [active, setActive] = useState(false);

  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    wrappedProps.onClick?.(event);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    wrappedProps.onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === "Enter") {
      event.preventDefault();
      setActive(true);
    }
  };

  const onKeyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    wrappedProps.onKeyUp?.(event);
    if (event.defaultPrevented) return;
    if (event.key === "Enter" && active) {
      event.preventDefault();
      setActive(false);
      event.currentTarget?.click();
    }
  };

  const onBlur = (event: FocusEvent<HTMLButtonElement>) => {
    setActive(false);
    wrappedProps.onBlur?.(event);
  };

  return (
    <button
      ref={_ref}
      type="button"
      {...wrappedProps}
      className={clsx(
        !simplified && styles.Button,
        active && styles.Active,
        wrappedProps.className,
      )}
      tabIndex={tabIndexes.latest}
      aria-disabled={disabled}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onBlur={onBlur}
      onClick={onClick}
    >
      {children}
    </button>
  );
});

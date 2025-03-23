import clsx from "clsx";
import {
  ComponentPropsWithRef,
  ReactNode,
} from "react";

import { Input } from "@/components/ui/Input";
import { Override } from "@/types/Override";

// import styles from "./NumberInput.module.scss";

/**
 * 数値入力
 *
 * `<Input />`ラッパー。
 */
export const NumberInput = ({
  value,
  setValue,
  children,
  hiddenWarning = false,
  max = Number.MAX_SAFE_INTEGER,
  min = Number.MIN_SAFE_INTEGER,
  step,
  allowDecimal = false,
  onlyNumber = false,
  ...wrappedProps
}: Override<
  /** `<Input />`要素に渡す */
  Omit<ComponentPropsWithRef<typeof Input>, "type">,
  {
    /**
     * 現在の値。入力が空の場合は `undefined`。
     */
    value: number | undefined;
    /**
     * 入力値を利用する関数
     *
     * @example
     * undefinedableなため、デフォルト値を与えたい場合は下記のように記述する。
     * ```
     * <NumberInput
     *  setValue={(value) => setState(value ?? 0)}
     * />
     * ```
     *
     * また、空文字を無視する場合はこのように記述する。
     * この時、空文字でsubmitされないように`required`を付けてvalidationを行うこともできる。
     * ```
     * <NumberInput
     *   setValue={(value) => value !== undefined && setState(value)}
     *   required={true}
     * />
     * ```
     */
    setValue: (input?: number) => void;
    /** 子要素 */
    children?: ReactNode;
    /**
     * 警告非表示フラグ
     * デフォルトは `false`。
     */
    hiddenWarning?: boolean;
    /**
     * 数字のみフラグ
     * デフォルトは `false`。
     */
    onlyNumber?: boolean;
    /** trueなら小数値の入力を許可 */
    allowDecimal?: boolean;
  }
>): ReactNode => {

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 矢印キー (Arrow Up/Down) のデフォルト動作を無効化
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
    } else if (onlyNumber && (e.key === "e" || e.key === "+" || e.key === "." || e.key === "-")) {
      e.preventDefault();
    }
  };

  return (
    <Input
      {...wrappedProps}
      type="number"
      className={clsx(
        // styles.NumberInput,
        wrappedProps.className,
      )}
      onKeyDown={handleKeyDown}
      value={value?.toString() ?? ""}
      setValue={(value) => setValue((value === "" || value == null) ? undefined : Number(value))}
      suppressWheelPropergation={wrappedProps.suppressWheelPropergation ?? true}
      max={max}
      min={min}
      step={step ?? allowDecimal ? "any" : undefined}
      hiddenWarning={hiddenWarning}
    >
      {children}
    </Input>
  );
};

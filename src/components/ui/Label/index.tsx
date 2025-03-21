import clsx from "clsx";
import {
  ComponentPropsWithRef,
  ReactNode,
} from "react";

import styles from "./Label.module.scss";

/**
 * 入力要素のラベル
 *
 * `<label />`ラッパー。
 */
export const Label = ({
  required = false,
  readOnly,
  children,
  ...wrappedProps
}:
  /** `<label />`要素に渡す */
  ComponentPropsWithRef<"label">
  & {
    /** 必須ならtrue */
    required?: boolean;
    /** 書込禁止ならtrue */
    readOnly?: boolean;
    /** 子要素 */
    children?: ReactNode;
  },
): ReactNode => {
  // const { t } = useTranslation("translation", { keyPrefix: "ui.form.Label" });
  if (!children)
    return null;

  return (
    <label
      {...wrappedProps}
      className={clsx(
        styles.Label,
        wrappedProps.className,
      )}
    >
      {children}
      {required
        && <span />
      }
      {readOnly
        && <span />
      }
    </label>
  );
};

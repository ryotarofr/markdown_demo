import clsx from "clsx";
import {
  ComponentProps,
  ComponentPropsWithRef,
  KeyboardEventHandler,
  ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { Floating } from "@/components/render/Floating";
import { Input } from "@/components/ui/Input";
import { useFocus } from "@/hooks/useFocus";
import { Override } from "@/types/Override";
import { Setter } from "@/types/Setter";

import styles from "./ComboBox.module.scss";
import { Option } from "./Option";

/**
 * コンボボックス
 *
 * デフォルトでは、選択肢に一致する入力以外はバリデーション後に弾かれる。<br>
 * ※ この時、直前の有効な入力が保持される。（ form の状態としては invalid なため、 submit は防止できる）
 */
export const ComboBox = <
  T extends Record<string, string>,
  Value extends ((FreeInput extends true ? string : keyof T) | undefined),
  FreeInput extends boolean = false,
>({
  suggestions: propsSuggestions,
  value: _currentKey,
  setValue: propsSetValue,
  freeInput = false as FreeInput,
  filterable = false,
  children,
  disabled,
  ...wrappedProps
}: Override<
  /** root要素に渡す */
  Omit<ComponentPropsWithRef<typeof Input>, "type">,
  {
    /**
     * 補完候補とラベルのMap
     */
    suggestions: T | undefined;
    /** 入力値 */
    value: Value | undefined;
    /** 入力結果を取得 */
    setValue: (input: Value | undefined) => void;
    /**
     * `true`なら入力による絞り込みが可能。
     * デフォルトは`false`。
     */
    filterable?: boolean;
    /**
     * 自由入力 trueなら、補完候補以外の入力値を許容する
     * @defaultValue false
     */
    freeInput?: FreeInput;
    disabled?: ComponentProps<typeof Input>["disabled"];
  }
>): ReactNode => {
  const datalistId = useId();
  const required = wrappedProps.required;
  const readOnly = wrappedProps.readOnly;
  const suggestions: [Value, string][] = Array.isArray(propsSuggestions)
    ? propsSuggestions
    : Object.entries(propsSuggestions ?? {}) as [Value, string][];
  const suggestionMap: Record<string, string> = Array.isArray(suggestions)
    ? Object.fromEntries(suggestions)
    : suggestions ?? {};
  const currentKey = (() => {
    if (_currentKey == null) return placeholderKey;
    const currentKey = (_currentKey ?? "") as string;
    if (!freeInput) return getOptionKey(currentKey);
    return currentKey;
  })();

  const inputRef = useRef<HTMLInputElement>(null);
  const pullTabRef = useRef<HTMLButtonElement>(null);
  const [rawInput, _setRawInput] = useState<string>("");
  const [initTrigger, setInitTrigger] = useState(false);
  const init = () => setInitTrigger((prev) => !prev);

  // 描画選択肢
  const options = ([
    [placeholderKey, wrappedProps.placeholder ?? ""],
    ...suggestions.map(([key, value]) => ([getOptionKey(key?.toString() ?? ""), value] as const)),
  ] satisfies (readonly [string, string])[]);
  const optionMap: Record<string, string> = Object.fromEntries(options);
  const sortedOptions = filterable
    ? getSortedOptions(options, rawInput)
    : options;
  // 選択肢が更新され、且つ該当するkeyが消失していたら値を初期化
  useEffect(() => {
    if (Object.keys(suggestionMap).length === 0) return;
    if (!_currentKey) return;
    if (suggestionMap[_currentKey.toString()]) return;
    propsSetValue(undefined);
  }, [JSON.stringify(suggestionMap)]);

  const typeable = filterable || freeInput;
  const findViewValue = (optionKey?: string): string => {
    if (optionKey == null) return "";
    const value = optionMap[optionKey];
    if (value != null) return value;
    if (reservedOptionKeys.includes(optionKey)) return "";
    return optionKey;
  };

  // 選択肢表示時に選択中要素までスクロール
  const focus = useFocus(sortedOptions.map(([key]) => ({ id: key?.toString() ?? "" })));
  const setFocusActive: Setter<boolean> = (setStateAction) =>
    focus.setActive((prev) => {
      const next = Setter.toValue(setStateAction, prev);
      if (next) focus.setById(currentKey);
      // if (next) updatePosition();
      return next;
    });

  const setRawInput: Setter<string> = (setStateAction) => _setRawInput((prev) => {
    const next = Setter.toValue(setStateAction, prev);
    if (prev !== next) {
      const [firstOption] = getSortedOptions(options, next);
      firstOption && focus.setById(firstOption[0]);
    }
    return next;
  });

  const setValue = (optionKey: string = "") => {
    const inputIsEmpty = optionKey === "";
    const value = optionMap[optionKey];
    if (optionKey === placeholderKey) {
      return propsSetValue(undefined as Value);
    }
    if (!freeInput && inputIsEmpty) {
      propsSetValue(undefined as Value);
      return;
    }
    if (value !== undefined) {
      propsSetValue(getSuggestionKey(optionKey) as Value);
      return;
    }
    if (!freeInput) return;
    return propsSetValue(optionKey as Value);
  };

  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    const preventLaterEvents = () => {
      event.preventDefault();
      event.stopPropagation();
    };
    switch (event.key) {
      case "Escape": (() => {
        if (!focus.active) return;
        preventLaterEvents();
        setFocusActive(false);
      })(); break;
      case "ArrowUp": (() => {
        if (disabled) return;
        preventLaterEvents();
        focus.prev({
          loop: !event.repeat,
          effect: (e) => {
            if (focus.active) return;
            if (e.next.id == null) return;
            setValue(e.next.id);
          },
        });
      })(); break;
      case "ArrowDown": (() => {
        if (disabled) return;
        preventLaterEvents();
        focus.next({
          loop: !event.repeat,
          effect: (e) => {
            if (focus.active) return;
            if (e.next.id == null) return;
            setValue(e.next.id);
          },
        });
      })(); break;
      case "Enter": (() => {
        if (disabled) return;
        preventLaterEvents();
        if (focus.active) setValue(focus.id);
        setFocusActive(!focus.active);
      })(); break;
      case "Backspace": (() => {
        if (disabled) return;
        event.stopPropagation();
        if (typeable) return;
        event.preventDefault();
        setValue("");
      })(); break;
      case "Tab": (() => {
        setFocusActive(false);
      })(); break;
    }
  };

  return (
    <Input
      data-testid="combobox"
      {...wrappedProps}
      ref={inputRef}
      className={clsx(
        styles.ComboBox,
        wrappedProps.className,
      )}
      containerProps={{
        ...wrappedProps.containerProps,
        onBlur: (event) => {
          if (event.currentTarget === event.target) return;
          if (event.relatedTarget === pullTabRef.current) return;
          if (event.relatedTarget === inputRef.current) return;
          setFocusActive(false);
        },
      }}
      type="text"
      autoComplete="off"
      list={datalistId}
      deps={[initTrigger]}
      value={currentKey}
      setValue={setValue}
      valueMapper={findViewValue}
      setRawValue={setRawInput}
      // rawValueMapper={getSuggestionKey}
      readOnly={readOnly || filterable ? readOnly : "trueWithoutLabel"}
      disabled={disabled}
      customValidations={{
        suggestionContainValue: {
          message: "選択肢に無い値は無効です",
          checkIsInvalid: (suggestionKey) => {
            if (suggestionKey === "" && !required) return;
            if (freeInput) return;
            const optionKey = getOptionKey(suggestionKey);
            if (optionMap[optionKey] !== undefined) return;
            return true;
          },
        },
        ...wrappedProps.customValidations,
      }}
      onPointerDown={() => setFocusActive(true)}
      onKeyDown={onKeyDown}
    >
      <button ref={pullTabRef}
        type="button"
        tabIndex={-1}
        className={clsx(
          styles.ComboBoxThumb,
          disabled && styles.Disabled,
        )}
        disabled={disabled}
        onFocus={(event) => {
          setFocusActive(!focus.active);
          inputRef.current?.focus();
          event.preventDefault();
        }}
      >{!disabled && focus.active ? "▲" : "▼"}</button>
      <Floating
        as={"ul"}
        ref={focus.setScrollRef}
        anchorTarget={inputRef}
        className={clsx(
          styles.DataList,
          (disabled || !focus.active) && styles.Hidden,
        )}
        onPointerDown={(event) => {
          event.stopPropagation();
          event.preventDefault();
        }}
      >
        {sortedOptions
          .map(([key, value]) =>
            <Option
              key={key}
              ref={focus.setContentRefs(key)}
              dataKey={key}
              value={value}
              focused={key === focus.id}
              selected={key === currentKey}
              setCurrentKey={(it) => !readOnly && setValue(it)}
              setFocused={setFocusActive}
              setFocusedOption={focus.setById}
              init={init}
              readOnly={!!wrappedProps.readOnly}
            />,
          )
        }
      </Floating>
      {children}
    </Input>
  );
};

const getSortedOptions = (options: (readonly [string, string])[], rawInput: string) => {
  const input = rawInput;
  return [...options]
    .sort(([, prevValue], [, nextValue]) => sortByIndexOf(input)(prevValue, nextValue));
};
const sortByIndexOf = (input: string) =>
  (prevValue: string, nextValue: string) => {
    const nextIndexRaw = input === "" ? -1 : nextValue.indexOf(input);
    const nextIndex = nextIndexRaw === -1 ? Number.MAX_SAFE_INTEGER : nextIndexRaw;
    const prevIndexRaw = input === "" ? -1 : prevValue.indexOf(input);
    const prevIndex = prevIndexRaw === -1 ? Number.MAX_SAFE_INTEGER : prevIndexRaw;
    if (prevIndex === nextIndex) return 0;
    return prevIndex - nextIndex;
  };

const keyPrefix = "~~~~~";
const getOptionKey = (suggestionkey: string) => keyPrefix + suggestionkey;
const getSuggestionKey = (optionKey: string) => optionKey.slice(keyPrefix.length);
const placeholderKey = getOptionKey("");
const reservedOptionKeys = [placeholderKey];

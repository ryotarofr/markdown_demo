// import clsx from "clsx";
// import {
//   ComponentPropsWithoutRef,
//   Dispatch,
//   ReactNode,
//   SetStateAction,
// } from "react";

// import { ComboBox } from "@/components/ui/ComboBox";
// import { Label } from "@/components/ui/Label";
// import { partializeSetState } from "@/fn/partializeSetState";
// // import { TabIndexes } from "@/fn/state/useTabIndexes";
// import { Override } from "@/types/Override";

// import styles from "./ComboBoxes.module.scss";
// import Image from "next/image";

// /**
//  * 複数選択のためのマルチ`<ComboBox/>`コンテナ
//  */
// export const ComboBoxes = <
//   T extends Record<string, string>,
//   Value extends ((FreeInput extends true ? string : keyof T) | undefined),
//   FreeInput extends boolean = false,
// >({
//   label,
//   value: values,
//   setValue: setValues,
//   showClearButton = true,
//   unique = true,
//   containerProps,
//   ...wrappedProps
// }: Override<
//   /** `<ComboBox />`要素に渡す */
//   ComponentPropsWithoutRef<typeof ComboBox<T, Value, FreeInput>>,
//   {
//     /** ラベル */
//     label?: string;
//     /** 入力値 */
//     value: Value[];
//     /** 入力結果を取得 */
//     setValue: Dispatch<SetStateAction<Value[]>>;
//     /** trueなら削除ボタンを描画。デフォルトはtrue */
//     showClearButton?: boolean;
//     /** trueなら選択肢の重複を禁止。デフォルトはtrue */
//     unique?: boolean;
//     /** 外縁要素に渡すAttributes */
//     containerProps?: ComponentPropsWithoutRef<"fieldset">;
//   }
// >): ReactNode => {
//   // const tabIndexes = TabIndexes.from(wrappedProps.tabIndex);
//   const suggestions = wrappedProps.suggestions;
//   const getRemainings = (...keeps: Value[]): T => {
//     if (!unique) return suggestions as T;
//     const ignores = values
//       .filter((it) => !keeps.includes(it));
//     return Object.fromEntries(
//       Object.entries(suggestions || {})
//         .filter(([key]) => !ignores.includes(key as Value)),
//     ) as T;
//   };
//   const allRemainings = getRemainings();
//   const remainingsIsNotEmpty = Object.keys(allRemainings).length != 0;
//   const remove = (targetIndex: number) =>
//     setValues((prevs) => prevs.filter((_, index) => index !== targetIndex));

//   return (
//     <fieldset
//       {...containerProps}
//       className={clsx(
//         styles.ComboBoxes,
//         containerProps?.className,
//       )}
//     >
//       <Label
//         required={wrappedProps.required}
//         readOnly={wrappedProps.readOnly === true}
//       >
//         {label}
//       </Label>
//       {values.map((value, index) => (
//         <div
//           key={index}
//           className={styles.ComboBoxRow}
//         >
//           <ComboBox
//             {...wrappedProps}
//             className={clsx(
//               styles.ComboBox,
//               wrappedProps.className,
//             )}
//             suggestions={getRemainings(value)}
//             value={value}
//             setValue={(next: Value | undefined) => next == null || next == ""
//               ? remove(index)
//               : partializeSetState(setValues)(index)(next)
//             }
//             required={false}
//           />
//           {showClearButton && (
//             <button
//               className={styles.RemoveButton}
//               type="button"
//               // tabIndex={tabIndexes.latest}
//               onClick={() => remove(index)}
//               disabled={!!wrappedProps.readOnly || wrappedProps.disabled}
//             >
//               <Image src="/icon/cross.svg" alt="" />
//             </button>
//           )}
//         </div>
//       ))}
//       {remainingsIsNotEmpty && (
//         <div
//           key={values.length}
//           className={styles.ComboBoxRow}
//         >
//           <ComboBox
//             {...wrappedProps}
//             className={clsx(
//               styles.ComboBox,
//               wrappedProps.className,
//             )}
//             suggestions={allRemainings}
//             value={undefined}
//             setValue={(next: Value | undefined) => next == null || next == ""
//               ? undefined
//               : setValues((prev) => ([
//                 ...prev,
//                 next,
//               ]))}
//             required={values.length === 0
//               ? wrappedProps.required
//               : false
//             }
//           />
//           {showClearButton && (
//             <div
//               className={styles.DummyRemoveButton}
//             />
//           )}
//         </div>
//       )}
//     </fieldset>
//   );
// };

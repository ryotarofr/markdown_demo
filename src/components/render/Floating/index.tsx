// import clsx from "clsx";
// import {
//   ComponentPropsWithoutRef,
//   createElement,
//   CSSProperties,
//   // DetailedHTMLFactory,
//   // ForwardedRef,
//   HTMLAttributes,
//   // ReactHTML,
//   ReactNode,
//   RefObject,
//   useEffect,
//   useImperativeHandle,
//   useRef,
//   useState,
// } from "react";
// import { createPortal } from "react-dom";

// import { useEffectEvent } from "@/hooks/useEffectEvent";
// import { Override } from "@/types/Override";

// import styles from "./Floating.module.scss";

// export const Floating = <As extends React.ElementType = 'div'>({
//   as,
//   anchorTarget,
//   children,
//   ...wrappedProps
// }: Override<
//   ComponentPropsWithoutRef<As>,
//   {
//     as?: As;
//     anchorTarget?: RefObject<HTMLElement>;
//     children?: ReactNode;
//   }
// >) => {
//   type AsElement = HTMLElementFrom<As>;
//   const ref = useRef<AsElement>(undefined);
//   useImperativeHandle(wrappedProps.ref, () => ref.current!);

//   // 選択肢の描画位置の更新
//   const [suggestPos, setSuggestPos] = useState<{
//     top?: number;
//     left?: number;
//     right?: number;
//     bottom?: number;
//     minWidth?: number;
//     maxWidth?: number;
//     minHeight?: number;
//     maxHeight?: number;
//   }>({});
//   const updatePosition = () => {
//     const target = anchorTarget?.current;
//     if (!target) return;
//     const rect = target.getBoundingClientRect();
//     const anchorBottom = window.innerHeight / 2 < rect.top;
//     const anchorRight = window.innerWidth / 2 < rect.left;
//     const maxHeight = anchorBottom
//       ? rect.top
//       : window.innerHeight - rect.bottom;
//     const maxWidth = anchorRight
//       ? rect.width + rect.left
//       : window.innerWidth - rect.left;
//     setSuggestPos({
//       top: !anchorBottom ? Math.max(0, rect.top + rect.height) : undefined,
//       bottom: anchorBottom ? Math.max(0, window.innerHeight - rect.top) : undefined,
//       left: !anchorRight ? Math.max(0, rect.left) : undefined,
//       right: anchorRight ? Math.max(0, window.innerWidth - rect.right) : undefined,
//       minWidth: rect.width,
//       maxWidth: Math.min(maxWidth, window.innerWidth) - 20,
//       minHeight: rect.height,
//       maxHeight: Math.min(maxHeight, window.innerHeight) - 20,
//     });
//   };

//   const [visibleObserver] = useState(() => (
//     new MutationObserver(() => {
//       if (!ref.current?.checkVisibility()) return;
//       updatePosition();
//     })
//   ));

//   const initEffect = useEffectEvent(() => {
//     window.addEventListener("resize", updatePosition);
//     window.addEventListener("scroll", updatePosition, { capture: true });
//     return () => {
//       visibleObserver.disconnect();
//       window.removeEventListener("resize", updatePosition);
//       window.removeEventListener("scroll", updatePosition, { capture: true });
//     };
//   });
//   useEffect(initEffect, [initEffect]);

//   const onMount = (element: AsElement) => {
//     if (!element) return;
//     ref.current = element;
//     visibleObserver.observe(element as Node, { attributes: true });
//   };

//   /**
//    * 選択肢の描画先。
//    * 要素の重なりに影響されないために root に配置する。（→ document.body）
//    * 親に dialog が見つかった場合はそれを root とする。
//    * └ #top-layer として dialog が描画された際に選択肢が裏に回らないようにするため。
//    */
//   const rootElement = anchorTarget?.current?.closest("dialog") ?? document.body;

//   const cssVariables = {
//     "--top": suggestPos.top,
//     "--left": suggestPos.left,
//     "--right": suggestPos.right,
//     "--bottom": suggestPos.bottom,
//     "--min-width": suggestPos.minWidth,
//     "--max-width": suggestPos.maxWidth,
//     "--min-height": suggestPos.minHeight,
//     "--max-height": suggestPos.maxHeight,
//   } as CSSProperties;

//   return createPortal(
//     createElement(
//       as ?? "div",
//       {
//         ref: onMount,
//         ...wrappedProps,
//         className: clsx(
//           styles.Floating,
//           wrappedProps.className,
//         ),
//         style: {
//           ...cssVariables,
//           ...wrappedProps.style,
//         },
//       },
//       children,
//     ),
//     rootElement,
//   );
// };

// type HTMLElementFrom<T>
//   = T extends HTMLAttributes<unknown>
//   ? Element
//   : never;

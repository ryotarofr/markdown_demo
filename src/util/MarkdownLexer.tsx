// "use client";

// import * as React from "react";
// import * as ReactJSXRuntime from "react/jsx-runtime";
// import { highlightCode, loadComponent } from "./function";


// declare global {
//   interface Window {
//     React: typeof React;
//     jsxRuntime: typeof ReactJSXRuntime;
//   }
// }

// if (typeof window !== "undefined") {
//   window.React = React;
//   window.jsxRuntime = ReactJSXRuntime;
// }

// export interface MDXRendererProps {
//   readonly compiledCode: string;
// }

// export function MDXRenderer({ compiledCode }: MDXRendererProps) {
//   const [Component, _setComponent] = React.useState<React.ComponentType | null>(null);
//   const containerRef = React.useRef<HTMLDivElement>(null);

//   const init = async () => {
//     await loadComponent({ compiledCode, setComponent: _setComponent })
//     await highlightCode({ containerRef });
//   };

//   React.useEffect(() => {
//     init();
//   }, [compiledCode]);

//   return (
//     <div ref={containerRef}>
//       {Component ? <Component /> : <div>Loading MDX content...</div>}
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import * as React from "react";
import * as ReactJSXRuntime from "react/jsx-runtime";

if (typeof window !== "undefined") {
  (window as any).React = React;
  (window as any).jsxRuntime = ReactJSXRuntime;
}

interface MDXRendererProps {
  compiledCode: string;
}

export function MDXRenderer({ compiledCode }: MDXRendererProps) {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    async function loadModule() {
      let adjustedCode = compiledCode;

      // (1) react/jsx-runtimeとreactのimportを完全に削除
      adjustedCode = adjustedCode
        .replace(/import\s+\{[^}]+\}\s+from\s+["']react\/jsx(-dev)?-runtime["'];?/g, '')
        .replace(/import\s+\*\s+as\s+React\s+from\s+["']react["'];?/g, '')
        .replace(/import\s+\{.*?\}\s+from\s+["']react["'];?/g, '');

      // (2) ここが重要！window.Reactではなく、jsxRuntimeを使うように修正
      adjustedCode = adjustedCode
        .replace(/\b_jsxDEV\(/g, 'window.jsxRuntime.jsxDEV(')
        .replace(/\b_jsxs\(/g, 'window.jsxRuntime.jsxs(')
        .replace(/\b_jsx\(/g, 'window.jsxRuntime.jsx(')
        .replace(/(?<!window\.jsxRuntime\.)\bjsxDEV\(/g, 'window.jsxRuntime.jsxDEV(')
        .replace(/(?<!window\.jsxRuntime\.)\bjsx\(/g, 'window.jsxRuntime.jsx(')
        .replace(/\b(_Fragment|Fragment)\b/g, 'window.jsxRuntime.Fragment');

      // 他の相対importを絶対パスURLに調整
      adjustedCode = adjustedCode.replace(
        /from\s+["']\.\/button\.js["']/g,
        `from "${window.location.origin}/button.js"`
      );

      console.log('Adjusted MDX Code:', adjustedCode);

      const blob = new Blob([adjustedCode], { type: "application/javascript" });
      const url = URL.createObjectURL(blob);

      try {
        const mod = await import(/* webpackIgnore: true */ url);
        setComponent(() => mod.default);
      } catch (error) {
        console.error("Error loading module:", error);
      }
    }

    loadModule();
  }, [compiledCode]);

  if (!Component) return <div>Loading MDX content...</div>;
  return <Component />;
}

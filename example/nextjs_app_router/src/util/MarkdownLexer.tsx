"use client";

import { useEffect, useState, useRef } from "react";
import * as React from "react";
import * as ReactJSXRuntime from "react/jsx-runtime";
import { common, createStarryNight } from "@wooorm/starry-night";
import { toDom } from "hast-util-to-dom";

if (typeof window !== "undefined") {
  (window as any).React = React;
  (window as any).jsxRuntime = ReactJSXRuntime;
}

interface MDXRendererProps {
  compiledCode: string;
}

export function MDXRenderer({ compiledCode }: MDXRendererProps) {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // MDX コンテンツの動的インポートと調整
  useEffect(() => {
    async function loadModule() {
      let adjustedCode = compiledCode;

      // (1) react/jsx-runtime と react の import を削除
      adjustedCode = adjustedCode
        .replace(/import\s+\{[^}]+\}\s+from\s+["']react\/jsx(-dev)?-runtime["'];?/g, '')
        .replace(/import\s+\*\s+as\s+React\s+from\s+["']react["'];?/g, '')
        .replace(/import\s+\{.*?\}\s+from\s+["']react["'];?/g, '');

      // (2) window.jsxRuntime を利用するように修正
      adjustedCode = adjustedCode
        .replace(/\b_jsxDEV\(/g, 'window.jsxRuntime.jsxDEV(')
        .replace(/\b_jsxs\(/g, 'window.jsxRuntime.jsxs(')
        .replace(/\b_jsx\(/g, 'window.jsxRuntime.jsx(')
        .replace(/(?<!window\.jsxRuntime\.)\bjsxDEV\(/g, 'window.jsxRuntime.jsxDEV(')
        .replace(/(?<!window\.jsxRuntime\.)\bjsx\(/g, 'window.jsxRuntime.jsx(')
        .replace(/\b(_Fragment|Fragment)\b/g, 'window.jsxRuntime.Fragment');

      // 相対importの調整（例として button.js を絶対パスに）
      adjustedCode = adjustedCode.replace(
        /from\s+["']\.\/button\.js["']/g,
        `from "${window.location.origin}/button.js"`
      );

      console.log("Adjusted MDX Code:", adjustedCode);

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

  // MDX コンテンツがレンダリングされた後にコードブロックのハイライトを実行
  useEffect(() => {
    async function highlightCode() {
      const starryNight = await createStarryNight(common);
      const prefix = "language-";

      // containerRef の中から <code> 要素を取得
      const container = containerRef.current;
      if (!container) return;
      const nodes = Array.from(container.querySelectorAll("code"));

      for (const node of nodes) {
        const className = Array.from(node.classList).find((d) =>
          d.startsWith(prefix)
        );
        if (!className) continue;
        const scope = starryNight.flagToScope(className.slice(prefix.length));
        if (!scope) continue;
        if (node.textContent) {
          const tree = starryNight.highlight(node.textContent, scope);
          node.replaceChildren(toDom(tree, { fragment: true }));
        }
      }
    }

    // Component がセットされたら、レンダリング完了後にハイライト実行
    if (Component) {
      // 少しタイミングをずらす場合は setTimeout を使う
      setTimeout(() => {
        highlightCode();
      }, 100);
    }
  }, [Component]);

  return (
    <div ref={containerRef}>
      {Component ? <Component /> : <div>Loading MDX content...</div>}
    </div>
  );
}

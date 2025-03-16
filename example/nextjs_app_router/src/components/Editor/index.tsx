"use client"

import React, { forwardRef } from "react";

export const Editor = forwardRef<HTMLTextAreaElement, { defaultValue: string }>(
  ({ defaultValue }, ref) => {
    return (
      <textarea
        ref={ref}
        defaultValue={defaultValue}
        rows={10}
        cols={50}
        style={{ width: "100%", marginBottom: "1rem" }}
      />
    );
  }
);


// "use client";

import { useEffect, useState } from "react";

interface MDXRendererProps {
  compiledCode: string;
}

export default function MDXRenderer({ compiledCode }: MDXRendererProps) {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    async function loadModule() {
      // compiledCode 内の "react/jsx-runtime" を CDN 経由の絶対パスに置換する
      const adjustedCode = compiledCode.replace(
        /from\s+["']react\/jsx-runtime["']/g,
        'from "https://esm.sh/react/jsx-runtime"'
      );

      // Blob URL を作成
      const blob = new Blob([adjustedCode], { type: "application/javascript" });
      const url = URL.createObjectURL(blob);

      try {
        // webpackIgnore を使ってバンドラーに処理させないようにする
        const mod = await import(/* webpackIgnore: true */ url);
        setComponent(() => mod.default);
      } catch (error) {
        console.error("Error loading module:", error);
      } finally {
        // 必要に応じて URL を解放（ただし、早すぎる解放は import 失敗の原因となるので注意）
        // URL.revokeObjectURL(url);
      }
    }

    loadModule();
  }, [compiledCode]);

  if (!Component) return <div>Loading MDX content...</div>;
  return <Component />;
}

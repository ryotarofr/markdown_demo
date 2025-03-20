"use client";

import { useEffect, useState, useRef } from "react";
import * as React from "react";
import * as ReactJSXRuntime from "react/jsx-runtime";
import { highlightCode, loadComponent } from "./function";

if (typeof window !== "undefined") {
  (window as any).React = React;
  (window as any).jsxRuntime = ReactJSXRuntime;
}

export interface MDXRendererProps {
  readonly compiledCode: string;
}

export function MDXRenderer({ compiledCode }: MDXRendererProps) {
  const [Component, _setComponent] = useState<React.ComponentType | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const init = async () => {
    await loadComponent({ compiledCode, setComponent: _setComponent })
    await highlightCode({ containerRef });
  };

  useEffect(() => {
    init();
  }, [compiledCode]);

  return (
    <div ref={containerRef}>
      {Component ? <Component /> : <div>Loading MDX content...</div>}
    </div>
  );
}

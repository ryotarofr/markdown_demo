"use client"

import
React,
{
  useEffect,
  useRef,
  useState,
  Dispatch,
  SetStateAction,
  ComponentType,
  ChangeEvent,
  RefObject,
}
  from "react";
import * as ReactJSXRuntime from "react/jsx-runtime";

import { Button } from '@/components/ui/Button/index.';
import { highlightCode, loadComponent } from '@/util/function';

declare global {
  interface Window {
    React: typeof React;
    jsxRuntime: typeof ReactJSXRuntime;
  }
}

if (typeof window !== "undefined") {
  window.React = React;
  window.jsxRuntime = ReactJSXRuntime;
}

import init, { compile_mdx } from '@/crates/mdxjs-rs/pkg/mdxjs_rs.js';
const P = {
  init: async (initFunc: typeof init) => await initFunc(),
  from: async (
    md: string,
    pathArray: string[],
    _setComponent: Dispatch<SetStateAction<ComponentType | null>>,
    containerRef: RefObject<HTMLDivElement | null>
  ) => {
    return {
      load: async () => {
        new loadComponent(compile_mdx(md), pathArray, _setComponent);
      },
      insert: async () => await highlightCode({ containerRef })
    }
  },
  testView: (
    md: string,
    setVal: Dispatch<SetStateAction<string>>
  ) => {
    return setVal(compile_mdx(md));
  }
}

export interface MDXProps {
  readonly md: string;
  readonly customComponentPath: string[];
}

export default function MDX({ md, customComponentPath }: MDXProps) {
  const [mdxSource, setMdxSource] = useState(md);
  const [compiledMDX, setCompiledMDX] = useState<string>(""); // debug
  const [showTree, setShowTree] = useState<boolean>(false);
  const [Component, _setComponent] = useState<ComponentType | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const convert = async (value: string) => {
    await P.init(init);
    P.testView(value, setCompiledMDX);
    const result = await P.from(value, customComponentPath, _setComponent, containerRef);
    await result.load();
    await result.insert();
  }

  useEffect(() => {
    convert(md);
  }, []);

  const handleChange = async (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMdxSource(e.target.value);
    convert(e.target.value);
  };

  return (
    <div>
      <h1>Wasm MDX Compile Example</h1>
      <textarea
        onChange={handleChange}
        value={mdxSource}
        rows={10}
        cols={50}
        style={{ width: "100%", marginBottom: "1rem" }}
      />
      <hr />
      <div ref={containerRef}>
        {Component ? <Component /> : <div>Loading MDX content...</div>}
      </div>
      <hr />
      <Button onClick={() => setShowTree((prev) => !prev)}>{showTree ? "close" : "show"} Tree</Button>
      {showTree && <pre>{compiledMDX}</pre>}
      {/* <GitHubFileDisplay /> */}
    </div >
  );
}

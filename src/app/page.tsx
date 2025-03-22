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
import styles from "./page.module.css";
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
    text: string,
    _setComponent: Dispatch<SetStateAction<ComponentType | null>>,
    containerRef: RefObject<HTMLDivElement | null>
  ) => {
    return {
      load: async () => await loadComponent(
        { compiledCode: compile_mdx(text), setComponent: _setComponent }
      ),
      insert: async () => await highlightCode({ containerRef })
    }
  },
  testView: (
    text: string,
    setVal: Dispatch<SetStateAction<string>>
  ) => {
    return setVal(compile_mdx(text));
  }
}

export default function Page() {
  const [mdxSource, setMdxSource] = useState("## Hello, world!");
  const [compiledMDX, setCompiledMDX] = useState<string>(""); // debug
  const [showTree, setShowTree] = useState<boolean>(false);
  const [Component, _setComponent] = useState<ComponentType | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      await P.init(init);
    })();
  }, []);

  const handleChange = async (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMdxSource(e.target.value);
    const result = await P.from(e.target.value, _setComponent, containerRef);
    await result.load();
    await result.insert();
    P.testView(e.target.value, setCompiledMDX);
  };

  return (
    <div className={styles.page}>
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

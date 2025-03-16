"use client"

import { useEffect, useState } from 'react';
import init, { compile_mdx } from '@/crates/mdxjs-rs/pkg/mdxjs_rs.js';
import MDXRenderer from '@/components/Editor';

import styles from "./page.module.css";

export default function Wasm() {
  const [source, setSource] = useState<string>("# Hello, MDX!");
  const [compiledMDX, setCompiledMDX] = useState<string>("");

  useEffect(() => {
    (async () => {
      await initWasm();
      const initialCompiled = compile_mdx(source);
      setCompiledMDX(initialCompiled);
    })();
  }, []);

  async function initWasm() {
    await init();
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newSource = e.target.value;
    setSource(newSource);
    const newCompiled = compile_mdx(newSource);
    setCompiledMDX(newCompiled);
  };

  return (
    <div className={styles.page}>
      <h1>Wasm MDX Compile Example</h1>
      <textarea
        onChange={handleChange}
        value={source}
        rows={10}
        cols={50}
        style={{ width: "100%", marginBottom: "1rem" }}
      />
      <hr />
      <MDXRenderer compiledCode={compiledMDX} />
      <hr />
      <pre>{compiledMDX}</pre>
    </div>
  );
}


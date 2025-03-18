"use client"

import { useEffect, useState } from 'react';
import init, { compile_mdx } from '@/crates/mdxjs-rs/pkg/mdxjs_rs.js';
import { MDX, MDX2 } from '@/config/md';
import { MDXRenderer } from '@/util/MarkdownLexer';
import styles from "./page.module.css";
import { Button } from '@/components/Button/index.';
import CodeBlock from '@/components/sample';


export default function Wasm() {
  const [source, setSource] = useState<string>(MDX2);
  const [compiledMDX, setCompiledMDX] = useState<string>("");

  useEffect(() => {
    (async () => {
      await _initWasm();
      const initialCompiled = compile_mdx(source);
      setCompiledMDX(initialCompiled);
    })();
  }, []);

  async function _initWasm() {
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
      <Button>Button</Button>
      <CodeBlock lang="js" value="console.log('Hello, world!');" />
    </div>
  );
}


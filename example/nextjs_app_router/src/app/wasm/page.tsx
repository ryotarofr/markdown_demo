"use client"

import { useEffect, useState } from 'react';
import init, { compile_mdx } from '@/crates/mdxjs-rs/pkg/mdxjs_rs.js';
import { compileAndProcessMdx, processMdx } from '@/util/processMdx';

export default function Wasm() {
  const [source, setSource] = useState<string>("# Hello, MDX!");
  const [compiledMDX, setCompiledMDX] = useState<any>();

  useEffect(() => {
    (async () => {
      await initWasm();
      // const initialCompiled = await compileAndProcessMdx(source);
      // const initialCompiled = compile_mdx(source);
      // const initialCompiled = await processMdx(source)
      // setCompiledMDX(initialCompiled);
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
    <div>
      <h1>Wasm MDX Compile Example</h1>
      <textarea
        onChange={handleChange}
        value={source}
        rows={10}
        cols={50}
        style={{ width: "100%", marginBottom: "1rem" }}
      />
      <hr />
      <pre>{compiledMDX}</pre>
    </div>
  );
}


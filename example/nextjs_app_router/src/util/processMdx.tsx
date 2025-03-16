"use server";

import { cache } from 'react';
import * as runtime from 'react/jsx-runtime';
import { evaluate } from '@mdx-js/mdx';
import { config as mdxConfig } from '../config/index.config.js';
import { useMDXComponents } from '@/hooks/useMDXComponents';
import init, { compile_mdx } from '@/crates/mdxjs-rs/pkg/mdxjs_rs.js';

interface MdxContent<T extends Record<string, unknown>> {
  frontmatter: T;
  default: React.ComponentType<any>;
}

export const processMdx = cache(async function processMdx<T extends Record<string, unknown>>(
  code: string,
): Promise<MdxContent<T>> {
  // @ts-expect-error
  return await evaluate(code, { ...runtime, ...mdxConfig, useMDXComponents });
});

export const compileAndProcessMdx = cache(async function processMdx<T extends Record<string, unknown>>(
  code: string,
): Promise<MdxContent<T>> {
  const compiledCode = compile_mdx(code);
  // @ts-expect-error
  return await evaluate(compiledCode, { ...runtime, ...mdxConfig, useMDXComponents });
});

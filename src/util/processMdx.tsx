"use server";

import { cache } from 'react';
import * as runtime from 'react/jsx-runtime';
import { evaluate } from '@mdx-js/mdx';
import { config as mdxConfig } from '../config/index.config.js';
import { useMDXComponents } from '@/hooks/useMDXComponents';

interface MdxContent<T extends Record<string, unknown>> {
  frontmatter: T;
  default: React.ComponentType<any>;
}

export const processMdx = cache(async function processMdx<T extends Record<string, unknown>>(
  code: string,
): Promise<MdxContent<T>> {
  // @ts-expect-error The type definition for evaluate does not match the actual arguments, so it is being ignored.
  return await evaluate(code, { ...runtime, ...mdxConfig, useMDXComponents });
});

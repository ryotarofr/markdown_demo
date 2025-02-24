import React, { cache, useEffect, useState } from 'react'
import * as runtime from 'react/jsx-runtime'
import { evaluate } from '@mdx-js/mdx'
// Import type { MDXModule } from "mdx/types";
import { config as mdxConfig } from '../config/index.config.js'
import { useMDXComponents } from '@/hooks/useMDXComponents'

export default function MdxLexer({ mdxString }: { mdxString: string }) {
  const [Content, setContent] = useState<React.ComponentType | undefined>()

  useEffect(() => {
    ; (async () => {
      if (!mdxString) return
      // @ts-expect-error
      const result: MDXModule = await evaluate(mdxString, {
        ...runtime,
        ...mdxConfig,
        useMDXComponents,
      })

      if (result.default) {
        setContent(() => result.default)
      }
    })()
  }, [mdxString])

  return <>{Content ? <Content /> : <p>Loading...</p>}</>
}

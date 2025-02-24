import rehypeShiki from '@shikijs/rehype'
import withHeadingIds from 'rehype-slug'
import withFrontmatter from 'remark-frontmatter'
import withGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import withTypographicQuotes from 'remark-smartypants'
import remarkToc from 'remark-toc'
import remarkExternalLinks from 'remark-external-links'
import rehypeSlug from 'rehype-slug'
import {config as syntaxHighlighterConfig} from './syntax-highlighter.config.mjs'
import remarkTabsToMdx, { remarkVisitPlugin } from '@/components/test'


/** @type {import('@mdx-js/mdx').CompileOptions} */
export const config = {
  remarkPlugins: [
    [remarkToc, {heading: '目次', maxDepth: 5}],
    [remarkExternalLinks, {target: '_blank', rel: ['nofollow', 'noopener']}],
    remarkMath,
    withFrontmatter,
    withGfm,
    remarkTabsToMdx,
    // remarkVisitPlugin,
    withTypographicQuotes,
  ],
  rehypePlugins: [
    rehypeSlug,
    rehypeKatex,
    withHeadingIds,    
    [rehypeShiki, syntaxHighlighterConfig],
  ]
}

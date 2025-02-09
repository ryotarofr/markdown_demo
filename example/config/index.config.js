import withSyntaxHighlighter from '@shikijs/rehype'
import withHeadingIds from 'rehype-slug'
import withFrontmatter from 'remark-frontmatter'
import withGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import withTypographicQuotes from 'remark-smartypants'
import remarkToc from 'remark-toc'
import remarkExternalLinks from 'remark-external-links'
import rehypeSlug from 'rehype-slug'
import remarkMarkdownUnist from 'remark-markdown-unist'
import {config as syntaxHighlighterConfig} from './syntax-highlighter.config.mjs'

/** @type {import('@mdx-js/mdx').CompileOptions} */
export const config = {
  remarkPlugins: [
    [remarkToc, {heading: '目次', maxDepth: 5}],
    [remarkExternalLinks, {target: '_blank', rel: ['nofollow', 'noopener']}],
    remarkMath,
    withFrontmatter,
    withGfm,
    withTypographicQuotes,
    remarkMarkdownUnist
  ],
  rehypePlugins: [
    rehypeSlug,
    rehypeKatex,
    withHeadingIds,
    [withSyntaxHighlighter, syntaxHighlighterConfig]
  ]
}

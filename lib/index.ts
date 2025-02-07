/**
 * @packageDocumentation
 * @module RemarkMarkdownUnist
 *
 * This module provides a class-based remark plugin for transforming code blocks
 * in Markdown/MDX documents. The `RemarkMarkdownUnist` class encapsulates two
 * primary transformations:
 *
 * 1. **Code Block Title Extraction:**
 *    If a code block's language property includes a colon (for example, `js:example.js`),
 *    the transformer splits the string into the actual language and a title. It then
 *    updates the code block’s `lang` property to include only the language and inserts
 *    an MDX JSX text element before the code block that displays the title.
 *
 * 2. **Code Tabs Splitting:**
 *    For code blocks that include HTML comment headers (e.g. `<!-- lang:label -->`),
 *    the transformer splits the block into multiple sections. Each section is converted
 *    into its own code node with the `lang` property set to `lang:label`, enabling further
 *    processing (such as title extraction) on each node.
 *
 * ## Example Usage
 *
 * ```ts
 * import remarkMarkdownUnist from 'remark-markdown-unist'
 * import { unified } from 'unified'
 * import remarkParse from 'remark-parse'
 * import remarkMdx from 'remark-mdx'
 *
 *
 * unified()
 *   .use(remarkParse)
 *   .use(remarkMdx)
 *   .use(remarkMarkdownUnist)
 *   .process(yourMarkdownInput)
 *   .then((file) => {
 *     console.log(String(file))
 *   })
 * ```
 *
 * ## Dependencies
 *
 * - `unist-util-visit`
 * - `mdast`
 * - `mdast-util-mdx-jsx`
 *
 * @remarks
 * This plugin is designed to be used as part of a unified/remark processing pipeline.
 *
 * @author
 * ryotarofr
 *
 * @license MIT
 */

import { visit } from 'unist-util-visit'
import { type Root, type Parent, type Code } from 'mdast'
import type { MdxJsxTextElement } from 'mdast-util-mdx-jsx'
import { type Section } from './type.js'

/**
 * A class-based remark plugin that performs both:
 *
 * - Extraction of code block titles from language annotations (e.g. `js:example.js`)
 * - Splitting of code blocks that contain tab headers into multiple code nodes.
 */
class RemarkMarkdownUnist {
  /**
   * Apply all transformations to the given MDAST tree.
   */
  public transform(tree: Root): void {
    this.addCodeTitles(tree)
    this.splitCodeTabs(tree)
  }

  /**
   * Walks the tree to find code nodes with language annotations that include a colon.
   * When found, it extracts the title and inserts an MDX JSX text element before the code block.
   */
  private addCodeTitles(tree: Root): void {
    visit(
      tree,
      'code',
      (node: Code, index: number | undefined, parent: Parent | undefined) => {
        if (!parent || index === undefined) return

        const nodeLang = node.lang ?? ''
        let language = ''
        let title = ''

        if (nodeLang.includes(':')) {
          // Split on the first colon (or all colons if needed)
          language = nodeLang.split(':')[0]
          title = nodeLang.split(':').slice(1).join(':')
        }

        if (!title) {
          return
        }

        const className = 'remark-code-title'

        const titleNode: MdxJsxTextElement = {
          type: 'mdxJsxTextElement',
          name: 'div',
          attributes: [
            { type: 'mdxJsxAttribute', name: 'className', value: className }
          ],
          children: [{ type: 'text', value: title }],
          data: { _xdmExplicitJsx: true }
        }

        // Insert the title node before the code node
        parent.children.splice(index, 0, titleNode)
        // Update the code node’s language to only include the actual language
        node.lang = language
      }
    )
  }

  /**
   * Walks the tree to find code nodes that include tab header comments.
   * If found, the code block is split into multiple code nodes—one per tab section.
   */
  private splitCodeTabs(tree: Root): void {
    visit(
      tree,
      'code',
      (node: Code, index: number | undefined, parent: Parent | undefined) => {
        if (!parent || index === undefined) return
        if (!node.value.includes('<!--')) return

        const sections = this.extractSections(node.value)
        if (sections.length === 0) return

        const newNodes = sections.map((section) => this.createCodeNode(section))
        // Replace the original code node with the new code nodes.
        parent.children.splice(index, 1, ...newNodes)
      }
    )
  }

  /**
   * Extract sections from a code block string.
   * Each section is separated by a header comment of the form:
   * <!-- lang:label -->
   */
  private extractSections(value: string): Section[] {
    const lines = value.split('\n')
    // This regex matches (optional list marker) plus an HTML comment like <!-- js:example.js -->
    const headerRegex = /^(?:\s*[*+-]\s*)?<!--\s*([\w+-]+)\s*:\s*(.+?)\s*-->$/
    const sections: Section[] = []
    let currentSection: Section | undefined

    for (const line of lines) {
      const match = headerRegex.exec(line)
      if (match) {
        if (currentSection) {
          sections.push(currentSection)
        }

        currentSection = {
          lang: match[1],
          title: match[2],
          codeLines: []
        }
      } else if (currentSection) {
        currentSection.codeLines.push(line)
      }
    }

    if (currentSection) {
      sections.push(currentSection)
    }

    return sections
  }

  /**
   * Create a new code node for a given section.
   */
  private createCodeNode(section: Section): Code {
    // Join code lines and trim leading/trailing newlines
    const codeValue = section.codeLines.join('\n').trim()
    return {
      type: 'code',
      lang: `${section.lang}:${section.title}`,
      value: codeValue
    }
  }
}

export default function remarkMarkdownUnist() {
  const transformer = new RemarkMarkdownUnist()
  return (tree: Root) => {
    transformer.transform(tree)
  }
}

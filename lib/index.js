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
import {visit} from 'unist-util-visit'
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
  transform(tree) {
    this.addCodeTitles(tree)
    this.splitCodeTabs(tree)
  }

  /**
   * Walks the tree to find code nodes with language annotations that include a colon.
   * When found, it extracts the title and inserts an MDX JSX text element before the code block.
   */
  addCodeTitles(tree) {
    visit(tree, 'code', (node, index, parent) => {
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
      const titleNode = {
        type: 'mdxJsxTextElement',
        name: 'div',
        attributes: [
          {type: 'mdxJsxAttribute', name: 'className', value: className}
        ],
        children: [{type: 'text', value: title}],
        data: {_xdmExplicitJsx: true}
      }
      // Insert the title node before the code node
      parent.children.splice(index, 0, titleNode)
      // Update the code node’s language to only include the actual language
      node.lang = language
    })
  }

  /**
   * Walks the tree to find code nodes that include tab header comments.
   * If found, the code block is split into multiple code nodes—one per tab section.
   *
   * ※ MDX のコードブロック（MDX JSX 内のコードノード）は対象外とし、
   *     Markdown のコードブロックのみに適用するように修正。
   */
  splitCodeTabs(tree) {
    // AST 書き換えのための一時保持変数
    const replacements = []
    visit(tree, 'code', (node, index, parent) => {
      if (!parent || index === undefined) return
      // MDX JSX 内のコードノードは対象外とする
      if (
        typeof parent.type === 'string' &&
        (parent.type === 'mdxJsxTextElement' ||
          parent.type === 'mdxJsxFlowElement')
      ) {
        return
      }

      // タブ用ヘッダーコメントが含まれているかチェック
      if (!node.value.includes('<!--')) return
      const sections = this.extractSections(node.value)
      if (sections.length === 0) return
      const newNodes = sections.map((section) => this.createCodeNode(section))
      // 置換対象として記録する
      replacements.push({parent, index, newNodes})
    })
    // 同じ親ノード内で複数の置換がある場合、後ろから置換するために降順にソートする
    replacements.sort((a, b) => {
      if (a.parent === b.parent) {
        return b.index - a.index // 降順ソート
      }

      return 0 // 異なる親の場合は順序は気にしなくてよい
    })
    // 収集した情報をもとに、ツリーの書き換えを一括で実施する
    for (const {parent, index, newNodes} of replacements) {
      parent.children.splice(index, 1, ...newNodes)
    }
  }

  /**
   * Extract sections from a code block string.
   * Each section is separated by a header comment of the form:
   * <!-- lang:label -->
   */
  extractSections(value) {
    const lines = value.split('\n')
    // この正規表現は（オプションのリストマーカー付き） HTML コメント <!-- js:example.js --> にマッチする
    const headerRegex = /^(?:\s*[*+-]\s*)?<!--\s*([\w+-]+)\s*:\s*(.+?)\s*-->$/
    const sections = []
    let currentSection
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
  createCodeNode(section) {
    // コード行を結合し、前後の改行を除去
    const codeValue = section.codeLines.join('\n').trim()
    return {
      type: 'code',
      lang: `${section.lang}:${section.title}`,
      value: codeValue
    }
  }
}
const plugin = new RemarkMarkdownUnist()
export function addCodeTitles(tree) {
  plugin.addCodeTitles(tree)
}

export function splitCodeTabs(tree) {
  plugin.splitCodeTabs(tree)
}

export default function remarkMarkdownUnist() {
  return (tree) => {
    plugin.transform(tree)
  }
}

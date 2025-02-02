// https://github.com/tonyantony300/blog-repo/blob/8e474f87c46b4dfb877c479a2afb09f9d7e2d5d8/lib/remark-code-title.js
import { visit } from 'unist-util-visit'
import { type Root, type Parent, type Code, PhrasingContent } from 'mdast'
import type { MdxJsxTextElement } from 'mdast-util-mdx-jsx'

export function remarkCodeTitles() {
  return (tree: Root) => {
    visit(
      tree,
      'code',
      (node: Code, index: number | undefined, parent: Parent | undefined) => {
        if (!parent || index === undefined) return

        const nodeLang = node.lang ?? ''
        let language = ''
        let title = ''

        if (nodeLang.includes(':')) {
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

        parent.children.splice(index, 0, titleNode)
        node.lang = language
      }
    )
  }
}

/**
 * Splits a single code block that uses tab headers into multiple code block nodes.
 *
 * This transformer searches for code blocks containing one or more tab headers in the form
 * of HTML comments. A tab header should follow the format:
 *
 * ```html
 * <!-- lang:label -->
 * ```
 *
 * When such a header is encountered, all subsequent code lines are associated with it until
 * another header is found. Each section is then transformed into a new code block node with its
 * `lang` property set to the concatenation `lang:label` so that further processing (e.g. by
 * title extraction plugins) can be applied.
 *
 * @example
 * Given the following markdown:
 *
 * ```md
 * <!-- js:index.js -->
 * function sample() {
 *   return <></>
 * }
 *
 * * <!-- css:main.css -->
 * body {
 *   color: red;
 * }
 * ```
 *
 * The plugin transforms it into two separate code nodes:
 *
 * ```js:index.js
 * function sample() {
 *   return <></>
 * }
 * ```
 *
 * and
 *
 * ```css:main.css
 * body {
 *   color: red;
 * }
 * ```
 *
 * @returns A transformer function compatible with unified.
 */
export function remarkCodeTabs() {
  return (tree: Root) => {
    visit(
      tree,
      'code',
      (node: Code, index: number | undefined, parent: Parent | undefined) => {
        if (!parent || index === undefined) return

        if (!node.value.includes('<!--')) return

        const lines = node.value.split('\n')
        // Each section is an object with language, label, and its code lines.
        type Section = { lang: string; title: string; codeLines: string[] }
        const sections: Section[] = []
        let currentSection: Section | undefined

        // Matches an optional bullet marker, then a header of the form: <!-- lang:label -->
        const headerRegex =
          /^(?:\s*[*+-]\s*)?<!--\s*([\w+-]+)\s*:\s*(.+?)\s*-->$/

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
            continue
          }

          if (currentSection) {
            currentSection.codeLines.push(line)
          }
        }

        if (currentSection) {
          sections.push(currentSection)
        }

        if (sections.length === 0) return

        const newNodes: Code[] = sections.map((section) => {
          // Join the code lines and trim any leading or trailing newlines.
          const codeValue = section.codeLines
            .join('\n')
            .replaceAll(/^\n+|\n+$/g, '')
          return {
            type: 'code',
            lang: `${section.lang}:${section.title}`,
            value: codeValue
          }
        })

        // Replace the original code node with the new code nodes.
        parent.children.splice(index, 1, ...newNodes)
      }
    )
  }
}

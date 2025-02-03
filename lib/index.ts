import { visit } from 'unist-util-visit'
import { type Root, type Parent, type Code, PhrasingContent } from 'mdast'
import type { MdxJsxTextElement } from 'mdast-util-mdx-jsx'

/**
 * A remark plugin that extracts titles from code block language annotations.
 *
 * This plugin searches for code blocks whose `lang` property is formatted as
 * `language:title` (for example, `js:example.js`). When such a code block is found,
 * the plugin:
 *
 * 1. Splits the language string into its actual language (e.g. `js`) and a title (e.g. `example.js`).
 * 2. Inserts an MDX JSX text element before the code block containing the title.
 * 3. Updates the code block's `lang` property to contain only the language part.
 *
 * The inserted title element is a `<div>` with the class `remark-code-title`.
 *
 * @example
 * // Given the following Markdown:
 * ```md
 * ```js:example.js
 * console.log("Hello, world!");
 * ```
 *
 * // The plugin transforms it into:
 *
 * <div className="remark-code-title">example.js</div>
 * ```js
 * console.log("Hello, world!");
 * ```
 *
 * @returns A transformer function compatible with unified's plugin interface.
 */
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
type Section = { lang: string; title: string; codeLines: string[] }

/**
 * Extract sections from a code block string.
 * Each section is separated by a header comment of the form:
 * <!-- lang:label -->
 */
function extractSections(value: string): Section[] {
  const lines = value.split('\n')
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
 * Create a new code node for a section.
 */
function createCodeNode(section: Section): Code {
  const codeValue = section.codeLines.join('\n').replaceAll(/^\n+|\n+$/g, '')
  return {
    type: 'code',
    lang: `${section.lang}:${section.title}`,
    value: codeValue
  }
}

/**
 * A remark plugin that splits a code block containing code tabs
 * into multiple code nodes.
 */
export function remarkCodeTabs() {
  return (tree: Root) => {
    visit(
      tree,
      'code',
      (node: Code, index: number | undefined, parent: Parent | undefined) => {
        if (!parent || index === undefined) return
        if (!node.value.includes('<!--')) return

        const sections = extractSections(node.value)
        if (sections.length === 0) return

        const newNodes = sections.map((section) => createCodeNode(section))
        // Replace the original code node with the new code nodes.
        parent.children.splice(index, 1, ...newNodes)
      }
    )
  }
}

// https://github.com/tonyantony300/blog-repo/blob/8e474f87c46b4dfb877c479a2afb09f9d7e2d5d8/lib/remark-code-title.js
import {visit} from 'unist-util-visit'
import {type Root, type Parent, type Code, PhrasingContent} from 'mdast'
import type {MdxJsxTextElement} from 'mdast-util-mdx-jsx'

export default function remarkCodeTitles() {
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
            {type: 'mdxJsxAttribute', name: 'className', value: className}
          ],
          children: [{type: 'text', value: title}],
          data: {_xdmExplicitJsx: true}
        }

        parent.children.splice(index, 0, titleNode)
        node.lang = language
      }
    )
  }
}

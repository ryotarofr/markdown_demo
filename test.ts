import test from 'node:test'
import assert from 'node:assert'
import {unified} from 'unified'
import remarkParse from 'remark-parse'
import {type Root} from 'mdast'
import {type MdxJsxTextElement} from 'mdast-util-mdx-jsx'
import remarkCodeTitles from './lib/index.js'

test('should add a title to the code block', async () => {
  const inputMarkdown = '```js:title.js\nconsole.log("Hello");\n```'
  const processor = unified().use(remarkParse).use(remarkCodeTitles)
  const parsedTree = processor.parse(inputMarkdown)

  console.log('Parsed Markdown AST:', JSON.stringify(parsedTree, null, 2)) // ASTをログ出力

  // RemarkCodeTitles を適用
  await processor.run(parsedTree)

  // `parsedTree.children` の中に `mdxJsxTextElement` が含まれていることを確認
  const titleNode = parsedTree.children.find(
    (node): node is MdxJsxTextElement => node.type === 'mdxJsxTextElement'
  )

  assert.ok(titleNode, 'Title node not found')

  assert.strictEqual(titleNode.name, 'div')
  assert.deepStrictEqual(titleNode.attributes[0], {
    type: 'mdxJsxAttribute',
    name: 'className',
    value: 'remark-code-title'
  })
  assert.deepStrictEqual(titleNode.children[0], {
    type: 'text',
    value: 'title.js'
  })
})

test('should not modify code blocks without a title', async () => {
  const inputMarkdown = '```js\nconsole.log("Hello");\n```'
  const processor = unified().use(remarkParse).use(remarkCodeTitles)
  const parsedTree = processor.parse(inputMarkdown)

  // RemarkCodeTitles を適用
  await processor.run(parsedTree)

  // `mdxJsxTextElement` が追加されていないことを確認
  const titleNode = parsedTree.children.find(
    (node): node is MdxJsxTextElement => node.type === 'mdxJsxTextElement'
  )

  assert.strictEqual(titleNode, undefined)
})

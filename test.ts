import test from 'node:test'
import assert from 'node:assert'
import {unified} from 'unified'
import remarkParse from 'remark-parse'
import {type Code} from 'mdast'
import {type MdxJsxTextElement} from 'mdast-util-mdx-jsx'
import {remarkCodeTabs, remarkCodeTitles} from './lib/index.js'

void test('should add a title to the code block', async () => {
  const inputMarkdown = '```js:title.js\nconsole.log("Hello");\n```'
  const processor = unified().use(remarkParse).use(remarkCodeTitles)
  const parsedTree = processor.parse(inputMarkdown)

  await processor.run(parsedTree)

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

void test('should not modify code blocks without a title', async () => {
  const inputMarkdown = '```js\nconsole.log("Hello");\n```'
  const processor = unified().use(remarkParse).use(remarkCodeTitles)
  const parsedTree = processor.parse(inputMarkdown)

  await processor.run(parsedTree)

  const titleNode = parsedTree.children.find(
    (node): node is MdxJsxTextElement => node.type === 'mdxJsxTextElement'
  )

  assert.strictEqual(titleNode, undefined)
})

void test('should split a code block with tab headers into multiple code nodes', async () => {
  const inputMarkdown = [
    '```md',
    '<!-- js:index.js -->',
    'function sample() {',
    '  return <></>;',
    '}',
    '',
    '<!-- css:main.css -->',
    'body {',
    '  color: red;',
    '}',
    '```'
  ].join('\n')

  const processor = unified().use(remarkParse).use(remarkCodeTabs)
  const parsedTree = processor.parse(inputMarkdown)

  await processor.run(parsedTree)

  const codeNodes = parsedTree.children.filter(
    (node): node is Code => node.type === 'code'
  )

  // Console.log('Parsed Markdown AST:', JSON.stringify(codeNodes, null, 2)) // ASTをログ出力
  // 👇DEGUB
  // Parsed Markdown AST: [
  //   {
  //     "type": "code",
  //     "lang": "js:index.js",
  //     "value": "function sample() {\n  return <></>;\n}"
  //   },
  //   {
  //     "type": "code",
  //     "lang": "css:main.css",
  //     "value": "body {\n  color: red;\n}"
  //   }
  // ]

  assert.strictEqual(
    codeNodes.length,
    2,
    'Expected 2 code nodes after splitting the tabbed code block'
  )

  const firstNode = codeNodes[0]
  assert.strictEqual(firstNode.lang, 'js:index.js')
  const expectedFirstValue = [
    'function sample() {',
    '  return <></>;',
    '}'
  ].join('\n')
  assert.strictEqual(firstNode.value.trim(), expectedFirstValue)

  const secondNode = codeNodes[1]
  assert.strictEqual(secondNode.lang, 'css:main.css')
  const expectedSecondValue = ['body {', '  color: red;', '}'].join('\n')
  assert.strictEqual(secondNode.value.trim(), expectedSecondValue)
})

void test('should not modify code blocks without tab headers', async () => {
  const inputMarkdown = '```js\nconsole.log("Hello, world!");\n```'
  const processor = unified().use(remarkParse).use(remarkCodeTabs)
  const parsedTree = processor.parse(inputMarkdown)

  await processor.run(parsedTree)

  const codeNodes = parsedTree.children.filter(
    (node): node is Code => node.type === 'code'
  )

  assert.strictEqual(
    codeNodes.length,
    1,
    'Expected a single code node when no tab headers are present'
  )
  assert.strictEqual(codeNodes[0].lang, 'js')
  assert.strictEqual(codeNodes[0].value.trim(), 'console.log("Hello, world!");')
})

import test from 'node:test'
import assert from 'node:assert'
import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkMarkdownUnist from './lib/index.js'

void test('should add a title to the code block', async () => {
  const inputMarkdown = '```js:title.js\nconsole.log("Hello");\n```'
  const processor = unified().use(remarkParse).use(remarkMarkdownUnist)
  const parsedTree = processor.parse(inputMarkdown)
  const info = await processor.run(parsedTree)
  console.log('info', info)
  const titleNode = parsedTree.children.find(
    (node) => node.type === 'mdxJsxTextElement'
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
  const processor = unified().use(remarkParse).use(remarkMarkdownUnist)
  const parsedTree = processor.parse(inputMarkdown)
  await processor.run(parsedTree)
  const titleNode = parsedTree.children.find(
    (node) => node.type === 'mdxJsxTextElement'
  )
  assert.strictEqual(titleNode, undefined)
})
void test('should split a code block with tab headers into multiple code nodes', async () => {
  const inputMarkdown = [
    '```md',
    '## Hedding2',
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
  const processor = unified().use(remarkParse).use(remarkMarkdownUnist)
  const parsedTree = processor.parse(inputMarkdown)
  const info = await processor.run(parsedTree)
  console.log('info', info)
  const codeNodes = parsedTree.children.filter((node) => node.type === 'code')
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
  const processor = unified().use(remarkParse).use(remarkMarkdownUnist)
  const parsedTree = processor.parse(inputMarkdown)
  await processor.run(parsedTree)
  const codeNodes = parsedTree.children.filter((node) => node.type === 'code')
  assert.strictEqual(
    codeNodes.length,
    1,
    'Expected a single code node when no tab headers are present'
  )
  assert.strictEqual(codeNodes[0].lang, 'js')
  assert.strictEqual(codeNodes[0].value.trim(), 'console.log("Hello, world!");')
})
// Import 'mdast';
// declare module 'mdast' {
//   export interface RootContentMap {
//     codeGroup: CodeGroupNode;
//   }
// }
// // テスト1: 同じ group 属性を持つ連続するコードブロックがひとまとめの codeGroup ノードに変換されること
// void test('should group consecutive code blocks with same group attribute', async () => {
//   const inputMarkdown = [
//     '```js group=example1 label="JavaScript"',
//     'console.log("Hello, world!");',
//     '```',
//     '```python group=example1 label="Python"',
//     'print("Hello, world!")',
//     '```'
//   ].join('\n')
//   const processor = unified()
//     .use(remarkParse)
//     .use(remarkCodeGroup)
//   const parsedTree = processor.parse(inputMarkdown)
//   const tree = await processor.run(parsedTree)
//   if (!isParent(tree)) {
//     throw new Error("Parsed tree has no children");
//   }
//   // AST 内に codeGroup ノードが存在するか確認
//   const codeGroupNode = (tree as Parent).children.find(
//     (node): node is CodeGroupNode => node.type === 'codeGroup'
//   );
//   // const codeGroupNode = tree.children.find(node => node.type === 'codeGroup')
//   assert.ok(codeGroupNode, 'Expected a codeGroup node to be created')
//   // codeGroup ノードの children を Code[] として扱う
//   const groupChildren = (codeGroupNode as { children: unknown[] }).children as Code[]
//   assert.strictEqual(groupChildren.length, 2, 'Expected 2 code blocks in the group')
//   // 各コードブロックの lang プロパティから group や label 情報が削除され、
//   // 純粋な言語名のみになっていることを確認
//   assert.strictEqual(groupChildren[0].lang, 'js', 'Expected first code block lang to be "js"')
//   assert.strictEqual(groupChildren[1].lang, 'python', 'Expected second code block lang to be "python"')
//   // コード内容の検証
//   assert.strictEqual(
//     groupChildren[0].value.trim(),
//     'console.log("Hello, world!");',
//     'Unexpected content in the first code block'
//   )
//   assert.strictEqual(
//     groupChildren[1].value.trim(),
//     'print("Hello, world!")',
//     'Unexpected content in the second code block'
//   )
// })
// // テスト2: group 属性がない場合、コードブロックはグループ化されずそのまま残ること
// void test('should not group code blocks without group attribute', async () => {
//   const inputMarkdown = [
//     '```js',
//     'console.log("Hello, world!");',
//     '```'
//   ].join('\n')
//   const processor = unified()
//     .use(remarkParse)
//     .use(remarkCodeGroup)
//   const parsedTree = processor.parse(inputMarkdown)
//   const tree = await processor.run(parsedTree)
//   // codeGroup ノードが存在しないことを確認
//   const codeGroupNodes = (tree as Parent).children.filter(
//     (node): node is CodeGroupNode => node.type === 'codeGroup'
//   );
//   assert.strictEqual(codeGroupNodes.length, 0, 'Expected no codeGroup nodes when group attribute is absent')
//   // コードブロックはそのまま残っていることを確認
//   const codeGroupNode = (tree as Parent).children.find(isCodeGroupNode);
//   if (!codeGroupNode) return;
//   const groupChildren = codeGroupNode.children.filter(isCode) as Code[];
//   assert.strictEqual(groupChildren.length, 1, 'Expected one code block')
//   assert.strictEqual(groupChildren[0].lang, 'js')
//   assert.strictEqual(groupChildren[0].value.trim(), 'console.log("Hello, world!");')
// })
// // テスト3: コードブロックが非連続の場合、たとえ同じ group 属性があってもグループ化されず、個別のコードブロックとして残ること
// void test('should not group non-consecutive code blocks even if they have same group attribute', async () => {
//   const inputMarkdown = [
//     '```js group=example1 label="JavaScript"',
//     'console.log("Hello from JS block 1");',
//     '```',
//     'A paragraph between.',
//     '```python group=example1 label="Python"',
//     'print("Hello from Python block");',
//     '```'
//   ].join('\n')
//   const processor = unified()
//     .use(remarkParse)
//     .use(remarkCodeGroup)
//   const parsedTree = processor.parse(inputMarkdown)
//   const tree = await processor.run(parsedTree)
//   // 連続していない場合はグループ化されず、codeGroup ノードは生成されないはず
//   const codeGroupNodes = (tree as Parent).children.filter(isCodeGroupNode)
//   assert.strictEqual(codeGroupNodes.length, 0, 'Expected no codeGroup nodes when code blocks are non-consecutive')
//   // 個別のコードブロックが 2 つあることを確認
//   const codeNodes = (tree as Parent).children.filter((node): node is Code => node.type === 'code')
//   assert.strictEqual(codeNodes.length, 2, 'Expected two separate code blocks')
// })

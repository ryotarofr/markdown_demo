# remark-markdown-unist

We have created a custom plugin for remark. You can easily add it with [`unified`](https://github.com/unifiedjs/unified).

## Install

This package is [ESM](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c) only. In Node.js (version 16+), install with [npm](https://docs.npmjs.com/cli/v11/commands/npm-install):

```bash
npm install remark-markdown-unist
# or
yarn add remark-markdown-unist
```

## Ezample

````js
// remarkCodeTabs
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
````

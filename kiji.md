# マークダウンコードブロックライブラリを作る

[unified](https://github.com/unifiedjs/unified)を拡張した、マークダウン系のライブラリを作ろうと思っています[`remark-markdown-unist`](https://www.npmjs.com/package/remark-markdown-unist)。

ちょっと触った感じ、思ったより対応範囲が広いのか。となっている状況です。

## 利用ケースを考える

* \[ ] 1つのコードブロック内にjs、cssなど複数拡張子混在する場合で、ハイライトを独立させる
* \[ ] 複数コードブロックを同じコードブロックに結合してタブで仕分ける

## ルールを決める

例えば、1つのコードブロック内にjs、cssが混在する時に、ハイライトを独立させたいなど場合を

````js
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
````

AST（抽象構文木）の走査中にプラグインがツリーを直接変更（置換）

```ts
```

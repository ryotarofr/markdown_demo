# ⛏️マークダウンデモ
next.js(app router) で検証中。

## 概要
[`markdown-rs`](https://github.com/wooorm/markdown-rs) を使用して、コンパイルした関数を WebAssembly 経由で JavaScript から呼び出す。

## 機能
- [x] [syntax highlight](https://github.com/ryotarofr/markdown_demo/blob/b96fc56588e8fc2f8415b75f7d2df01dc0ee8037/src/util/function.ts#L66)
- [x] [custom componennt](https://github.com/ryotarofr/markdown_demo/blob/b96fc56588e8fc2f8415b75f7d2df01dc0ee8037/public/input.jsx) (事前にコンパイルした js, jsx を利用可能) 
-> 他サービス(qiita,zenn)では独自のマークダウン記法などを作成していないのでマークダウンをコピペで転用する場合の考慮が必要なのか？
- [x] [github ファイルのインポート](https://github.com/ryotarofr/markdown_demo/blob/b96fc56588e8fc2f8415b75f7d2df01dc0ee8037/src/components/GitHubFileDisplay.tsx)
- [ ] 数式プラグイン
- [ ] TOH
- [ ] ...other

### wasm build command
```bash
wasm-pack build --target web
```

### custom componennt
`public/` に jsx を作成してください。
build 後、js として利用可能です。

```bash
# build
esbuild public/hoge.jsx --bundle --format=esm --external:react --outfile=public/hoge.js
```

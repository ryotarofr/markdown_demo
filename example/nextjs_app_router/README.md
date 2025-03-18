## 2025_3_16
next.js(app router) でいくつか検証

AST/VDOM に Shiki を使うのは避けたほうがいい？
-> 文字列を生成するため再解析する必要があるため

public/*jsxをビルドするコマンド
esbuild public/button.tsx --bundle --format=esm --external:react --outfile=public/button.ts

todo
- [ ] カスタムコンポーネントでapi通信できるか確認
- [x] ハイライト使えるか確認
- [ ] 数式とかのプラグインを見る -> markdown-rs オプションの追加でできるらしい
- [ ] リファクタリング
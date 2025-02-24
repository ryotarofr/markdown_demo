
export default function remarkTabsToMdx() {
  return (tree) => {
    const newChildren = [];
    let index = 0;

    // タブヘッダー (例: === "C") を判定
    function isTabHeader(node) {
      return (
        node.type === 'paragraph' &&
        node.children?.length === 1 &&
        node.children[0].type === 'text' &&
        /^===\s*".+"$/.test(node.children[0].value.trim())
      );
    }

    // タブ内容の終了符 (例: ===) を判定
    function isTabEnd(node) {
      return (
        node.type === 'paragraph' &&
        node.children?.length === 1 &&
        node.children[0].type === 'text' &&
        node.children[0].value.trim() === '==='
      );
    }

    // 空行（すべてのテキストが空白）を判定
    function isEmptyParagraph(node) {
      return (
        node.type === 'paragraph' &&
        node.children?.length &&
        node.children.every(
          (child) => child.type === 'text' && child.value.trim() === ''
        )
      );
    }

    while (index < tree.children.length) {
      const node = tree.children[index];

      // タブヘッダーなら tabs グループを開始
      if (isTabHeader(node)) {
        const tabsElement = {
          type: 'mdxJsxFlowElement',
          name: 'tabs',
          attributes: [],
          children: []
        };

        // 内部ループで、連続する「タブヘッダー → コンテンツ → 終了符」を同じ <tabs> にまとめる
        while (index < tree.children.length) {
          const headerNode = tree.children[index];
          // 空行はスキップ
          if (isEmptyParagraph(headerNode)) {
            index++;
            continue;
          }
          // タブヘッダー以外が来たらグループ終了
          if (!isTabHeader(headerNode)) {
            break;
          }

          // タブヘッダーを処理
          const headerText = headerNode.children[0].value.trim();
          const match = headerText.match(/^===\s*"(.+)"$/);
          const title = match ? match[1] : '';
          index++; // ヘッダー行を消費

          // タブの内容を収集
          const contentNodes = [];
          while (index < tree.children.length) {
            const nextNode = tree.children[index];
            if (isTabEnd(nextNode) || isTabHeader(nextNode) || isEmptyParagraph(nextNode)) {
              // タブ終了符か新たなタブヘッダー、空行が来たら終了
              break;
            }
            contentNodes.push(nextNode);
            index++;
          }

          // タブの終了符 (===) があれば消費して次へ
          if (index < tree.children.length && isTabEnd(tree.children[index])) {
            index++;
          }

          // タブノードを作成
          const tabElement = {
            type: 'mdxJsxFlowElement',
            name: 'tab',
            attributes: [{ type: 'mdxJsxAttribute', name: 'title', value: title }],
            children: contentNodes.length > 0
              ? contentNodes
              : [{ type: 'text', value: '' }]
          };
          tabsElement.children.push(tabElement);
        }

        newChildren.push(tabsElement);
      } else {
        // タブヘッダーでないノードはそのまま追加
        newChildren.push(node);
        index++;
      }
    }

    tree.children = newChildren;
  };
}

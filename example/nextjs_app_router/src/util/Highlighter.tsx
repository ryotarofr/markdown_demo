"use client";

import { useEffect } from "react";
import { common, createStarryNight } from "@wooorm/starry-night";
import { toDom } from "hast-util-to-dom";

export default function Highlighter() {
  useEffect(() => {
    async function highlightCode() {
      // starryNight を初期化
      const starryNight = await createStarryNight(common);
      const prefix = "language-";

      // ページ内のすべての <code> 要素を取得
      const nodes = Array.from(document.body.querySelectorAll("code"));

      for (const node of nodes) {
        const className = Array.from(node.classList).find((d) => d.startsWith(prefix));
        if (!className) continue;

        const scope = starryNight.flagToScope(className.slice(prefix.length));
        if (!scope) continue;

        // コードのハイライトを実行し、DOM を置き換える
        if (node.textContent) {
          const tree = starryNight.highlight(node.textContent, scope);
          node.replaceChildren(toDom(tree, { fragment: true }));
        }
      }
    }

    highlightCode();
  }, []);

  return null;
}

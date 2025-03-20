"use client"

import React, { useState } from "react";
import GitHubFileDisplay from "../../components/GitHubFileDisplay";

export default function GithubFile() {
  const [url, setUrl] = useState<string>("ryotarofr/hyori/contents/src/index.ts?ref=main")

  // マークダウン記法とgui記法で入力できるように用意
  /**
   * マークダウンの場合
   * ```言語
   * github: [url, start, end]
   * or
   * github: url, start, end
   * ```
   *
   * 指定した言語にハイライトを優先して適応
   * 言語を指定しない場合は、urlのファイル名から言語を取得
   *
   **/

  /**
   * GUIの場合
   * googleのリンクみたいな感じにする。
   * inputフォームに url と 文字数 を指定する
   *
   */

  /**
   * コードブロックで表示したい場合と、githubのリンクから中身をそのまま表示したい場合がある
   *
   * 前者を先に実装
   * 後者はやり方調べる
   */

  return (
    <div>
      <GitHubFileDisplay />
    </div>
  )
}

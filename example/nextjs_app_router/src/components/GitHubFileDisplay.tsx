'use client';

import React from 'react';
import { useEffect, useState } from 'react';

export default function GitHubFileDisplay({
  /** 
   * github url 
   *   `userid/repo/file_path?ref=branch` のように指定
   * 例. 
   *   `ryotarofr/hyori/contents/src/index.ts?ref=main`
   * */
  url,
  /** 取得行 スタートインデックス */
  start = 0,
  /** 取得行 エンドインデックス */
  end = 1000,
}: {
  url: string,
  start?: number,
  end?: number,
}) {
  const [content, setContent] = useState('');

  useEffect(() => {
    // 'https://api.github.com/repos/ryotarofr/hyori/contents/src/index.ts?ref=main'
    const githubApiUrl = encodeURIComponent(`https://api.github.com/repos/${url}`);
    fetch(`/api/github-file?apiUrl=${githubApiUrl}&start=${start}&end=${end}`)
      .then((res) => res.text())
      .then(setContent)
      .catch((error) => console.error('エラー:', error));
  }, []);

  return (
    <div>
      <h1>GitHubファイルの特定の行を取得</h1>
      <pre>{content}</pre>
    </div>
  );
}

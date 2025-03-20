'use client';

import React from 'react';
import { useState } from 'react';
import { Input } from './Input';
import { Button } from './Button/index.';

export default function GitHubFileDisplay() {
  const [content, setContent] = useState('');
  const [url, setUrl] = useState<string>('ryotarofr/hyori/contents/src/index.ts?ref=main');
  const [start] = useState<number>(0);
  const [end] = useState<number>(1000);

  const handleClick = () => {
    // ここにバリデーション入れる

    // 'https://api.github.com/repos/ryotarofr/hyori/contents/src/index.ts?ref=main'
    const githubApiUrl = encodeURIComponent(`https://api.github.com/repos/${url}`);
    fetch(`/api/github-file?apiUrl=${githubApiUrl}&start=${start}&end=${end}`)
      .then((res) => res.text())
      .then(setContent)
      .catch((error) => console.error('エラー:', error));
  };
  return (
    <div>
      <h1>GitHubファイルの特定の行を取得</h1>
      <Input
        type="text"
        value={url}
        setValue={setUrl} />

      {/* todo numberinpout 入れる */}
      {/* <input
        type="number"
        value={start}
      />
      <input
        type="number"
        value={end}
      /> */}
      <br />
      <Button onClick={() => handleClick()}>データ取得</Button>
      <pre>{content}</pre>
    </div>
  );
}

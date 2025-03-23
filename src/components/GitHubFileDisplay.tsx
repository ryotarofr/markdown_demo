'use client';

import React from 'react';
import { useState } from 'react';
import { Input } from './ui/Input';
import { Button } from './ui/Button/index.';
// import { NumberInput } from './ui/NumberInput';
import { partializeSetState } from '@/fn/partializeSetState';

interface Content {
  url: string;
  // start: number | undefined;
  // end: number | undefined;
  value: string;
}
export default function GitHubFileDisplay() {
  const [content, setContent] = useState<Content>(
    {
      url: '',
      // start: 0,
      // end: 1000,
      value: ''
    }
  );

  /**
   * #L**から**の部分を取得
   * 例: #L123 -> 123
   */
  const toNo = (value: string) => {
    const match = value.match(/^#L(\d+)$/);
    return match ? match[1] : null;
  }
  /**
   * パスをスラッシュで分割して、空文字は除外
   * 例: ["ryotarofr", "markdown_demo", "blob", "main", "src", "util", "function.ts"]
   */
  const toSegment = (path: string): string[] | Error => {
    const pathArray = path.split('/').filter(segment => segment.length > 0);
    const err = new Error("URLの形式が正しくありません。正しい形式: /{owner}/{repo}/blob/{branch}/...");
    if (pathArray.length < 4 || pathArray[2] !== "blob") {
      return err;
    }
    return pathArray;
  }
  /** エラー判定 */
  const isError = (value: unknown): value is Error => {
    return value instanceof Error;
  }
  /** URLにクエリパラメータを追加 */
  const setParam = (url: URL, key: string, value: string) => {
    url.searchParams.set(key, value);
    return url.toString();
  }

  function transformGitHubUrlToApi(url: string): string {
    const urlObj = new URL(url);
    const lineNumber: string | null = urlObj.hash ? toNo(urlObj.hash) : null;
    const segmentsOrError = toSegment(urlObj.pathname);
    if (isError(segmentsOrError)) {
      throw segmentsOrError;
    }
    const segments: string[] = segmentsOrError;
    const [owner, repo, , branch, ...fileSegments] = segments;
    const filePath = fileSegments.join('/');
    const BASE = "https://api.github.com/repos";
    const newUrl = new URL(`${BASE}/${owner}/${repo}/contents/${filePath}`);
    setParam(newUrl, 'ref', branch);
    if (lineNumber) {
      setParam(newUrl, 'start', lineNumber);
      setParam(newUrl, 'end', '-1');
    }

    return newUrl.toString();
  }

  const handleClick = () => {
    fetch(`/api/github-file?apiUrl=${transformGitHubUrlToApi(content.url)}`)
      .then((res) => res.text())
      .then((res) => partializeSetState(setContent)('value')(res))
      .catch((error) => console.error('エラー:', error));
  };

  return (
    <div>
      <h3>GitHubファイルの特定の行を取得サンプル</h3>
      <Input
        style={{ width: '600px' }}
        type="text"
        placeholder='githubのファイルURLを入力'
        value={content.url}
        setValue={(value) => partializeSetState(setContent)("url")(value)} />
      {/* <div style={{ display: 'flex', gap: '8px' }}>
        <NumberInput
          min={0}
          max={10000}
          value={content.start}
          setValue={(value) => partializeSetState(setContent)("start")(value)}
        />
        <NumberInput
          min={0}
          max={10000}
          value={content.end}
          setValue={(value) => partializeSetState(setContent)("end")(value)}
        />
      </div> */}
      <Button onClick={() => handleClick()}>取得</Button>
      <pre>{content?.value}</pre>
    </div>
  );
}

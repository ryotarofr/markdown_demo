// app/api/github-file/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const apiUrl = searchParams.get('apiUrl');
  const start = parseInt(searchParams.get('start')) || 0;
  const end = parseInt(searchParams.get('end')) || 1000;

  // GitHub APIのエンドポイント（ユーザー名、リポジトリ名、ファイルパスを適宜変更してください）
  // const apiUrl = 'https://api.github.com/repos/ryotarofr/hyori/contents/src/index.ts?ref=main';

  const res = await fetch(apiUrl, {
    headers: {
      'Accept': 'application/vnd.github.v3.raw',
      // プライベートリポジトリの場合はアクセストークンを利用してください
      // 'Authorization': 'token YOUR_ACCESS_TOKEN'
    }
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: 'GitHubからのファイル取得に失敗しました' },
      { status: res.status }
    );
  }

  // ファイルの内容をテキストとして取得
  const fileText = await res.text();
  // 改行で分割して各行を配列に変換
  const lines = fileText.split('\n');
  // 指定した行だけを抽出（配列のインデックスは0から始まるので注意）
  const extracted = lines.slice(start, end).join('\n');

  return new NextResponse(extracted, {
    headers: { 'Content-Type': 'text/plain' }
  });
}

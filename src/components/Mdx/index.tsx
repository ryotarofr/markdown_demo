"use client"

import
React,
{
  useEffect,
  useRef,
  useState,
  Dispatch,
  SetStateAction,
  ComponentType,
  ChangeEvent,
  RefObject,
}
  from "react";
import * as ReactJSXRuntime from "react/jsx-runtime";

import { Button } from '@/components/ui/Button/index.';
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { partializeSetState } from "@/fn/partializeSetState";
import { highlightCode, loadComponent } from './function';
import { Url } from "./struct/Url";
import styles from "./MarkdownLexer.module.scss";

declare global {
  interface Window {
    React: typeof React;
    jsxRuntime: typeof ReactJSXRuntime;
  }
}

if (typeof window !== "undefined") {
  window.React = React;
  window.jsxRuntime = ReactJSXRuntime;
}

import init, { compile_mdx } from '@/crates/mdxjs-rs/pkg/mdxjs_rs.js';
const P = {
  init: async (initFunc: typeof init) => await initFunc(),
  from: async (
    md: string,
    pathArray: string[],
    _setComponent: Dispatch<SetStateAction<ComponentType | null>>,
    containerRef: RefObject<HTMLDivElement | null>,
  ) => {
    return {
      load: async () => { new loadComponent(compile_mdx(md), pathArray, _setComponent) },
      insert: async () => await highlightCode({ containerRef })
    }
  },
  testView: (
    md: string,
    setVal: Dispatch<SetStateAction<string>>,
  ) => {
    return setVal(compile_mdx(md));
  }
}

export interface MDXProps {
  readonly md: string;
  readonly customComponentPath: string[];
}

export default function MDX({ md, customComponentPath }: MDXProps) {
  const [mdxSource, setMdxSource] = useState(md);
  const [compiledMDX, setCompiledMDX] = useState<string>(""); // debug
  const [showTree, setShowTree] = useState<boolean>(false);
  const [Component, _setComponent] = useState<ComponentType | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const convert = async (iniFlg: boolean, value: string): Promise<void> => {
    if (iniFlg) await P.init(init);
    P.testView(value, setCompiledMDX);
    const result = await P.from(value, customComponentPath, _setComponent, containerRef);
    await result.load();
    await result.insert();
  }

  useEffect(() => {
    convert(true, md);
  }, []);

  const transformGitHubUrlToApi = (url: Url) => {
    const urlObj = new URL(url.value);
    const lineNumber: string | null = urlObj.hash ? Url.toNo(urlObj.hash) : null;
    const segmentsOrError = Url.toSegment(urlObj.pathname);
    if (Url.isError(segmentsOrError)) {
      throw segmentsOrError;
    }
    const [owner, repo, _, branch, ...fileSegments] = segmentsOrError;
    const newUrl = new URL(`https://api.github.com/repos/${owner}/${repo}/contents/${fileSegments.join('/')}`);
    Url.setParam(newUrl, 'ref', branch);
    if (lineNumber) {
      Url.setParam(newUrl, 'start', lineNumber);
      Url.setParam(newUrl, 'end', '-1');
    }
    return newUrl.toString();
  }

  interface Content {
    url: string;
    value: string;
  }
  const [content, setContent] = useState<Content>({ url: '', value: '', });
  const [modal, setModal] = useState<boolean>(false);
  const handleClick = () => {
    fetch(`/api/github-file?apiUrl=${transformGitHubUrlToApi({ value: content.url })}`)
      .then((res) => res.text())
      .then((res) => {
        partializeSetState(setContent)('value')(res)
        const ext = content.url.split('.').pop();
        const replaceSource = mdxSource.replace(":github", '```' + ext + '\n' + res + '\n```')
        setMdxSource(replaceSource);
        convert(false, replaceSource);
      })
      .catch((error) => console.error('エラー:', error));
    setModal(false);
  };
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (modal) return;
    setMdxSource(e.target.value);
    // TODO! 行はじめのみ有効にしたい
    if (e.target.value.includes(":github")) return setModal(true);
    convert(false, e.target.value);
  };

  return (
    <div>
      <h1>Wasm MDX Compile Example</h1>
      <textarea
        onChange={handleChange}
        value={mdxSource}
        rows={10}
        cols={50}
        className={styles.textarea}
      />
      <hr />
      <div ref={containerRef}>
        {Component ? <Component /> : <div>Loading MDX content...</div>}
      </div>
      <hr />
      <Button onClick={() => setShowTree((prev) => !prev)}>{showTree ? "close" : "show"} Tree</Button>
      {showTree && <pre>{compiledMDX}</pre>}
      <Modal
        opened={modal}
        setOpened={setModal}
      >
        <Input
          style={{ width: '600px' }}
          type="text"
          placeholder='githubのファイルURLを入力'
          value={content.url}
          setValue={(value) => partializeSetState(setContent)("url")(value)} />
        <Button onClick={() => handleClick()}>取得</Button>
      </Modal>
    </div >
  );
}

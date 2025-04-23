"use client"

import { EditorView, basicSetup } from "codemirror"
import {markdown} from "@codemirror/lang-markdown"
import { useEffect, useRef } from "react"

export default function CodeMirror() {
  const editorRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!editorRef.current) return
    
    const view = new EditorView({
      parent: editorRef.current,
      doc: `*CodeMirror* Markdown \`mode\``,
      extensions: [basicSetup, markdown()]
    })
    
    return () => {
      view.destroy()
    }
  }, [])
  
  return (
    <div>
      <h1>CodeMirror</h1>
      <div ref={editorRef}></div>
    </div>
  )
}
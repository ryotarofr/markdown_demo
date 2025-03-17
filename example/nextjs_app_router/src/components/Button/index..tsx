"use client"

import { useState } from "react"

export function Button() {
  const [state, setState] = useState(0);
  return (
    <button onClick={() => setState((prev) => prev + 1)}>{state}</button>
  )
}
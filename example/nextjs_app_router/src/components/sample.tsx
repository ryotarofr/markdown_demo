import { Code } from "bright"

export default function CodeBlock({
  lang = "md",
  value = ""
}: {
  lang: string;
  value: string;
}) {
  return <Code lang={lang}>{value}</Code>
}
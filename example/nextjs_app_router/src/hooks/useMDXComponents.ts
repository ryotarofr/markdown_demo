import { TabBlock } from "@/components/Tab/Tab";

export const components = {
  // pre: SampleCodeBlock,
  tabs: TabBlock,
};

declare global {
  type MDXProvidedComponents = typeof components;
}

export function useMDXComponents(): MDXProvidedComponents {
  return {
    // pre: SampleCodeBlock,
    tabs: TabBlock,
  };
}
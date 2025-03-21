import { common, createStarryNight, Grammar } from "@wooorm/starry-night";
import { toDom } from "hast-util-to-dom";

/**
 * Load the compiled code as a module and set it as a component.
 */
export async function loadComponent(
  {
    compiledCode,
    setComponent
  }: {
    compiledCode: string,
    setComponent: React.Dispatch<React.SetStateAction<React.ComponentType | null>>
  }) {
  let adjustedCode = compiledCode;

  /**
   * adjust compile_mdx(source) to loadComponent(compiledCode, setComponent)
   * 
   * Example:
   *     options) file path
   * 
   * options
   * - delete
   * - correction
   */

  /** delete) react/jsx-runtime, react */
  adjustedCode = adjustedCode
    .replace(/import\s+\{[^}]+\}\s+from\s+["']react\/jsx(-dev)?-runtime["'];?/g, '')
    .replace(/import\s+\*\s+as\s+React\s+from\s+["']react["'];?/g, '')
    .replace(/import\s+\{.*?\}\s+from\s+["']react["'];?/g, '');

  /**  correction) window.jsxRuntime */
  adjustedCode = adjustedCode
    .replace(/\b_jsxDEV\(/g, 'window.jsxRuntime.jsxDEV(')
    .replace(/\b_jsxs\(/g, 'window.jsxRuntime.jsxs(')
    .replace(/\b_jsx\(/g, 'window.jsxRuntime.jsx(')
    .replace(/(?<!window\.jsxRuntime\.)\bjsxDEV\(/g, 'window.jsxRuntime.jsxDEV(')
    .replace(/(?<!window\.jsxRuntime\.)\bjsx\(/g, 'window.jsxRuntime.jsx(')
    .replace(/\b(_Fragment|Fragment)\b/g, 'window.jsxRuntime.Fragment');

  /** correction) button.js */
  adjustedCode = adjustedCode.replace(
    /from\s+["']\.\/button\.js["']/g,
    `from "${window.location.origin}/button.js"`
  );

  // ----------------------------------------
  // add other components here ...
  // ----------------------------------------

  const blob = new Blob([adjustedCode], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);
  try {
    const mod = await import(/* webpackIgnore: true */ url);
    setComponent(() => mod.default);
  } catch (error) {
    console.error("Error loading module:", error);
  }
}

/**
 * Highlight the code block main.
 */
export async function highlightCode({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const starryNight = await createStarryNight(common);
  const prefix = "language-";
  const container = containerRef.current;
  if (!container) return;
  const nodes = Array.from(container.querySelectorAll("code"));

  nodes.forEach((node) => {
    highlightNode(node, starryNight, prefix);
    addCopyButton(node);
  });
}

interface StarryNight {
  flagToScope: (flag: string) => string | undefined;
  highlight: (text: string, scope: string) => any;
  missingScopes: () => ReadonlyArray<string>;
  register: (grammars: ReadonlyArray<Readonly<Grammar>>) => Promise<undefined>;
  scopes: () => ReadonlyArray<string>;
}
/**
 * Highlight the code block.
 */
function highlightNode(node: HTMLElement, starryNight: StarryNight, prefix: string) {
  console.log("starryNight", starryNight);
  const className = Array.from(node.classList).find((d) => d.startsWith(prefix));
  if (!className) return;
  const scope = starryNight.flagToScope(className.slice(prefix.length));
  if (!scope) return;
  if (node.textContent) {
    const tree = starryNight.highlight(node.textContent, scope);
    node.replaceChildren(toDom(tree, { fragment: true }));
  }
}

/**
 * Add a copy button to the code block.
 */
function addCopyButton(node: HTMLElement) {
  const copyIconContainer = document.createElement("span");
  copyIconContainer.style.position = "absolute";
  copyIconContainer.style.top = "-15px";
  copyIconContainer.style.right = "5px";
  copyIconContainer.style.opacity = "0.5";
  copyIconContainer.style.cursor = "pointer";
  copyIconContainer.style.width = "36px";
  copyIconContainer.style.height = "0px";

  copyIconContainer.innerHTML = `
    <img 
      src="/icon/copy.svg" 
      alt="Copy icon" 
      style="width:16px; height:16px;" 
    />
  `;

  // copy to clipboard
  copyIconContainer.addEventListener("click", () => {
    navigator.clipboard.writeText(node.textContent || "")
      .then(() => {
        // TODO! ここに toast を入れる
        console.log("Code copied to clipboard!");
      })
      .catch((error) => {
        console.error("Copy failed:", error);
      });
  });

  // create a wrapper
  const wrapper = document.createElement("div");
  wrapper.style.position = "relative";
  node.parentNode?.insertBefore(wrapper, node);
  wrapper.appendChild(node);
  wrapper.appendChild(copyIconContainer);
}

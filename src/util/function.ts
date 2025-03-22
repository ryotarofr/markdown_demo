import { common, createStarryNight, Grammar } from "@wooorm/starry-night";
import { toDom } from "hast-util-to-dom";


export class loadComponent {
  adjustedCode: string;

  constructor(
    compiledCode: string,
    pathArray: string[],
    setComponent: React.Dispatch<React.SetStateAction<React.ComponentType | null>>
  ) {

    this.adjustedCode = compiledCode;
    this.adjust(pathArray);

    const blob = new Blob([this.adjustedCode], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    try {
      import(/* webpackIgnore: true */ url).then((mod) => {
        setComponent(() => mod.default);
      }).catch((error) => {
        console.error("Error loading module:", error);
      });
    } catch (error) {
      console.error("Error loading module:", error);
    }
  }

  private delete() {
    const A = /import\s+\{[^}]+\}\s+from\s+["']react\/jsx(-dev)?-runtime["'];?/g;
    this.adjustedCode = this.adjustedCode.replace(new RegExp(A, "g"), "");
  }

  private convertConst() {
    const A = /\b_jsxs\(/g;
    const B = /\b_jsx\(/g;
    const C = /\b(_Fragment|Fragment)\b/g;
    this.adjustedCode = this.adjustedCode
      .replace(new RegExp(A, "g"), "window.jsxRuntime.jsxs(")
      .replace(new RegExp(B, "g"), "window.jsxRuntime.jsx(")
      .replace(new RegExp(C, "g"), "window.jsxRuntime.Fragment");
  }

  private convertCustom(pathArray: string[]) {
    for (const p of pathArray) {
      this.adjustedCode = this.adjustedCode.replace(
        new RegExp(`from\\s+["']\\.\\/${p}["']`, "g"),
        `from "${window.location.origin}/${p}"`
      );
    }
  }

  private adjust(pathArray: string[]) {
    this.delete();
    this.convertConst();
    this.convertCustom(pathArray);
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
        // TODO! ここに toast が入る
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

import React, { useState } from 'react';

/**
 * TabbedCode コンポーネント
 * 
 * props.tabs は、以下のような構造の配列を想定しています:
 * [
 *   {
 *     title: "C", 
 *     code: {
 *       lang: "c",
 *       value: "#include <stdio.h>\n\nint main(void) { ... }"
 *     }
 *   },
 *   {
 *     title: "C++",
 *     code: {
 *       lang: "c++",
 *       value: "#include <iostream>\n\nint main(void) { ... }"
 *     }
 *   }
 * ]
 */
// export const TabbedCode = ( tabs ) => {
//   console.log("TabbedCode", tabs)
//   const [activeTab, setActiveTab] = useState(0);
//   if (!tabs) return;
//   console.log("tabs", tabs)
//   return (
//     <div className="tabbed-code">
//       {/* タブのヘッダー部分 */}
//       <div className="tab-headers">
//         {tabs.map((tab, index) => (
//           <button
//             key={index}
//             className={`tab-button ${activeTab === index ? 'active' : ''}`}
//             onClick={() => setActiveTab(index)}
//           >
//             {tab.title}
//           </button>
//         ))}
//       </div>

//       {/* アクティブなタブのコードブロック */}
//       <div className="tab-content">
//         <pre {...tabs} />
//           {/* <code className={`language-${tabs[activeTab].code.lang}`}> */}
//             {/* {tabs[activeTab].code.value} */}
//           {/* </code> */}
//         {/* </pre> */}
//       </div>
//     </div>
//   );
// };

function Tab({ index, element, active, setActive }) {
  const { title } = element.props;
  return (
    <button
      className={`tab-button ${active === index ? 'active' : ''}`}
      onClick={() => setActive(index)}
    >
      {title}
    </button>
  );
}

export const SampleCodeBlock = ({ children, ...rest }) => {
  return <pre {...rest}>{children}</pre>;
};

export function TabBlock({ children }) {
  const codeBlocks = React.Children.toArray(children);
  console.log("codeBlocks", codeBlocks);
  const [activeIdx, setActiveIdx] = useState(0);
  const activeChild = codeBlocks[activeIdx];

  return (
    <div className="code-block-wrapper">
      <div className="tab-header">
        {codeBlocks.map((child, i) => (
          <Tab
            key={i}
            index={i}
            element={child}
            active={activeIdx}
            setActive={setActiveIdx}
          />
        ))}
      </div>
      <div className="tab-content">
        {activeChild && <SampleCodeBlock {...activeChild.props} />}
      </div>
    </div>
  );
}

// export const TabbedCodeGroup = ({ children, ...rest }) => {
//   console.log("TabbedCodeGroup", children)
//   // children は <tab> 要素の配列を想定
//   const tabsElements = React.Children.toArray(children);
//   console.log('--- TabbedCodeGroup children (tabs) ---');
//   console.log(tabsElements);

//   // 各タブ要素から title, lang, codeText を抽出する
//   const tabs = tabsElements.map((tabElement) => {
//     // <tab> 要素は mdxJsxFlowElement として、props に title, lang, children を持つ
//     const { title, lang, tabChildren } = tabElement.props;
//     console.log('tabChildren =>', tabElement.props.children.props.children.props.children);
//     // 子要素から <code> 要素を探す（MDX では code ブロックは mdxJsxFlowElement の子要素として存在する）
//     // const codeNode = React.Children.toArray(tabElement.props.children).find(
//     //   (child) => child?.props?.type === 'code'
//     // );
//     // tabElement の子要素から再帰的に code ノードを探す
//     const codeNode = findCodeNode(tabElement.props.children);
//     console.log("codeNode", codeNode);

//     // コードの内容は、codeNode.props.children または codeNode.props.value に入っている場合がある
//     const codeText = 
//       extractText(codeNode?.props?.children) ||
//       codeNode?.props?.value ||
//       '';
//     console.log("codeText", codeText);
//     return { title, lang, value: codeNode };
//   });

//   const [activeTab, setActiveTab] = useState(0);

//   if (tabs.length === 0) {
//     return null;
//   }

//   return (
//     <div className="tabbed-code-group">
//       <div className="tabbed-code-group__headers">
//         {tabs.map((tab, index) => (
//           <button
//             key={index}
//             className={`tab-button ${activeTab === index ? 'active' : ''}`}
//             onClick={() => setActiveTab(index)}
//           >
//             {tab.title}
//           </button>
//         ))}
//       </div>
//       <div className="tabbed-code-group__content">
//       {/* {tabs[activeTab].value} */}
//         {/* <pre {...children} /> */}
//         <pre {...rest}>{children}</pre>
//         {/* <pre>
//           <code className={`language-${tabs[activeTab].lang}`}>
//             {tabs[activeTab].value}
//           </code>
//         </pre> */}
//       </div>
//     </div>
//   );
// };

// /**
//  * 再帰的に子要素を探索して、props.type === 'code' な要素を返す関数
//  * （最初に見つかった要素を返すサンプル）
//  */
// function findCodeNode(node) {
//   if (!node) return null;
  
//   // nodeが配列の場合は、各要素に対して探索
//   if (Array.isArray(node)) {
//     for (const child of node) {
//       const found = findCodeNode(child);
//       if (found) return found;
//     }
//     return null;
//   }

//   // nodeがReact要素の場合:
//   // 直接 node.type をチェック（ログにあるように type: "code" として出ている場合）
//   if (node.type === 'code' ||
//       (node.props && (node.props.mdxType === 'code' || node.props.type === 'code'))
//   ) {
//     return node;
//   }

//   // 再帰的に子要素を探索する
//   if (node.props && node.props.children) {
//     const childrenArray = React.Children.toArray(node.props.children);
//     for (const child of childrenArray) {
//       const found = findCodeNode(child);
//       if (found) return found;
//     }
//   }
  
//   return null;
// }


// function extractText(children) {
//   if (typeof children === 'string') {
//     return children;
//   } else if (Array.isArray(children)) {
//     return children.map(extractText).join('');
//   } else if (React.isValidElement(children)) {
//     // React 要素の場合、その子要素からテキストを抽出する
//     return extractText(children.props.children);
//   }
//   return '';
// }
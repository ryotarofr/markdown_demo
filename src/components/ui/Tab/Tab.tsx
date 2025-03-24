"use client"

import React, { useState } from 'react';

interface TabElementProps {
  title: string;
}

interface TabProps {
  index: number;
  element: React.ReactElement<TabElementProps>;
  active: number;
  setActive: React.Dispatch<React.SetStateAction<number>>;
}

function Tab({ index, element, active, setActive }: TabProps) {
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

export const SampleCodeBlock: React.FC<React.HTMLAttributes<HTMLPreElement>> = ({
  children,
  ...rest
}) => {
  return <pre {...rest}>{children}</pre>;
};

interface TabBlockProps {
  children: React.ReactNode;
}

export function TabBlock({ children }: TabBlockProps) {
  const codeBlocks = React.Children.toArray(children) as React.ReactElement<TabElementProps>[];
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

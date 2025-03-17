// public/button.jsx
function Button() {
  const [count, setCount] = window.React.useState(0);
  return window.jsxRuntime.jsx("button", {
    children: `Button clicked ${count} times`,
    onClick: () => setCount(count + 1)
  });
}
export {
  Button
};

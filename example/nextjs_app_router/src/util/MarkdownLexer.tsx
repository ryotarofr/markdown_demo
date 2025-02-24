interface MdxLexerProps {
  Component: React.ComponentType;
}

export default function MdxLexer({ Component }: MdxLexerProps) {
  return <>{Component ? <Component /> : <p>Loading...</p>}</>;
}
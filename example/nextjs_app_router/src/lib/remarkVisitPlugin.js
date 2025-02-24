export function remarkVisitPlugin() {
  return (tree) => {
    visit(tree, 'tabs', (node) => {
      console.log('`tabs`が見つかりました:', node)
    })
  }
}
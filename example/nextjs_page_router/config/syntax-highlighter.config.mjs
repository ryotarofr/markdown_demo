import {
  transformerNotationDiff,
  transformerNotationErrorLevel,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerNotationWordHighlight
} from '@shikijs/transformers'

/** @typedef {import("shiki").BuiltinTheme} BuiltinTheme */
/** @type {import("shiki").CodeOptionsThemes<BuiltinTheme>} */
export const config = {
  defaultColor: 'light',
  themes: {
    light: 'vitesse-light',
    dark: 'vitesse-dark'
  },
  defaultColor: false,
  cssVariablePrefix: '--_s-',
  transformers: [
    transformerNotationDiff({
      matchAlgorithm: 'v3'
    }),
    transformerNotationFocus({
      matchAlgorithm: 'v3',
      classActiveLine: 'has-focus',
      classActivePre: 'has-focused-lines'
    }),
    transformerNotationHighlight({
      matchAlgorithm: 'v3'
    }),
    transformerNotationErrorLevel({
      matchAlgorithm: 'v3'
    }),
    transformerNotationWordHighlight({
      matchAlgorithm: 'v3'
    })
  ]
}

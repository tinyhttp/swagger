import ts from '@rollup/plugin-typescript'
import { minifyHTML } from 'rollup-plugin-minify-html'

export default {
  input: 'src/index.ts',
  output: [{ dir: 'dist', format: 'esm' }],
  plugins: [
    ts(),
    minifyHTML({
      targets: [
        {
          src: 'src/template.html',
          dest: 'dist/template.html',
          minifierOptions: {
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true,
            minifyURLs: true,
            minifyHTML: true
          }
        }
      ]
    })
  ],
  external: ['fs', 'path']
}

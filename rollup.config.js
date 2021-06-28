import ts from '@rollup/plugin-typescript'
import copy from 'rollup-plugin-copy'

export default {
  input: 'src/index.ts',
  output: [{ dir: 'dist', format: 'esm' }],
  plugins: [ts(), copy({ targets: [{ src: 'src/template.html', dest: 'dist' }] })],
  external: ['fs', 'path']
}

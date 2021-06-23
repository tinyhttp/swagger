import ts from '@rollup/plugin-typescript'

export default cfg => ({
  input: 'src/index.ts',
  output: [
    { file: 'dist/index.cjs', format: 'cjs' },
    { dir: 'dist', format: 'esm' },
  ],
  plugins: [ts({ include: ['./src/**/*.ts'] }), ...(cfg.plugins || [])],
})

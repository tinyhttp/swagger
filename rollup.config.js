import cfg from './cfg'
import { dependencies } from './package.json'

export default cfg({
  external: dependencies,
})

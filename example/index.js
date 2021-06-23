import { App } from '@tinyhttp/app'
import { addToDocs, generateDocs } from 'swagger'
import { writeFileSync } from 'fs'
import stringify from 'json-format'

const schema = {
  id: { type: 'number', positive: true, integer: true },
  name: { type: 'string', min: 3, max: 255 },
  status: 'boolean',
}

const app = new App()

app.post(
  '/',
  addToDocs({
    headers: { authorization: 'string' },
    params: { docId: 'number' },
    body: schema,
  }),
  (req, res) => {
    res.status(200).send('done')
  }
)

writeFileSync('docs.json', stringify(generateDocs(app)), { encoding: 'utf-8' })
// app.listen(3000)

const { App } = require('@tinyhttp/app')
const { addToDocs, generateDocs } = require('swagger')
const { writeFileSync } = require('fs')
const stringify = require('json-format')

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

import { App } from '@tinyhttp/app'
import { addToDocs, generateDocs } from '../dist/index.js'
import { writeFileSync } from 'fs'
import stringify from 'json-format'

const schema = {
  id: { type: 'number', positive: true, integer: true },
  name: { type: 'string', min: 3, max: 255 },
  status: 'boolean'
}

const app = new App()

app
  .get('/:docId', addToDocs({ params: { docId: 'number' } }), (req, res) => {
    res.status(200).send('done')
  })
  .post(
    '/:docId',
    addToDocs(
      {
        headers: { authorization: 'string' },
        params: { docId: 'number' },
        body: schema
      },
      ['docs']
    ),
    (req, res) => {
      res.status(200).send('done')
    }
  )
  .get('/users', addToDocs({ query: { userId: { type: 'number', optional: true } } }, ['users']), (req, res) => {
    res.status(200).send('done')
  })
  .get('/:userId/:docId', addToDocs({ params: { userId: 'number', docId: 'number' } }), (req, res) => {
    res.status(200).send('done')
  })

const docs = generateDocs(app, { title: 'example' })
writeFileSync('docs.json', stringify(docs), {
  encoding: 'utf-8',
})
// app.listen(3000)

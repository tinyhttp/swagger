import { App } from '@tinyhttp/app'
import { addToDocs, generateDocs } from '../dist/index.cjs'
import { writeFileSync } from 'fs'
import stringify from 'json-format'

const schema = {
  id: { type: 'number', positive: true, integer: true },
  name: { type: 'string', min: 3, max: 255 },
  status: 'boolean',
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
        body: schema,
      },
      ['docs']
    ),
    (req, res) => {
      res.status(200).send('done')
    }
  )
  .get(
    '/users',
    addToDocs({ query: { userId: 'number' } }, ['users']),
    (req, res) => {
      res.status(200).send('done')
    }
  )

writeFileSync('docs.json', stringify(generateDocs(app, { title: 'example' })), {
  encoding: 'utf-8',
})
// app.listen(3000)

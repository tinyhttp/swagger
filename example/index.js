import { App } from '@tinyhttp/app'
import { addToDocs, serveDocs } from '../dist/index.js'

// In case the value for a given field is an object, @tinyhttp/swagger only uses the type, optional or items(in case type is array)
// Other fields are ignored and are shown here only to imply that the same schema object can be used for validation by the fastest-validator package
const schema = {
  id: { type: 'number', positive: true, integer: true },
  name: { type: 'string', min: 3, max: 255 },
  status: 'boolean'
}

const app = new App()

app
  .get('/docs/:docId', addToDocs({ params: { docId: 'number' } }), (req, res) => {
    res.status(200).send('done')
  })
  .post(
    '/docs/:docId',
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

// default for version is 0.1 and for prefix is docs but title is required
serveDocs(app, { title: 'example', version: '1.0', prefix: 'api-docs' })
app.listen(3000)

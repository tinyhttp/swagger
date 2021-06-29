import { App } from '@tinyhttp/app'
import { makeFetch } from 'supertest-fetch'
import { addToDocs, generateDocs, serveDocs } from '../src/index'

export function initApp() {
  const app = new App()

  app.get(
    '/users/:id',
    addToDocs(
      {
        headers: {
          authorization: 'string'
        },
        params: {
          id: {
            type: 'string',
            optional: true
          }
        }
      },
      ['users']
    ),
    (_, res) => {
      res.status(200).send('users list')
    }
  )

  app.post(
    '/users',
    addToDocs(
      {
        headers: {
          'csrf-token': 'string',
          accept: {
            type: 'string',
            optional: true
          }
        },
        params: {
          _csrf: {
            type: 'string',
            optional: true
          }
        },
        body: {
          name: 'string',
          email: 'string',
          phone: {
            type: 'number',
            optional: true
          },
          score: {
            type: 'array',
            items: 'number'
          }
        }
      },
      ['users']
    ),
    (_, res) => {
      res.status(200).send('users post')
    }
  )

  app.get('/json', (_, res) => {
    res.status(200).json(generateDocs(app, { title: 'sample app' }))
  })

  serveDocs(app, { title: 'sample app' })

  const server = app.listen()
  const fetch = makeFetch(server)

  return { app, server, fetch }
}

import { App } from '@tinyhttp/app'
import { makeFetch } from 'supertest-fetch'
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { addToDocs, generateDocs, serveDocs } from '../src/index'
import { initApp } from './helper'

test('should be able to create a simple swagger file', async () => {
  const { fetch } = initApp()
  const response = await fetch('/json')
  const body = await response.json()

  const resultSchema = {
    openapi: '3.0.3',
    info: {
      title: 'sample app',
      description: '',
      version: '0.1'
    },
    paths: {
      '/users/{id}': {
        get: {
          tags: ['users'],
          parameters: [
            {
              in: 'path',
              required: false,
              name: 'id',
              schema: {
                type: 'string'
              }
            },
            {
              in: 'header',
              required: true,
              name: 'authorization',
              schema: {
                type: 'string'
              }
            }
          ],
          responses: {
            '200': {
              description: 'successful'
            }
          }
        }
      },
      '/users': {
        post: {
          parameters: [
            {
              in: 'path',
              required: false,
              name: '_csrf',
              schema: {
                type: 'string'
              }
            },
            {
              in: 'header',
              required: true,
              name: 'csrf-token',
              schema: {
                type: 'string'
              }
            },
            {
              in: 'header',
              required: false,
              name: 'accept',
              schema: {
                type: 'string'
              }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'score'],
                  properties: {
                    name: {
                      type: 'string'
                    },
                    email: {
                      type: 'string'
                    },
                    phone: {
                      type: 'number'
                    },
                    score: {
                      type: 'array',
                      items: {
                        type: 'number'
                      }
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'successful'
            }
          },
          tags: ['users']
        }
      }
    },
    servers: []
  }

  assert.is(response.status, 200)
  assert.equal(body, resultSchema)
})

test('should return a html page of swagger docs', async () => {
  const { fetch } = initApp()
  const response = await fetch('/docs')
  const body = await response.text()
  const htmlPage = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>sample app</title>
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3.51.0/swagger-ui.css" />
    <link rel="icon" type="image/png" href="https://upload.wikimedia.org/wikipedia/commons/a/ab/Swagger-logo.png" />
    <style>
      html {
        box-sizing: border-box;
        overflow: -moz-scrollbars-vertical;
        overflow-y: scroll;
      }

      *,
      *:before,
      *:after {
        box-sizing: inherit;
      }

      body {
        margin: 0;
        background: #fafafa;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3.51.0/swagger-ui-bundle.js" charset="UTF-8"></script>
    <script
      src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3.51.0/swagger-ui-standalone-preset.js"
      charset="UTF-8"
    ></script>
    <script>
      window.onload = function () {
        const ui = SwaggerUIBundle({
          spec: '##docs##',
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          plugins: [SwaggerUIBundle.plugins.DownloadUrl],
          layout: 'StandaloneLayout'
        })

        window.ui = ui
      }
    </script>
  </body>
</html>
`
  assert.is(response.status, 200)
  assert.is(response.headers.get('content-type'), 'text/html; charset=utf-8')
  assert.fixture(body, htmlPage)
})

test('should return error for generateDocs without title', async () => {
  const app = new App()
  app.get('/', addToDocs({ body: { name: 'string' } }), (_, res) => res.sendStatus(200))
  app.get('/docs', (_, res) => res.send(generateDocs(app, { title: '' })))
  const fetch = makeFetch(app.listen())
  const response = await fetch('/docs')
  const body = await response.text()

  assert.is(response.status, 500)
  assert.is(body, 'you should provide generateDocs with a title')
})

test('should return error for serveDocs without title', async () => {
  const app = new App()
  app.get('/', addToDocs({ body: { name: 'string' } }), (_, res) => res.sendStatus(200))
  assert.throws(() => serveDocs(app, { title: '' }), 'you should provide serveDocs with a title')
})

test.run()

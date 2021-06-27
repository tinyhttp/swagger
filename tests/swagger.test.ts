import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { initApp } from './helper'

test('should be able to create a simple swagger file', async () => {
  const { fetch } = initApp()
  const response = await fetch('/docs')
  const body = await response.json()

  const resultSchema = {
    openapi: '3.0.3',
    info: {
      title: 'sample app',
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
                  required: ['name', 'email', 'phone'],
                  properties: {
                    name: {
                      type: 'string'
                    },
                    email: {
                      type: 'string'
                    },
                    phone: {
                      type: 'number'
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
          }
        }
      }
    }
  }

  assert.is(response.status, 200)
  assert.equal(body, resultSchema)
})

test.run()

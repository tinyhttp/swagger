import { createBodySub, createParameterSubs, body, parameters } from './schema'
import { App, Request, Response, NextFunction, Middleware } from '@tinyhttp/app'
import { Handler, AsyncHandler } from '@tinyhttp/router'

type SwaggerHandler = (Handler | AsyncHandler) & { schema: any; tags: any }

export function addToDocs(
  schema: parameters & { body?: body },
  tags: string[] = []
) {
  const mw = async (_req: Request, _res: Response, next: NextFunction) => {
    next()
  }
  mw.schema = schema
  mw.tags = tags
  return mw
}

export function generateDocs(app: App, opts) {
  if (!opts.title) {
    throw Error('you should provide generatDocs with a title')
  }

  const version = opts.version || '0.1'

  const routes = app.middleware
    .filter(mw => mw.type == 'route' && (mw.handler as SwaggerHandler).schema)
    .map(route => {
      return {
        path: ((route as Middleware).path as string).replace(
          /:(?<param>[A-Za-z0-9_]+)/g,
          '{$<param>}'
        ),
        schema: (route.handler as SwaggerHandler).schema,
        tags: (route.handler as SwaggerHandler).tags,
        method: route.method,
      }
    })

  const uniquePathsSet = new Set(routes.map(r => r.path))
  const uniquePaths = Array.from(uniquePathsSet.keys()) as string[]

  const docs = {}
  uniquePaths.forEach(p => {
    docs[p] = {}
  })

  uniquePaths.forEach(p => {
    const current = routes.filter(route => route.path == p)
    current.forEach(route => {
      const method = (route.method as string).toLowerCase()
      docs[p][method] = {
        tags: route.tags.length == 0 ? undefined : route.tags,
        parameters: createParameterSubs({
          headers: route.schema.headers,
          params: route.schema.params,
          query: route.schema.query,
        }),
        requestBody: route.schema.body
          ? createBodySub(route.schema.body)
          : undefined,
        responses: { 200: { description: 'successful' } },
      }
    })
  })

  return {
    openapi: '3.0.3',
    info: { title: opts.title, version },
    paths: docs,
  }
}

export default { addToDocs, generateDocs }

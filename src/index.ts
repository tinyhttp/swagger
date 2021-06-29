import type { App, Request, Response, NextFunction, Middleware } from '@tinyhttp/app'
import type { Handler, AsyncHandler } from '@tinyhttp/router'
import { createBodySub, createParameterSubs, docsOptions, outline } from './schema'
import { readFileSync } from 'fs'
import { dirname, resolve } from 'path'

type SwaggerHandler = (Handler | AsyncHandler) & { schema: any; tags: any }

export function addToDocs(schema: outline, tags: string[] = []) {
  const mw = async (_req: Request, _res: Response, next: NextFunction) => {
    next()
  }
  mw.schema = schema
  mw.tags = tags
  return mw
}

export function generateDocs(app: App, opts: docsOptions) {
  if (!opts.title) {
    throw Error('you should provide generateDocs with a title')
  }

  const version = opts.version || '0.1'
  const servers = opts.servers || []

  const routes = app.middleware
    .filter((mw) => mw.type == 'route' && (mw.handler as SwaggerHandler).schema)
    .map((route) => ({
      path: ((route as Middleware).path as string).replace(/:(?<param>[A-Za-z0-9_]+)/g, '{$<param>}'),
      schema: (route.handler as SwaggerHandler).schema,
      tags: (route.handler as SwaggerHandler).tags,
      method: route.method
    }))

  const uniquePathsSet = new Set(routes.map((r) => r.path))
  const uniquePaths = Array.from(uniquePathsSet.keys()) as string[]

  const docs = {}
  uniquePaths.forEach((p) => {
    docs[p] = {}
  })

  uniquePaths.forEach((p) => {
    const current = routes.filter((route) => route.path == p)
    current.forEach((route) => {
      const method = (route.method as string).toLowerCase()
      docs[p][method] = {
        tags: route.tags.length == 0 ? undefined : route.tags,
        parameters: createParameterSubs({
          headers: route.schema.headers,
          params: route.schema.params,
          query: route.schema.query
        }),
        requestBody: route.schema.body ? createBodySub(route.schema.body) : undefined,
        responses: { 200: { description: 'successful' } }
      }
    })
  })

  return {
    openapi: '3.0.3',
    info: { title: opts.title, version, description: opts.description },
    servers: servers.length > 0 ? opts.servers.map((url) => ({ url })) : undefined,
    paths: docs
  }
}

export function serveDocs(app: App, opts: docsOptions) {
  if (!opts.title) {
    throw Error('you should provide serveDocs with a title')
  }

  const version = opts.version || '0.1'
  const prefix = opts.prefix || 'docs'

  const docs = generateDocs(app, {
    title: opts.title,
    version,
    servers: opts.servers,
    description: opts.description
  })
  const strDocs = JSON.stringify(docs)

  const moduleURL = new URL(import.meta.url)
  const __dirname = dirname(moduleURL.pathname)

  const template = readFileSync(resolve(__dirname, 'template.html'), 'utf8')
  const html = template.replace('"##docs##"', strDocs).replace('"##title##"', opts.title)

  app.get('/' + prefix, (_req: Request, res: Response) => {
    res.status(200).send(html)
  })
}

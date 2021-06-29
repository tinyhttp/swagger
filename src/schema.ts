export type parameters = { headers?: schema; params?: schema; query?: schema }
export type outline = parameters & { body?: body }
export type origin = 'header' | 'query' | 'path'
export type schema = {
  [_: string]: 'number' | 'string' | { type: 'number' | 'string'; optional?: boolean; [_: string]: any }
}
export type body = {
  [_: string]:
    | 'boolean'
    | 'number'
    | 'string'
    | {
        type: 'boolean' | 'number' | 'string'
        optional?: boolean
        [_: string]: any
      }
    | {
        type: 'array'
        items: 'boolean' | 'string' | 'number'
        optional?: boolean
        [_: string]: any
      }
}

export type contentType = 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'application/json'

export type docsOptions = {
  title: string
  version?: string
  servers?: string[]
  description?: string
  prefix?: string
}

export function createBodySub(schema: body, contentType: contentType = 'application/json') {
  if (!schema || Object.keys(schema).length == 0) return {}

  const content: { [_: string]: { schema: any } } = {}
  content[contentType] = { schema: bodyToOpenAPI(schema) }
  return {
    required: true,
    content
  }
}

export function createParameterSubs(parameters: parameters) {
  const query = parameters.query
  const params = parameters.params
  const headers = parameters.headers

  let querySubs = []
  let paramSubs = []
  let headerSubs = []

  if (query) querySubs = schemaToOpenAPI(query, 'query')
  if (params) paramSubs = schemaToOpenAPI(params, 'path')
  if (headers) headerSubs = schemaToOpenAPI(headers, 'header')

  return [...querySubs, ...paramSubs, ...headerSubs]
}

function bodyToOpenAPI(schema: body) {
  const names = Object.keys(schema)

  const required = names.filter((n) => {
    if (typeof schema[n] == 'string') {
      return true
    }

    return !(schema[n] as { optional?: boolean; type: 'string' | 'number' | 'boolean' })['optional']
  })

  const properties = {}
  names.forEach((n) => {
    if (typeof schema[n] == 'string') {
      properties[n] = { type: schema[n] as string }
    } else if ((schema[n] as { type: string; [_: string]: any })['type'] == 'array') {
      properties[n] = {
        type: 'array',
        items: { type: (schema[n] as { items: string })['items'] }
      }
    } else {
      properties[n] = { type: (schema[n] as { type: string })['type'] }
    }
  })

  return {
    type: 'object',
    required,
    properties
  }
}

function schemaToOpenAPI(schema: schema, origin: origin): any[] {
  const names = Object.keys(schema)
  const subs = names.map((n) => {
    if (typeof schema[n] == 'string') {
      return {
        in: origin,
        required: true,
        name: n,
        schema: { type: schema[n] }
      }
    }

    const details = schema[n] as {
      optional?: boolean
      type: 'string' | 'number' | 'boolean'
    }

    return {
      in: origin,
      required: !details.optional,
      name: n,
      schema: { type: details.type }
    }
  })
  return subs
}

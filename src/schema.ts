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
        type: 'boolean' | 'number' | 'string' | 'enum'
        optional?: boolean
        nullable?: boolean
        values?: string[]
        enum?: string[]
        [_: string]: any
      }
    | {
        type: 'array'
        items: 'boolean' | 'string' | 'number' | body
        optional?: boolean
        nullable?: boolean
        enum?: string[]
        [_: string]: any
      }
    | { type: 'object'; props: body; optional?: boolean; nullable?: boolean; [_: string]: any }
}

export type contentType = 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'application/json'

export type generateOptions = {
  title: string
  version?: string
  servers?: string[]
  description?: string
}

export type serveOptions = generateOptions & { prefix?: string }

const acceptableTypes = ['string', 'number', 'boolean', 'object', 'array', 'enum', 'any']

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
  const properties = {}
  const required = []

  for (const key in schema) {
    if (typeof schema[key] == 'string') {
      if (!acceptableTypes.includes(schema[key] as string)) throw Error(`invalid type ${schema[key]} for field ${key}`)
      properties[key] = { type: schema[key] }
      required.push(key)
      continue
    }

    const item = schema[key] as { optional?: boolean }
    if (!item.optional) required.push(key)
    const temp = convertItem(key, item as any)
    if (typeof temp == 'string') throw Error(temp)
    properties[key] = temp
  }

  return { type: 'object', required, properties }
}

function convertItem(
  key: string,
  item: {
    type: string
    values?: string[]
    props?: body
    items?: body
    enum?: string[]
    optional?: boolean
    nullable?: boolean
  }
) {
  if (!item.type) throw Error(`field ${key} does not have a type`)
  if (!acceptableTypes.includes(item.type)) throw Error(`invalid type ${item.type} for field ${key}`)

  if (item.type == 'enum' && (!item.values || !Array.isArray(item.values)))
    throw Error(`enum field ${key} does not provide list of values`)

  if (item.type == 'object' && (!item.props || typeof item.props != 'object' || Array.isArray(item.props)))
    throw Error(`object field ${key} should provide a valid props object`)

  if (
    item.type == 'array' &&
    (!item.items || !['string', 'object'].includes(typeof item.items) || Array.isArray(item.items))
  )
    throw Error(`array field ${key} should provide a valid items object`)

  if (item.type == 'enum') {
    const properties: { type: 'string'; nullable?: boolean; enum?: string[] } = { type: 'string' }
    properties.enum = item.values
    if (typeof item.nullable == 'boolean') properties.nullable = item.nullable
    return properties
  }

  if (item.type == 'object') {
    const properties = bodyToOpenAPI(item.props)
    if (typeof item.nullable == 'boolean') (properties as any).nullable = item.nullable
    return properties
  }

  if (item.type == 'array') {
    const properties: { type: string; items: any; nullable?: boolean } = { type: 'array', items: {} }
    if (typeof item.items == 'string') {
      properties.items = { type: item.items }
      if (item.items == 'string' && Array.isArray(item.enum)) properties.items.enum = item.enum
    } else {
      properties.items = convertItem(`${key}.$`, item.items as any)
    }
    if (typeof item.nullable == 'boolean') properties.nullable = item.nullable
    return properties
  }

  const properties: { type: string; enum?: string[]; nullable?: boolean } = { type: item.type }
  if (item.type == 'string' && item.enum && Array.isArray(item.enum)) properties.enum = item.enum
  if (typeof item.nullable == 'boolean') properties.nullable = item.nullable
  return properties
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

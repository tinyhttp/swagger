'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function createBodySub(schema, contentType = 'application/json') {
    if (!schema || Object.keys(schema).length == 0)
        return {};
    const content = {};
    content[contentType] = { schema: bodyToOpenAPI(schema) };
    return {
        required: true,
        content,
    };
}
function createParameterSubs(parameters) {
    const query = parameters.query;
    const params = parameters.params;
    const headers = parameters.headers;
    let querySubs = [];
    let paramSubs = [];
    let headerSubs = [];
    if (query)
        querySubs = schemaToOpenAPI(query, 'query');
    if (params)
        paramSubs = schemaToOpenAPI(params, 'path');
    if (headers)
        headerSubs = schemaToOpenAPI(headers, 'header');
    return [...querySubs, ...paramSubs, ...headerSubs];
}
function bodyToOpenAPI(schema) {
    const names = Object.keys(schema);
    const required = names.filter(n => {
        if (typeof schema[n] == 'string') {
            return true;
        }
        return !!!schema[n]['optional'];
    });
    const properties = names.map(n => {
        if (typeof schema[n] == 'string') {
            const tmp = {};
            tmp[n] = { type: schema[n] };
            return tmp;
        }
        if (schema[n]['type'] == 'array') {
            const tmp = {};
            tmp[n] = {
                type: 'array',
                items: { type: schema[n]['items'] },
            };
            return tmp;
        }
        const tmp = {};
        tmp[n] = { type: schema[n]['type'] };
        return tmp;
    });
    return { type: 'object', required, properties };
}
function schemaToOpenAPI(schema, origin) {
    const names = Object.keys(schema);
    const subs = names.map(n => {
        if (typeof schema[n] == 'string') {
            return {
                in: origin,
                required: true,
                name: n,
                schema: { type: schema[n] },
            };
        }
        const details = schema[n];
        return {
            in: origin,
            required: !!!details.optional,
            name: n,
            schema: { type: details.type },
        };
    });
    return subs;
}

function addToDocs(schema) {
    const mw = async (_req, _res, next) => {
        next();
    };
    mw.schema = schema;
    return mw;
}
function generateDocs(app) {
    const routes = app.middleware
        .filter(mw => mw.type == 'route' && mw.handler.schema)
        .map(route => {
        return {
            path: route.path.replace(/:(?<param>[A-Za-z0-9_]+)/g, '{$<param>}'),
            schema: route.handler.schema,
            method: route.method,
        };
    });
    const uniquePathsSet = new Set(routes.map(r => r.path));
    const uniquePaths = Array.from(uniquePathsSet.keys());
    const docs = uniquePaths.map(path => {
        const merged = routes
            .filter(route => route.path == path)
            .map(route => {
            const tmp = {};
            tmp[path] = {};
            tmp[path][route.method.toLowerCase()] = {
                parameters: createParameterSubs({
                    headers: route.schema.headers,
                    params: route.schema.params,
                    query: route.schema.query,
                }),
                requestBody: createBodySub(route.schema.body),
            };
            return tmp;
        });
        return merged;
    });
    return docs;
}

exports.addToDocs = addToDocs;
exports.generateDocs = generateDocs;

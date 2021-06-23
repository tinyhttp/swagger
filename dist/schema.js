"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createParameterSubs = exports.createBodySub = void 0;
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
exports.createBodySub = createBodySub;
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
exports.createParameterSubs = createParameterSubs;
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

import { createBodySub, createParameterSubs } from './schema';
export function addToDocs(schema) {
    const mw = async (_req, _res, next) => {
        next();
    };
    mw.schema = schema;
    return mw;
}
export function generateDocs(app) {
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

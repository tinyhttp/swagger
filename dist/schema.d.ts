export declare type parameters = {
    headers?: schema;
    params?: schema;
    query?: schema;
};
export declare type origin = 'header' | 'query' | 'path';
export declare type schema = {
    [_: string]: 'number' | 'string' | {
        type: 'number' | 'string';
        optional?: boolean;
        [_: string]: any;
    };
};
export declare type body = {
    [_: string]: 'boolean' | 'number' | 'string' | {
        type: 'boolean' | 'number' | 'string';
        optional?: boolean;
        [_: string]: any;
    } | {
        type: 'array';
        items: 'boolean' | 'string' | 'number';
        optional?: boolean;
        [_: string]: any;
    };
};
export declare type contentType = 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'application/json';
export declare function createBodySub(schema: body, contentType?: contentType): {
    required?: undefined;
    content?: undefined;
} | {
    required: boolean;
    content: {
        [_: string]: {
            schema: any;
        };
    };
};
export declare function createParameterSubs(parameters: parameters): any[];

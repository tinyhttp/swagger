import { body, parameters } from './schema';
import { App, Request, Response, NextFunction } from '@tinyhttp/app';
export declare function addToDocs(schema: parameters & {
    body?: body;
}): {
    (_req: Request, _res: Response, next: NextFunction): Promise<void>;
    schema: parameters & {
        body?: body;
    };
};
export declare function generateDocs(app: App): {
    [_: string]: any;
}[][];

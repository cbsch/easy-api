/// <reference types="express-serve-static-core" />
import * as express from 'express';
import { GeneratedModel } from '.';
export declare type ExpressMiddleware = (name: string) => (req: express.Request, res: Express.Response, next: express.NextFunction) => Promise<void | express.Response> | void;
export interface RouteFactoryOptions {
    middleware?: {
        get?: ExpressMiddleware;
        post?: ExpressMiddleware;
        put?: ExpressMiddleware;
        delete?: ExpressMiddleware;
    };
    getUserId?: (req: express.Request) => Promise<number>;
}
export declare function useRoutes(model: {
    [key: string]: GeneratedModel<any>;
}, options?: RouteFactoryOptions): express.Router;
export default function routeFactory(options?: RouteFactoryOptions): (model: GeneratedModel<any>) => express.Router;

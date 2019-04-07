
import * as express from 'express';
import * as debugFactory from 'debug'
const debug = debugFactory('fast-rest:routes')

import { GeneratedModel, SelectArgs } from './model'

export type ExpressMiddleware = (name: string) => (req: express.Request, res: Express.Response, next: express.NextFunction) => Promise<void | express.Response> | void

export interface RouteFactoryOptions {
    middleware?: {
        get?: ExpressMiddleware
        post?: ExpressMiddleware
        put?: ExpressMiddleware
        delete?: ExpressMiddleware
    }
}

export function useRoutes(model: {[key: string]: GeneratedModel<{}>}): express.Router {
    const router = express.Router()
    const route = routeFactory()
    Object.keys(model).map(m => router.use('/', route((model as any)[m])))
    return router
}

export default function routeFactory(options?: RouteFactoryOptions) {

    const nullMiddlewareGenerator: ExpressMiddleware = (name) => { return (req, res, next) => { return next(); }}

    options = options || {}
    options.middleware = options.middleware || {}
    options.middleware.get = options.middleware.get || nullMiddlewareGenerator
    options.middleware.post = options.middleware.post || nullMiddlewareGenerator
    options.middleware.put = options.middleware.put || nullMiddlewareGenerator
    options.middleware.delete = options.middleware.delete || nullMiddlewareGenerator

    return function generate(model: GeneratedModel<any>): express.Router {
        const router = express.Router()
        const def = model.definition
        const middleware = options.middleware

        debug(`generating routes for ${model.definition.name}`)

        router.get(`/${def.name}`, middleware.get(def.name), async (req, res) => {
            try {
                debug(`GET ${def.name}`)

                const split = req.url.split('?')
                let query = ''
                if (split.length > 1) {
                    query = split[1]
                }

                const result = await model.find(query)
                return res.status(200).json({
                    status: 'ok',
                    data: result,
                    message: `returned ${result.length} ${def.name}`
                })
            } catch (err) {
                debug(err)
                return res.status(500).json(err)
            }
        })

        router.post(`/${def.name}`, middleware.post(def.name) , async (req, res) => {
            try {
                debug(`POST ${def.name}`)
                const data = req.body
                const result = await model.insert(data)
                return res.status(200).json({
                    status: 'ok',
                    data: result
                })
            } catch (err) {
                debug(err)
                return res.status(500).json(err)
            }
        })

        router.put(`/${def.name}`, middleware.put(def.name), async (req, res) => {
            try {
                debug(`POST ${def.name}`)
                const data = req.body
                const result = await model.update(data)
                return res.status(200).json({
                    status: 'ok',
                    data: result
                })
            } catch (err) {
                debug(err)
                return res.status(500).json(err)
            }
        })

        router.delete(`/${def.name}`, middleware.delete(def.name), async (req, res) => {
            try {
                debug(`DELETE ${def.name}`)
                const data = req.body
                const result = await model.delete(data.id)
                return res.status(200).json({
                    status: 'ok',
                    data: result
                })
            } catch (err) {
                debug(err)
                return res.status(500).json(err)
            }
        })

        return router
    }
}

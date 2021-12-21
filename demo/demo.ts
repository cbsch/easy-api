import * as pgpLib from 'pg-promise'
import * as express from 'express'
import modelWrapper, { useRoutes, createSocketServer, Table } from '../src';
import { generatedModel as model } from '../src/model';
import { AddressInfo } from 'net';
import * as http from 'http'


export interface Login {
    id: number
    name: string
}
export const loginTable: Table<Partial<Login>> = {
    name: 'login',
    columns: [{
        name: 'name',
        type: 'string'
    }]
}

export interface Audit {
    id: number
    name: string
    created_by_id: number
    modified_by_id: number
}

export const auditTable: Table<Partial<Audit>> = {
    name: 'audit',
    audit: 'login',
    columns: [{
        name: 'name',
        type: 'string'
    }]
}

export const complexTable: Table<any> = {
    name: 'complex',
    audit: 'login',
    columns: [{
        name: 'name',
        type: 'string'
    }, {
        name: 'value',
        type: 'number'
    }, {
        name: 'enabled',
        type: 'boolean'
    }, {
        name: 'timestamp',
        type: 'date'
    }, {
        name: 'uuid',
        type: 'uuid'
    }, {
        name: 'default_false',
        type: 'boolean',
        default: 'false'
    }]

}


const setupDb = async () => {
    const config = require('../config').config

    const pgp = pgpLib();
    const db = pgp(config);
    const modelFactory = modelWrapper(db as any)

    const login = modelFactory(loginTable)
    const audit = modelFactory(auditTable)
    const complex = modelFactory(complexTable)

    for (var i = 0, keys = Object.keys(model).reverse(); i < keys.length; i++) {
        await ((model as any)[keys[i]].drop())
    }

    for (var i = 0, keys = Object.keys(model); i < keys.length; i++) {
        await ((model as any)[keys[i]].create())
    }

    await login.insert({ name: 'Test User' })
}

const setupRoutes = async () => {
    const routeOpts = {
        getUserId: async (req: express.Request) => {
            const userId = req.body.userid
            // await login.find("")

            return userId ? userId : 1000
        }
    }

    return useRoutes(model, routeOpts)
}

(async () => {
    await setupDb()

    let port = 8092

    const app = express()
    app.use(express.json({ limit: '1mb' }) as any)

    app.use('/api', await setupRoutes())

    const server = http.createServer(app)

    createSocketServer(server)

    server.on('listening', () => {
        port = (server.address() as AddressInfo).port
        console.log(`listening on port ${port}`)
    })
    server.listen(port)
})()
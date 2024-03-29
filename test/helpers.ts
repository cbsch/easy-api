import * as express from 'express'
import * as pgpLib from 'pg-promise'
import modelWrapper, { useRoutes, createSocketServer } from '../src';
import { auditTable, loginTable, complexTable } from './data.test';
import { generatedModel as model } from '../src/model';
import { startDb, stopDb } from './docker'
import * as path from 'path'
import writeClientApi from '../src/integration/ts-client-api/generate-ts-client-api';
import db from './db'

import * as http from 'http'

import 'chai-http'
import * as chai from 'chai'
const should = chai.should()
// import bodyParser = require('body-parser');
import { AddressInfo } from 'net';


let port: number = 8092
export function url() {
    return `http://localhost:${port}/api/`
}

export function wsurl() {
    return `ws://localhost:${port}/socket-api`
}

export async function genericBefore() {
    await cleanDb(db)
}

export function range(a: number, b: number) {
    let result: number[] = []
    for(let i: number = a; i < b; i++) {
        result = [...result, i]
    }
    return result
}

export async function cleanDb(db: pgpLib.IDatabase<any>) {
    for (var i = 0, keys = Object.keys(model).reverse(); i < keys.length; i++) {
        await ((model as any)[keys[i]].drop())
    }

    for (var i = 0, keys = Object.keys(model); i < keys.length; i++) {
        await ((model as any)[keys[i]].create())
    }
}

// const config = require('../config').config

const modelFactory = modelWrapper(db as any)

export const login = modelFactory(loginTable)
export const audit = modelFactory(auditTable)
export const complex = modelFactory(complexTable)

const routeOpts = {
    getUserId: async (req: express.Request) => {
        const userId = req.body.userid
        await login.find("")

        return userId ? userId : 100
    }
}

const app = express()
app.use(express.json({limit: '1mb'}) as any)

const apiRoutes = useRoutes(model, routeOpts)
app.use('/api', apiRoutes)

const server = http.createServer(app)
createSocketServer(server)

export const init = () => {
    return new Promise<void>(async (resolve, reject) => {
        try {
            try {
                await startDb()
            } catch {}

            for (var i = 0, keys = Object.keys(model); i < keys.length; i++) {
                await ((model as any)[keys[i]].create())
            }

            await db.query(`INSERT INTO login(id, name) VALUES(100, 'test')`)

            let modelList = Object.keys(model).map(k => model[k])
            writeClientApi(modelList, path.join(__dirname, '/gen/api'))

            server.on('listening', () => {
                port = (server.address() as AddressInfo).port
                console.log(`listening on port ${port}`)
                resolve()
            })
            server.listen(port)
        } catch (ex) {
            console.log(ex)
            // try { await stopDb() } catch { }
            reject(ex)
        }
    })
}

export const stop = async () => {
    server.close()
    await stopDb()
    process.exit(0)
}

before(function () {
    this.timeout(0)
    return init()
})

after(async function () {
    await stop()
})


import apiGenerator, { socketApi as socketApiGenerator} from './gen/api'
export const api = apiGenerator({url: url()})
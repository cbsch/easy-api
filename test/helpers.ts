import * as pgpLib from 'pg-promise'
import * as express from 'express'
import modelWrapper, { useRoutes, createSocketServer } from '../src';
import { auditTable, loginTable, complexTable } from './data.test';
import { generatedModel as model } from '../src/model';

import * as http from 'http'

import 'chai-http'
import * as chai from 'chai'
const should = chai.should()
import bodyParser = require('body-parser');
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

const config = require('../config').config

const pgp = pgpLib();
export const db = pgp(config);
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

before(function () {
    return new Promise<void>((resolve, reject) => {
        try {
            server.on('listening', () => {
                port = (server.address() as AddressInfo).port
                console.log(`listening on port ${port}`)
                resolve()
            })
            server.listen(port)
        } catch(ex) {
            reject(ex)
        }
    })
})

after(function(done) {
    server.close()
    done()
    process.exit(0)
})


import apiGenerator, { socketApi as socketApiGenerator} from './gen/api'
export const api = apiGenerator({url: url()})
import * as pgpLib from 'pg-promise'
import * as express from 'express'
import modelWrapper, { useRoutes } from '../src';
import { auditTable, loginTable, Login, Audit, complexTable } from './data.test';
import { generatedModel as model } from '../src/model';
import * as path from 'path'

import * as http from 'http'

import 'chai-http'
import * as chai from 'chai'
const should = chai.should()
import bodyParser = require('body-parser');



export function url() {
    return "http://localhost:9999/api/"
}



export async function cleanDb(db: pgpLib.IDatabase<any>) {

    return new Promise(async (resolve, reject) => {
        try {
            for (var i = 0, keys = Object.keys(model).reverse(); i < keys.length; i++) {
                await ((model as any)[keys[i]].drop())
            }

            for (var i = 0, keys = Object.keys(model); i < keys.length; i++) {
                await ((model as any)[keys[i]].create())
            }
            resolve()
        } catch (ex) {
            reject(ex)
        }
    })
}

const config = require('../config').config

const pgp = pgpLib();
export const db = pgp(config);
const modelFactory = modelWrapper(db as any)

export const login = modelFactory(loginTable)
export const audit = modelFactory(auditTable)
export const complex = modelFactory(complexTable)


const routeOpts = {getUserId: async (req: express.Request) => {
    const userId = req.body.userid
    await login.find("")

    return userId ? userId : 100
}}

const app = express()
app.use(bodyParser.json({limit: '1mb'}))

const apiRoutes = useRoutes(model, routeOpts) 
app.use('/api', apiRoutes)

const server = http.createServer(app)

before(async function () {
    return new Promise(async (resolve, reject) => {
        try {
            server.on('listening', () => {
                resolve();
            })
            server.listen(9999)
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

let modelList = Object.keys(model).map(k => model[k])

import writeCodeFile from '../src/interface/ts-client-api/generate-ts-client-api';
writeCodeFile(modelList, path.join(__dirname, '/gen/api'))
import apiGenerator from './gen/api'
export const api = apiGenerator({url: url()})


export function range(a: number, b: number) {
    let result: number[] = []
    for(let i: number = a; i < b; i++) {
        result = [...result, i]
    }
    return result
}
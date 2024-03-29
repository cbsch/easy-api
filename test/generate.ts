import * as path from 'path'
import { generatedModel as model } from '../src/model';
import writeClientApi from '../src/integration/ts-client-api/generate-ts-client-api';
import { auditTable, loginTable, complexTable } from './data.test';
import * as pgpLib from 'pg-promise'
import modelWrapper from '../src';
import { getDbConfig } from './docker'

const config = getDbConfig()

const pgp = pgpLib();
export const db = pgp({
    host: 'localhost',
    port: config.port,
    password: config.password
});
// const config = require('../config').config

// const pgp = pgpLib();
// export const db = pgp(config);
const modelFactory = modelWrapper(db as any)
export const login = modelFactory(loginTable)
export const audit = modelFactory(auditTable)
export const complex = modelFactory(complexTable)

let modelList = Object.keys(model).map(k => model[k])
writeClientApi(modelList, path.join(__dirname, '/gen/api'))
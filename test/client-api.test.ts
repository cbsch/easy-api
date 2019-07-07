import { generatedModel as model } from '../src/model';
import * as chai from 'chai'
import { generateApiCode } from '../src/interface/ts-client-api/generate-ts-client-api'
chai.should()

describe('generateApiCode', () => {
    it('should generate correct output', done => {
        let modelList = Object.keys(model)
            .filter(k => ['login', 'audit']
            .includes(k)).map(k => model[k])
        const apiCode = generateApiCode(modelList).get()

        apiCode.should.eql(`import {
    login,
    audit,
} from './interfaces'
import generateApi, { ApiOptions } from './generated-api-lib'

export default (options?: ApiOptions) => {
    return {
        login: generateApi<login>('login', options),
        audit: generateApi<audit>('audit', options),
    }
}
`)

        done()
    })
})

import 'chai-http'
chai.should()
chai.use(require('chai-http'))
import { api, range } from './helpers'

describe('client api (login)', () => {
    const name = 'client-api-login-should-post'
    it('should post', async () => {
        const data = await api.login.insert({name: name})
        data.should.have.property('id').eql(1000)
        data.should.have.property('name').eql(name)
    })
    it('should work', async () => {
        const data = await api.login.getById(1000)
        data.should.have.property('id').eql(1000)
        data.should.have.property('name').eql(name)
    })
})

describe('client api (complex)', () => {
    const nameBase = 'client-api-complex-should-post'
    const values = range(10, 20).map(v => {
        return {
            name: `${nameBase}-${v}`,
            value: v
        }
    })
    it('should post', async () => {
        (await Promise.all(values.map(async value => {
            return Promise.resolve({
                data: value,
                res: await api.complex.insert(value)
            })
        }))).map(o => {
            o.res.should.have.property('name').eql(o.data.name)
            o.res.should.have.property('value').eql(o.data.value)
        })

    })

    it ('should get', async () => {
    })

})
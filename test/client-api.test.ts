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
} from './model-interfaces'
import {
    loginQueryBuilder,
    auditQueryBuilder,
} from './query-interfaces'
import generateApi, { ApiOptions } from './generated-api-lib'

export default (options?: ApiOptions) => {
    return {
        login: generateApi<login, loginQueryBuilder<login>>('login', options),
        audit: generateApi<audit, auditQueryBuilder<audit>>('audit', options),
    }
}

import generateSocketApi, { WSApiOptions } from './generated-ws-api-lib'

export const socketApi = (options?: WSApiOptions) => {
    return {
        login: generateSocketApi<login, loginQueryBuilder<login>>('login', options),
        audit: generateSocketApi<audit, auditQueryBuilder<audit>>('audit', options),
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
    const values = range(10, 90).map(v => {
        return {
            name: `${nameBase}-${v}`,
            value: v
        }
    })
    it('should post', async () => {
        ;(await Promise.all(values.map(async value => {
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
        await api.complex.insert({name: 'test-name1', enabled: true, timestamp: (new Date), uuid: 'a1b48147-7d82-4e6a-85f8-474287e87e51'})
        await api.complex.insert({name: 'test-name2', enabled: false, timestamp: (new Date), uuid: 'a5446517-26e7-4d57-ae55-0ca27aa9472d'})
        const res1 = (await api.complex.query().filter.name.eq(`test-name1`).get())[0]
        res1.should.have.property('name').eql('test-name1')
        res1.should.have.property('default_false').eql(false)
        res1.should.have.property('uuid').eql('a1b48147-7d82-4e6a-85f8-474287e87e51')

        const res2 = (await api.complex.query().filter.name.eq(`test-name2`).get())[0]
        res2.should.have.property('name').eql('test-name2')
        res2.should.have.property('default_false').eql(false)
        res2.should.have.property('uuid').eql('a5446517-26e7-4d57-ae55-0ca27aa9472d')

        const res3 = (await api.complex.query().filter.created_by_id.eq(100).get())
    })

    it ('should put a partial record', async () => {
        await api.complex.update({id: 1000, name: 'updated'})
    })
})
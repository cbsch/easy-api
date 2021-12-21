
import * as chai from 'chai'
import 'chai-http'
chai.should()
chai.use(require('chai-http'))
import { wsurl, range, db, cleanDb, genericBefore } from './helpers'


// Setup some stuff in the global object that the socket api requires
// declare global {
//     namespace NodeJS {
//         interface Global {
//             WebSocket: WebSocket
//             window: {}
//         }
//     }
// }

// global['WebSocket'] = require('ws')
// global['window'] = { onbeforeunload: null }


import { socketApi as socketApiGenerator } from './gen/api'
const api = socketApiGenerator({url: wsurl()})

describe('socket client api (login)', () => {
    before(genericBefore)
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

describe('socket client api (complex)', () => {
    before(genericBefore)
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
        await api.complex.insert({name: 'test-name1', enabled: true, timestamp: (new Date)})
        await api.complex.insert({name: 'test-name2', enabled: false, timestamp: (new Date)})
        const res1 = (await api.complex.query().filter.name.eq(`test-name1`).get())[0]
        res1.should.have.property('name').eql('test-name1')

        const res2 = (await api.complex.query().filter.name.eq(`test-name2`).get())[0]
        res2.should.have.property('name').eql('test-name2')

        const res3 = (await api.complex.query().filter.created_by_id.eq(100).get())
    })

    it ('should put a partial record', async () => {
        await api.complex.update({id: 1000, name: 'updated'})
    })
})
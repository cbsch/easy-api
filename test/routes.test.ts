import { Login, Audit } from './data.test';
import { cleanDb, db, login, url } from './helpers';
import 'chai-http'
import * as chai from 'chai'
chai.should()
chai.use(require('chai-http'))



describe('login', () => {
    before(async () => {
        return new Promise(async (resolve, reject) => {
            try {
                await cleanDb(db)
                await login.insert({ name: 'Test User' })
                resolve()
            } catch (ex) {
                reject(ex)
            }
        })
    })
    it('should post', async () => {
        return new Promise(async (resolve, reject) => {
            try {
                const loginData: Partial<Login> = {
                    name: 'Another User'
                }

                const res = await chai.request(url()).post('login').send(loginData)
                res.should.have.status(200)
                const data = res.body.data
                data.should.have.property('name').eql('Another User')
                data.should.have.property('id').eql(1001)
                resolve()

            } catch (ex) {
                reject(ex)
            }
        })
    })

    it('should put', async () => {
        return new Promise(async (resolve, reject) => {
            try {
                const loginData: Partial<Login> = {
                    id: 1001,
                    name: 'Another McUser'
                }
                const res = await chai.request(url()).put('login').send(loginData)
                res.should.have.status(200)
                const data = res.body.data
                data.should.have.property('name').eql('Another McUser')
                data.should.have.property('id').eql(1001)
                resolve()
            } catch (ex) {
                reject(ex)
            }
        })
    })
    it('should get', async () => {
        return new Promise(async (resolve, reject) => {
            try {
                const res = await chai.request(url()).get('login?filters=id[1000,1001]')
                res.should.have.status(200)
                const data = res.body.data
                data.should.have.length(2)
                resolve()

            } catch (ex) {
                reject(ex)
            }
        })
    })
})

describe('audit', () => {
    before(async () => {
        return new Promise(async (resolve, reject) => {
            try {
                await cleanDb(db)
                await db.any(`
                        INSERT INTO login(name, id) VALUES('Create User', 100);
                        INSERT INTO login(name, id) VALUES('Update User', 101);
                        `)
                resolve()
            } catch (ex) {
                reject(ex)
            }
        })
    })

    it('should post', async () => {
        return new Promise(async (resolve, reject) => {
            try {
                const auditData: Partial<Audit> = {
                    name: 'TestRow'
                }

                const res = await chai.request(url()).post('audit').send(auditData)
                res.should.have.status(200)
                const data = res.body.data
                data.should.have.property('name').eql('TestRow')
                data.should.have.property('id').eql(1000)
                data.should.have.property('modified_by_id').eql(100)
                data.should.have.property('created_by_id').eql(100)
                resolve()

            } catch (ex) {
                reject(ex)
            }
        })
    })

    it('should put', async () => {
        return new Promise(async (resolve, reject) => {
            try {
                const auditData: Partial<Audit> = {
                    id: 1000,
                    name: 'TestRow'
                }

                const res = await chai.request(url()).put('audit').send({ ...auditData, userid: 101 })
                res.should.have.status(200)
                const data = res.body.data
                data.should.have.property('name').eql('TestRow')
                data.should.have.property('id').eql(1000)
                data.should.have.property('modified_by_id').eql(101)
                data.should.have.property('created_by_id').eql(100)
                resolve()

            } catch (ex) {
                reject(ex)
            }
        })
    })

    it('should get', async () => {
        return new Promise(async (resolve, reject) => {
            try {
                const res = await chai.request(url()).get('audit?filters=id=1000&relations')
                res.should.have.status(200)
                const data = res.body.data[0]
                const created_by = data.relations.created_by
                const modified_by = data.relations.modified_by
                data.should.have.property('name').eql('TestRow')
                data.should.have.property('id').eql(1000)
                data.should.have.property('modified_by_id').eql(101)
                data.should.have.property('created_by_id').eql(100)
                created_by.should.have.property('name').eql('Create User')
                created_by.should.have.property('id').eql(100)
                modified_by.should.have.property('name').eql('Update User')
                modified_by.should.have.property('id').eql(101)
                resolve()

            } catch (ex) {
                reject(ex)
            }
        })
    })
})
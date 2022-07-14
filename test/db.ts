import * as pgpLib from 'pg-promise'

const getDbConfig = () => {
    return {
        containerName: 'testname',
        port: 6543,
        user: 'postgres',
        password: 'testpass'
    }
}

const config = getDbConfig()
const pgp = pgpLib();

export default pgp({
    host: 'localhost',
    port: config.port,
    user: config.user,
    password: config.password
});
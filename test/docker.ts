import { promisify } from 'util'
import { randomBytes } from 'crypto'
import * as child_process from 'child_process'
import db from './db'
const exec = promisify(child_process.exec)

async function checkDocker() {
    try {
        const result = await exec('docker system info')

        if (result.stdout.match(/Client:/)) {
            return true
        } else {
            throw result.stderr
        }
    } catch (err) {
        console.log(`failed to run docker: ${err}`)
        process.exit(1)
    }
}

function memoize<T>(func: () => T): () => T {
    var memo: any = {};
    var slice = Array.prototype.slice;

    return function () {
        var args = slice.call(arguments);

        if (args in memo)
            return memo[args];
        else
            return (memo[args] = func.apply(this, args));
    }
}

interface Config {
    containerName: string,
    port: number,
    user: string
    password: string
}

// export const getDbConfig = memoize<Config>(() => {
//     // return {
//     //     containerName: randomBytes(8).toString("hex"),
//     //     port: 6543,
//     //     password: randomBytes(16).toString("hex")
//     // }
//     return {
//         containerName: 'testname',
//         port: 6543,
//         user: 'postgres',
//         password: 'testpass'
//     }
// })
export const getDbConfig = () => {
    // return {
    //     containerName: randomBytes(8).toString("hex"),
    //     port: 6543,
    //     password: randomBytes(16).toString("hex")
    // }
    return {
        containerName: 'testname',
        port: 6543,
        user: 'postgres',
        password: 'testpass'
    }
}

export async function startDb() {
    try {
        await checkDocker()

        const config = getDbConfig()

        const args = [
            "run",
            "--rm",
            "-d",
            `-p ${config.port}:5432`,
            `-e POSTGRES_PASSWORD=${config.password}`,
            `--name ${config.containerName}`,
            "postgres:14"
        ]

        await exec(`docker ${args.join(' ')}`)


        // const pgp = pgpLib()
        // const db = pgp({
        //     host: 'localhost',
        //     port: config.port,
        //     user: config.user,
        //     password: config.password
        // });

        const sleep = async (ms: number) => {
            return new Promise<void>(resolve => setTimeout(() => { resolve() }, ms))
        }

        let ready = false
        while (!ready) {
            try {
                await db.query(`SELECT * FROM pg_database`)
                ready = true
            } catch (err) {
                if (err.toString().match(/Error: Connection terminated unexpectedly/)) {
                    await sleep(100)
                } else if (err.toString().match(/error: the database system is starting up/)) {
                    await sleep(100)
                } else {
                    console.log(err)
                    ready = true
                }
            }
        }
    } catch (err) {
        throw err
    }
}

export async function stopDb() {
    try {
        await exec(`docker rm --force ${getDbConfig().containerName}`)
    } catch (err) {
        console.log(`failed to stop container: ${err}`)
    }
}

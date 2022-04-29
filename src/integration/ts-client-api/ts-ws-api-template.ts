import { queryBuilderFactory, QueryBuilder } from "./query";
import { Table } from "./interfaces";

let socket: WebSocket = null
const messageQueue: object[] = []
const requests: {[id: string]: (data: object) => void} = {}
type Method = "GET" | "PUT" | "POST" | "DELETE"
let nextRequestId = 0
let _options: WSApiOptions = null



export type Request = (item: string, query: string, method: Method, data?: any) => Promise<any>
export interface WSApiOptions {
    url: string
    errorHandler?: (error: any) => void
}

function ensureSocketConnection() {
    // Return immediately if the socket is in an acceptable state
    if (socket && socket.readyState !== socket.CLOSED && socket.readyState !== socket.CLOSING) {
        return
    }

    const url = _options.url
    //const path = '/socket-api'
    //const url = `wss://${window.location.hostname}${window.location.port ? ':'+window.location.port : ''}${path}`

    socket = new WebSocket(url)

    socket.onopen = ev => {
        flushMessageQueue()
    }

    socket.onmessage = ev => {
        const res = JSON.parse(ev.data) as {id: string, data: object}
        if (undefined !== res.id) {
            requests[res.id](res.data)
            delete requests[res.id]
        }
    }

    socket.onclose = ev => {
        // Try to reconnect if the socket closes
        ensureSocketConnection()
    }

    window.onbeforeunload = (ev: any) => {
        // Close the connection when the window unloads
        socket.close();
    }
}

function flushMessageQueue() {
    if (socket.readyState !== socket.OPEN) { return }

    while (messageQueue.length > 0) {
        const message = messageQueue.shift()
        socket.send(JSON.stringify(message))
    }
}

export const requestFactory = (options?: WSApiOptions): Request => {
    return async (item: string, query: string, method: Method, data?: object) => {
        ensureSocketConnection()
        return new Promise((resolve, reject) => {
            try {
                const id = nextRequestId++

                requests[id] = data => {
                    resolve(data)
                }

                // Remove the leading ? from the query
                if (query) {
                    query = query.substring(1)
                }

                const message = {
                    method: method,
                    item: item,
                    query: query,
                    id: id,
                    data: data
                }

                messageQueue.push(message)

                flushMessageQueue()

                const timeout = 2000
                setTimeout(() => {
                    reject(`${method} ${item} with query ${query} timed out after ${timeout}ms`)
                }, timeout)
            } catch (err) {
                if (options && options.errorHandler) {
                    options.errorHandler(err)
                } else {
                    throw err
                }
            }
        })
    }
}

const modelList: Table<any>[] = require('./models.json')

export default function generateApi<T, QB extends QueryBuilder<T>>(modelName: string, options?: WSApiOptions) {
    _options = options
    ensureSocketConnection()
    const request = requestFactory(options)
    const table = modelList.filter(t => t.name === modelName)[0] as Table<T>
    return {
        get: getFactory<T>(modelName, request),
        getById: getByIdFactory<T>(modelName, request),
        update: updateFactory<T>(modelName, request),
        insert: insertFactory<T>(modelName, request),
        remove: removeFactory<T>(modelName, request),
        query: queryBuilderFactory<T, QB>(table, (query) => { return getFactory<T>(modelName, request)(query) }),
    }
}

function getByIdFactory<T>(modelName: string, request: Request) {
    return (id: number): Promise<T> => {
        return new Promise<T>(async (resolve, reject) => {
            try {
                const response = await request(modelName, 'filters=id=' + id, 'GET')
                resolve(response[0])
            } catch(err) {
                reject(err)
            }
        })
    }
}

function getFactory<T>(modelName: string, request: Request) {
    return (query?: string): Promise<T[]> => {
        return new Promise<T[]>(async (resolve, reject) => {
            try {
                const response = await request(modelName, query, 'GET')
                if (!response) { return }
                const data: T[] = response
                resolve(data)
            } catch (err) {
                reject(err)
            }
        })
    }
}

function removeFactory<T>(modelName: string, request: Request) {
    return (data: T): Promise<T> => {
        return new Promise<T>(async (resolve, reject) => {
            try {
                const response = await request(modelName, undefined, 'DELETE', data)
                resolve(response)
            } catch (err) {
                reject(err)
            }
        })
    }
}

function insertFactory<T>(modelName: string, request: Request) {
    return (data: T): Promise<T> => {
        return new Promise<T>(async (resolve, reject) => {
            try {
                const response = await request(modelName, undefined, 'POST', data)
                resolve(response)
            } catch (err) {
                reject(err)
            }
        })
    }
}

function updateFactory<T>(modelName: string, request: Request) {
    return (data: T): Promise<T> => {
        return new Promise<T>(async (resolve, reject) => {
            try {
                const response = await request(modelName, undefined, 'PUT', data)
                resolve(response)
            } catch (err) {
                reject(err)
            }
        })
    }
}

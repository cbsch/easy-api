import Axios, { Method, AxiosResponse } from "axios";

export type Request = (url: string, method: Method, data?: any) => Promise<AxiosResponse<any>>
export interface ApiOptions {
    url?: string
    headers?: Headers
    errorHandler?: (error: any) => void
}

export const requestFactory = (options?: ApiOptions): Request => {
    return async (url: string, method: Method, data?: object) => {
        try {
            if (options && options.url) {
                url = options.url + url
            }

            let headers = {}
            if (options && options.headers) {
                headers = options.headers
            }

            const res = await Axios.request({
                method: method,
                url: url,
                headers: headers,
                data: data
            })

            return res
        } catch (err) {
            if (options && options.errorHandler) {
                options.errorHandler(err)
            } else {
                throw err
            }
        }
    }
}

const modelList = require('models.json')


export default function generateApi<T>(modelName: string, options?: ApiOptions) {
    const request = requestFactory(options)

    console.log('test')
    console.log(require('./models.json'))
    console.log('test')

    return {
        get: getFactory<T>(modelName, request),
        getById: getByIdFactory<T>(modelName, request),
        update: updateFactory<T>(modelName, request),
        insert: insertFactory<T>(modelName, request),
        remove: removeFactory<T>(modelName, request),
        //query: queryBuilderFactory()
    }
}

function getByIdFactory<T>(modelName: string, request: Request) {
    return (id: number): Promise<T> => {
        return new Promise<T>(async (resolve, reject) => {
            try {
                const response = await request(modelName + '/?filters=id=' + id, 'get')
                resolve(response.data.data[0])
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
                var path = modelName
                if (query) {
                    path += query
                }
                const response = await request(path, 'get')
                if (!response) { return }
                //console.log(`GET ${path} : ${response.status}`)
                const data: T[] = response.data.data
                resolve(data)
            } catch (err) {
                console.log(`GET ${path} : ${err.status}`)
                //reject(err)
                resolve([])
            }
        })
    }
}

function removeFactory<T>(modelName: string, request: Request) {
    return (data: T): Promise<T> => {
        return new Promise<T>(async (resolve, reject) => {
            try {
                const url = modelName
                console.log(url)
                const response = await request(url, 'delete', data)
                resolve(response.data.data)
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
                var path = modelName
                const response = await request(path, 'post', data)
                resolve(response.data.data)
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
                const response = await request(modelName, 'put', data)
                resolve(response.data.data)
            } catch (err) {
                reject(err)
            }
        })
    }
}

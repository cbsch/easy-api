import * as https from 'https'
import * as http from 'http'
import * as WebSocket from 'ws'
import { Request } from 'express'
import { generatedModel } from './model';
import { GeneratedModel } from '.';


const socketServer = new WebSocket.Server({ noServer: true })

export default function createSocketServer(httpServer: https.Server | http.Server) {
    httpServer.on('upgrade', (request: Request, socket, head, ...args) => {
        const pathname = request.url

        if (pathname === '/socket-api') {
            socketServer.handleUpgrade(request, socket, head, ws => {
                socketServer.emit('connection', ws, request)
            })
        }
    })
}

interface WebSocketEx extends WebSocket {
    isAlive: boolean
    id: symbol
}


socketServer.on('connection', (ws: WebSocketEx) => {
    ws.id = Symbol()
    ws.send(JSON.stringify({message: 'welcome, client'}))
    ws.isAlive = true
    ws.on('message', msg => {
        onMessage(ws, msg)
    })
})

function sendError(ws: WebSocketEx, message: string) {
    ws.send(JSON.stringify({
        error: message
    }))
}

function sendData(ws: WebSocketEx, req: Protocol, data: object) {
    ws.send(JSON.stringify({
        id: req.id,
        data: data
    }))
}

async function onMessage(ws: WebSocketEx, msg: WebSocket.Data) {
    try {
        const req = JSON.parse(msg.toString()) as Protocol

        const model = generatedModel[req.item] as GeneratedModel<any>
        if (!model) {
            sendError(ws, `item ${req.item} does not exist`)
            return
        }

        switch (req.method) {
            case "GET": {
                try {
                    const data = await model.find(req.query)
                    sendData(ws, req, data)
                } catch {
                    sendError(ws, `unable to GET item ${req.item} with query ${req.query}`)
                }
                break;
            }
            case "PUT": {
                try {
                    const data = await model.update(req.data)
                    sendData(ws, req, data)
                } catch {
                    sendError(ws, `unable to PUT item ${req.item} with query ${req.query}`)
                }
                break;
            }
            case "POST": {
                try {
                    const data = await model.insert(req.data)
                    sendData(ws, req, data)
                } catch {
                    sendError(ws, `unable to PUT item ${req.item} with query ${req.query}`)
                }
                break;
            }
            case "DELETE": {
                try {
                    const data = await model.delete((req.data as any).id)
                    sendData(ws, req, data)
                } catch {
                    sendError(ws, `unable to PUT item ${req.item} with query ${req.query}`)
                }
                break;
            }
            default: {
                sendError(ws, `method ${req.method} is not supported`)
                return
            }
        }

    } catch {
        sendError(ws, `unable to parse message ${msg}`)
    }
}

interface Protocol {
    method: "GET" | "PUT" | "POST" | "DELETE"
    item: string
    query: string
    id: string
    data: object
}
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var WebSocket = require("ws");
var model_1 = require("./model");
var socketServer = new WebSocket.Server({ noServer: true });
function createSocketServer(httpServer) {
    httpServer.on('upgrade', function (request, socket, head) {
        var args = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            args[_i - 3] = arguments[_i];
        }
        var pathname = request.url;
        if (pathname === '/socket-api') {
            socketServer.handleUpgrade(request, socket, head, function (ws) {
                socketServer.emit('connection', ws, request);
            });
        }
    });
}
exports.default = createSocketServer;
socketServer.on('connection', function (ws) {
    ws.id = Symbol();
    ws.send(JSON.stringify({ message: 'welcome, client' }));
    ws.isAlive = true;
    ws.on('message', function (msg) {
        onMessage(ws, msg);
    });
});
function sendError(ws, message) {
    ws.send(JSON.stringify({
        error: message
    }));
}
function sendData(ws, req, data) {
    ws.send(JSON.stringify({
        id: req.id,
        data: data
    }));
}
function onMessage(ws, msg) {
    return __awaiter(this, void 0, void 0, function () {
        var req, model, _a, data, _b, data, _c, data, _d, data, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _g.trys.push([0, 19, , 20]);
                    req = JSON.parse(msg.toString());
                    model = model_1.generatedModel[req.item];
                    if (!model) {
                        sendError(ws, "item ".concat(req.item, " does not exist"));
                        return [2];
                    }
                    _a = req.method;
                    switch (_a) {
                        case "GET": return [3, 1];
                        case "PUT": return [3, 5];
                        case "POST": return [3, 9];
                        case "DELETE": return [3, 13];
                    }
                    return [3, 17];
                case 1:
                    _g.trys.push([1, 3, , 4]);
                    return [4, model.find(req.query)];
                case 2:
                    data = _g.sent();
                    sendData(ws, req, data);
                    return [3, 4];
                case 3:
                    _b = _g.sent();
                    sendError(ws, "unable to GET item ".concat(req.item, " with query ").concat(req.query));
                    return [3, 4];
                case 4: return [3, 18];
                case 5:
                    _g.trys.push([5, 7, , 8]);
                    return [4, model.update(req.data)];
                case 6:
                    data = _g.sent();
                    sendData(ws, req, data);
                    return [3, 8];
                case 7:
                    _c = _g.sent();
                    sendError(ws, "unable to PUT item ".concat(req.item, " with query ").concat(req.query));
                    return [3, 8];
                case 8: return [3, 18];
                case 9:
                    _g.trys.push([9, 11, , 12]);
                    return [4, model.insert(req.data)];
                case 10:
                    data = _g.sent();
                    sendData(ws, req, data);
                    return [3, 12];
                case 11:
                    _d = _g.sent();
                    sendError(ws, "unable to PUT item ".concat(req.item, " with query ").concat(req.query));
                    return [3, 12];
                case 12: return [3, 18];
                case 13:
                    _g.trys.push([13, 15, , 16]);
                    return [4, model.delete(req.data.id)];
                case 14:
                    data = _g.sent();
                    sendData(ws, req, data);
                    return [3, 16];
                case 15:
                    _e = _g.sent();
                    sendError(ws, "unable to PUT item ".concat(req.item, " with query ").concat(req.query));
                    return [3, 16];
                case 16: return [3, 18];
                case 17:
                    {
                        sendError(ws, "method ".concat(req.method, " is not supported"));
                        return [2];
                    }
                    _g.label = 18;
                case 18: return [3, 20];
                case 19:
                    _f = _g.sent();
                    sendError(ws, "unable to parse message ".concat(msg));
                    return [3, 20];
                case 20: return [2];
            }
        });
    });
}
//# sourceMappingURL=socket.js.map
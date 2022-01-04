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
exports.requestFactory = void 0;
var query_1 = require("./query");
var socket = null;
var messageQueue = [];
var requests = {};
var nextRequestId = 0;
var _options = null;
function ensureSocketConnection() {
    if (socket && socket.readyState !== socket.CLOSED && socket.readyState !== socket.CLOSING) {
        return;
    }
    var url = _options.url;
    socket = new WebSocket(url);
    socket.onopen = function (ev) {
        flushMessageQueue();
    };
    socket.onmessage = function (ev) {
        var res = JSON.parse(ev.data);
        if (undefined !== res.id) {
            requests[res.id](res.data);
            delete requests[res.id];
        }
    };
    socket.onclose = function (ev) {
        ensureSocketConnection();
    };
    window.onbeforeunload = function (ev) {
        socket.close();
    };
}
function flushMessageQueue() {
    if (socket.readyState !== socket.OPEN) {
        return;
    }
    while (messageQueue.length > 0) {
        var message = messageQueue.shift();
        socket.send(JSON.stringify(message));
    }
}
var requestFactory = function (options) {
    return function (item, query, method, data) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            ensureSocketConnection();
            return [2, new Promise(function (resolve, reject) {
                    try {
                        var id = nextRequestId++;
                        requests[id] = function (data) {
                            resolve(data);
                        };
                        if (query) {
                            query = query.substring(1);
                        }
                        var message = {
                            method: method,
                            item: item,
                            query: query,
                            id: id,
                            data: data
                        };
                        messageQueue.push(message);
                        flushMessageQueue();
                        var timeout_1 = 2000;
                        setTimeout(function () {
                            reject("".concat(method, " ").concat(item, " with query ").concat(query, " timed out after ").concat(timeout_1, "ms"));
                        }, timeout_1);
                    }
                    catch (err) {
                        if (options && options.errorHandler) {
                            options.errorHandler(err);
                        }
                        else {
                            throw err;
                        }
                    }
                })];
        });
    }); };
};
exports.requestFactory = requestFactory;
var modelList = require('./models.json');
function generateApi(modelName, options) {
    _options = options;
    ensureSocketConnection();
    var request = (0, exports.requestFactory)(options);
    var table = modelList.filter(function (t) { return t.name === modelName; })[0];
    return {
        get: getFactory(modelName, request),
        getById: getByIdFactory(modelName, request),
        update: updateFactory(modelName, request),
        insert: insertFactory(modelName, request),
        remove: removeFactory(modelName, request),
        query: (0, query_1.queryBuilderFactory)(table, function (query) { return getFactory(modelName, request)(query); }),
    };
}
exports.default = generateApi;
function getByIdFactory(modelName, request) {
    var _this = this;
    return function (id) {
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var response, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, request(modelName, 'filters=id=' + id, 'GET')];
                    case 1:
                        response = _a.sent();
                        resolve(response[0]);
                        return [3, 3];
                    case 2:
                        err_1 = _a.sent();
                        reject(err_1);
                        return [3, 3];
                    case 3: return [2];
                }
            });
        }); });
    };
}
function getFactory(modelName, request) {
    var _this = this;
    return function (query) {
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var response, data, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, request(modelName, query, 'GET')];
                    case 1:
                        response = _a.sent();
                        if (!response) {
                            return [2];
                        }
                        data = response;
                        resolve(data);
                        return [3, 3];
                    case 2:
                        err_2 = _a.sent();
                        reject(err_2);
                        return [3, 3];
                    case 3: return [2];
                }
            });
        }); });
    };
}
function removeFactory(modelName, request) {
    var _this = this;
    return function (data) {
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var response, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, request(modelName, undefined, 'DELETE', data)];
                    case 1:
                        response = _a.sent();
                        resolve(response);
                        return [3, 3];
                    case 2:
                        err_3 = _a.sent();
                        reject(err_3);
                        return [3, 3];
                    case 3: return [2];
                }
            });
        }); });
    };
}
function insertFactory(modelName, request) {
    var _this = this;
    return function (data) {
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var response, err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, request(modelName, undefined, 'POST', data)];
                    case 1:
                        response = _a.sent();
                        resolve(response);
                        return [3, 3];
                    case 2:
                        err_4 = _a.sent();
                        reject(err_4);
                        return [3, 3];
                    case 3: return [2];
                }
            });
        }); });
    };
}
function updateFactory(modelName, request) {
    var _this = this;
    return function (data) {
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var response, err_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, request(modelName, undefined, 'PUT', data)];
                    case 1:
                        response = _a.sent();
                        resolve(response);
                        return [3, 3];
                    case 2:
                        err_5 = _a.sent();
                        reject(err_5);
                        return [3, 3];
                    case 3: return [2];
                }
            });
        }); });
    };
}
//# sourceMappingURL=ts-ws-api-template.js.map
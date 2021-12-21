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
exports.useRoutes = void 0;
var express = require("express");
var debugFactory = require("debug");
var debug = debugFactory('easy-api:routes');
function useRoutes(model, options) {
    var router = express.Router();
    var route = routeFactory(options);
    Object.keys(model).map(function (m) {
        router.use('/', route(model[m]));
    });
    return router;
}
exports.useRoutes = useRoutes;
function routeFactory(options) {
    var nullMiddlewareGenerator = function (name) { return function (req, res, next) { return next(); }; };
    options = options || {};
    options.middleware = options.middleware || {};
    options.middleware.get = options.middleware.get || nullMiddlewareGenerator;
    options.middleware.post = options.middleware.post || nullMiddlewareGenerator;
    options.middleware.put = options.middleware.put || nullMiddlewareGenerator;
    options.middleware.delete = options.middleware.delete || nullMiddlewareGenerator;
    return function generate(model) {
        var _this = this;
        var router = express.Router();
        var def = model.definition;
        var middleware = options.middleware;
        debug("generating routes for ".concat(model.definition.name));
        if (model.definition.audit && !options.getUserId) {
            throw "model ".concat(model.definition.name, " has audit enabled, but no getUserId function is specified in options");
        }
        router.get("/".concat(def.name), middleware.get(def.name), function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var split, query, result, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        debug("GET ".concat(def.name));
                        split = req.url.split('?');
                        query = '';
                        if (split.length > 1) {
                            query = split[1];
                        }
                        return [4, model.find(query)];
                    case 1:
                        result = _a.sent();
                        return [2, res.status(200).json({
                                status: 'ok',
                                data: result,
                                message: "returned ".concat(result.length, " ").concat(def.name)
                            })];
                    case 2:
                        err_1 = _a.sent();
                        debug(err_1);
                        return [2, res.status(500).json(err_1)];
                    case 3: return [2];
                }
            });
        }); });
        router.post("/".concat(def.name), middleware.post(def.name), function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var data, userId, result, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        debug("POST ".concat(def.name));
                        data = req.body;
                        if (!model.definition.audit) return [3, 2];
                        return [4, options.getUserId(req)];
                    case 1:
                        userId = _a.sent();
                        data['modified_by_id'] = userId;
                        data['created_by_id'] = userId;
                        _a.label = 2;
                    case 2: return [4, model.insert(data)];
                    case 3:
                        result = _a.sent();
                        return [2, res.status(200).json({
                                status: 'ok',
                                data: result
                            })];
                    case 4:
                        err_2 = _a.sent();
                        debug(err_2);
                        return [2, res.status(500).json(err_2)];
                    case 5: return [2];
                }
            });
        }); });
        router.put("/".concat(def.name), middleware.put(def.name), function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var data, userId, result, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        debug("POST ".concat(def.name));
                        data = req.body;
                        if (!model.definition.audit) return [3, 2];
                        return [4, options.getUserId(req)];
                    case 1:
                        userId = _a.sent();
                        data['modified_by_id'] = userId;
                        _a.label = 2;
                    case 2: return [4, model.update(data)];
                    case 3:
                        result = _a.sent();
                        return [2, res.status(200).json({
                                status: 'ok',
                                data: result
                            })];
                    case 4:
                        err_3 = _a.sent();
                        debug(err_3);
                        return [2, res.status(500).json(err_3)];
                    case 5: return [2];
                }
            });
        }); });
        router.delete("/".concat(def.name), middleware.delete(def.name), function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var data, result, err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        debug("DELETE ".concat(def.name));
                        data = req.body;
                        return [4, model.delete(data.id)];
                    case 1:
                        result = _a.sent();
                        return [2, res.status(200).json({
                                status: 'ok',
                                data: result
                            })];
                    case 2:
                        err_4 = _a.sent();
                        debug(err_4);
                        return [2, res.status(500).json(err_4)];
                    case 3: return [2];
                }
            });
        }); });
        return router;
    };
}
exports.default = routeFactory;
//# sourceMappingURL=routes.js.map
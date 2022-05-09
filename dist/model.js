"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryToObject = exports.modelWrapper = exports.emitter = exports.getModel = exports.generatedModel = void 0;
var events = require("events");
var debugFactory = require("debug");
var generateUpdate_1 = require("./sql/postgres/generateUpdate");
var generateSelect_1 = require("./sql/postgres/generateSelect");
var mapRelations_1 = require("./sql/postgres/mapRelations");
var debug = debugFactory('easy-api:model:generator');
var generatedModel = {};
exports.generatedModel = generatedModel;
function getModel(name) {
    return generatedModel[name];
}
exports.getModel = getModel;
var emitter = new events.EventEmitter();
exports.emitter = emitter;
emitter.setMaxListeners(500);
var generateCreateTable_1 = require("./sql/postgres/generateCreateTable");
var generateInsert_1 = require("./sql/postgres/generateInsert");
function modelWrapper(db) {
    if (!db) {
        throw new Error("db object not initialized");
    }
    return function (def) {
        return model(db, def);
    };
}
exports.modelWrapper = modelWrapper;
function model(db, def) {
    if (!db) {
        throw new Error("db object not initialized");
    }
    if (!def) {
        throw new Error("definition object not initialized");
    }
    if (generatedModel[def.name]) {
        return generatedModel[def.name];
    }
    debug("generating table ".concat(def.name, " on db ").concat(db));
    def.columns = __spreadArray([{ name: 'id', type: 'serial', pk: true }], def.columns, true);
    def.columns = def.columns.map(function (c) {
        return __assign(__assign({}, c), { reference: c.reference ? c.reference : c.type === "reference" ? c.name : null });
    });
    if (def.audit) {
        def.columns = __spreadArray(__spreadArray([], def.columns, true), [
            { name: 'created_by', type: 'reference', reference: def.audit },
            { name: 'modified_by', type: 'reference', reference: def.audit }
        ], false);
    }
    var aliasNumber = 0;
    def.columns = def.columns.map(function (c) {
        if (c.type === 'reference') {
            return __assign(__assign({}, c), { _reference_alias: "".concat(c.reference).concat(aliasNumber++) });
        }
        else {
            return c;
        }
    });
    var model = {
        definition: def,
        createText: (0, generateCreateTable_1.generateCreateTable)(def),
        create: createFactory(db, def),
        drop: dropFactory(db, def),
        insert: insertFactory(db, def),
        delete: deleteFactory(db, def),
        find: findFactory(db, def),
        update: updateFactory(db, def)
    };
    generatedModel[def.name] = model;
    return model;
}
exports.default = model;
function deleteFactory(db, def) {
    var _this = this;
    return function (id) {
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var result, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, db.oneOrNone("DELETE FROM ".concat(def.name, " WHERE id = $[id] RETURNING *;"), { id: id })];
                    case 1:
                        result = _a.sent();
                        resolve(result);
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
function updateFactory(db, def) {
    var _this = this;
    return function (data) {
        var sqlText = (0, generateUpdate_1.default)(def, data);
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var result, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, db.oneOrNone(sqlText, data)];
                    case 1:
                        result = _a.sent();
                        emitter.emit("".concat(def.name, "_update"), result);
                        resolve(result);
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
function insertFactory(db, def) {
    var _this = this;
    return function (data) {
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var sqlText, result, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        sqlText = (0, generateInsert_1.default)(def, data);
                        return [4, db.oneOrNone(sqlText, data)];
                    case 1:
                        result = _a.sent();
                        emitter.emit("".concat(def.name, "_insert"), result);
                        resolve(result);
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
function dropFactory(db, def) {
    var _this = this;
    return function () {
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, db.none("DROP TABLE IF EXISTS ".concat(def.name, ";"))];
                    case 1:
                        _a.sent();
                        resolve();
                        return [3, 3];
                    case 2:
                        err_4 = _a.sent();
                        debug("unable to drop table ".concat(def.name));
                        reject(err_4);
                        return [3, 3];
                    case 3: return [2];
                }
            });
        }); });
    };
}
function createFactory(db, def) {
    var _this = this;
    var sqlText = (0, generateCreateTable_1.generateCreateTable)(def);
    return function () {
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var err_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, db.none(sqlText)];
                    case 1:
                        _a.sent();
                        resolve();
                        return [3, 3];
                    case 2:
                        err_5 = _a.sent();
                        debug("failed to create table ".concat(def.name));
                        reject(err_5);
                        return [3, 3];
                    case 3: return [2];
                }
            });
        }); });
    };
}
var getQueryObject = function (query) {
    if (typeof (query) === 'string') {
        return queryToObject(query);
    }
    else {
        return query;
    }
};
function findFactory(db, def) {
    var _this = this;
    return function (query) {
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var args, sqlText, obj, result, err_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        debug("find called on ".concat(def.name));
                        args = getQueryObject(query);
                        sqlText = (0, generateSelect_1.default)(def, args);
                        obj = {};
                        if (args && args.filters) {
                            args.filters.forEach(function (a) { obj[a.column] = a.value; });
                        }
                        return [4, db.manyOrNone(sqlText, obj)];
                    case 1:
                        result = _a.sent();
                        debug("found ".concat(result.length, " ").concat(def.name));
                        if (args && args.relations) {
                            (0, mapRelations_1.default)(result);
                        }
                        resolve(result);
                        return [3, 3];
                    case 2:
                        err_6 = _a.sent();
                        reject(err_6);
                        return [3, 3];
                    case 3: return [2];
                }
            });
        }); });
    };
}
function queryToObject(string) {
    if (!string) {
        return undefined;
    }
    var query = new URLSearchParams(string);
    var args = {};
    if (query.has('filters')) {
        args.filters = [];
        var filterList = query.get('filters').split(';');
        for (var _i = 0, filterList_1 = filterList; _i < filterList_1.length; _i++) {
            var filter = filterList_1[_i];
            var op = filter.match('=') ? '=' :
                filter.match('>') ? '>' :
                    filter.match('<') ? '<' :
                        filter.match(/\[/) ? '[' : undefined;
            if (!op) {
                continue;
            }
            if (op === '[') {
                var values = filter.split(op)[1].split(']')[0].split(',');
                args.in = {
                    column: filter.split(op)[0],
                    values: values
                };
            }
            else {
                var column = filter.split(op)[0];
                var value = filter.split(op)[1];
                args.filters.push({
                    column: column,
                    op: op,
                    value: value
                });
            }
        }
    }
    if (query.has('relations')) {
        args.relations = true;
    }
    if (query.has('orderby')) {
        args.orderby = query.get('orderby').split(';');
    }
    return args;
}
exports.queryToObject = queryToObject;
//# sourceMappingURL=model.js.map
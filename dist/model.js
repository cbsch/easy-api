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
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
var events = require("events");
var debugFactory = require("debug");
var querystring = require("querystring");
var debug = debugFactory('easy-api:model:generator');
var generatedModel = {};
exports.generatedModel = generatedModel;
var emitter = new events.EventEmitter();
exports.emitter = emitter;
emitter.setMaxListeners(500);
var joinTableColumnSplit = '___';
function generateCreateColumn(def) {
    var sqlString = '    ';
    if (def.type === "reference") {
        sqlString += def.name + "_id";
    }
    else {
        sqlString += def.name;
    }
    var type = def.type === "number" ? 'INTEGER' :
        def.type === "string" ? 'TEXT' :
            def.type === "date" ? 'TIMESTAMP WITH TIME ZONE' :
                def.type === "serial" ? 'SERIAL' :
                    def.type === "boolean" ? 'BOOLEAN' :
                        def.type === "float" ? 'REAL' :
                            def.type === "reference" ? "INTEGER REFERENCES " + def.reference + "(id)" : '';
    if (type === '')
        throw "No type for column " + def.name;
    sqlString += " " + type;
    if (def.unique) {
        sqlString += ' UNIQUE';
    }
    if (def.notnull) {
        sqlString += ' NOT NULL';
    }
    if (def.pk) {
        sqlString += ' PRIMARY KEY';
    }
    if (def.type === "reference" && def.cascade) {
        sqlString += ' ON UPDATE CASCADE ON DELETE CASCADE';
    }
    return sqlString;
}
exports.generateCreateColumn = generateCreateColumn;
function generateCreateTable(def) {
    var sqlText = "CREATE TABLE " + def.name + " (\n";
    var columnStrings = def.columns.map(function (c) { return generateCreateColumn(c); });
    var columnText = columnStrings.join(',\n');
    columnText += '\n';
    sqlText += columnText;
    sqlText += ');\n';
    sqlText += "ALTER SEQUENCE " + def.name + "_id_seq RESTART WITH 1000;\n";
    return sqlText;
}
exports.generateCreateTable = generateCreateTable;
function generateInsert(def, data) {
    var validColumns = def.columns.map(function (c) {
        if (c.type === "reference") {
            return c.name + "_id";
        }
        else {
            return c.name;
        }
    }).filter(function (s) { return s !== 'id'; });
    var columns = Object.keys(data).filter(function (v) { return validColumns.indexOf(v) > -1; });
    var valueColums = columns.map(function (c) { return "$[" + c + "]"; });
    var sqlText = "INSERT INTO " + def.name + "(\n";
    sqlText += '    ' + columns.join(',\n    ') + '\n';
    sqlText += ') VALUES (\n';
    sqlText += '    ' + valueColums.join(',\n    ') + '\n';
    sqlText += ')\n';
    sqlText += 'RETURNING *;\n';
    return sqlText;
}
exports.generateInsert = generateInsert;
function generateUpdate(def, data) {
    var validColumns = def.columns.map(function (c) {
        if (c.type === "reference") {
            return c.name + "_id";
        }
        else {
            return c.name;
        }
    }).filter(function (s) { return s !== 'id'; });
    var columns = Object.keys(data).filter(function (v) { return validColumns.indexOf(v) > -1; });
    var setStatements = [];
    columns.forEach(function (c) {
        setStatements.push(c + " = $[" + c + "]");
    });
    var sqlText = "UPDATE " + def.name + "\n";
    sqlText += 'SET\n';
    sqlText += '    ' + setStatements.join(',\n    ') + '\n';
    sqlText += 'WHERE id = $[id]\n';
    sqlText += 'RETURNING *;\n';
    return sqlText;
}
exports.generateUpdate = generateUpdate;
function queryToObject(string) {
    if (!string) {
        return undefined;
    }
    var query = querystring.parse(string);
    var args = {};
    if (query && query['filters']) {
        args.filters = [];
        var filterList = query['filters'].split(',');
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
                var values = filter.split(op)[1].split(']')[0].split(';');
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
    if (query && undefined !== query['relations']) {
        args.relations = true;
    }
    if (query && undefined !== query['orderby']) {
        args.orderby = query['orderby'].split(',');
    }
    return args;
}
exports.queryToObject = queryToObject;
function generateSelect(def, args) {
    var columns;
    if (args && args.columns) {
        columns = args.columns.map(function (s) { return def.name + "." + s; }).join(', ');
    }
    else {
        columns = def.columns.map(function (s) { return def.name + "." + (s.type !== "reference" ? s.name : s.name + '_id'); }).join(', ');
    }
    if (args && args.relations) {
        var joinedSelects = [];
        def.columns.filter(function (c) { return c.type === "reference"; }).map(function (refTable) {
            debug(refTable);
            var refColumns = generatedModel[refTable.reference].definition.columns;
            refColumns.map(function (refCol) {
                var columnName = refCol.type === "reference" ? refCol.name + "_id" : refCol.name;
                joinedSelects.push(refTable.reference + "." + columnName + " AS " + refTable.name + joinTableColumnSplit + columnName);
            });
        });
        if (joinedSelects) {
            columns += ', ';
            columns += joinedSelects.join(', ');
        }
    }
    var sqlText = "SELECT " + columns + "\nFROM " + def.name + "\n";
    var joinText = '';
    if (args && args.relations) {
        def.columns.filter(function (c) { return c.type === "reference"; }).map(function (c) {
            joinText += "JOIN " + c.reference + " ON " + c.reference + ".id = " + c.name + "_id\n";
        });
    }
    if (joinText) {
        sqlText += joinText;
    }
    var filterText;
    var filterLines = [];
    if (args && args.filters) {
        filterLines = args.filters.map(function (c) {
            if (!c.op.match(/[<>=]/g)) {
                throw "Invalid operator " + c.op;
            }
            return def.name + "." + c.column + " " + c.op + " $[" + c.column + "]";
        }).slice();
    }
    if (args && args.in) {
        filterLines = filterLines.concat([args.in.column + " IN (" + args.in.values.join(', ') + ")"]);
    }
    if (filterLines.length > 0) {
        filterText = filterLines.join(' AND ');
        sqlText += "WHERE " + filterText + "\n";
    }
    if (args && args.orderby) {
        sqlText += "ORDER BY " + args.orderby.join(', ') + "\n";
    }
    sqlText += ';';
    return sqlText;
}
exports.generateSelect = generateSelect;
function modelWrapper(db) {
    if (!db) {
        throw "db object not initialized";
    }
    return function (def) {
        return model(db, def);
    };
}
exports.modelWrapper = modelWrapper;
function model(db, def) {
    if (!db) {
        throw "db object not initialized";
    }
    if (!def) {
        throw "definition object not initialized";
    }
    debug("generating table " + def.name + " on db " + db);
    def.columns.unshift({ name: 'id', type: "serial", pk: true });
    def.columns = def.columns.map(function (c) {
        return __assign({}, c, { reference: c.reference ? c.reference : c.type === "reference" ? c.name : null });
    });
    var model = {
        definition: def,
        createText: generateCreateTable(def),
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
                        return [4, db.oneOrNone("DELETE FROM " + def.name + " WHERE id = $[id] RETURNING *;", { id: id })];
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
        var sqlText = generateUpdate(def, data);
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var result, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, db.oneOrNone(sqlText, data)];
                    case 1:
                        result = _a.sent();
                        emitter.emit(def.name + "_update", result);
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
                        sqlText = generateInsert(def, data);
                        return [4, db.oneOrNone(sqlText, data)];
                    case 1:
                        result = _a.sent();
                        emitter.emit(def.name + "_insert", result);
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
                        return [4, db.none("DROP TABLE IF EXISTS " + def.name + ";")];
                    case 1:
                        _a.sent();
                        resolve();
                        return [3, 3];
                    case 2:
                        err_4 = _a.sent();
                        debug("unable to drop table " + def.name);
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
    var sqlText = generateCreateTable(def);
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
                        debug("failed to create table " + def.name);
                        reject(err_5);
                        return [3, 3];
                    case 3: return [2];
                }
            });
        }); });
    };
}
function findFactory(db, def) {
    var _this = this;
    return function (query) {
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var args, sqlText, obj, result, err_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        debug("find called on " + def.name);
                        args = queryToObject(query);
                        sqlText = generateSelect(def, args);
                        obj = {};
                        if (args && args.filters) {
                            args.filters.forEach(function (a) { obj[a.column] = a.value; });
                        }
                        return [4, db.manyOrNone(sqlText, obj)];
                    case 1:
                        result = _a.sent();
                        debug("found " + result.length + " " + def.name);
                        if (args && args.relations) {
                            mapRelations(result);
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
function mapRelations(result) {
    result.map(function (r) {
        r['relations'] = {};
        Object.keys(r).map(function (key) {
            if (key.match(joinTableColumnSplit)) {
                var relationName = key.split(joinTableColumnSplit)[0];
                if (!r['relations'][relationName]) {
                    r['relations'][relationName] = {};
                }
                r['relations'][relationName][key.split(joinTableColumnSplit)[1]] = r[key];
                delete r[key];
            }
        });
    });
}
//# sourceMappingURL=model.js.map
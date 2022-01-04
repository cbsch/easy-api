"use strict";
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
exports.mapRelations = exports.generateSelect = exports.generateUpdate = exports.generateInsert = exports.generateCreateTable = exports.generateCreateColumn = void 0;
var model_1 = require("../model");
var debugFactory = require("debug");
var debug = debugFactory('easy-api:sql:pg');
var joinTableColumnSplit = '___';
function generateCreateColumn(def) {
    var sqlString = '    ';
    if (def.type === "reference") {
        sqlString += "".concat(def.name, "_id");
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
                            def.type === "uuid" ? 'UUID' :
                                def.type === "reference" ? "INTEGER REFERENCES ".concat(def.reference, "(id)") : '';
    if (type === '')
        throw "No type for column ".concat(def.name);
    sqlString += " ".concat(type);
    if (def.type === "reference" && def.cascade) {
        sqlString += ' ON UPDATE CASCADE ON DELETE CASCADE';
    }
    if (def.unique) {
        sqlString += ' UNIQUE';
    }
    if (def.notnull) {
        sqlString += ' NOT NULL';
    }
    if (def.pk) {
        sqlString += ' PRIMARY KEY';
    }
    if (def.default) {
        sqlString += " DEFAULT '".concat(def.default, "'");
    }
    if (def.extraColumnSql) {
        sqlString += " ".concat(def.extraColumnSql);
    }
    return sqlString;
}
exports.generateCreateColumn = generateCreateColumn;
function generateCreateTable(def) {
    var sqlText = "CREATE TABLE ".concat(def.name, " (\n");
    var columnStrings = def.columns.map(function (c) { return generateCreateColumn(c); });
    var columnText = columnStrings.join(',\n');
    columnText += '\n';
    sqlText += columnText;
    sqlText += ');\n';
    sqlText += "ALTER SEQUENCE ".concat(def.name, "_id_seq START 1000;\n");
    return sqlText;
}
exports.generateCreateTable = generateCreateTable;
function generateInsert(def, data) {
    var validColumns = def.columns.map(function (c) {
        if (c.type === "reference") {
            return "".concat(c.name, "_id");
        }
        else {
            return c.name;
        }
    }).filter(function (s) { return s !== 'id'; });
    var columns = Object.keys(data).filter(function (v) { return validColumns.indexOf(v) > -1; });
    var valueColums = columns.map(function (c) { return "$[".concat(c, "]"); });
    var sqlText = "INSERT INTO ".concat(def.name, "(\n");
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
            return "".concat(c.name, "_id");
        }
        else {
            return c.name;
        }
    }).filter(function (s) { return s !== 'id'; });
    var columns = Object.keys(data).filter(function (v) { return validColumns.indexOf(v) > -1; });
    var setStatements = [];
    debug('putting data:');
    debug(data);
    columns.forEach(function (c) {
        setStatements.push("".concat(c, " = $[").concat(c, "]"));
    });
    var sqlText = "UPDATE ".concat(def.name, "\n");
    sqlText += 'SET\n';
    sqlText += '    ' + setStatements.join(',\n    ') + '\n';
    sqlText += 'WHERE id = $[id]\n';
    sqlText += 'RETURNING *;\n';
    debug(sqlText);
    return sqlText;
}
exports.generateUpdate = generateUpdate;
function generateSelect(def, args) {
    var columns;
    if (args && args.columns) {
        columns = args.columns.map(function (s) { return "".concat(def.name, ".").concat(s); }).join(', ');
    }
    else {
        columns = def.columns.map(function (s) { return "".concat(def.name, ".").concat(s.type !== "reference" ? s.name : s.name + '_id'); }).join(', ');
    }
    if (args && args.relations) {
        var joinedSelects_1 = [];
        def.columns.filter(function (c) { return c.type === "reference"; }).map(function (refTable) {
            debug(refTable);
            var refColumns = model_1.generatedModel[refTable.reference].definition.columns;
            refColumns.map(function (refCol) {
                var columnName = refCol.type === "reference" ? "".concat(refCol.name, "_id") : refCol.name;
                joinedSelects_1.push("".concat(refTable._reference_alias, ".").concat(columnName, " AS ").concat(refTable.name).concat(joinTableColumnSplit).concat(columnName));
            });
        });
        if (joinedSelects_1) {
            columns += ', ';
            columns += joinedSelects_1.join(', ');
        }
    }
    var sqlText = "SELECT ".concat(columns, "\nFROM ").concat(def.name, "\n");
    var joinText = '';
    if (args && args.relations) {
        for (var _i = 0, _a = def.columns.filter(function (c) { return c.type === "reference"; }); _i < _a.length; _i++) {
            var c = _a[_i];
            joinText += "LEFT JOIN ".concat(c.reference, " AS ").concat(c._reference_alias, " ON ").concat(c._reference_alias, ".id = ").concat(def.name, ".").concat(c.name, "_id\n");
        }
    }
    if (joinText) {
        sqlText += joinText;
    }
    var filterText;
    var filterLines = [];
    if (args && args.filters) {
        filterLines = __spreadArray([], args.filters.map(function (c) {
            if (!c.op.match(/[<>=]/g)) {
                throw "Invalid operator ".concat(c.op);
            }
            return "".concat(def.name, ".").concat(c.column, " ").concat(c.op, " $[").concat(c.column, "]");
        }), true);
    }
    if (args && args.in) {
        filterLines = __spreadArray(__spreadArray([], filterLines, true), ["".concat(args.in.column, " IN (").concat(args.in.values.join(', '), ")")], false);
    }
    if (filterLines.length > 0) {
        filterText = filterLines.join(' AND ');
        sqlText += "WHERE ".concat(filterText, "\n");
    }
    if (args && args.orderby) {
        sqlText += "ORDER BY ".concat(args.orderby.join(', '), "\n");
    }
    sqlText += ';';
    return sqlText;
}
exports.generateSelect = generateSelect;
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
exports.mapRelations = mapRelations;
//# sourceMappingURL=pg.js.map
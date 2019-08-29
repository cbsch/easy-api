"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var model_1 = require("../model");
var debugFactory = require("debug");
var debug = debugFactory('easy-api:sql:pg');
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
        sqlString += " DEFAULT '" + def.default + "'";
    }
    if (def.extraColumnSql) {
        sqlString += " " + def.extraColumnSql;
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
    debug('putting data:');
    debug(data);
    columns.forEach(function (c) {
        setStatements.push(c + " = $[" + c + "]");
    });
    var sqlText = "UPDATE " + def.name + "\n";
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
        columns = args.columns.map(function (s) { return def.name + "." + s; }).join(', ');
    }
    else {
        columns = def.columns.map(function (s) { return def.name + "." + (s.type !== "reference" ? s.name : s.name + '_id'); }).join(', ');
    }
    if (args && args.relations) {
        var joinedSelects_1 = [];
        def.columns.filter(function (c) { return c.type === "reference"; }).map(function (refTable) {
            debug(refTable);
            var refColumns = model_1.generatedModel[refTable.reference].definition.columns;
            refColumns.map(function (refCol) {
                var columnName = refCol.type === "reference" ? refCol.name + "_id" : refCol.name;
                joinedSelects_1.push(refTable._reference_alias + "." + columnName + " AS " + refTable.name + joinTableColumnSplit + columnName);
            });
        });
        if (joinedSelects_1) {
            columns += ', ';
            columns += joinedSelects_1.join(', ');
        }
    }
    var sqlText = "SELECT " + columns + "\nFROM " + def.name + "\n";
    var joinText = '';
    if (args && args.relations) {
        for (var _i = 0, _a = def.columns.filter(function (c) { return c.type === "reference"; }); _i < _a.length; _i++) {
            var c = _a[_i];
            joinText += "LEFT JOIN " + c.reference + " AS " + c._reference_alias + " ON " + c._reference_alias + ".id = " + def.name + "." + c.name + "_id\n";
        }
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
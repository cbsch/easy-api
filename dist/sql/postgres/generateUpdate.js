"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var debugFactory = require("debug");
var debug = debugFactory('easy-api:sql:pg');
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
exports.default = generateUpdate;
//# sourceMappingURL=generateUpdate.js.map
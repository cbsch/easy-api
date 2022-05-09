"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.default = generateInsert;
//# sourceMappingURL=generateInsert.js.map
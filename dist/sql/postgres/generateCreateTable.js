"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCreateTable = void 0;
var generateCreateColumn_1 = require("./generateCreateColumn");
function generateCreateTable(def) {
    var sqlText = "CREATE TABLE ".concat(def.name, " (\n");
    var columnStrings = def.columns.map(function (c) { return (0, generateCreateColumn_1.generateCreateColumn)(c); });
    var columnText = columnStrings.join(',\n');
    columnText += '\n';
    sqlText += columnText;
    sqlText += ');\n';
    sqlText += "ALTER SEQUENCE ".concat(def.name, "_id_seq RESTART WITH 1000;\n");
    return sqlText;
}
exports.generateCreateTable = generateCreateTable;
//# sourceMappingURL=generateCreateTable.js.map
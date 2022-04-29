"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCreateColumn = void 0;
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
        throw new Error("No type for column ".concat(def.name));
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
//# sourceMappingURL=generateCreateColumn.js.map
import { Column } from "../../interfaces";

export function generateCreateColumn(def: Column) {
    var sqlString = '    '
    if (def.type === "reference") {
        sqlString += `${def.name}_id`
    } else {
        sqlString += def.name
    }

    const type =
        def.type === "number" ? 'INTEGER' :
        def.type === "string" ? 'TEXT' :
        def.type === "date" ? 'TIMESTAMP WITH TIME ZONE' :
        def.type === "serial" ? 'SERIAL' :
        def.type === "boolean" ? 'BOOLEAN' :
        def.type === "float" ? 'REAL' :
        def.type === "uuid" ? 'UUID' :
        def.type === "reference" ? `INTEGER REFERENCES ${def.reference}(id)` : ''

    if (type === '') throw new Error(`No type for column ${def.name}`)

    sqlString += ` ${type}`

    if (def.type === "reference" && def.cascade) {
        sqlString += ' ON UPDATE CASCADE ON DELETE CASCADE'
    }

    if (def.unique) { sqlString += ' UNIQUE'}
    if (def.notnull) { sqlString += ' NOT NULL'}
    if (def.pk) { sqlString += ' PRIMARY KEY'}
    if (def.default) { sqlString += ` DEFAULT '${def.default}'`}
    if (def.extraColumnSql) { sqlString += ` ${def.extraColumnSql}`}


    return sqlString
}
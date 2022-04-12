import { JOIN_TABLE_COLUMN_SPLIT } from "./constants"

export default function mapRelations(result: any[]): void {
    result.map((r: any) => {
        r['relations'] = {}
        Object.keys(r).map((key: string) => {
            if (key.match(JOIN_TABLE_COLUMN_SPLIT)) {
                const relationName = key.split(JOIN_TABLE_COLUMN_SPLIT)[0]
                if (!r['relations'][relationName]) { r['relations'][relationName] = {}}
                r['relations'][relationName][key.split(JOIN_TABLE_COLUMN_SPLIT)[1]] = r[key]
                delete r[key]
            }
        })
    })
}
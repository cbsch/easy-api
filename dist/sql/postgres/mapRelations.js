"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("./constants");
function mapRelations(result) {
    result.map(function (r) {
        r['relations'] = {};
        Object.keys(r).map(function (key) {
            if (key.match(constants_1.JOIN_TABLE_COLUMN_SPLIT)) {
                var relationName = key.split(constants_1.JOIN_TABLE_COLUMN_SPLIT)[0];
                if (!r['relations'][relationName]) {
                    r['relations'][relationName] = {};
                }
                r['relations'][relationName][key.split(constants_1.JOIN_TABLE_COLUMN_SPLIT)[1]] = r[key];
                delete r[key];
            }
        });
    });
}
exports.default = mapRelations;
//# sourceMappingURL=mapRelations.js.map
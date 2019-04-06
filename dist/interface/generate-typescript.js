"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var codebuilder_1 = require("./codebuilder");
function generateCode(models, path) {
    var code = codebuilder_1.default();
    models.forEach(function (model) {
        code.addcontainer(generateInterfaceText(model.definition));
    });
    fs_1.writeFileSync(path, code.get());
}
exports.default = generateCode;
function generateInterfaceText(table) {
    var code = codebuilder_1.default();
    code.addln("export interface " + table.name + " {").indent();
    table.columns.forEach(function (column) {
        switch (column.type) {
            case 'reference': {
                code.addln(column.name + "_id?: number");
                break;
            }
            case 'date': {
                code.addln(column.name + "?: Date");
                break;
            }
            case 'serial': {
                code.addln(column.name + "?: number");
                break;
            }
            default: {
                code.addln(column.name + "?: " + column.type);
            }
        }
    });
    var references = table.columns.filter(function (c) { return c.type === 'reference'; });
    if (references.length > 0) {
        code.addln("relations?: {").indent();
        references.forEach(function (column) {
            code.addln(column.name + "?: " + column.reference);
        });
        code.unindent().addln('}');
    }
    code.unindent().addln('}');
    return code;
}
exports.generateInterfaceText = generateInterfaceText;
//# sourceMappingURL=generate-typescript.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var codebuilder_1 = require("./codebuilder");
function writeCodeFile(models, path) {
    fs_1.writeFileSync(path, generateCode(models));
}
exports.default = writeCodeFile;
function generateCode(models) {
    var code = codebuilder_1.default();
    models.forEach(function (model) {
        code.addcontainer(generateInterfaceText(model.definition));
    });
    return code.get();
}
exports.generateCode = generateCode;
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
            case 'float': {
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
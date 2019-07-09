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
        if (column.type === 'reference') {
            code.addln(column.name + "_id?: number");
        }
        else {
            code.addln(column.name + "?: " + modelTypeToTSType(column.type));
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
function modelTypeToTSType(type) {
    switch (type) {
        case 'reference': {
            return 'number';
        }
        case 'date': {
            return 'Date';
        }
        case 'serial': {
            return 'number';
        }
        case 'float': {
            return 'number';
        }
        default: {
            return type;
        }
    }
}
exports.modelTypeToTSType = modelTypeToTSType;
//# sourceMappingURL=generate-typescript.js.map
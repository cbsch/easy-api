"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelTypeToTSType = exports.generateInterfaceText = exports.generateCode = void 0;
var fs_1 = require("fs");
var codebuilder_1 = require("./codebuilder");
function writeCodeFile(models, path) {
    (0, fs_1.writeFileSync)(path, generateCode(models));
}
exports.default = writeCodeFile;
function generateCode(models) {
    var code = (0, codebuilder_1.default)();
    models.forEach(function (model) {
        code.addcontainer(generateInterfaceText(model.definition));
    });
    return code.get();
}
exports.generateCode = generateCode;
function generateInterfaceText(table) {
    var code = (0, codebuilder_1.default)();
    code.addln("export interface ".concat(table.name, " {")).indent();
    table.columns.forEach(function (column) {
        if (column.type === 'reference') {
            code.addln("".concat(column.name, "_id?: number"));
        }
        else {
            code.addln("".concat(column.name, "?: ").concat(modelTypeToTSType(column.type)));
        }
    });
    var references = table.columns.filter(function (c) { return c.type === 'reference'; });
    if (references.length > 0) {
        code.addln("relations?: {").indent();
        references.forEach(function (column) {
            code.addln("".concat(column.name, "?: ").concat(column.reference));
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
        case 'uuid': {
            return 'string';
        }
        default: {
            return type;
        }
    }
}
exports.modelTypeToTSType = modelTypeToTSType;
//# sourceMappingURL=generate-typescript.js.map
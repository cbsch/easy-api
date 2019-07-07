"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var codebuilder_1 = require("../codebuilder");
var generate_typescript_1 = require("../generate-typescript");
var path_1 = require("path");
function writeCodeFile(models, path) {
    var interfacePath = path_1.join(path, 'interfaces.ts');
    fs_1.writeFileSync(interfacePath, generate_typescript_1.generateCode(models));
    var apiPath = path_1.join(path, 'index.ts');
    fs_1.writeFileSync(apiPath, generateApiCode(models).get());
    var templatePath = path_1.join(path, 'generated-api-lib.ts');
    var template = fs_1.readFileSync(path_1.join(__dirname, 'ts-api-template.ts'));
    fs_1.writeFileSync(templatePath, template);
    var modelJsonPath = path_1.join(path, 'models.json');
    var modelJson = generateModel(models);
    fs_1.writeFileSync(modelJsonPath, modelJson);
}
exports.default = writeCodeFile;
function generateApiCode(models) {
    var defs = models.map(function (model) { return model.definition; });
    var code = codebuilder_1.default();
    code.addln('import {').indent();
    for (var _i = 0, defs_1 = defs; _i < defs_1.length; _i++) {
        var def = defs_1[_i];
        code.addln(def.name + ",");
    }
    code.unindent().addln("} from './interfaces'");
    code.addln("import generateApi, { ApiOptions } from './generated-api-lib'").addln();
    code.addln('export default (options?: ApiOptions) => {').indent();
    code.addln('return {').indent();
    for (var _a = 0, defs_2 = defs; _a < defs_2.length; _a++) {
        var def = defs_2[_a];
        code.addln(def.name + ": generateApi<" + def.name + ">('" + def.name + "', options),");
    }
    code.unindent().addln('}');
    code.unindent().addln('}');
    return code;
}
exports.generateApiCode = generateApiCode;
function generateModel(models) {
    var defs = models.map(function (model) { return model.definition; });
    return JSON.stringify(defs, null, 2);
}
exports.generateModel = generateModel;
//# sourceMappingURL=generate-ts-client-api.js.map
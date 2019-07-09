"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var codebuilder_1 = require("../codebuilder");
var generate_typescript_1 = require("../generate-typescript");
var path_1 = require("path");
function writeClientApi(models, path) {
    var interfacePath = path_1.join(path, 'model-interfaces.ts');
    fs_1.writeFileSync(interfacePath, generate_typescript_1.generateCode(models));
    var apiPath = path_1.join(path, 'index.ts');
    fs_1.writeFileSync(apiPath, generateApiCode(models).get());
    var templatePath = path_1.join(path, 'generated-api-lib.ts');
    var template = fs_1.readFileSync(path_1.join(__dirname, 'ts-api-template.ts'));
    fs_1.writeFileSync(templatePath, template);
    var modelJsonPath = path_1.join(path, 'models.json');
    var modelJson = generateModel(models);
    fs_1.writeFileSync(modelJsonPath, modelJson);
    fs_1.writeFileSync(path_1.join(path, 'interfaces.ts'), fs_1.readFileSync(path_1.join(__dirname, '../../interfaces.ts')));
    fs_1.writeFileSync(path_1.join(path, 'query.ts'), fs_1.readFileSync(path_1.join(__dirname, '../../query.ts')));
    fs_1.writeFileSync(path_1.join(path, 'query-interfaces.ts'), generateQueryBuilderInterfaces(models));
}
exports.default = writeClientApi;
function generateApiCode(models) {
    var defs = models.map(function (model) { return model.definition; });
    var code = codebuilder_1.default();
    code.addln('import {').indent();
    for (var _i = 0, defs_1 = defs; _i < defs_1.length; _i++) {
        var def = defs_1[_i];
        code.addln(def.name + ",");
    }
    code.unindent().addln("} from './model-interfaces'");
    code.addln('import {').indent();
    for (var _a = 0, defs_2 = defs; _a < defs_2.length; _a++) {
        var def = defs_2[_a];
        code.addln(def.name + "QueryBuilder,");
    }
    code.unindent().addln("} from './query-interfaces'");
    code.addln("import generateApi, { ApiOptions } from './generated-api-lib'").addln();
    code.addln('export default (options?: ApiOptions) => {').indent();
    code.addln('return {').indent();
    for (var _b = 0, defs_3 = defs; _b < defs_3.length; _b++) {
        var def = defs_3[_b];
        code.addln(def.name + ": generateApi<" + def.name + ", " + def.name + "QueryBuilder<" + def.name + ">>('" + def.name + "', options),");
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
function generateQueryBuilderInterfaces(models) {
    var defs = models.map(function (model) { return model.definition; });
    var code = codebuilder_1.default();
    code.addln("import { Filter, OrderBy } from './query'");
    for (var _i = 0, defs_4 = defs; _i < defs_4.length; _i++) {
        var def = defs_4[_i];
        var ifName = def.name + "QueryBuilder<T>";
        code.addln("export interface " + ifName + " {").indent();
        code.addln("filter: {").indent();
        for (var _a = 0, _b = def.columns; _a < _b.length; _a++) {
            var column = _b[_a];
            if (column.type === 'reference') {
                code.addln(column.name + "_id?: Filter<number, " + ifName + ">");
            }
            else {
                code.addln(column.name + "?: Filter<" + generate_typescript_1.modelTypeToTSType(column.type) + ", " + ifName + ">");
            }
        }
        code.unindent().addln("}");
        code.addln("orderby: {").indent();
        for (var _c = 0, _d = def.columns; _c < _d.length; _c++) {
            var column = _d[_c];
            if (column.type === 'reference') {
                code.addln(column.name + "_id?: OrderBy<" + ifName + ">");
            }
            else {
                code.addln(column.name + "?: OrderBy<" + ifName + ">");
            }
        }
        code.unindent().addln('}');
        code.addln("relations: () => " + ifName);
        code.addln("toString: () => string");
        code.addln("get: () => Promise<T[]>");
        code.unindent().addln('}');
    }
    return code.get();
}
exports.generateQueryBuilderInterfaces = generateQueryBuilderInterfaces;
//# sourceMappingURL=generate-ts-client-api.js.map
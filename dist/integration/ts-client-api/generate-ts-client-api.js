"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQueryBuilderInterfaces = exports.generateModel = exports.generateApiCode = void 0;
var fs_1 = require("fs");
var codebuilder_1 = require("../codebuilder");
var generate_typescript_1 = require("../generate-typescript");
var path_1 = require("path");
function writeClientApi(models, path) {
    var interfacePath = (0, path_1.join)(path, 'model-interfaces.ts');
    (0, fs_1.writeFileSync)(interfacePath, (0, generate_typescript_1.generateCode)(models));
    var apiPath = (0, path_1.join)(path, 'index.ts');
    (0, fs_1.writeFileSync)(apiPath, generateApiCode(models).get());
    var templatePath = (0, path_1.join)(path, 'generated-api-lib.ts');
    var template = (0, fs_1.readFileSync)((0, path_1.join)(__dirname, '../../../src/integration/ts-client-api/ts-api-template.ts'));
    (0, fs_1.writeFileSync)(templatePath, template);
    (0, fs_1.writeFileSync)((0, path_1.join)(path, 'generated-ws-api-lib.ts'), (0, fs_1.readFileSync)((0, path_1.join)(__dirname, '../../../src/integration/ts-client-api/ts-ws-api-template.ts')));
    var modelJsonPath = (0, path_1.join)(path, 'models.json');
    var modelJson = generateModel(models);
    (0, fs_1.writeFileSync)(modelJsonPath, modelJson);
    (0, fs_1.writeFileSync)((0, path_1.join)(path, 'interfaces.ts'), (0, fs_1.readFileSync)((0, path_1.join)(__dirname, '../../../src/interfaces.ts')));
    (0, fs_1.writeFileSync)((0, path_1.join)(path, 'query.ts'), (0, fs_1.readFileSync)((0, path_1.join)(__dirname, '../../../src/query.ts')));
    (0, fs_1.writeFileSync)((0, path_1.join)(path, 'query-interfaces.ts'), generateQueryBuilderInterfaces(models));
}
exports.default = writeClientApi;
function generateApiCode(models) {
    var defs = models.map(function (model) { return model.definition; });
    var code = (0, codebuilder_1.default)();
    code.addln('import {').indent();
    for (var _i = 0, defs_1 = defs; _i < defs_1.length; _i++) {
        var def = defs_1[_i];
        code.addln("".concat(def.name, ","));
    }
    code.unindent().addln("} from './model-interfaces'");
    code.addln('import {').indent();
    for (var _a = 0, defs_2 = defs; _a < defs_2.length; _a++) {
        var def = defs_2[_a];
        code.addln("".concat(def.prettyName, "QueryBuilder,"));
    }
    code.unindent().addln("} from './query-interfaces'");
    code.addln("import generateApi, { ApiOptions } from './generated-api-lib'").addln();
    code.addln('export default (options?: ApiOptions) => {').indent();
    code.addln('return {').indent();
    for (var _b = 0, defs_3 = defs; _b < defs_3.length; _b++) {
        var def = defs_3[_b];
        code.addln("".concat(def.name, ": generateApi<").concat(def.name, ", ").concat(def.prettyName, "QueryBuilder<").concat(def.name, ">>('").concat(def.name, "', options),"));
    }
    code.unindent().addln('}');
    code.unindent().addln('}');
    code.addln();
    code.addln("import generateSocketApi, { WSApiOptions } from './generated-ws-api-lib'").addln();
    code.addln('export const socketApi = (options?: WSApiOptions) => {').indent();
    code.addln('return {').indent();
    for (var _c = 0, defs_4 = defs; _c < defs_4.length; _c++) {
        var def = defs_4[_c];
        code.addln("".concat(def.name, ": generateSocketApi<").concat(def.name, ", ").concat(def.prettyName, "QueryBuilder<").concat(def.name, ">>('").concat(def.name, "', options),"));
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
    var code = (0, codebuilder_1.default)();
    code.addln("import { Filter, OrderBy } from './query'");
    for (var _i = 0, defs_5 = defs; _i < defs_5.length; _i++) {
        var def = defs_5[_i];
        var interfaceName = "".concat(def.prettyName, "QueryBuilder<T>");
        code.addln("export interface ".concat(interfaceName, " {")).indent();
        code.addln("filter: {").indent();
        for (var _a = 0, _b = def.columns; _a < _b.length; _a++) {
            var column = _b[_a];
            var name_1 = column.type === 'reference' ? column.name + "_id" : column.name;
            code.addln("".concat(name_1, ": Filter<").concat((0, generate_typescript_1.modelTypeToTSType)(column.type), ", ").concat(interfaceName, ">"));
        }
        code.unindent().addln("}");
        code.addln("orderby: {").indent();
        for (var _c = 0, _d = def.columns; _c < _d.length; _c++) {
            var column = _d[_c];
            var name_2 = column.type === 'reference' ? column.name + "_id" : column.name;
            code.addln("".concat(name_2, ": OrderBy<").concat(interfaceName, ">"));
        }
        code.unindent().addln('}');
        code.addln("groupby: {").indent();
        for (var _e = 0, _f = def.columns; _e < _f.length; _e++) {
            var column = _f[_e];
            var name_3 = column.type === 'reference' ? column.name + "_id" : column.name;
            code.addln("".concat(name_3, ": () => ").concat(interfaceName));
        }
        code.unindent().addln('}');
        code.addln("select: {").indent();
        for (var _g = 0, _h = def.columns; _g < _h.length; _g++) {
            var column = _h[_g];
            var name_4 = column.type === 'reference' ? column.name + "_id" : column.name;
            code.addln("".concat(name_4, ": () => ").concat(interfaceName));
        }
        code.unindent().addln('}');
        code.addln("relations: () => ".concat(interfaceName));
        code.addln("count: () => ".concat(interfaceName));
        code.addln("toString: () => string");
        code.addln("get: () => Promise<T[]>");
        code.unindent().addln('}');
    }
    return code.get();
}
exports.generateQueryBuilderInterfaces = generateQueryBuilderInterfaces;
//# sourceMappingURL=generate-ts-client-api.js.map
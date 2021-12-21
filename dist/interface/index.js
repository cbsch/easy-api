"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePowershell = void 0;
var model_1 = require("../model");
var generate_csharp_1 = require("./generate-csharp");
var generate_powershell_1 = require("./generate-powershell");
var generate_typescript_1 = require("./generate-typescript");
var generate_plantuml_1 = require("./generate-plantuml");
var generate_ts_client_api_1 = require("./ts-client-api/generate-ts-client-api");
function generateCode(language, path, namespace) {
    var models = Object.keys(model_1.generatedModel).map(function (key) { return model_1.generatedModel[key]; });
    namespace = namespace ? namespace : "GeneratedApi";
    switch (language) {
        case "csharp": {
            (0, generate_csharp_1.default)(models, path, namespace);
            break;
        }
        case "powershell": {
            (0, generate_powershell_1.default)(models, path);
            break;
        }
        case "typescript": {
            (0, generate_typescript_1.default)(models, path);
            break;
        }
        case "typescript_api": {
            (0, generate_ts_client_api_1.default)(models, path);
            break;
        }
        case "plantuml": {
            (0, generate_plantuml_1.default)(models, path);
            break;
        }
    }
}
exports.default = generateCode;
function generatePowershell(path, requestFnName, cmdletPrefix) {
    var models = Object.keys(model_1.generatedModel).map(function (key) { return model_1.generatedModel[key]; });
    (0, generate_powershell_1.default)(models, path, requestFnName, cmdletPrefix);
}
exports.generatePowershell = generatePowershell;
//# sourceMappingURL=index.js.map
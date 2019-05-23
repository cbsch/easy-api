"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var model_1 = require("../model");
var generate_csharp_1 = require("./generate-csharp");
var generate_powershell_1 = require("./generate-powershell");
var generate_typescript_1 = require("./generate-typescript");
function generateCode(language, path) {
    var models = Object.keys(model_1.generatedModel).map(function (key) { return model_1.generatedModel[key]; });
    switch (language) {
        case "csharp": {
            generate_csharp_1.default(models, path);
            break;
        }
        case "powershell": {
            generate_powershell_1.default(models, path);
            break;
        }
        case "typescript": {
            generate_typescript_1.default(models, path);
            break;
        }
    }
}
exports.default = generateCode;
//# sourceMappingURL=index.js.map
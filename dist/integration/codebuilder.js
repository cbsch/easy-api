"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getCodeBuilder() {
    var _text = '';
    var _indentLevel = 0;
    var _numIndentSpaces = 4;
    var obj = {
        add: function (text) { _text += ' '.repeat(_indentLevel * _numIndentSpaces) + text; return obj; },
        addln: function (text) { _text += ' '.repeat(_indentLevel * _numIndentSpaces) + (text ? text : '') + '\n'; return obj; },
        addcontainer: function (container) {
            container.get().split('\n').map(function (s) { return obj.addln(s); });
            return obj;
        },
        indent: function () { _indentLevel++; return obj; },
        unindent: function () { _indentLevel = _indentLevel === 0 ? 0 : _indentLevel - 1; return obj; },
        get: function () { return _text; }
    };
    return obj;
}
exports.default = getCodeBuilder;
//# sourceMappingURL=codebuilder.js.map


export interface CodeBuilder {
    add: (text: string) => CodeBuilder,
    addln: (text?: string) => CodeBuilder,
    addcontainer: (container: CodeBuilder) => CodeBuilder,
    indent: () => CodeBuilder,
    unindent: () => CodeBuilder,
    get: () => string,
}

export default function getCodeBuilder(): CodeBuilder {
    let _text = ''
    let _indentLevel = 0
    let _numIndentSpaces = 4

    const obj = {
        add: (text: string) => { _text += ' '.repeat(_indentLevel * _numIndentSpaces) + text; return obj},
        addln: (text?: string) => { _text += ' '.repeat(_indentLevel * _numIndentSpaces) + (text ? text : '') + '\n'; return obj},
        addcontainer: (container: CodeBuilder) => {
            container.get().split('\n').map(s => obj.addln(s))
            return obj
        },
        indent: () => { _indentLevel++; return obj},
        unindent: () => { _indentLevel = _indentLevel === 0 ? 0 : _indentLevel - 1; return obj},
        get: () => { return _text }
    }

    return obj
}

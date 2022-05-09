export interface CodeBuilder {
    add: (text: string) => CodeBuilder;
    addln: (text?: string) => CodeBuilder;
    addcontainer: (container: CodeBuilder) => CodeBuilder;
    indent: () => CodeBuilder;
    unindent: () => CodeBuilder;
    get: () => string;
}
export default function getCodeBuilder(): CodeBuilder;

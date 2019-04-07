interface QueryBuilder {
    name: QueryBuilderValue<string>;
    id: QueryBuilderValue<number>;
    get: () => string;
}
interface QueryBuilderValue<T> {
    eq: (value: T) => QueryBuilder;
    in: (value: T[]) => QueryBuilder;
}
declare const testFilter: () => QueryBuilder;

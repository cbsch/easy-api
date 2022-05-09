import { Table } from "../../interfaces";
export default function generateInsert<T>(def: Table<T>, data: T): string;

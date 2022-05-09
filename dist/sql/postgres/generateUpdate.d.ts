import { Table } from "../../interfaces";
export default function generateUpdate<T>(def: Table<T>, data: T): string;

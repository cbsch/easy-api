import { Table, SelectArgs } from "../../interfaces";
export default function generateSelect<T>(def: Table<T>, args?: SelectArgs): string;

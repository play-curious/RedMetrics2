import React from "react";

import Button from "./Button";

import {
  faSyncAlt,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const unneededColumns: string[] = ["custom_data"];

export default function SortBy<Table>({
  row,
  onChange,
}: {
  row: Table;
  onChange: (sortBy: `${string} ${"asc" | "desc"}`) => unknown;
}) {
  const columns = Object.keys(row).filter(
    (key) => !unneededColumns.includes(key)
  ) as (keyof Table)[];

  const [order, setOrder] = React.useState<"asc" | "desc">("desc");
  const [column, setColumn] = React.useState<keyof Table>(columns[0]);
  const [pattern, setPattern] = React.useState<`${string} ${"asc" | "desc"}`>();

  const _pattern = `${column} ${order}`;

  if (pattern !== _pattern) {
    setPattern(`${column} ${order}`);
    onChange(`${column} ${order}`);
  }

  return (
    <div className="flex items-center">
      Sort list by column name:
      <span
        className="bg-transparent text-red-500 px-2 cursor-pointer"
        onClick={() =>
          setColumn(columns[columns.indexOf(column) + 1] ?? columns[0])
        }
      >
        {column}
      </span>
      and by order:
      <span
        className="bg-transparent text-red-500 px-2 cursor-pointer"
        onClick={() => {
          setOrder(order === "asc" ? "desc" : "asc");
        }}
      >
        {order}
        <FontAwesomeIcon
          className="px-2"
          icon={order === "asc" ? faSortUp : faSortDown}
        />
      </span>
    </div>
  );
}

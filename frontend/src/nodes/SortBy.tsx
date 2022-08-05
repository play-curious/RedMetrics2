import React from "react";

import { faSortUp, faSortDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import * as utils from "../utils";

const unneededColumns: string[] = ["custom_data"];

export default function SortBy<Table>({
  row,
  onChange,
}: {
  row: Table;
  onChange: (sortBy: `${string} ${"asc" | "desc"}`) => unknown;
}) {
  const columns = Object.keys(row)
    .filter((key) => !unneededColumns.includes(key))
    .map(utils.camelToSnakeCase) as (keyof Table)[];

  const [order, setOrder] = React.useState<"asc" | "desc">("desc");
  const [column, setColumn] = React.useState<keyof Table>();
  const [pattern, setPattern] = React.useState<`${string} ${"asc" | "desc"}`>();

  if (!column) {
    if (columns.includes("updated_timestamp" as any))
      setColumn("updated_timestamp" as any);
    else if (columns.includes("created_timestamp" as any))
      setColumn("created_timestamp" as any);
    else setColumn(columns[0]);
    return <div />;
  }

  const _pattern: `${string} ${"asc" | "desc"}` = `${column} ${order}`;

  if (pattern !== _pattern) {
    console.log(_pattern);
    onChange(_pattern);
    setPattern(_pattern);
    return <div />;
  }

  return (
    <div className="flex items-center">
      Sort list by column name:
      <span
        className="bg-transparent text-red-500 px-2 cursor-pointer"
        onClick={() =>
          setColumn(columns[columns.indexOf(column as any) + 1] ?? columns[0])
        }
      >
        {column}
      </span>
      and by order:
      <span
        className="bg-transparent text-red-500 px-2 cursor-pointer"
        onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
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

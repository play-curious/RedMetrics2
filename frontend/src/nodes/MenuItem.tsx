import React from "react";
import * as Dom from "react-router-dom";

export default function MenuItem({
  to,
  children: text,
}: {
  to: string;
  children: string | number;
}) {
  return (
    <Dom.Link
      className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
      to={to}
    >
      {text}
    </Dom.Link>
  );
}

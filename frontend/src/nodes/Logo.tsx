import React from "react";
import * as Dom from "react-router-dom";

export default function Logo({ bg }: { bg?: boolean }) {
  return (
    <Dom.Link to="/">
      <span
        className={
          "text-7x1 " + (bg ? "bg-gray-800 px-2 rounded inline-block" : "")
        }
      >
        <span className="text-red-600">Red</span>
        <span className="text-red-100">Metrics</span>
        <span className="text-red-600">2</span>
      </span>
    </Dom.Link>
  );
}

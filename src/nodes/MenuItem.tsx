import React from "react";
import * as Dom from "react-router-dom";

const MenuItem: React.FunctionComponent<{
  to: string;
  children: string | number;
}> = ({ to, children: text }) => {
  return (
    <Dom.Link
      className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
      to={to}
    >
      {text}
    </Dom.Link>
  );
};

export default MenuItem;

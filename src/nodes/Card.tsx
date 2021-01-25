import React from "react";
import * as Dom from "react-router-dom";

const Card: React.FunctionComponent<{
  title: string;
  description: string;
  fields: string[];
  url: string;
}> = ({ title, description, fields, url }) => (
  <Dom.Link className="max-w-2xl mx-auto sm:px-6 lg:px-8" to={url}>
    <div className="overflow-hidden shadow-md">
      <div className="px-6 py-4 bg-white border-b border-gray-200 font-bold uppercase">
        {title}
      </div>
      <div className="p-6 bg-white border-b border-gray-200">
        {description}{" "}
        {fields.map((field) => {
          return <p> {field} </p>;
        })}
      </div>
      <div className="p-6 bg-white border-gray-200 text-right">footer</div>
    </div>
  </Dom.Link>
);

export default Card;

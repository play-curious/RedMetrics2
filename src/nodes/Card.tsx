import React from "react";
import * as Dom from "react-router-dom";

const Card: React.FunctionComponent<{
  title: string;
  description: string;
  fields: string[];
  url: string;
}> = ({ title, description, fields, url }) => (
  <>
    <Dom.Link className="card" to={url}>
      <h3> {title} </h3>
      <p> {description} </p>
      <div>
        {fields.map((field) => {
          return <p> {field} </p>;
        })}
      </div>
    </Dom.Link>
  </>
);

export default Card;

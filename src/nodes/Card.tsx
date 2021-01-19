import React, { FunctionComponent } from "react";
import { Link } from "react-router-dom";
import "./Card.scss";

const Card: FunctionComponent<{
  title: string;
  description: string;
  fields: string[];
  url: string;
}> = ({ title, description, fields, url }) => (
  <>
    <Link className="card" to={url}>
      <h3> {title} </h3>
      <p> {description} </p>
      <div>
        {fields.map((field) => {
          return <p> {field} </p>;
        })}
      </div>
    </Link>
  </>
);

export default Card;

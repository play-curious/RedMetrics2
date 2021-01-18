import React from "react";
import { Link } from "react-router-dom";
import "./Card.scss";

export default abstract class Card extends React.Component {
  props = {
    title: "Mon titre",
    description: "Ma description",
    fields: [],
    url: "",
  };

  state = {
    selected: false,
  };

  render() {
    return (
      <Link
        className={`card ${this.state.selected && "selected"}`}
        to={this.props.url}
      >
        <h3> {this.props.title} </h3>
        <p> {this.props.description} </p>
        <div>
          {this.props.fields.map((field) => {
            return <p> {field} </p>;
          })}
        </div>
      </Link>
    );
  }
}

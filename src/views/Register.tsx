import React from "react";
import App from "../App";
import { Link } from "react-router-dom";

export default class Register extends React.Component {
  props: {
    setAPIKey: ((this: App, apiKey: string) => void) | null;
  } = {
    setAPIKey: null,
  };

  render() {
    return (
      <div className="Register">
        <h1> REGISTEEEER </h1>
        <Link
          className="button"
          to={{
            pathname: "/login",
          }}
        >
          Just login
        </Link>
      </div>
    );
  }
}

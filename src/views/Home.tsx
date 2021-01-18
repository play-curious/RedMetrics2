import React from "react";
import { Redirect } from "react-router";
import { Link } from "react-router-dom";

export default class Home extends React.Component {
  props: {
    apiKey: string | null;
  } = { apiKey: null };
  state: {} = {};

  render() {
    if (this.props.apiKey) {
      return (
        <div className="Home">
          <div className="center">
            <h1> Home </h1>
            <h2> What is RedMetrics? </h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolor
              ducimus eos fugit officia, rem reprehenderit sequi totam.
              Accusamus consequatur dolores esse ipsa natus pariatur quae quo
              quod ratione, recusandae sint.
            </p>
            <h2> I want to use it! </h2>
            <Link className="button" to={{ pathname: "/tutorial" }}>
              Getting started
            </Link>
            <Link className="button" to={{ pathname: "/docs" }}>
              Documentation
            </Link>
          </div>
        </div>
      );
    }

    return <Redirect to="/register" />;
  }
}

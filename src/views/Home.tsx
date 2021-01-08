import React from "react";
import { Redirect } from "react-router";

export default class Home extends React.Component {
  props: {
    apiKey: string | null;
  } = { apiKey: null };
  state: {} = {};

  render() {
    if (this.props.apiKey) {
      return <div className="Home">HOOOOOOME</div>;
    }

    return <Redirect to="/register" />;
  }
}

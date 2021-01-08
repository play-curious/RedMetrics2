import React from "react";
import App from "../App";

export default class Login extends React.Component {
  props: {
    setAPIKey: ((this: App, apiKey: string) => void) | null;
  } = {
    setAPIKey: null,
  };

  state: {
    email: string;
    password: string;
  } = {
    email: "",
    password: "",
  };

  handleChange = (event: any) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
  };

  render() {
    return (
      <div className="Login">
        <div className="center">
          <h1> Login </h1>
          <form onSubmit={this.handleSubmit}>
            <input
              type="email"
              name="email"
              value={this.state.email}
              placeholder="Email"
              onChange={this.handleChange}
            />
            <input
              type="password"
              name="password"
              value={this.state.password}
              placeholder="Password"
              onChange={this.handleChange}
            />
            <input type="submit" value="Go" />
          </form>
        </div>
      </div>
    );
  }
}

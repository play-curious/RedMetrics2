import axios from "axios";
import React from "react";
import { Redirect } from "react-router";

export default class Login extends React.Component {
  props: {
    onApiKeyChange: ((apiKey: string) => void) | null;
  } = {
    onApiKeyChange: null,
  };

  state: {
    email: string;
    password: string;
    redirect: null | string;
  } = {
    email: "",
    password: "",
    redirect: null,
  };

  handleChange = (event: any) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await axios.post(
        "login",
        {
          email: this.state.email,
          password: this.state.password,
        },
        {
          baseURL: "http://localhost:6627/",
        }
      );

      this.props.onApiKeyChange?.(response.data.apiKey);

      this.setState({ redirect: "/home", password: "" });
    } catch (error) {
      this.setState({ redirect: "/error", password: "" });
    }
  };

  render() {
    return (
      <div className="Login">
        {this.state.redirect && <Redirect to={this.state.redirect} />}
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

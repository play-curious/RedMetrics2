import React from "react";
import App from "../App";
import { Link } from "react-router-dom";

export default class Register extends React.Component {
  props: {
    setAPIKey: ((this: App, apiKey: string) => void) | null;
  } = {
    setAPIKey: null,
  };

  state: {
    email: string;
    password: string;
    role: "dev" | "user";
  } = {
    email: "",
    password: "",
    role: "user",
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
      <div className="Register">
        <h1> Register </h1>
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
          <input
            type="radio"
            name="role"
            value="user"
            checked={this.state.role === "user"}
            onChange={this.handleChange}
          />
          <input
            type="radio"
            name="role"
            value="dev"
            checked={this.state.role === "dev"}
            onChange={this.handleChange}
          />
          <input type="submit" value="Go" />
        </form>
        <Link className="button" to={{ pathname: "/login" }}>
          Just login
        </Link>
      </div>
    );
  }
}

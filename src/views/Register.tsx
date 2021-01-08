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
        <div className="center">
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
            <div className="radio">
              <span> as </span>
              <label>
                user
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={this.state.role === "user"}
                  onChange={this.handleChange}
                />
              </label>
              <label>
                dev
                <input
                  type="radio"
                  name="role"
                  value="dev"
                  checked={this.state.role === "dev"}
                  onChange={this.handleChange}
                />
              </label>
            </div>
            <input type="submit" value="Go" />
          </form>
          <Link className="button" to={{ pathname: "/login" }}>
            Just login
          </Link>
        </div>
      </div>
    );
  }
}

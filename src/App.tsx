import React from "react";
import Register from "./views/Register";
import Login from "./views/Login";
import Home from "./views/Home";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.scss";
import AppError from "./views/AppError";

class App extends React.Component {
  state: {
    apiKey: string | null;
  } = {
    apiKey: null,
  };

  setAPIKey = (apiKey: string) => {
    this.setState({ apiKey });
  };

  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/">
            <Home apiKey={this.state.apiKey} />
          </Route>
          <Route exact path="/register">
            <Register setAPIKey={this.setAPIKey} />
          </Route>
          <Route exact path="/login">
            <Login setAPIKey={this.setAPIKey} />
          </Route>
          <Route exact path="/error">
            <AppError code={0} message={""} />
          </Route>
        </Switch>
      </Router>
    );
  }
}

export default App;

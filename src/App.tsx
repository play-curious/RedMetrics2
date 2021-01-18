import React from "react";
import Register from "./views/Register";
import Login from "./views/Login";
import Home from "./views/Home";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.scss";
import AppError from "./views/AppError";
import Admin from "./views/Admin";
import Documentation from "./views/Documentation";
import GettingStarted from "./views/GettingStarted";
import Search from "./views/Search";
import Profile from "./views/Profile";

class App extends React.Component {
  state: {
    apiKey: string | null;
  } = {
    apiKey: null,
  };

  handleApiKeyChange = (apiKey: string) => {
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
            <Register onApiKeyChange={this.handleApiKeyChange} />
          </Route>
          <Route exact path="/login">
            <Login onApiKeyChange={this.handleApiKeyChange} />
          </Route>
          <Route exact path="/error">
            <AppError code={0} message={""} />
          </Route>
          <Route exact path="/admin">
            <Admin />
          </Route>
          <Route exact path="/docs">
            <Documentation />
          </Route>
          <Route exact path="/tutorial">
            <GettingStarted />
          </Route>
          <Route exact path="/search">
            <Search />
          </Route>
          <Route exact path="/profile">
            <Profile />
          </Route>
        </Switch>
      </Router>
    );
  }
}

export default App;

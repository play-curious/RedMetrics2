import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import React from "react";
import Register from "./views/auth/Register";
import Login from "./views/auth/Login";
import Home from "./views/user/Home";
import AppError from "./views/system/AppError";
import Accounts from "./views/admin/Accounts";
import Documentation from "./views/info/Documentation";
import GettingStarted from "./views/info/GettingStarted";
import Search from "./views/user/Search";
import Profile from "./views/user/Profile";

import "./App.scss";

class App extends React.Component {
  state: {
    apiKey: string | null;
  } = {
    apiKey: null,
  };

  componentDidMount() {
    const apiKey = sessionStorage.getItem("apiKey");

    if (apiKey) {
      this.setState({ apiKey });
    }
  }

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
          <Route exact path="/accounts">
            <Accounts />
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

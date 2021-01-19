import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import React, { useState } from "react";
import Register from "./views/auth/Register";
import Login from "./views/auth/Login";
import Home from "./views/user/Home";
import AppError from "./views/system/AppError";
import Accounts from "./views/admin/Accounts";
import Documentation from "./views/info/Documentation";
import Tutorial from "./views/info/Tutorial";
import Search from "./views/user/Search";
import Profile from "./views/user/Profile";

import "./App.scss";

export default function App() {
  const [apiKey, setApiKey] = useState<string | null>(
    sessionStorage.getItem("apiKey")
  );

  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Home apiKey={apiKey} />
        </Route>
        <Route exact path="/register">
          <Register onApiKeyChange={setApiKey} />
        </Route>
        <Route exact path="/login">
          <Login onApiKeyChange={setApiKey} />
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
          <Tutorial />
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

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Register from "./views/auth/Register";
import Login from "./views/auth/Login";
import Home from "./views/user/Home";
import Accounts from "./views/admin/Accounts";
import Documentation from "./views/info/Documentation";
import Tutorial from "./views/info/Tutorial";
import Search from "./views/user/Search";
import Profile from "./views/user/Profile";
import GamePage from "./views/user/GamePage";
import AddGame from "./views/dev/AddGame";
import AddVersion from "./views/dev/AddVersion";

import * as types from "./types";
import * as constants from "./constants";

import NotFound from "./views/system/NotFound";

import "./App.scss";

export default function App() {
  const [apiKey, setApiKey] = useState<string | null>(
    sessionStorage.getItem("apiKey")
  );

  const [role, setRole] = useState<types.Role>("user");

  useEffect(() => {
    if (apiKey !== null)
      axios
        .get("/account?apikey=" + apiKey, { baseURL: constants.apiBaseURL })
        .then((response) => {
          setRole(response.data.role);
          sessionStorage.setItem("role", role);
        })
        .catch(() => {
          setApiKey(null);
        });
  }, [apiKey]);

  return (
    <>
      <Router>
        <Switch>
          <Route
            exact
            path="/"
            children={<Home apiKey={apiKey} role={role} />}
          />
          <Route
            exact
            path="/home"
            children={<Home apiKey={apiKey} role={role} />}
          />
          <Route
            exact
            path="/register"
            children={<Register onApiKeyChange={setApiKey} />}
          />
          <Route
            exact
            path="/login"
            children={<Login onApiKeyChange={setApiKey} />}
          />
          <Route
            exact
            path="/accounts"
            children={<Accounts role={role} apiKey={apiKey} />}
          />
          <Route exact path="/docs" children={<Documentation />} />
          <Route exact path="/tutorial" children={<Tutorial />} />
          <Route exact path="/search" children={<Search />} />
          <Route exact path="/profile" children={<Profile />} />
          <Route exact path="/game/show/:id" children={<GamePage />} />
          <Route exact path="/game/add" children={<AddGame role={role} />} />
          <Route
            exact
            path="/game/:id/version/add"
            children={<AddVersion role={role} />}
          />
          <Route component={NotFound} />
        </Switch>
      </Router>
    </>
  );
}

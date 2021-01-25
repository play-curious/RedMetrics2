import React from "react";
import * as Dom from "react-router-dom";

import axios from "axios";
import qs from "querystring";

import * as types from "./types";
import * as constants from "./constants";

import NotFound from "./views/system/NotFound";
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
import GameMenu from "./views/user/GameMenu";
import AddVersion from "./views/dev/AddVersion";
import Settings from "./views/system/Settings";

export default function App() {
  const [apiKey, setApiKey] = React.useState<string | null>(
    sessionStorage.getItem("apiKey")
  );

  const [user, setUser] = React.useState<types.SessionUser>();

  React.useEffect(() => {
    if (apiKey !== null)
      axios
        .get<types.SessionUser>(
          "/account?" + qs.stringify({ apikey: apiKey }),
          {
            baseURL: constants.apiBaseURL,
          }
        )
        .then((response) => {
          setUser(response.data);
        })
        .catch(() => {
          setApiKey(null);
        });
  }, [apiKey]);

  return (
    <>
      <Dom.BrowserRouter>
        <Dom.Switch>
          <Dom.Route
            exact
            path="/register"
            children={<Register onApiKeyChange={setApiKey} />}
          />
          <Dom.Route
            exact
            path="/login"
            children={<Login onApiKeyChange={setApiKey} />}
          />
          <Dom.Route exact path="/docs" children={<Documentation />} />
          <Dom.Route exact path="/tutorial" children={<Tutorial />} />
          <Dom.Route component={NotFound} />
          {user && (
            <>
              <Dom.Route
                exact
                path="/accounts"
                children={<Accounts user={user} />}
              />
              <Dom.Route
                exact
                path="/settings"
                children={<Settings user={user} />}
              />
              <Dom.Route exact path="/" children={<Home user={user} />} />
              <Dom.Route exact path="/home" children={<Home user={user} />} />
              <Dom.Route
                exact
                path="/search"
                children={<Search user={user} />}
              />
              <Dom.Route
                exact
                path="/profile"
                children={<Profile user={user} />}
              />
              <Dom.Route
                exact
                path="/game/show/:id"
                children={<GamePage user={user} />}
              />
              <Dom.Route
                exact
                path="/game/add"
                children={<AddGame user={user} />}
              />
              <Dom.Route
                exact
                path="/game/menu"
                children={<GameMenu user={user} />}
              />
              <Dom.Route
                exact
                path="/game/:id/version/add"
                children={<AddVersion user={user} />}
              />
            </>
          )}
        </Dom.Switch>
      </Dom.BrowserRouter>
    </>
  );
}

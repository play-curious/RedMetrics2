import React from "react";
import * as Dom from "react-router-dom";

import * as types from "./types";

import Register from "./views/Register";
import Login from "./views/Login";
import Documentation from "./views/Documentation";
import Tutorial from "./views/Tutorial";
import Accounts from "./views/Accounts";
import Settings from "./views/Settings";
import Home from "./views/Home";
import Search from "./views/Search";
import Profile from "./views/Profile";
import GamePage from "./views/GamePage";
import AddGame from "./views/AddGame";
import AddVersion from "./views/AddVersion";
import NotFound from "./views/NotFound";
import About from "./views/About";
import Games from "./views/Games";
import EditGame from "./views/EditGame";
import EditVersion from "./views/EditVersion";
import VersionPage from "./views/VersionPage";
import CreateAccount from "./views/CreateAccount";
import AccountPage from "./views/AccountPage";
import GameSessionPage from "./views/GameSessionPage";

export default function Routing({
  user,
  setApiKey,
}: {
  user?: types.ApiKeyUser;
  setApiKey: (apiKey: string) => unknown;
}) {
  return (
    <Dom.Switch>
      <Dom.Route
        exact
        path="/register"
        children={<Register setApiKey={setApiKey} />}
      />
      <Dom.Route
        exact
        path="/login"
        children={<Login setApiKey={setApiKey} />}
      />
      <Dom.Route exact path="/docs" children={<Documentation />} />
      <Dom.Route exact path="/tutorial" children={<Tutorial />} />
      <Dom.Route exact path="/about" children={<About />} />
      <Dom.Route exact path="/accounts" children={<Accounts user={user} />} />
      <Dom.Route
        exact
        path="/account/create"
        children={<CreateAccount user={user} />}
      />
      <Dom.Route
        exact
        path="/account/show/:id"
        children={<AccountPage user={user} />}
      />
      <Dom.Route exact path="/settings" children={<Settings user={user} />} />
      <Dom.Route exact path="/" children={<Home />} />
      <Dom.Route exact path="/home" children={<Home />} />
      <Dom.Route exact path="/search" children={<Search user={user} />} />
      <Dom.Route exact path="/profile" children={<Profile user={user} />} />
      <Dom.Route
        exact
        path="/version/show/:id"
        children={<VersionPage user={user} />}
      />
      <Dom.Route
        exact
        path="/version/edit/:id"
        children={<EditVersion user={user} />}
      />
      <Dom.Route
        exact
        path="/game/show/:id"
        children={<GamePage user={user} />}
      />
      <Dom.Route exact path="/games" children={<Games user={user} />} />
      <Dom.Route exact path="/game/add" children={<AddGame user={user} />} />
      <Dom.Route
        exact
        path="/game/edit/:id"
        children={<EditGame user={user} />}
      />
      <Dom.Route
        exact
        path="/game/session/show/:id"
        children={<GameSessionPage user={user} />}
      />
      <Dom.Route
        exact
        path="/game/:id/version/add"
        children={<AddVersion user={user} />}
      />
      <Dom.Route path="*" exact component={NotFound} />
    </Dom.Switch>
  );
}

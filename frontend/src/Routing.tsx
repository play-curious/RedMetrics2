import React from "react";
import * as Dom from "react-router-dom";

import * as types from "rm2-typings";

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
import NotFound from "./views/NotFound";
import About from "./views/About";
import Games from "./views/Games";
import EditGame from "./views/EditGame";
import CreateAccount from "./views/CreateAccount";
import AccountPage from "./views/AccountPage";
import GameSessionPage from "./views/GameSessionPage";

export default function Routing({ user }: { user?: types.tables.Account }) {
  return (
    <Dom.Switch>
      <Dom.Route exact path="/register" children={<Register />} />
      <Dom.Route exact path="/login" children={<Login />} />
      <Dom.Route exact path="/docs" children={<Documentation />} />
      <Dom.Route exact path="/tutorial" children={<Tutorial />} />
      <Dom.Route exact path="/about" children={<About />} />
      <Dom.Route exact path="/accounts" children={<Accounts user={user} />} />
      <Dom.Route
        exact
        path="/account/create"
        children={<CreateAccount user={user} />}
      />
      {user && (
        <Dom.Route
          exact
          path="/account/show/:id"
          children={AccountPage({ user })}
        />
      )}
      <Dom.Route exact path="/settings" children={<Settings user={user} />} />
      <Dom.Route exact path="/" children={<Home />} />
      <Dom.Route exact path="/home" children={<Home />} />
      <Dom.Route exact path="/search" children={<Search user={user} />} />
      <Dom.Route exact path="/profile" children={<Profile user={user} />} />
      {user && (
        <Dom.Route exact path="/game/show/:id" children={GamePage({ user })} />
      )}
      {user && <Dom.Route exact path="/games" children={Games({ user })} />}
      {user && (
        <Dom.Route exact path="/game/add" children={AddGame({ user })} />
      )}
      {user && (
        <Dom.Route
          exact
          path="/game/edit/:id"
          children={<EditGame user={user} />}
        />
      )}
      {user && (
        <Dom.Route
          exact
          path="/game/session/show/:id"
          children={<GameSessionPage user={user} />}
        />
      )}
      <Dom.Route path="*" exact component={NotFound} />
    </Dom.Switch>
  );
}

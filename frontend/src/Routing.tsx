import React from "react";
import * as Dom from "react-router-dom";

import * as types from "rm2-typings";

import Register from "./views/public/Register";
import Login from "./views/public/Login";
import Documentation from "./views/public/Documentation";
import Tutorial from "./views/public/Tutorial";
import AccountList from "./views/private/AccountList";
import Settings from "./views/public/Settings";
import Home from "./views/public/Home";
import GameView from "./views/private/GameView";
import GameAdd from "./views/private/GameAdd";
import NotFound from "./views/system/NotFound";
import About from "./views/public/About";
import GameList from "./views/private/GameList";
import GameEdit from "./views/private/GameEdit";
import EventView from "./views/private/EventView";
import AccountAdd from "./views/private/AccountAdd";
import AccountView from "./views/private/AccountView";
import SessionView from "./views/private/SessionView";
import ForgottenPassword from "./views/system/ForgottenPassword";
import ConfirmEmail from "./views/system/ConfirmEmail";
import APIKeyList from "./views/private/APIKeyList";

import * as Router from "react-router";

import { User } from "./utils";

export default function Routing({
  user,
  fetchUser,
}: {
  user?: User;
  fetchUser: () => unknown;
}) {
  return (
    <Dom.Switch>
      <Dom.Route exact path={["/", "/home"]}>
        <Home />
      </Dom.Route>
      <Dom.Route exact path="/register">
        <Register />
      </Dom.Route>
      <Dom.Route exact path="/reset-password">
        <ForgottenPassword />
      </Dom.Route>
      <Dom.Route exact path="/login">
        <Login deleteUser={fetchUser} />
      </Dom.Route>
      <Dom.Route exact path="/docs">
        <Documentation />
      </Dom.Route>
      <Dom.Route exact path="/tutorial">
        <Tutorial />
      </Dom.Route>
      <Dom.Route exact path="/about">
        <About />
      </Dom.Route>

      {user && (
        <>
          <Dom.Route exact path="/confirm-email">
            <ConfirmEmail />
          </Dom.Route>
          <Dom.Route exact path="/profile">
            <Router.Redirect to={"/account/show/" + user.id} />
          </Dom.Route>
          <Dom.Route exact path="/account/show/:id">
            <AccountView user={user} />
          </Dom.Route>
          {user.confirmed && (
            <>
              <Dom.Route exact path="/accounts">
                <AccountList user={user} />
              </Dom.Route>
              <Dom.Route exact path="/account/create">
                <AccountAdd user={user} />
              </Dom.Route>
              <Dom.Route exact path="/settings">
                <Settings user={user} />
              </Dom.Route>
              <Dom.Route exact path="/games">
                <GameList user={user} />
              </Dom.Route>
              <Dom.Route exact path="/game/add">
                <GameAdd user={user} />
              </Dom.Route>
              <Dom.Route exact path="/api-keys">
                <APIKeyList user={user} />
              </Dom.Route>
              <Dom.Route exact path="/game/edit/:id">
                <GameEdit />
              </Dom.Route>
              <Dom.Route exact path="/game/:game_id/session/show/:id">
                <SessionView />
              </Dom.Route>
              <Dom.Route
                exact
                path="/game/:game_id/session/:session_id/event/show/:id"
              >
                <EventView />
              </Dom.Route>
              <Dom.Route exact path="/game/show/:id">
                <GameView />
              </Dom.Route>
            </>
          )}
        </>
      )}

      <Dom.Route path="*" exact component={NotFound} />
    </Dom.Switch>
  );
}

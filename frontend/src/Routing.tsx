import React from "react";
import * as Dom from "react-router-dom";

import * as types from "rm2-typings";

import _Register from "./views/_Register";
import _Login from "./views/_Login";
import _Documentation from "./views/_Documentation";
import _Tutorial from "./views/_Tutorial";
import AccountList from "./views/AccountList";
import _Settings from "./views/_Settings";
import _Home from "./views/_Home";
import GameView from "./views/GameView";
import GameAdd from "./views/GameAdd";
import _NotFound from "./views/_NotFound";
import _About from "./views/_About";
import GameList from "./views/GameList";
import GameEdit from "./views/GameEdit";
import AccountAdd from "./views/AccountAdd";
import AccountView from "./views/AccountView";
import SessionView from "./views/SessionView";
import __ForgottenPassword from "./views/__ForgottenPassword";
import __ConfirmEmail from "./views/__ConfirmEmail";
import APIKeyList from "./views/APIKeyList";

import * as Router from "react-router";

export default function Routing({
  user,
  fetchUser,
}: {
  user?: types.tables.Account;
  fetchUser: () => unknown;
}) {
  return (
    <Dom.Switch>
      <Dom.Route exact path={["/", "/home"]}>
        <_Home />
      </Dom.Route>
      <Dom.Route exact path="/register">
        <_Register />
      </Dom.Route>
      <Dom.Route exact path="/forgotten-password">
        <__ForgottenPassword />
      </Dom.Route>
      <Dom.Route exact path="/login">
        <_Login deleteUser={fetchUser} />
      </Dom.Route>
      <Dom.Route exact path="/docs">
        <_Documentation />
      </Dom.Route>
      <Dom.Route exact path="/tutorial">
        <_Tutorial />
      </Dom.Route>
      <Dom.Route exact path="/about">
        <_About />
      </Dom.Route>

      {user && (
        <>
          <Dom.Route exact path="/confirm-email">
            <__ConfirmEmail />
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
                <_Settings user={user} />
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
              <Dom.Route exact path="/game/session/show/:id">
                <SessionView />
              </Dom.Route>
              <Dom.Route exact path="/game/show/:id">
                <GameView />
              </Dom.Route>
            </>
          )}
        </>
      )}

      <Dom.Route path="*" exact component={_NotFound} />
    </Dom.Switch>
  );
}

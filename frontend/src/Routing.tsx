import React from "react";
import env from "react-dotenv";
import * as Dom from "react-router-dom";

import * as types from "rm2-typings";

import Register from "./views/Register";
import Login from "./views/Login";
import Documentation from "./views/Documentation";
import Tutorial from "./views/Tutorial";
import Accounts from "./views/Accounts";
import Settings from "./views/Settings";
import Home from "./views/Home";
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
import ForgottenPassword from "./views/ForgottenPassword";
import ConfirmEmail from "./views/ConfirmEmail";

import Debug from "./nodes/Debug";

export default function Routing({
  user,
  fetchUser,
}: {
  user?: types.tables.Account;
  fetchUser: () => unknown;
}) {
  return (
    <Dom.Switch>
      <Dom.Route exact path="/debug">
        <Debug {...{ ...user, ...env }} />
      </Dom.Route>

      <Dom.Route exact path={["/", "/home"]}>
        <Home />
      </Dom.Route>
      <Dom.Route exact path="/register">
        <Register />
      </Dom.Route>
      <Dom.Route exact path="/forgotten-password">
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
          {user.confirmed && (
            <>
              <Dom.Route exact path="/accounts">
                <Accounts user={user} />
              </Dom.Route>
              <Dom.Route exact path="/account/create">
                <CreateAccount user={user} />
              </Dom.Route>
              <Dom.Route exact path="/account/show/:id">
                <AccountPage user={user} />
              </Dom.Route>
              <Dom.Route exact path="/settings">
                <Settings user={user} />
              </Dom.Route>
              <Dom.Route exact path="/profile">
                <Profile user={user} />
              </Dom.Route>
              <Dom.Route exact path="/game/show/:id">
                <GamePage />
              </Dom.Route>
              <Dom.Route exact path="/games">
                <Games user={user} />
              </Dom.Route>
              <Dom.Route exact path="/game/add">
                <AddGame user={user} />
              </Dom.Route>
              <Dom.Route exact path="/game/edit/:id">
                <EditGame />
              </Dom.Route>
              <Dom.Route exact path="/game/session/show/:id">
                <GameSessionPage />
              </Dom.Route>
            </>
          )}
        </>
      )}

      <Dom.Route path="*" component={NotFound} />
    </Dom.Switch>
  );
}

import React from "react";
import * as Dom from "react-router-dom";
import NotificationSystem from "react-notification-system";

import Clipboard from "clipboard";

import * as types from "rm2-typings";
import * as constants from "./constants";

import Routing from "./Routing";

import Header from "./nodes/Header";
import Container from "./nodes/Container";

import axios from "axios";
import Warn from "./nodes/Warn";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = constants.API_BASE_URL;

export default function App() {
  new Clipboard(".clipboard");

  const notificationSystem = React.createRef<NotificationSystem.System>();
  const [user, setUser] = React.useState<types.tables.Account>();

  const fetchUser = () => {
    axios
      .get<types.api.Account["Get"]["Response"]>("/account")
      .then((response) => {
        const user = response.data;

        notificationSystem.current?.addNotification({
          message: "Logged-in as " + user.email,
          level: "success",
        });

        setUser(user);
      })
      .catch(console.error);
  };

  if (!user) fetchUser();

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      <Dom.BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Header user={user} />
          {user &&
            (user.confirmed ? (
              ""
            ) : (
              <Warn type="danger">
                You need to
                <a className="text-blue-700" href="/confirm-email">
                  confirm your email
                </a>
                to access some parts of website!
              </Warn>
            ))}
          <Container>
            <div className="">
              {/*flex flex-col items-start*/}
              <Routing {...{ fetchUser, user }} />
            </div>
          </Container>
        </div>
      </Dom.BrowserRouter>
    </>
  );
}

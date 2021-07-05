import React from "react";
import * as Dom from "react-router-dom";
import NotificationSystem from "react-notification-system";

import Clipboard from "clipboard";

import * as types from "rm2-typings";
import * as constants from "./constants";

import Header from "./nodes/Header";
import Body from "./nodes/Body";
import Routing from "./Routing";
import Container from "./nodes/Container";

import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = constants.API_BASE_URL;

export default function App() {
  new Clipboard(".clipboard");

  const notificationSystem = React.createRef<NotificationSystem.System>();
  const [user, setUser] = React.useState<types.tables.Account>();

  if (!user)
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

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      <Dom.BrowserRouter>
        <Header user={user} deleteUser={() => setUser(undefined)} />
        <Body>
          <Container>
            <Routing user={user} />
          </Container>
        </Body>
      </Dom.BrowserRouter>
    </>
  );
}

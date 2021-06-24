import React from "react";
import * as Dom from "react-router-dom";
import NotificationSystem from "react-notification-system";

import axios from "axios";
import Clipboard from "clipboard";

import * as types from "rm2-typings";
import * as constants from "./constants";

import Footer from "./nodes/Footer";
import Header from "./nodes/Header";
import Body from "./nodes/Body";
import Routing from "./Routing";
import Container from "./nodes/Container";

export default function App() {
  new Clipboard(".clipboard");

  const notificationSystem = React.createRef<NotificationSystem.System>();
  const [user, setUser] = React.useState<types.tables.Account>();

  if (!user)
    axios
      .get<types.api.Account["Get"]["Response"]>("/account", {
        baseURL: constants.API_BASE_URL,
      })
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
        <Footer />
      </Dom.BrowserRouter>
    </>
  );
}

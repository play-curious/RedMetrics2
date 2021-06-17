import React from "react";
import * as Dom from "react-router-dom";
import NotificationSystem from "react-notification-system";

import axios from "axios";
import qs from "querystring";
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
  const [apikey, setApiKey] = React.useState<string | null>(
    sessionStorage.getItem("apiKey")
  );
  const [user, setUser] = React.useState<types.ApiKeyUser>();

  if (!user)
    axios
      .get<types.ApiKeyUser>("/account?" + qs.stringify({ apikey }), {
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
        <Header
          setApiKey={(apiKey: string | null) => setApiKey(apiKey)}
          user={user}
          deleteUser={() => setUser(undefined)}
        />
        <Body>
          <Container>
            <Routing
              setApiKey={(apiKey: string) => setApiKey(apiKey)}
              user={user}
            />
          </Container>
        </Body>
        <Footer />
      </Dom.BrowserRouter>
    </>
  );
}

import React from "react";
import * as Dom from "react-router-dom";
import NotificationSystem from "react-notification-system";

import Clipboard from "clipboard";

import * as types from "rm2-typings";
import * as constants from "./constants";

import Routing from "./Routing";

import Header from "./nodes/Header";
import Container from "./nodes/Container";
import Warn from "./nodes/Warn";
import Footer from "./nodes/Footer";
import Wrapper from "./nodes/Wrapper";

import { User } from "./utils";

types.utils.setupConfig({
  withCredentials: true,
  baseURL: constants.API_BASE_URL,
});

const request = types.utils.request;

export default function App() {
  new Clipboard(".clipboard");

  const notificationSystem = React.createRef<NotificationSystem.System>();
  const [user, setUser] = React.useState<User>();

  const fetchUser = async () => {
    const { data } = await request<types.api.Account>(
      "Get",
      "/account",
      undefined
    );

    notificationSystem.current?.addNotification({
      message: "Logged-in as " + data.email,
      level: "success",
    });

    setUser(data);
  };

  if (!user) fetchUser().catch(console.error);

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      <Dom.BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Header user={user} />
          <Container>
            {user &&
              (user.confirmed ? (
                ""
              ) : (
                <div className="mt-2">
                  <Wrapper>
                    <Warn type="danger">
                      You need to
                      <Dom.Link to="/confirm-email">
                        <span className="text-red-900 hover:text-blue-600">
                          {" "}
                          confirm your email{" "}
                        </span>
                      </Dom.Link>
                      to access some parts of website!
                    </Warn>
                  </Wrapper>
                </div>
              ))}
            <Routing {...{ fetchUser, user }} />
          </Container>
          {/*<Footer />*/}
        </div>
      </Dom.BrowserRouter>
    </>
  );
}

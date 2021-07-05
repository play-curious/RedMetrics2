import axios from "axios";
import React from "react";
import * as Router from "react-router";
import * as Dom from "react-router-dom";

import NotificationSystem from "react-notification-system";

import * as constants from "../constants";
import { api as types } from "rm2-typings";

import Center from "../nodes/Center";
import CustomForm from "../nodes/CustomForm";

export default function Register() {
  const [redirect, setRedirect] = React.useState<null | string>(null);
  const notificationSystem = React.createRef<NotificationSystem.System>();

  return (
    <> WIP </> || (
      <>
        {redirect && <Router.Redirect to={redirect} />}
        <NotificationSystem ref={notificationSystem} />
        <div className="register">
          <Center>
            <h1> Register </h1>
            <CustomForm
              className="flex flex-col"
              submitText="Submit"
              inputs={{
                email: {
                  is: "email",
                  placeholder: "Email",
                  label: "Email",
                  required: true,
                },
                password: {
                  is: "password",
                  placeholder: "Password",
                  label: "Password",
                  required: true,
                },
              }}
              onSubmit={(data: types.Register["Post"]["Body"]) => {
                axios
                  .post<types.Register["Post"]["Response"]>("/register", data)
                  .then((response) => {
                    notificationSystem.current?.addNotification({
                      message: "Successful registered",
                      level: "success",
                    });
                    setRedirect("/home");
                  })
                  .catch((error) => {
                    notificationSystem.current?.addNotification({
                      message: error.message,
                      level: "error",
                    });
                  });
              }}
            >
              <Dom.Link className="button" to={{ pathname: "/login" }}>
                Login
              </Dom.Link>
            </CustomForm>
          </Center>
        </div>
      </>
    )
  );
}

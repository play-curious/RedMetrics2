import React from "react";
import * as Router from "react-router";
import * as Dom from "react-router-dom";

import NotificationSystem from "react-notification-system";

import * as types from "rm2-typings";

import CustomForm from "../nodes/CustomForm";

import * as utils from "../utils";

const request = types.utils.request;

export default function _Register() {
  const [redirect, setRedirect] = React.useState<null | string>(null);
  const notificationSystem = React.createRef<NotificationSystem.System>();

  utils.checkNotificationParams(notificationSystem).catch();

  return (
    <> WIP </> || (
      <>
        {redirect && <Router.Redirect to={redirect} />}
        <NotificationSystem ref={notificationSystem} />
        <div className="register">
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
            onSubmit={(data: types.api.Register["Methods"]["Post"]["Body"]) => {
              request<types.api.Register>("Post", "/register", data)
                .then(() => {
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
        </div>
      </>
    )
  );
}

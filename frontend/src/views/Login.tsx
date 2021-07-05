import axios from "axios";
import React from "react";
import * as Router from "react-router";

import NotificationSystem from "react-notification-system";

import * as types from "rm2-typings";

import Center from "../nodes/Center";
import CustomForm from "../nodes/CustomForm";

export default function Login({ deleteUser }: { deleteUser: () => unknown }) {
  const [redirect, setRedirect] = React.useState<null | string>(null);
  const notificationSystem = React.createRef<NotificationSystem.System>();

  return (
    <>
      {redirect && <Router.Redirect to={redirect} />}
      <NotificationSystem ref={notificationSystem} />
      <div className="min-h-full">
        <Center height="min-h-full">
          <h1> Login </h1>
          <CustomForm
            onSubmit={(data: types.api.Login["Post"]["Body"]) => {
              axios
                .post<types.api.Login["Post"]["Response"]>("/login", data)
                .then(() => {
                  notificationSystem.current?.addNotification({
                    message: "Successful connected",
                    level: "success",
                  });
                  deleteUser();
                  setRedirect("/home");
                  window.location.reload(true);
                })
                .catch((error) => {
                  notificationSystem.current?.addNotification({
                    message: error.message,
                    level: "error",
                  });
                });
            }}
            className="flex flex-col"
            submitText="Login"
            inputs={{
              email: {
                is: "email",
                placeholder: "Email",
                required: true,
              },
              password: {
                is: "password",
                placeholder: "Password",
                required: true,
              },
            }}
          />
        </Center>
      </div>
    </>
  );
}

import React from "react";
import * as Router from "react-router";
import NotificationSystem from "react-notification-system";

import * as types from "rm2-typings";

import axios from "axios";

import CustomForm from "../nodes/CustomForm";
import Button from "../nodes/Button";

export default function Login({ deleteUser }: { deleteUser: () => unknown }) {
  const [redirect, setRedirect] = React.useState<null | string>(null);
  const notificationSystem = React.createRef<NotificationSystem.System>();

  return (
    <>
      {redirect && <Router.Redirect to={redirect} />}
      <NotificationSystem ref={notificationSystem} />
      <div className="min-h-full">
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
                if (/40[14]/.test(error?.message)) {
                  return notificationSystem.current?.addNotification({
                    message: "Incorrect email or password",
                    level: "error",
                  });
                }

                notificationSystem.current?.addNotification({
                  message: error.message,
                  level: "error",
                });
              });
          }}
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
          otherButtons={
            <Button to="/forgotten-password">Forgotten password</Button>
          }
        />
      </div>
    </>
  );
}

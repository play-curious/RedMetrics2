import React from "react";
import * as Router from "react-router";
import NotificationSystem from "react-notification-system";

import * as types from "rm2-typings";
import * as utils from "../../utils";

import CustomForm from "../../nodes/CustomForm";
import Button from "../../nodes/Button";

const request = types.utils.request;

export default function Login({ deleteUser }: { deleteUser: () => unknown }) {
  const [redirect, setRedirect] = React.useState<null | string>(null);
  const notificationSystem = React.createRef<NotificationSystem.System>();

  utils.checkNotificationParams(notificationSystem).catch();

  return (
    <>
      {redirect && <Router.Redirect to={redirect} />}
      <NotificationSystem ref={notificationSystem} />
      <div className="min-h-full">
        <h1> Login </h1>
        <CustomForm
          onSubmit={(data: types.api.Login["Methods"]["Post"]["Body"]) => {
            request<types.api.Login>("Post", "/login", data)
              .then(() => {
                notificationSystem.current?.addNotification({
                  message: "Successful connected",
                  level: "success",
                });
                deleteUser();
                setRedirect("/home");
                window.location.reload();
              })
              .catch((error: any) => {
                if (/40[14]/.test(error?.message)) {
                  notificationSystem.current?.addNotification({
                    message: "Incorrect email or password",
                    level: "error",
                  });
                } else {
                  notificationSystem.current?.addNotification({
                    message: error.message,
                    level: "error",
                  });
                }
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
            <Button to="/reset-password" textOnly>
              Forgotten password
            </Button>
          }
        />
      </div>
    </>
  );
}

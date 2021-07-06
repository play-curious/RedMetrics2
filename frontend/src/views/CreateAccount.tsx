import React from "react";
import * as Router from "react-router";

import * as types from "rm2-typings";

import NotificationSystem from "react-notification-system";
import axios from "axios";
import * as uuid from "uuid";

import Center from "../nodes/Center";
import CustomForm from "../nodes/CustomForm";
import ErrorPage from "./ErrorPage";

export default function CreateAccount({
  user,
}: {
  user?: types.tables.Account;
}) {
  const notificationSystem = React.createRef<NotificationSystem.System>();
  const [redirect, setRedirect] = React.useState<null | string>(null);

  const password = uuid.v4();

  if (!user?.is_admin)
    return ErrorPage({
      text: "You must be administrator to access this page.",
    });

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      {redirect && <Router.Redirect to={redirect} />}
      <div className="register">
        <Center>
          <h1> Create account </h1>
          <CustomForm
            className="flex flex-col"
            onSubmit={(data: types.api.Account["Post"]["Body"]) => {
              axios
                .post<types.api.Account["Post"]["Response"]>("/account", data)
                .then(() => {
                  const message = `new account created with password: ${password}`;

                  console.info(message);
                  alert(message);

                  notificationSystem.current?.addNotification({
                    message: "Successful registered",
                    level: "success",
                  });
                  notificationSystem.current?.addNotification({
                    message: `new account created with password: ${password}`,
                    level: "info",
                  });

                  setRedirect("/accounts");
                })
                .catch((error) => {
                  notificationSystem.current?.addNotification({
                    message: error.message.includes("401")
                      ? "Email already used!"
                      : error.message,
                    level: "error",
                  });
                });
            }}
            submitText="Create"
            inputs={{
              password,
              email: {
                is: "email",
                required: true,
                placeholder: "Email",
              },
              is_admin: {
                is: "checkbox",
                label: "as admin?",
                checked: false,
              },
            }}
          />
        </Center>
      </div>
    </>
  );
}

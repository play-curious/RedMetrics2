import React from "react";
import * as Router from "react-router";
import * as uuid from "uuid";
import * as types from "rm2-typings";

import NotificationSystem from "react-notification-system";

import CustomForm from "../../nodes/CustomForm";
import Error from "../system/Error";

const request = types.utils.request;

export default function AccountAdd({
  user,
}: {
  user?: types.utils.SnakeToCamelCaseNested<types.tables.Account>;
}) {
  const notificationSystem = React.createRef<NotificationSystem.System>();
  const [redirect, setRedirect] = React.useState<null | string>(null);

  const password = uuid.v4();

  if (!user?.isAdmin)
    return Error({
      text: "You must be administrator to access this page.",
    });

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      {redirect && <Router.Redirect to={redirect} />}
      <div className="register">
        <h1> Create account </h1>
        <CustomForm
          className="flex flex-col"
          onSubmit={(data: types.api.Account["Methods"]["Post"]["Body"]) => {
            request<types.api.Account>("Post", "/account", data)
              .then(({ status }) => {
                const message = `New account created with password: ${password}`;

                console.info(message);
                alert(message);

                notificationSystem.current?.addNotification({
                  message: "Successful registered",
                  level: "success",
                });
                notificationSystem.current?.addNotification({
                  message,
                  level: "info",
                });

                setTimeout(() => {
                  if (status === 201) {
                    notificationSystem.current?.addNotification({
                      message: "Can't send the confirmation email...",
                      level: "error",
                    });
                  }
                }, 1000);

                setTimeout(() => {
                  notificationSystem.current?.addNotification({
                    message: "Redirect to accounts in 2 seconds...",
                    level: "info",
                  });
                }, 2000);

                setTimeout(() => {
                  setRedirect("/accounts");
                }, 4000);
              })
              .catch((error) => {
                if (error.message.includes("401")) {
                  notificationSystem.current?.addNotification({
                    message: "Email already used!",
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
          submitText="Create"
          inputs={{
            password,
            email: {
              is: "email",
              required: true,
              placeholder: "Email",
            },
            isAdmin: {
              is: "checkbox",
              label: "as admin?",
            },
          }}
        />
      </div>
    </>
  );
}

import React from "react";
import * as Router from "react-router";
import * as Form from "react-hook-form";

import * as types from "rm2-typings";
import * as constants from "../constants";

import NotificationSystem from "react-notification-system";
import axios from "axios";
import * as uuid from "uuid";

import Center from "../nodes/Center";
import CheckUser from "../nodes/CheckUser";
import CustomForm from "../nodes/CustomForm";

export default function CreateAccount({ user }: { user?: types.ApiKeyUser }) {
  const notificationSystem = React.createRef<NotificationSystem.System>();
  const [redirect, setRedirect] = React.useState<null | string>(null);

  const password = uuid.v4();

  const submit = (data: types.User) => {
    axios
      .post("/register", data, {
        baseURL: constants.API_BASE_URL,
      })
      .then((response) => {
        const id = response.data.id;

        const message = `new account created.\nwith id: ${id}\nwith password: ${password}`;

        console.info(message);
        alert(message);

        notificationSystem.current?.addNotification({
          message: "Successful registered",
          level: "success",
        });
        notificationSystem.current?.addNotification({
          message: `new account created (#${id}) with password: ${password}`,
          level: "info",
        });

        setRedirect("/account/show/" + id);
      })
      .catch((error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      });
  };

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      {redirect && <Router.Redirect to={redirect} />}
      <CheckUser
        user={user}
        permissions={[
          types.Permission.CREATE_ACCOUNTS,
          types.Permission.MANAGE_ACCOUNTS,
        ]}
        condition={() => false}
      />
      <div className="register">
        <Center>
          <h1> Create account </h1>
          <CustomForm
            className="flex flex-col"
            onSubmit={submit}
            submitText="Create"
            inputs={{
              password,
              email: {
                is: "email",
                required: true,
                placeholder: "Email",
              },
              role: {
                is: "radio",
                required: true,
                choices: [
                  { label: "User", value: "user" },
                  { label: "Dev", value: "dev" },
                  { label: "Admin", value: "admin" },
                ],
              },
            }}
          />
        </Center>
      </div>
    </>
  );
}

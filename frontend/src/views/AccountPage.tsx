import React from "react";
import * as Router from "react-router";

import axios from "axios";
import NotificationSystem from "react-notification-system";

import * as types from "rm2-typings";
import * as constants from "../constants";

import Center from "../nodes/Center";
import CustomForm from "../nodes/CustomForm";

export default async function AccountPage({
  user,
}: {
  user: types.tables.Account;
}) {
  const notificationSystem = React.createRef<NotificationSystem.System>();

  const { id } = Router.useParams<{ id: string }>();

  let account: types.tables.Account;

  if (id !== user.id) {
    if (user.is_admin) {
      const response = await axios
        .get<types.api.AccountById["Get"]["Response"]>("/account/" + id, {
          baseURL: constants.API_BASE_URL,
        })
        .catch((error) => {
          notificationSystem.current?.addNotification({
            message: error.message,
            level: "error",
          });
          return null;
        });
      account = response?.data ?? user;
    } else {
      notificationSystem.current?.addNotification({
        message: "You must be an administrator to edit another profile",
        level: "error",
      });
      account = user;
    }
  } else {
    account = user;
  }

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      <Center>
        <h1> Edit account </h1>
        <CustomForm
          className="flex flex-col"
          submitText="Edit"
          inputs={{
            email: {
              is: "email",
              value: user.email,
              required: true,
              label: "Email",
              placeholder: "Email",
            },
            password: {
              is: "password",
              required: true,
              label: "Password",
              placeholder: "Password",
            },
            is_admin: {
              is: "checkbox",
              checked: user.is_admin,
              label: "as admin?",
            },
          }}
          onSubmit={(data: types.api.AccountById["Put"]["Body"]) => {
            axios
              .post<types.api.AccountById["Put"]["Response"]>(
                "/account/" + id,
                data,
                {
                  baseURL: constants.API_BASE_URL,
                }
              )
              .then((response) => {
                notificationSystem.current?.addNotification({
                  message: "Successful registered",
                  level: "success",
                });
                notificationSystem.current?.addNotification({
                  message:
                    "The new user temporary password is copied in your clipboard",
                  level: "info",
                });
              })
              .catch((error) => {
                notificationSystem.current?.addNotification({
                  message: error.message,
                  level: "error",
                });
              });
          }}
        />
      </Center>
    </>
  );
}

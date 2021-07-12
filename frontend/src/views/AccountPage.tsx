import React from "react";
import * as Router from "react-router";

import axios from "axios";
import NotificationSystem from "react-notification-system";

import * as types from "rm2-typings";

import Center from "../nodes/Center";
import CustomForm from "../nodes/CustomForm";

export default function AccountPage({ user }: { user: types.tables.Account }) {
  const notificationSystem = React.createRef<NotificationSystem.System>();
  const [account, setAccount] = React.useState<types.tables.Account>();
  const { id } = Router.useParams<{ id: string }>();

  if (!account)
    if (id !== user.id) {
      if (user.is_admin) {
        axios
          .get<types.api.AccountById["Get"]["Response"]>("/account/" + id)
          .then((response) => {
            setAccount(response?.data ?? user);
          })
          .catch((error) => {
            notificationSystem.current?.addNotification({
              message: error.message,
              level: "error",
            });
            setAccount(user);
          });
      } else {
        notificationSystem.current?.addNotification({
          message: "You must be an administrator to edit another profile",
          level: "error",
        });

        setAccount(user);
      }
    } else {
      setAccount(user);
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
              default: user.email,
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
              default: user.is_admin,
              label: "as admin?",
            },
          }}
          onSubmit={(data: types.api.AccountById["Put"]["Body"]) => {
            axios
              .put<types.api.AccountById["Put"]["Response"]>(
                "/account/" + id,
                data
              )
              .then(() => {
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

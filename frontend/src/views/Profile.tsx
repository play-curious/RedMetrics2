import axios from "axios";
import React from "react";
import NotificationSystem from "react-notification-system";

import * as types from "rm2-typings";

import Center from "../nodes/Center";
import Button from "../nodes/Button";
import CustomForm from "../nodes/CustomForm";

export default function Profile({ user }: { user: types.tables.Account }) {
  const notificationSystem = React.createRef<NotificationSystem.System>();

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      <Center height="min-h-full">
        <h1>Edit your personal information</h1>
        <h2 className="text-lg text-center font-bold"> Profile </h2>
        <CustomForm
          className="flex flex-col h-full justify-center"
          onSubmit={(data: types.api.AccountById["Put"]["Body"]) => {
            axios
              .put<types.api.AccountById["Put"]["Response"]>(
                `account/${user.id}`,
                data
              )
              .catch((error) => {
                notificationSystem.current?.addNotification({
                  message: error.message,
                  level: "error",
                });
              });
          }}
          inputs={{
            email: {
              is: "email",
              required: true,
              placeholder: "Email",
              default: user.email,
            },
            password: {
              is: "password",
              required: true,
              placeholder: "Password",
            },
            is_admin: {
              is: "checkbox",
              label: "as admin?",
              default: user.is_admin,
            },
          }}
          otherButtons={<Button to="/api-keys">Api Keys</Button>}
          submitText="Edit account"
        />
      </Center>
    </>
  );
}

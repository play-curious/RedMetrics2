import axios from "axios";
import React from "react";
import * as Form from "react-hook-form";
import * as Router from "react-router";
import * as Dom from "react-router-dom";

import NotificationSystem from "react-notification-system";

import * as constants from "../constants";
import * as types from "rm2-typings";

import Center from "../nodes/Center";
import CustomForm from "../nodes/CustomForm";

export default function Login({
  setApiKey,
}: {
  setApiKey: (apiKey: string) => void;
}) {
  const [redirect, setRedirect] = React.useState<null | string>(null);
  const notificationSystem = React.createRef<NotificationSystem.System>();
  const { register, handleSubmit, setValue } = Form.useForm<types.Login>();

  const submit = (data: types.Login) => {
    axios
      .post("login", data, {
        baseURL: constants.API_BASE_URL,
      })
      .then((response) => {
        const apiKey = response.data.apiKey;
        notificationSystem.current?.addNotification({
          message: "Successful connected",
          level: "success",
        });
        sessionStorage.setItem("apiKey", apiKey);
        setApiKey(apiKey);
        setRedirect("/home");
      })
      .catch((error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      })
      .finally(() => setValue("password", ""));
  };

  return (
    <>
      {redirect && <Router.Redirect to={redirect} />}
      <NotificationSystem ref={notificationSystem} />
      <div className="min-h-full">
        <Center height="min-h-full">
          <h1> Login </h1>
          <CustomForm
            onSubmit={submit}
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

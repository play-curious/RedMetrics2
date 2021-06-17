import axios from "axios";
import React from "react";
import * as Form from "react-hook-form";
import * as Router from "react-router";
import * as Dom from "react-router-dom";

import NotificationSystem from "react-notification-system";

import * as constants from "../constants";
import * as types from "rm2-typings";

import Center from "../nodes/Center";
import Button from "../nodes/Button";

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
          <form onSubmit={handleSubmit(submit)} className="flex flex-col">
            <input
              type="email"
              name="email"
              placeholder="Email"
              ref={register("email", { required: true }).ref}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              ref={register("password", {}).ref}
            />
            <div className="flex justify-around">
              <Button submit> Go </Button>
              {/*<Dom.Link className="button" to={{ pathname: "/register" }}>*/}
              {/*  Register*/}
              {/*</Dom.Link>*/}
            </div>
          </form>
        </Center>
      </div>
    </>
  );
}

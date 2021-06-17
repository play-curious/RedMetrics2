import axios from "axios";
import React from "react";
import * as Form from "react-hook-form";
import * as Router from "react-router";
import * as Dom from "react-router-dom";

import NotificationSystem from "react-notification-system";

import * as constants from "../constants";
import * as types from "rm2-typings";

import Center from "../nodes/Center";

export default function Register({
  setApiKey,
}: {
  setApiKey: (apiKey: string) => void;
}) {
  const [redirect, setRedirect] = React.useState<null | string>(null);
  const notificationSystem = React.createRef<NotificationSystem.System>();
  const { register, handleSubmit, setValue } = Form.useForm<types.User>();

  const submit = (data: types.User) => {
    axios
      .post("/register", data, {
        baseURL: constants.API_BASE_URL,
      })
      .then((response) => {
        const apikey = response.data.apiKey;
        notificationSystem.current?.addNotification({
          message: "Successful registered",
          level: "success",
        });
        sessionStorage.setItem("apiKey", apikey);
        setApiKey(apikey);
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
    <> WIP </> || (
      <>
        {redirect && <Router.Redirect to={redirect} />}
        <NotificationSystem ref={notificationSystem} />
        <div className="register">
          <Center>
            <h1> Register </h1>
            <form onSubmit={handleSubmit(submit)} className="flex flex-col">
              <input
                type="email"
                name="email"
                placeholder="Email"
                ref={register("email",{ required: true }).ref}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                ref={register("password").ref}
              />
              <div className="flex justify-around">
                <span> as </span>
                <label>
                  user
                  <input type="radio" name="role" value="user" />
                </label>
                <span> or </span>
                <label>
                  dev
                  <input type="radio" name="role" value="dev" ref={register("role").ref} />
                </label>
              </div>
              <div className="flex justify-around">
                <input className="button" type="submit" value="Go" />
                <Dom.Link className="button" to={{ pathname: "/login" }}>
                  Login
                </Dom.Link>
              </div>
            </form>
          </Center>
        </div>
      </>
    )
  );
}

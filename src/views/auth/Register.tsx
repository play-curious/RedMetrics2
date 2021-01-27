import axios from "axios";
import React from "react";
import * as Form from "react-hook-form";
import * as Router from "react-router";
import * as Dom from "react-router-dom";

import NotificationSystem from "react-notification-system";

import * as constants from "../../constants";
import * as types from "../../types";

import Menu from "../../nodes/Menu";
import MenuItem from "../../nodes/MenuItem";
import Center from "../../nodes/Center";

export default function Register({
  onApiKeyChange,
}: {
  onApiKeyChange: (apiKey: string) => void;
}) {
  const [redirect, setRedirect] = React.useState<null | string>(null);
  const notificationSystem = React.createRef<NotificationSystem.System>();
  const { register, handleSubmit, setValue } = Form.useForm<types.User>();

  const submit = (data: types.User) => {
    axios
      .post("register", data, {
        baseURL: constants.apiBaseURL,
      })
      .then((response) => {
        onApiKeyChange(response.data.apiKey);
        sessionStorage.setItem("apiKey", response.data.apiKey);
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
      <Menu>
        <MenuItem to="/home"> Home </MenuItem>
      </Menu>
      <div className="register">
        <Center>
          <h1> Register </h1>
          <form onSubmit={handleSubmit(submit)} className="flex flex-col">
            <input
              type="email"
              name="email"
              placeholder="Email"
              ref={register({ required: true })}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              ref={register({})}
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
                <input
                  type="radio"
                  name="role"
                  value="dev"
                  ref={register({ required: true })}
                />
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
      <NotificationSystem ref={notificationSystem} />
    </>
  );
}

import axios from "axios";
import React, { FunctionComponent, useState } from "react";
import { useForm } from "react-hook-form";
import { Redirect } from "react-router";
import { Link } from "react-router-dom";

import { NotificationStack, INotification } from "../../nodes/Notifications";

import * as constants from "../../constants";
import Menu from "../../nodes/Menu";

interface RegisterForm {
  email: string;
  password: string;
  role: "dev" | "user";
}

const Register: FunctionComponent<{
  onApiKeyChange: (apiKey: string) => void;
}> = ({ onApiKeyChange }) => {
  const [redirect, setRedirect] = useState<null | string>(null);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const { register, handleSubmit, setValue } = useForm<RegisterForm>();

  const submit = (data: RegisterForm) => {
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
        setNotifications([
          {
            text: error.message,
            type: "error",
          },
        ]);
      })
      .finally(() => setValue("password", ""));
  };

  return (
    <>
      <Menu links={[{ path: "/home", name: "Home" }]} />
      <div className="register">
        {redirect && <Redirect to={redirect} />}
        <div className="center">
          <h1> Register </h1>
          <form onSubmit={handleSubmit(submit)}>
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
            <div className="radio">
              <span> as </span>
              <label>
                user
                <input type="radio" name="role" value="user" />
              </label>
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
            <div className="flex">
              <input className="button" type="submit" value="Go" />
              <Link className="button" to={{ pathname: "/login" }}>
                Login
              </Link>
            </div>
          </form>
        </div>

        <NotificationStack notifications={notifications} />
      </div>
    </>
  );
};

export default Register;

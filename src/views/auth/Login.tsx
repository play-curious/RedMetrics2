import axios from "axios";
import React from "react";
import Form from "react-hook-form";
import Router from "react-router";
import Dom from "react-router-dom";

import NotificationSystem from "react-notification-system";

import * as constants from "../../constants";
import Menu from "../../nodes/Menu";

interface LoginForm {
  email: string;
  password: string;
}

const Login: React.FunctionComponent<{
  onApiKeyChange: (apiKey: string) => void;
}> = ({ onApiKeyChange }) => {
  const [redirect, setRedirect] = React.useState<null | string>(null);
  const notificationSystem = React.createRef<NotificationSystem.System>();
  const { register, handleSubmit, setValue } = Form.useForm<LoginForm>();

  const submit = (data: LoginForm) => {
    axios
      .post("login", data, {
        baseURL: constants.apiBaseURL,
      })
      .then((response) => {
        onApiKeyChange(response.data.apiKey);
        sessionStorage.setItem("apiKey", response.data.apiKey);
        setRedirect("/home");
      })
      .catch((error) => {
        const notification = notificationSystem.current;
        notification?.addNotification({
          message: error.message,
          level: "error",
        });
      })
      .finally(() => setValue("password", ""));
  };

  return (
    <>
      <Menu>
        <Dom.Link to="/home"> Home </Dom.Link>
      </Menu>
      <div className="login">
        {redirect && <Router.Redirect to={redirect} />}
        <div className="center">
          <h1> Login </h1>
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
            <div className="flex">
              <input className="button" type="submit" value="Go" />
              <Dom.Link className="button" to={{ pathname: "/register" }}>
                Register
              </Dom.Link>
            </div>
          </form>
        </div>
        <NotificationSystem ref={notificationSystem} />
      </div>
    </>
  );
};

export default Login;

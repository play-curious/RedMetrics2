import axios from "axios";
import React, { FunctionComponent, useState } from "react";
import { useForm } from "react-hook-form";
import { Redirect } from "react-router";
import { Link } from "react-router-dom";
import * as constants from "../../constants";

interface LoginForm {
  email: string;
  password: string;
}

const Login: FunctionComponent<{
  onApiKeyChange: (apiKey: string) => void;
}> = ({ onApiKeyChange }) => {
  const [redirect, setRedirect] = useState<null | string>(null);

  const { register, handleSubmit, setValue } = useForm<LoginForm>();

  const afterSubmit = (data: LoginForm) => {
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
        setRedirect("/error");
      })
      .finally(() => setValue("password", ""));
  };

  return (
    <>
      {redirect && <Redirect to={redirect} />}
      <div className="center">
        <h1> Login </h1>
        <form onSubmit={handleSubmit(afterSubmit)}>
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
          <input className="button" type="submit" value="Go" />
        </form>
      </div>
      <Link className="button" to={{ pathname: "/login" }}>
        Register
      </Link>
    </>
  );
};

export default Login;

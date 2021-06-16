import React from "react";
import * as Router from "react-router";
import * as Form from "react-hook-form";

import * as types from "rm2-typings";
import * as constants from "../constants";

import NotificationSystem from "react-notification-system";
import axios from "axios";
import * as uuid from "uuid";

import Center from "../nodes/Center";
import Button from "../nodes/Button";
import CheckUser from "../nodes/CheckUser";

export default function CreateAccount({ user }: { user?: types.ApiKeyUser }) {
  const notificationSystem = React.createRef<NotificationSystem.System>();
  const [redirect, setRedirect] = React.useState<null | string>(null);
  const { register, handleSubmit } = Form.useForm<types.User>();

  const password = uuid.v4();

  const submit = (data: types.User) => {
    axios
      .post("/register", data, {
        baseURL: constants.API_BASE_URL,
      })
      .then((response) => {
        const id = response.data.id;

        notificationSystem.current?.addNotification({
          message: "Successful registered",
          level: "success",
        });
        notificationSystem.current?.addNotification({
          message:
            "The new user temporary password is copied in your clipboard",
          level: "info",
        });

        setRedirect("/account/show/" + id);
      })
      .catch((error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      });
  };

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      {redirect && <Router.Redirect to={redirect} />}
      <CheckUser
        user={user}
        permissions={[
          types.Permission.CREATE_ACCOUNTS,
          types.Permission.MANAGE_ACCOUNTS,
        ]}
        condition={() => false}
      />
      <div className="register">
        <Center>
          <h1> Create account </h1>
          <form onSubmit={handleSubmit(submit)} className="flex flex-col">
            <input
              type="email"
              name="email"
              placeholder="Email"
              ref={register({ required: true })}
            />
            <input
              type="hidden"
              name="password"
              value={password}
              ref={register}
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
                <input type="radio" name="role" value="dev" ref={register} />
              </label>
            </div>
            <Button submit clipboard={password}>
              Go
            </Button>
          </form>
        </Center>
      </div>
    </>
  );
}

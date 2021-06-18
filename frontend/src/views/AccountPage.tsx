import React from "react";
import * as Router from "react-router";
import * as Dom from "react-router-dom";
import * as Form from "react-hook-form";

import axios from "axios";
import NotificationSystem from "react-notification-system";

import * as types from "rm2-typings";
import * as constants from "../constants";

import Center from "../nodes/Center";
import CheckUser from "../nodes/CheckUser";
import Button from "../nodes/Button";

export default function AccountPage({ user }: { user?: types.ApiKeyUser }) {
  const [account, setAccount] = React.useState<types.Account>();
  const notificationSystem = React.createRef<NotificationSystem.System>();
  const { register, handleSubmit, setValue } = Form.useForm<types.User>();
  const { id } = Router.useParams<{ id: string }>();

  const submit = (data: types.User) => {
    axios
      .post("/register", data, {
        baseURL: constants.API_BASE_URL,
      })
      .then((response) => {
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
  };

  if (account === undefined)
    axios
      .get<types.Account>("/account/" + id, {
        baseURL: constants.API_BASE_URL,
        params: {
          apikey: user?.api_key,
        },
      })
      .then((response) => {
        setAccount(response.data);
        setValue("role", response.data.role);
        setValue("email", response.data.email);
      })
      .catch((error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      });

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      <CheckUser
        user={user}
        permissions={[
          types.Permission.MANAGE_ACCOUNTS,
          types.Permission.EDIT_ACCOUNTS,
        ]}
        condition={() => user?.account_id === id}
      />
      <Center>
        <h1> Edit account </h1>
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
            ref={register("password").ref}
          />
          {account?.role !== "admin" && (
            <div className="flex justify-around">
              <span> as </span>
              <label>
                user
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={account?.role === "user"}
                />
              </label>
              <span> or </span>
              <label>
                dev
                <input
                  type="radio"
                  name="role"
                  value="dev"
                  checked={account?.role === "dev"}
                  ref={register("role").ref}
                />
              </label>
            </div>
          )}
          <Button submit>Edit</Button>
        </form>
      </Center>
    </>
  );
}

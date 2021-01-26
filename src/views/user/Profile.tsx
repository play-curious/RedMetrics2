import axios from "axios";
import React from "react";
import * as Form from "react-hook-form";
import * as Dom from "react-router-dom";

import NotificationSystem from "react-notification-system";

import * as types from "../../types";
import * as constants from "../../constants";

import Menu from "../../nodes/Menu";
import MenuItem from "../../nodes/MenuItem";

export default function Profile({ user }: { user: types.SessionUser }) {
  const { register, handleSubmit, setValue } = Form.useForm<types.User>();
  const notificationSystem = React.createRef<NotificationSystem.System>();

  setValue("email", user.email);
  setValue("password", user.password);
  setValue("role", user.role);

  const submit = (data: types.User) => {
    axios
      .put("account/" + user.id, data, {
        baseURL: constants.apiBaseURL,
      })
      .catch((error: Error) => {
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
        <MenuItem to="/home"> Home </MenuItem>
      </Menu>
      <div className="profile">
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
            ref={register({ required: true })}
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
          <input className="button" type="submit" value="Go" />
        </form>
      </div>
      <NotificationSystem ref={notificationSystem} />
    </>
  );
}

import React, { FunctionComponent, useState } from "react";
import { Redirect, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import axios from "axios";

import NotificationSystem from "react-notification-system";

import * as types from "../../types";
import * as utils from "../../utils";
import * as constants from "../../constants";

import Menu from "../../nodes/Menu";

const AddVersion: FunctionComponent<{ user: types.SessionUser }> = ({
  user,
}) => {
  const { id } = useParams<{ id: string }>();
  const [redirect, setRedirect] = useState<null | string>(null);
  const { register, handleSubmit } = useForm<types.GameVersion>();
  const notificationSystem = React.createRef<NotificationSystem.System>();

  const submit = (version: types.GameVersion) => {
    axios
      .post(`/game/${id}/version`, version, {
        baseURL: constants.apiBaseURL,
      })
      .then((response) => {
        setRedirect("/game/" + response.data.game_id);
      })
      .catch((error) => {
        const notification = notificationSystem.current;
        notification?.addNotification({
          message: error.message,
          level: "error",
        });
      });
  };

  return (
    <>
      <Menu>
        <Link to="/home"> Home </Link>
      </Menu>
      <div className="add-version">
        {user.roleRank < utils.roleRank("dev") && setRedirect("/home")}
        {redirect && <Redirect to={redirect} />}
        <h1> Add your game version </h1>
        <form onSubmit={handleSubmit(submit)}>
          <input type="hidden" name="game_id" ref={register} value={id} />
          <input
            type="text"
            name="name"
            ref={register({ required: true, minLength: 3, maxLength: 256 })}
          />
          <textarea name="description" ref={register}>
            No description.
          </textarea>
          <code>
            <textarea name="custom_data" ref={register}>
              No description.
            </textarea>
          </code>
          <input className="button" type="submit" value="Add" />
        </form>
        <NotificationSystem ref={notificationSystem} />
      </div>
    </>
  );
};

export default AddVersion;

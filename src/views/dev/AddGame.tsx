import React, { FunctionComponent, useState } from "react";
import { Redirect } from "react-router";
import { useForm } from "react-hook-form";
import axios from "axios";

import NotificationSystem from "react-notification-system";

import * as types from "../../types";
import * as utils from "../../utils";
import * as constants from "../../constants";
import Menu from "../../nodes/Menu";

const AddGame: FunctionComponent<{ role: types.Role }> = ({ role }) => {
  const notificationSystem = React.createRef<NotificationSystem.System>();

  const [redirect, setRedirect] = useState<null | string>(null);
  const { register, handleSubmit } = useForm<types.Game>();

  const submit = (game: types.Game) => {
    axios
      .post("/game", game, {
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
      <Menu links={[{ path: "/home", name: "Home" }]} />
      <div className="add-game">
        {utils.roleRank(role) < utils.roleRank("dev") && setRedirect("/home")}
        {redirect && <Redirect to={redirect} />}
        <h1> Add your game </h1>
        <form onSubmit={handleSubmit(submit)}>
          <input
            type="text"
            name="name"
            ref={register({ required: true, minLength: 3, maxLength: 256 })}
          />
          <input
            type="text"
            name="author"
            ref={register({ minLength: 3, maxLength: 256 })}
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

export default AddGame;

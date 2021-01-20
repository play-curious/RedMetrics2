import React, { FunctionComponent, useState } from "react";
import { Redirect, useParams } from "react-router";
import { useForm } from "react-hook-form";
import axios from "axios";

import * as types from "../../types";
import * as utils from "../../utils";
import * as constants from "../../constants";
import { INotification, NotificationStack } from "../../nodes/Notifications";
import Menu from "../../nodes/Menu";

const AddVersion: FunctionComponent<{ role: types.Role }> = ({ role }) => {
  const { id } = useParams<{ id: string }>();
  const [redirect, setRedirect] = useState<null | string>(null);
  const { register, handleSubmit } = useForm<types.GameVersion>();
  const [notifications, setNotifications] = useState<INotification[]>([]);

  const submit = (version: types.GameVersion) => {
    axios
      .post(`/game/${id}/version`, version, {
        baseURL: constants.apiBaseURL,
      })
      .then((response) => {
        setRedirect("/game/" + response.data.game_id);
      })
      .catch((error) => {
        setNotifications([
          {
            text: error.message,
            type: "error",
          },
        ]);
      });
  };

  return (
    <>
      <Menu links={[{ path: "/home", name: "Home" }]} />
      <div className="add-version">
        {utils.roleRank(role) < utils.roleRank("dev") && setRedirect("/home")}
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
        <NotificationStack notifications={notifications} />
      </div>
    </>
  );
};

export default AddVersion;

import React from "react";
import * as Router from "react-router";
import * as Form from "react-hook-form";

import axios from "axios";
import NotificationSystem from "react-notification-system";

import * as types from "rm2-typings";
import * as utils from "../utils";
import * as constants from "../constants";
import { ErrorMessage } from "@hookform/error-message";
import Button from "../nodes/Button";
import CheckUser from "../nodes/CheckUser";

export default function AddVersion({ user }: { user?: types.ApiKeyUser }) {
  const { id } = Router.useParams<{ id: string }>();
  const [redirect, setRedirect] = React.useState<null | string>(null);
  const [game, setGame] = React.useState<types.Game>();
  const [validationMessage, setValidationMessage] =
    React.useState<string>("JSON Ok");
  const { register, handleSubmit } = Form.useForm<types.GameVersion>();
  const notificationSystem = React.createRef<NotificationSystem.System>();

  const submit = (version: types.GameVersion) => {
    axios
      .post(`/game/${id}/version`, version, {
        baseURL: constants.API_BASE_URL,
        params: { apikey: user?.api_key },
      })
      .then((response) => {
        setRedirect("/game/" + response.data.game_id);
      })
      .catch((error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      });
  };

  const validate = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const custom_data = JSON.parse(event.currentTarget.value);
      event.currentTarget.value = JSON.stringify(custom_data, null, 2);
      setValidationMessage("JSON Ok");
    } catch (error) {
      setValidationMessage(error.message);
    }
  };

  if (game === undefined)
    axios
      .get<types.Game>(`/game/${id}`, {
        baseURL: constants.API_BASE_URL,
        params: { apikey: user?.api_key },
      })
      .then((response) => {
        setGame(response.data);
      })
      .catch((error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
        setRedirect("/");
      });

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      <div className="add-version">
        {redirect && <Router.Redirect to={redirect} />}
        <CheckUser
          user={user}
          permissions={[
            types.Permission.EDIT_GAMES,
            types.Permission.MANAGE_GAMES,
          ]}
          condition={() => user?.account_id === game?.publisher_id}
        />
        <h1> Add your game version </h1>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col">
          <input
            type="hidden"
            name="game_id"
            ref={register("game_id").ref}
            value={id}
          />
          <input
            type="text"
            name="name"
            placeholder="Version name"
            ref={
              register("name", { required: true, minLength: 3, maxLength: 256 })
                .ref
            }
          />
          <textarea name="description" ref={register("description").ref}>
            No description.
          </textarea>
          <code>
            <textarea
              ref={register("custom_data").ref}
              name="custom_data"
              className="self-center"
              onChange={validate}
              defaultValue={"{}"}
            />
          </code>
          <div className="text-center text-gray-500 break-word">
            {validationMessage}
          </div>
          {validationMessage === "JSON Ok" ? (
            <Button submit> Add </Button>
          ) : (
            <span className="text-gray-500 text-center cursor-not-allowed bg-gray-200">
              Add
            </span>
          )}
        </form>
      </div>
    </>
  );
}

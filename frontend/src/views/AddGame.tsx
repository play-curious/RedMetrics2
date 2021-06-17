import React from "react";
import * as Router from "react-router";
import * as Form from "react-hook-form";

import axios from "axios";
import NotificationSystem from "react-notification-system";

import * as types from "rm2-typings";
import * as constants from "../constants";

import Center from "../nodes/Center";
import qs from "querystring";
import Button from "../nodes/Button";
import CheckUser from "../nodes/CheckUser";

export default function AddGame({ user }: { user?: types.ApiKeyUser }) {
  const notificationSystem = React.createRef<NotificationSystem.System>();
  const [validationMessage, setValidationMessage] =
    React.useState<string>("JSON Ok");
  const [redirect, setRedirect] = React.useState<null | string>(null);
  const { register, handleSubmit } = Form.useForm<types.Game>();

  const submit = (game: types.Game) => {
    axios
      .post("/game?" + qs.stringify({ apikey: user?.api_key }), game, {
        baseURL: constants.API_BASE_URL,
      })
      .then((response) => {
        setRedirect("/game/show/" + response.data.game_id);
      })
      .catch((error) => {
        const notification = notificationSystem.current;
        notification?.addNotification({
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

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      <Center>
        {redirect && <Router.Redirect to={redirect} />}
        <CheckUser
          user={user}
          permissions={[
            types.Permission.MANAGE_GAMES,
            types.Permission.CREATE_GAMES,
          ]}
          condition={() => false}
        />
        <h1> Add your game </h1>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col">
          <input
            type="text"
            name="name"
            placeholder="Game name"
            ref={register({ required: true, minLength: 3, maxLength: 256 })}
          />
          <input
            type="text"
            name="author"
            placeholder="Game author"
            ref={register({ minLength: 3, maxLength: 256 })}
          />
          <textarea
            name="description"
            ref={register}
            placeholder="Game description"
          />
          <code>
            <textarea
              ref={register}
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
      </Center>
    </>
  );
}

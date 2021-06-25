import React from "react";
import * as Router from "react-router";

import axios from "axios";
import NotificationSystem from "react-notification-system";

import * as types from "rm2-typings";
import * as constants from "../constants";

import Center from "../nodes/Center";
import CustomForm from "../nodes/CustomForm";

export default function AddGame({ user }: { user: types.tables.Account }) {
  const notificationSystem = React.createRef<NotificationSystem.System>();
  const [redirect, setRedirect] = React.useState<null | string>(null);

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      <Center>
        {redirect && <Router.Redirect to={redirect} />}
        <h1> Add your game </h1>
        <CustomForm
          onSubmit={(game: types.api.Game["Post"]["Body"]) => {
            axios
              .post<types.api.Game["Post"]["Response"]>("/game", game, {
                baseURL: constants.API_BASE_URL,
              })
              .then((response) => {
                setRedirect("/game/show/" + response.data.id);
              })
              .catch((error) => {
                const notification = notificationSystem.current;
                notification?.addNotification({
                  message: error.message,
                  level: "error",
                });
              });
          }}
          submitText="Add"
          className="flex flex-col"
          inputs={{
            name: {
              is: "text",
              required: true,
              minLength: 3,
              maxLength: 256,
              placeholder: "Game name",
              label: "Game name",
            },
            author: {
              is: "text",
              label: "Author",
              minLength: 3,
              maxLength: 256,
              placeholder: "Game author name",
            },
            description: {
              is: "area",
              label: "Game description",
            },
            custom_data: {
              is: "area",
              label: "Custom data",
              jsonValidation: true,
            },
            publisher_id: user.id,
          }}
        />
      </Center>
    </>
  );
}

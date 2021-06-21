import React from "react";
import * as Router from "react-router";

import qs from "querystring";
import axios from "axios";
import NotificationSystem from "react-notification-system";

import * as types from "rm2-typings";
import * as constants from "../constants";

import Center from "../nodes/Center";
import CheckUser from "../nodes/CheckUser";
import CustomForm from "../nodes/CustomForm";

export default function AddGame({ user }: { user?: types.ApiKeyUser }) {
  const notificationSystem = React.createRef<NotificationSystem.System>();
  const [redirect, setRedirect] = React.useState<null | string>(null);

  const submit = (game: types.POSTGame) => {
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
        <CustomForm
          onSubmit={submit}
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
          }}
        />
      </Center>
    </>
  );
}

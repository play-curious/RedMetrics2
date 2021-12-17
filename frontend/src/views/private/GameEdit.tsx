import React from "react";
import * as Router from "react-router";
import NotificationSystem from "react-notification-system";

import * as types from "rm2-typings";

import querystring from "query-string";

import CustomForm from "../../nodes/CustomForm";

const request = types.utils.request;

export default function GameEdit() {
  const notificationSystem = React.createRef<NotificationSystem.System>();
  const { id } = Router.useParams<{ id: string }>();
  const [game, setGame] = React.useState<types.tables.Game>();
  const [redirect, setRedirect] = React.useState<null | string>(null);

  if (!game)
    request<types.api.GameById>("Get", `/game/${id}`, undefined)
      .then(({ data }) => data)
      .then(setGame)
      .catch(console.error);

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      {redirect && <Router.Redirect to={redirect} />}
      <h1> Edit Game </h1>
      <CustomForm
        onSubmit={(data: types.api.GameById["Methods"]["Put"]["Body"]) => {
          request<types.api.GameById>("Put", `/game/${id}`, data)
            .then(() => {
              setRedirect(
                `/game/show/${id}?${querystring.stringify({
                  success: "Game successfully edited",
                })}`
              );
            })
            .catch((error) => {
              notificationSystem.current?.addNotification({
                message: error.message,
                level: "error",
              });
            });
        }}
        inputs={{
          name: {
            is: "text",
            minLength: 2,
            placeholder: "Game name",
          },
          author: {
            is: "text",
            placeholder: "Author of game",
          },
          description: {
            is: "area",
          },
          custom_data: {
            is: "area",
            code: true,
            label: "Custom data",
            jsonValidation: true,
          },
        }}
        defaultValues={{
          name: game?.name,
          author: game?.author,
          description: game?.description,
          custom_data: game?.custom_data,
        }}
      />
    </>
  );
}

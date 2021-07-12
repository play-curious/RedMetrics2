import React from "react";
import * as Router from "react-router";
import NotificationSystem from "react-notification-system";

import * as types from "rm2-typings";

import axios from "axios";

import CustomForm from "../nodes/CustomForm";

export default function EditGame() {
  const notificationSystem = React.createRef<NotificationSystem.System>();
  const { id } = Router.useParams<{ id: string }>();
  const [game, setGame] = React.useState<types.tables.Game>();

  if (!game)
    axios
      .get<types.api.GameById["Get"]["Response"]>("/game/" + id)
      .then((response) => setGame(response.data))
      .catch(console.error);

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      <h1> Edit Game </h1>
      <CustomForm
        onSubmit={(data: types.api.GameById["Put"]["Body"]) => {
          axios
            .put<types.api.GameById["Put"]["Response"]>("/game/" + id, data)
            .then(() => {
              notificationSystem.current?.addNotification({
                message: "Successful edited",
                level: "success",
              });
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
            placeholder: "Game name",
            default: game?.name,
          },
          author: {
            is: "text",
            placeholder: "Author of game",
            default: game?.author,
          },
          description: {
            is: "area",
            default: game?.description,
          },
          custom_data: {
            is: "area",
            jsonValidation: true,
            default: game?.custom_data,
          },
        }}
      />
    </>
  );
}

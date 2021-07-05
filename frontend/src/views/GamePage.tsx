import React from "react";
import * as Router from "react-router";
import NotificationSystem from "react-notification-system";

import axios from "axios";

import * as constants from "../constants";
import * as types from "rm2-typings";

import Button from "../nodes/Button";

export default function GamePage() {
  const { id } = Router.useParams<{ id: string }>();

  const notificationSystem = React.createRef<NotificationSystem.System>();

  const [game, setGame] = React.useState<types.tables.Game>();
  const [redirect, setRedirect] = React.useState<string>();

  if (game === undefined)
    axios
      .get<types.api.GameById["Get"]["Response"]>(`/game/${id}`)
      .then((response) => setGame(response.data))
      .catch((error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      });

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      {redirect && <Router.Redirect to={redirect} />}
      <div className="flex items-baseline">
        <h1> {game?.name ?? "No name"} </h1>
        <code className="px-3 font-light text-gray-600">{game?.id}</code>
      </div>
      <p> {game?.description ?? "No description"} </p>
      <div className="flex">
        <Button to={"/game/edit/" + id}> Edit </Button>
        <Button
          callback={() => {
            axios
              .delete<types.api.GameById["Delete"]["Response"]>(`/game/${id}`)
              .then(() => setRedirect("/games"))
              .catch((error) => {
                notificationSystem.current?.addNotification({
                  message: error.message,
                  level: "error",
                });
              });
          }}
        >
          Remove
        </Button>
      </div>
    </>
  );
}

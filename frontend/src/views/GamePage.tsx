import React from "react";
import * as Router from "react-router";
import NotificationSystem from "react-notification-system";

import axios from "axios";

import * as constants from "../constants";
import * as types from "rm2-typings";

import Card from "../nodes/Card";
import Button from "../nodes/Button";
import CheckUser from "../nodes/CheckUser";

export default function GamePage({ user }: { user?: types.ApiKeyUser }) {
  const { id } = Router.useParams<{ id: string }>();

  const notificationSystem = React.createRef<NotificationSystem.System>();

  const [game, setGame] = React.useState<types.Game>();
  const [redirect, setRedirect] = React.useState<string>();
  const [versions, setVersions] = React.useState<types.GameVersion[]>();

  if (game === undefined)
    axios
      .get<types.Game>(`/game/${id}`, {
        baseURL: constants.API_BASE_URL,
        params: { apikey: user?.api_key },
      })
      .then((response) => setGame(response.data))
      .catch((error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      });

  if (versions === undefined)
    axios
      .get<types.GameVersion[]>(`/game/${id}/version`, {
        baseURL: constants.API_BASE_URL,
        params: { apikey: user?.api_key },
      })
      .then((response) => setVersions(response.data))
      .catch((error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      });

  const deleteGame = () => {
    axios
      .delete(`/game/${id}`, {
        baseURL: constants.API_BASE_URL,
        params: { apikey: user?.api_key },
      })
      .then(() => setRedirect("/games"))
      .catch((error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      });
  };

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      {redirect && <Router.Redirect to={redirect} />}
      <h1> {game?.name ?? "No name"} </h1>
      <p> {game?.description ?? "No description"} </p>
      <CheckUser
        user={user}
        permissions={[
          types.Permission.MANAGE_GAMES,
          types.Permission.DELETE_GAMES,
        ]}
        condition={() => !!(user && user?.account_id === game?.publisher_id)}
      />
      <div className="flex">
        <Button to={"/game/edit/" + game?.id}> Edit </Button>
        <Button callback={deleteGame}> Remove </Button>
        <Button to={`/game/${game?.id}/version/add`}>New version</Button>
      </div>
      <div>
        {versions?.map((version, i) => {
          return (
            <Card
              key={i}
              title={version.name}
              url={"/version/show/" + version.id}
            >
              {version.description ?? "No description."}
            </Card>
          );
        })}
      </div>
    </>
  );
}

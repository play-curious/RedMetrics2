import React from "react";
import * as Router from "react-router";

import * as types from "rm2-typings";
import * as constants from "../constants";

import axios from "axios";
import NotificationSystem from "react-notification-system";

import CheckUser from "../nodes/CheckUser";
import Button from "../nodes/Button";

export default function VersionPage({ user }: { user?: types.ApiKeyUser }) {
  const { id } = Router.useParams<{ id: string }>();

  const notificationSystem = React.createRef<NotificationSystem.System>();

  const [sessions, setSessions] = React.useState<types.Session[]>();
  const [version, setVersion] = React.useState<types.GameVersion>();
  const [redirect, setRedirect] = React.useState<string>();
  const [game, setGame] = React.useState<types.Game>();

  const deleteVersion = () => {
    // todo: delete version
    setRedirect(game ? "/game/show/" + game.id : "/");
  };

  if (sessions === undefined)
    axios
      .get<types.Session[]>("/version-session/" + id, {
        baseURL: constants.API_BASE_URL,
        params: { apikey: user?.api_key },
      })
      .then((response) => setSessions(response.data))
      .catch((error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      });

  if (version === undefined)
    axios
      .get<types.GameVersion>("/version/" + id, {
        baseURL: constants.API_BASE_URL,
        params: { apikey: user?.api_key },
      })
      .then((response) => setVersion(response.data))
      .catch((error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      });

  if (game === undefined && version !== undefined)
    axios
      .get<types.Game>("/game/" + version.game_id, {
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

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      {redirect && <Router.Redirect to={redirect} />}
      <h1> {version?.name ?? "No name"} </h1>
      <p> {version?.description ?? "No description"} </p>
      <CheckUser
        user={user}
        permissions={[
          types.Permission.MANAGE_GAMES,
          types.Permission.DELETE_GAMES,
        ]}
        condition={() => !!(user && user?.account_id === game?.publisher_id)}
      />
      <div className="flex">
        <Button to={"/game/show/" + game?.id}> Game </Button>
        <Button to={"/version/edit/" + version?.id}> Edit </Button>
        <Button callback={deleteVersion}> Remove </Button>
      </div>
      <ul>
        {sessions?.map((session, i) => {
          return (
            <li>
              <Button to={"/game/session/show/" + session.id}>
                {session.id}
              </Button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

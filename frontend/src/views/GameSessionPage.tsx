import React from "react";
import * as Router from "react-router";

import * as types from "rm2-typings";
import * as constants from "../constants";

import axios from "axios";
import NotificationSystem from "react-notification-system";

import CheckUser from "../nodes/CheckUser";
import Button from "../nodes/Button";
import Wrapper from "../nodes/Wrapper";
import Card from "../nodes/Card";

export default function GameSessionPage({ user }: { user?: types.ApiKeyUser }) {
  const { id } = Router.useParams<{ id: string }>();

  const notificationSystem = React.createRef<NotificationSystem.System>();

  const [game, setGame] = React.useState<types.Game>();
  const [events, setEvents] = React.useState<types.RMEvent[]>();
  const [session, setSession] = React.useState<types.GameSession>();
  const [version, setVersion] = React.useState<types.GameVersion>();
  const [redirect, setRedirect] = React.useState<string>();

  const deleteSession = () => {
    // todo: delete version
    setRedirect(version ? "/version/show/" + version.id : "/");
  };

  if (session === undefined)
    axios
      .get<types.GameSession>("/game-session/" + id, {
        baseURL: constants.API_BASE_URL,
        params: { apikey: user?.api_key },
      })
      .then((response) => setSession(response.data))
      .catch((error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      });

  if (events === undefined)
    axios
      .get<types.RMEvent[]>(`/session/${id}/events`, {
        baseURL: constants.API_BASE_URL,
        params: { apikey: user?.api_key },
      })
      .then((response) => setEvents(response.data))
      .catch((error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      });

  if (version === undefined && session !== undefined)
    axios
      .get<types.GameVersion>("/version/" + session.game_version_id, {
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
      <h1> {session?.id ?? "No id"} </h1>
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
        <Button callback={deleteSession}> Remove </Button>
      </div>
      <Wrapper>
        {events?.map((event, i) => {
          return (
            <Card
              title={event.section ?? "no section"}
              footer={event.server_time}
            >
              <code>{JSON.stringify(event, null, 2)}</code>
            </Card>
          );
        })}
      </Wrapper>
    </>
  );
}

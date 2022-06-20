import React from "react";
import * as Router from "react-router";

import * as types from "rm2-typings";

import DownloadButton from "../../nodes/DownloadButton";
import Button from "../../nodes/Button";

import NotificationSystem from "react-notification-system";
import Wrapper from "../../nodes/Wrapper";

const request = types.utils.request;

export default function EventView() {
  const { game_id, session_id, _id } = Router.useParams<{
    game_id: string;
    session_id: string;
    _id: string;
  }>();

  const id = Number(_id);

  const notificationSystem = React.createRef<NotificationSystem.System>();

  const [game, setGame] = React.useState<types.tables.Game>();
  const [event, setEvent] = React.useState<types.tables.Event>();
  const [session, setSession] = React.useState<types.tables.Session>();

  if (event === undefined)
    request<types.api.EventById>("Get", `/event/${id}`, undefined)
      .then(({ data }) => data)
      .then(setEvent)
      .catch((error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      });
  else if (game === undefined)
    request<types.api.GameById>("Get", `/game/${game_id}`, undefined)
      .then(({ data }) => data)
      .then(setGame)
      .catch((error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      });
  else if (session === undefined)
    request<types.api.SessionById>("Get", `/session/${session_id}`, undefined)
      .then(({ data }) => data)
      .then(setSession)
      .catch((error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      });

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      <h1> Event n°{id} </h1>
      <Wrapper>
        <DownloadButton route={`/event/${id}/data.json`} name={"event" + id} />
        <Button to={"/game/show/" + game_id}> Game </Button>
        <Button to={`/game/${game_id}/session/show/${session_id}`}>
          Session
        </Button>
      </Wrapper>
      <h2>JSON Data</h2>
      <pre>
        <code>{JSON.stringify(event, null, 2)}</code>
      </pre>
    </>
  );
}

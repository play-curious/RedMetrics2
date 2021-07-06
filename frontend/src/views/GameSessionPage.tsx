import React from "react";
import * as Router from "react-router";

import * as types from "rm2-typings";
import * as constants from "../constants";

import axios from "axios";
import NotificationSystem from "react-notification-system";

import Button from "../nodes/Button";
import Wrapper from "../nodes/Wrapper";
import Card from "../nodes/Card";

export default function GameSessionPage() {
  const { id } = Router.useParams<{ id: string }>();

  const notificationSystem = React.createRef<NotificationSystem.System>();

  const [game, setGame] = React.useState<types.tables.Game>();
  const [events, setEvents] = React.useState<types.tables.Event[]>();
  const [session, setSession] = React.useState<types.tables.Session>();

  if (session === undefined)
    axios
      .get<types.api.SessionById["Get"]["Response"]>("/session/" + id)
      .then((response) => setSession(response.data))
      .catch((error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      });

  if (events === undefined)
    axios
      .get<types.api.SessionById_Events["Get"]["Response"]>(
        `/session/${id}/events`,
        {
          baseURL: constants.API_BASE_URL,
        }
      )
      .then((response) => setEvents(response.data))
      .catch((error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      });

  if (game === undefined && session !== undefined)
    axios
      .get<types.api.GameById["Get"]["Response"]>("/game/" + session.game_id)
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
      <h1> {session?.id ?? "No id"} </h1>
      <div className="flex">
        <Button to={"/game/show/" + game?.id}> Game </Button>
      </div>
      <Wrapper>
        {events?.map((event) => {
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

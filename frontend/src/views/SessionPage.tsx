import React from "react";
import * as Router from "react-router";

import * as types from "rm2-typings";
import * as utils from "../utils";
import * as constants from "../constants";

import NotificationSystem from "react-notification-system";

import Button from "../nodes/Button";
import Wrapper from "../nodes/Wrapper";
import Card from "../nodes/Card";
import DownloadButton from "../nodes/DownloadButton";

const request = types.utils.request;

export default function SessionPage() {
  const { id } = Router.useParams<{ id: string }>();

  const notificationSystem = React.createRef<NotificationSystem.System>();

  const [game, setGame] = React.useState<types.tables.Game>();
  const [events, setEvents] = React.useState<types.tables.Event[]>();
  const [session, setSession] = React.useState<types.tables.Session>();

  if (session === undefined)
    request<types.api.SessionById>("Get", `/session/${id}`, undefined)
      .then(setSession)
      .catch((error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      });

  if (events === undefined)
    request<types.api.SessionById_Events>(
      "Get",
      `/session/${id}/events`,
      undefined
    )
      .then(setEvents)
      .catch((error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      });

  if (game === undefined && session !== undefined)
    request<types.api.GameById>("Get", `/game/${session.game_id}`, undefined)
      .then(setGame)
      .catch((error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      });

  utils.checkNotificationParams(notificationSystem).catch();

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      <h1> {session?.id ?? "No id"} </h1>
      <Wrapper>
        <DownloadButton
          route={`session/${id}/data`}
          name={
            (game?.name ?? "game") +
            " " +
            (session?.id ? session?.id : "session")
          }
        />
        <Button to={"/game/show/" + game?.id}> Game </Button>
      </Wrapper>
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

import React from "react";
import * as Router from "react-router";

import * as types from "rm2-typings";
import * as utils from "../../utils";

import NotificationSystem from "react-notification-system";

import DownloadButton from "../../nodes/DownloadButton";
import Button from "../../nodes/Button";
import Wrapper from "../../nodes/Wrapper";
import Card from "../../nodes/Card";
import Paginator from "../../nodes/Paginator";
import Warn from "../../nodes/Warn";

const request = types.utils.request;

export default function SessionView() {
  const { id, game_id } = Router.useParams<{ id: string; game_id: string }>();

  const notificationSystem = React.createRef<NotificationSystem.System>();

  const [game, setGame] = React.useState<types.tables.Game>();
  const [session, setSession] = React.useState<types.tables.Session>();
  const [eventCount, setEventCount] = React.useState<number>();

  const eventPerPage = 15;

  if (session === undefined)
    request<types.api.SessionById>("Get", `/session/${id}`, undefined)
      .then(setSession)
      .catch((error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      });

  if (eventCount === undefined)
    request<types.api.SessionById_EventCount>(
      "Get",
      `/session/${id}/events/count`,
      undefined
    )
      .then(setEventCount)
      .catch((error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      });

  if (game === undefined && session !== undefined)
    request<types.api.GameById>("Get", `/game/${game_id}`, undefined)
      .then(setGame)
      .catch((error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      });

  utils.checkNotificationParams(notificationSystem).catch();
  utils.autoRefresh(setEventCount);

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      <h1> {id} </h1>
      <Wrapper>
        <DownloadButton
          route={`session/${id}/data`}
          name={
            (game?.name ?? "game") +
            " " +
            (session?.id ? session?.id : "session")
          }
        />
        <Button to={"/game/show/" + game_id}> Game </Button>
      </Wrapper>
      <h2>
        Events <code> ({eventCount ?? 0})</code>
      </h2>
      {eventCount && eventCount > 0 ? (
        <Paginator
          pageCount={Math.ceil(eventCount / eventPerPage)}
          fetchPageItems={(index) => {
            return request<types.api.SessionById_Events>(
              "Get",
              `/session/${id}/events`,
              undefined,
              {
                params: {
                  offset: index * eventPerPage,
                  limit: eventPerPage,
                },
              }
            ).then((events: types.tables.Event[]) => {
              return events.map((event, i) => {
                return (
                  <Card
                    key={i}
                    title={event.section ?? "no section"}
                    footer={event.server_timestamp}
                    url={`/game/${game_id}/session/${id}/event/${event.id}`}
                  >
                    <pre>
                      <code>{JSON.stringify(event, null, 2)}</code>
                    </pre>
                  </Card>
                );
              });
            });
          }}
        />
      ) : (
        <Warn type="warn"> No events found </Warn>
      )}
    </>
  );
}

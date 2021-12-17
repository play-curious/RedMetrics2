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

const request = types.utils.request;

export default function SessionView() {
  const { id, game_id } = Router.useParams<{ id: string; game_id: string }>();

  const notificationSystem = React.createRef<NotificationSystem.System>();

  const [game, setGame] = React.useState<types.tables.Game>();
  const [session, setSession] = React.useState<types.tables.Session>();
  const [context, setContext] = React.useState<{
    data: types.tables.Event[];
    headers: utils.ResolvedPagingHeaders;
  }>();

  const eventPerPage = 15;

  if (session === undefined)
    request<types.api.SessionById>("Get", `/session/${id}`, undefined)
      .then(({ data }) => data)
      .then(setSession)
      .catch((error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      });

  if (session && game === undefined)
    request<types.api.GameById>("Get", `/game/${game_id}`, undefined)
      .then(({ data }) => data)
      .then(setGame)
      .catch((error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      });

  const fetchEvents = (pageNumber: number) => {
    request<types.api.SessionById_Events>(
      "Get",
      `/session/${id}/events`,
      undefined,
      {
        params: {
          page: pageNumber,
          perPage: eventPerPage,
        },
      }
    ).then(utils.handlePagingFetch(setContext));
  };

  if (game && session && context === undefined) fetchEvents(1);

  utils.checkNotificationParams(notificationSystem).catch();

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      <h1> {id} </h1>
      <Wrapper>
        <DownloadButton
          route={`session/${id}/data.json`}
          name={
            (game?.name ?? "game") +
            " " +
            (session?.id ? session?.id : "session")
          }
        />
        <Button to={"/game/show/" + game_id}> Game </Button>
      </Wrapper>
      <h2>
        Events <code> ({context?.data.length ?? 0})</code>
      </h2>
      <Paginator
        context={context}
        onPageChange={fetchEvents}
        map={(event, i) => {
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
        }}
      />
    </>
  );
}

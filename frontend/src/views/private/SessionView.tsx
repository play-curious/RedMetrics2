import React from "react";
import * as Router from "react-router";

import * as types from "rm2-typings";
import * as utils from "../../utils";

import NotificationSystem from "react-notification-system";

import DownloadButton from "../../nodes/DownloadButton";
import Button from "../../nodes/Button";
import Wrapper from "../../nodes/Wrapper";
import Paginator from "../../nodes/Paginator";
import EventCard from "../../nodes/cards/EventCard";

const request = types.utils.request;

export default function SessionView() {
  const { id, game_id } = Router.useParams<{ id: string; game_id: string }>();

  const notificationSystem = React.createRef<NotificationSystem.System>();

  const [game, setGame] = React.useState<types.tables.Game>();
  const [session, setSession] = React.useState<types.tables.Session>();
  const [context, setContext] = React.useState<{
    data: types.utils.SnakeToCamelCaseNested<types.tables.Event>[];
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

  const fetchEvents = (
    pageNumber: number,
    sortBy: `${string} ${"asc" | "desc"}`
  ) => {
    request<types.api.SessionById_Event>(
      "Get",
      `/session/${id}/event`,
      undefined,
      {
        params: {
          page: pageNumber,
          perPage: eventPerPage,
          sortBy,
        },
      }
    ).then(utils.handlePagingFetch(setContext));
  };

  if (context === undefined) fetchEvents(1, "id desc");

  utils.checkNotificationParams(notificationSystem).catch();

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      <h1> {id} </h1>
      <Wrapper>
        <DownloadButton
          route={`/session/${id}/data.json`}
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
        map={(event, i) => (
          <EventCard game_id={game_id} event={event} key={i} />
        )}
      />
    </>
  );
}

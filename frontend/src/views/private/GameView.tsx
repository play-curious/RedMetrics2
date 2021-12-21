import React from "react";
import * as Router from "react-router";
import NotificationSystem from "react-notification-system";

import * as types from "rm2-typings";
import * as utils from "../../utils";

import Wrapper from "../../nodes/Wrapper";
import Button from "../../nodes/Button";
import UUID from "../../nodes/UUID";
import Warn from "../../nodes/Warn";
import Paginator from "../../nodes/Paginator";
import DownloadButton from "../../nodes/DownloadButton";
import SessionCard from "../../nodes/SessionCard";

const request = types.utils.request;

export default function GameView() {
  const { id } = Router.useParams<{ id: string }>();

  const notificationSystem = React.createRef<NotificationSystem.System>();

  const [game, setGame] = React.useState<types.tables.Game>();
  const [redirect, setRedirect] = React.useState<string>();
  const [context, setContext] = React.useState<{
    data: types.tables.Session[];
    headers: utils.ResolvedPagingHeaders;
  }>();

  const sessionPerPage = 15;

  if (game === undefined)
    request<types.api.GameById>("Get", `/game/${id}`, undefined)
      .then(({ data }) => data)
      .then(setGame)
      .catch((error: any) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      });

  const fetchSessions = (
    pageNumber: number,
    sortBy: `${string} ${"asc" | "desc"}`
  ) => {
    request<types.api.GameById_Sessions>(
      "Get",
      `/game/${id}/sessions`,
      undefined,
      {
        params: {
          page: pageNumber,
          perPage: sessionPerPage,
          sortBy,
        },
      }
    ).then(utils.handlePagingFetch(setContext));
  };

  if (context === undefined) fetchSessions(1, "id desc");

  utils.checkNotificationParams(notificationSystem).catch();

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      {redirect && <Router.Redirect to={redirect} />}
      <div className="flex w-full items-baseline">
        <h1 className=""> {game?.name ?? "No name"} </h1> &nbsp;
        {game?.author ? (
          <>
            <span className="text-gray-500"> by </span> &nbsp;
            <span className="float-right text-2xl"> {game?.author} </span>
          </>
        ) : (
          ""
        )}
      </div>
      <Wrapper>
        <UUID _key={id} />
      </Wrapper>
      <h2> Actions </h2>
      <Wrapper>
        <DownloadButton
          route={`game/${id}/data.json`}
          name={game?.name ?? "game"}
        />
        <Button to={"/game/edit/" + id}> Edit </Button>
        <Button
          callback={() => {
            request<types.api.GameById>("Delete", `/game/${id}`, undefined)
              .then(() => setRedirect("/games"))
              .catch((error: any) => {
                notificationSystem.current?.addNotification({
                  message: error.message,
                  level: "error",
                });
              });
          }}
        >
          Remove
        </Button>
      </Wrapper>
      <h2> Description </h2>
      {game?.description ? (
        <p> {game.description} </p>
      ) : (
        <Warn type="warn"> No description </Warn>
      )}
      <h2>
        Sessions <code> ({context?.headers.total ?? 0}) </code>
      </h2>
      <Paginator
        context={context}
        onPageChange={fetchSessions}
        map={(session, i) => {
          return <SessionCard key={i} session={session} />;
        }}
      />
    </>
  );
}

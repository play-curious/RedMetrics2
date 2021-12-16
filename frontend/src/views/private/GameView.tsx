import React from "react";
import * as Router from "react-router";
import NotificationSystem from "react-notification-system";

import * as types from "rm2-typings";
import * as utils from "../../utils";

import Wrapper from "../../nodes/Wrapper";
import Button from "../../nodes/Button";
import UUID from "../../nodes/UUID";
import Warn from "../../nodes/Warn";
import Card from "../../nodes/Card";
import Paginator from "../../nodes/Paginator";
import DownloadButton from "../../nodes/DownloadButton";

const request = types.utils.request;

export default function GameView() {
  const { id } = Router.useParams<{ id: string }>();

  const notificationSystem = React.createRef<NotificationSystem.System>();

  const [game, setGame] = React.useState<types.tables.Game>();
  const [redirect, setRedirect] = React.useState<string>();
  const [sessionCount, setSessionCount] = React.useState<number>();

  const sessionPerPage = 15;

  if (game === undefined)
    request<types.api.GameById>("Get", `/game/${id}`, undefined)
      .then(setGame)
      .catch((error: any) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      });

  if (game !== undefined && sessionCount === undefined)
    request<types.api.GameById_SessionCount>(
      "Get",
      `/game/${id}/sessions/count`,
      undefined
    )
      .then(setSessionCount)
      .catch((error: any) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      });

  utils.checkNotificationParams(notificationSystem).catch();
  utils.autoRefresh(setSessionCount);

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
        <DownloadButton route={`game/${id}/data`} name={game?.name ?? "game"} />
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
        Sessions <code> ({sessionCount ?? 0}) </code>
      </h2>
      {sessionCount && sessionCount > 0 ? (
        <Paginator
          pageCount={Math.ceil(sessionCount / sessionPerPage)}
          fetchPageItems={(index) => {
            return request<types.api.GameById_Sessions>(
              "Get",
              `/game/${id}/sessions`,
              undefined,
              {
                params: {
                  offset: index * sessionPerPage,
                  limit: sessionPerPage,
                },
              }
            ).then((sessions: types.tables.Session[]) => {
              return Promise.all(
                sessions
                  .sort((a, b) =>
                    a.created_timestamp.localeCompare(b.created_timestamp)
                  )
                  .map(async (session, i) => {
                    return (
                      <Card
                        key={i}
                        title={session.created_timestamp}
                        url={`/game/${id}/session/show/${session.id}`}
                        secondary={session.id}
                      >
                        {
                          await request<types.api.SessionById_EventCount>(
                            "Get",
                            `/session/${session.id}/events/count`,
                            undefined
                          )
                        }{" "}
                        events
                      </Card>
                    );
                  })
              );
            });
          }}
        />
      ) : (
        <Warn type="warn"> No sessions found </Warn>
      )}
    </>
  );
}

import React from "react";
import * as Router from "react-router";
import NotificationSystem from "react-notification-system";

import * as types from "rm2-typings";
import * as utils from "../utils";

import Wrapper from "../nodes/Wrapper";
import Button from "../nodes/Button";
import UUID from "../nodes/UUID";
import Warn from "../nodes/Warn";
import Card from "../nodes/Card";
import DownloadButton from "../nodes/DownloadButton";

const request = types.utils.request;

export default function GamePage() {
  const { id } = Router.useParams<{ id: string }>();

  const notificationSystem = React.createRef<NotificationSystem.System>();

  const [game, setGame] = React.useState<types.tables.Game>();
  const [sessions, setSessions] = React.useState<types.tables.Session[]>();
  const [redirect, setRedirect] = React.useState<string>();

  if (game === undefined)
    request<types.api.GameById>("Get", `/game/${id}`, undefined)
      .then(setGame)
      .catch((error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      });

  if (game && sessions === undefined)
    request<types.api.GameById_Sessions>(
      "Get",
      `/game/${id}/sessions`,
      undefined
    )
      .then(setSessions)
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
              .catch((error) => {
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
        Sessions <code> ({sessions?.length ?? 0}) </code>
      </h2>
      {sessions && sessions.length > 0 ? (
        sessions.map((session, i) => {
          return (
            <Card
              key={i}
              title={session.id}
              url={"/game/session/show/" + session.id}
            />
          );
        })
      ) : (
        <Warn type="warn"> No sessions found </Warn>
      )}
    </>
  );
}

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
import SessionCard from "../../nodes/cards/SessionCard";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";

const request = types.utils.request;

export default function GameView() {
  const { id } = Router.useParams<{ id: string }>();

  const notificationSystem = React.createRef<NotificationSystem.System>();

  const [game, setGame] = React.useState<types.tables.Game>();
  const [redirect, setRedirect] = React.useState<string>();
  const [apiKeys, setApiKeys] = React.useState<types.tables.ApiKey[]>();
  const [context, setContext] = React.useState<{
    data: types.utils.SnakeToCamelCaseNested<types.tables.Session>[];
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

  if (apiKeys === undefined)
    request<types.api.GameById_Key>("Get", `/game/${id}/key`, undefined)
      .then(({ data }) => data)
      .then(setApiKeys)
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
    request<types.api.GameById_Session>(
      "Get",
      `/game/${id}/session`,
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
          route={`/game/${id}/data.json`}
          name={game?.name ?? "game"}
        />
        <Button to={"/api-keys?game_id=" + id}> New API key </Button>
        <Button to={"/game/edit/" + id}> Edit </Button>
        <Button
          callback={() => {
            if (window.confirm("Are you sure you want to delete this game?"))
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
      <h2>API keys</h2>
      {apiKeys && apiKeys.length > 0 ? (
        <div className="table">
          <div className="table-row-group shadow">
            <div className="table-row">
              <div className="table-cell font-bold px-5">Name</div>
              <div className="table-cell font-bold px-5">Key</div>
              <div className="table-cell" />
            </div>
            {apiKeys.map((apiKey) => {
              return (
                <div className="table-row border-2">
                  <div
                    className="table-cell p-1 text-red-900 whitespace-nowrap overflow-hidden"
                    title={apiKey.description}
                  >
                    {apiKey.description}
                  </div>
                  <div className="table-cell p-1">
                    <UUID _key={apiKey.key} />
                  </div>
                  <div className="table-cell p-1 flex items-center h-full">
                    <Button
                      customClassName="hover:bg-red-600 rounded-full"
                      callback={function (this: types.tables.ApiKey) {
                        request<types.api.KeyByKey>(
                          "Delete",
                          `/key/${this.key}`,
                          undefined
                        )
                          .then(() => {
                            notificationSystem.current?.addNotification({
                              message: "Successfully deleted API key",
                              level: "success",
                            });
                            setApiKeys(undefined);
                          })
                          .catch((error) => {
                            notificationSystem.current?.addNotification({
                              message: error.message,
                              level: "error",
                            });
                          });
                      }.bind(apiKey)}
                    >
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </Button>
                  </div>
                </div>
              );
            }) || "No API key found"}
          </div>
        </div>
      ) : (
        <Warn type="warn"> No API keys </Warn>
      )}
      <h2>
        Sessions <code> ({context?.headers.total ?? 0}) </code>
      </h2>
      <Paginator
        context={context}
        onPageChange={fetchSessions}
        map={(session, i) => {
          return <SessionCard session={session} />;
        }}
      />
    </>
  );
}

import React from "react";
import * as Dom from "react-router-dom";
import NotificationSystem from "react-notification-system";

import * as types from "rm2-typings";

import UUID from "../../nodes/UUID";
import Warn from "../../nodes/Warn";
import Button from "../../nodes/Button";
import CustomForm from "../../nodes/CustomForm";

import { faTrashAlt, faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const request = types.utils.request;

export default function APIKeyList({ user }: { user: types.tables.Account }) {
  const [apiKeys, setApiKeys] = React.useState<types.tables.ApiKey[]>();
  const [ownGames, setOwnGames] = React.useState<types.tables.Game[]>();

  const notificationSystem = React.createRef<NotificationSystem.System>();

  const fetchApiKeys = () => {
    request<types.api.AccountById_Keys>(
      "Get",
      `/account/${user.id}/keys`,
      undefined
    )
      .then(({ data }) => setApiKeys(data))
      .catch((error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      });
  };

  if (apiKeys === undefined) fetchApiKeys();
  if (ownGames === undefined)
    request<types.api.Game>("Get", "/game", undefined, {
      params: {
        page: 1,
        sortBy: "name asc" as `${string} ${"asc" | "desc"}`,
        perPage: Number(process.env.API_MAX_LIMIT_PER_PAGE ?? 9000),
      },
    })
      .then(({ data }) => setOwnGames(data))
      .catch((error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      });

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      <h1>API Keys Management</h1>
      <h2 id="list">API Key list</h2>
      {apiKeys && apiKeys.length > 0 ? (
        <div className="table">
          <div className="table-row-group shadow">
            <div className="table-row">
              <div className="table-cell font-bold px-5">Name</div>
              <div className="table-cell font-bold px-5">Game</div>
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
                    <Dom.Link to={"/game/show/" + apiKey.game_id}>
                      <span className="underline hover:text-blue-600 transition duration-200">
                        {ownGames?.find((game) => game.id === apiKey.game_id)
                          ?.name ?? ""}
                      </span>
                    </Dom.Link>
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
                            fetchApiKeys();
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
        <Warn type="warn">You don't have any API keys...</Warn>
      )}
      <h2 id="add">Add API Key</h2>
      {ownGames && ownGames.length > 0 ? (
        <>
          <CustomForm
            onSubmit={(session: types.api.Key["Methods"]["Post"]["Body"]) => {
              request<types.api.Key>("Post", "/key", session)
                .then(() => {
                  notificationSystem.current?.addNotification({
                    message: "Successfully generated API key",
                    level: "success",
                  });
                  fetchApiKeys();
                })
                .catch((error) => {
                  notificationSystem.current?.addNotification({
                    message: error.message,
                    level: "error",
                  });
                });
            }}
            inputs={{
              description: {
                is: "text",
                placeholder: "API key name or reason",
              },
              game_id: {
                is: "select",
                label: "game",
                required: true,
                options:
                  ownGames.map((game) => {
                    return { value: game.id as string, label: game.name };
                  }) ?? [],
              },
            }}
            submitText="Add"
            otherButtons={
              <Button callback={() => setOwnGames(undefined)}>
                <FontAwesomeIcon icon={faSyncAlt} />
              </Button>
            }
          />
        </>
      ) : (
        <Warn type="warn">
          <Dom.Link to={"/game/add"}>First create a game</Dom.Link>, and then
          create an API key for it
        </Warn>
      )}
    </>
  );
}

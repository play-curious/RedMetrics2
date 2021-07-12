import axios from "axios";
import React from "react";
import * as Dom from "react-router-dom";
import NotificationSystem from "react-notification-system";

import * as types from "rm2-typings";
import * as constants from "../constants";

import UUID from "../nodes/UUID";
import Warn from "../nodes/Warn";
import Button from "../nodes/Button";
import CustomForm from "../nodes/CustomForm";

import { faTrashAlt, faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function APIKeys() {
  const [apiKeys, setApiKeys] = React.useState<types.tables.ApiKey[]>();
  const [ownGames, setOwnGames] = React.useState<types.tables.Game[]>();

  const notificationSystem = React.createRef<NotificationSystem.System>();

  const fetchApiKeys = () => {
    axios
      .get<types.api.Keys["Get"]["Response"]>("/keys")
      .then(({ data }) => {
        setApiKeys(data);
      })
      .catch((error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      });
  };

  if (apiKeys === undefined) fetchApiKeys();
  if (ownGames === undefined)
    axios
      .get<types.api.Game["Get"]["Response"]>(`/game`)
      .then((response) => setOwnGames(response.data))
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
        <>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Game</th>
                <th>Key</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {apiKeys.map((apiKey) => {
                return (
                  <tr>
                    <td
                      className="p-1 text-red-900 whitespace-nowrap overflow-hidden"
                      title={apiKey.name}
                    >
                      {apiKey.name}
                    </td>
                    <td className="p-1">
                      <Dom.Link to={"/game/show/" + apiKey.game_id}>
                        <span className="underline hover:text-blue-600 transition duration-200">
                          {ownGames?.find((game) => game.id === apiKey.game_id)
                            ?.name ?? ""}
                        </span>
                      </Dom.Link>
                    </td>
                    <td className="p-1">
                      <UUID _key={apiKey.key} />
                    </td>
                    <td className="p-1 flex items-center h-full">
                      <Button
                        customClassName="hover:bg-red-600 rounded-full"
                        callback={function (this: types.tables.ApiKey) {
                          axios
                            .delete(`/key/${this.key}`, {
                              baseURL: constants.API_BASE_URL,
                            })
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
                    </td>
                  </tr>
                );
              }) || "No apiKey"}
            </tbody>
          </table>
        </>
      ) : (
        <Warn type="warn">You don't have any API keys...</Warn>
      )}
      <h2 id="add">Add API Key</h2>
      {ownGames && ownGames.length > 0 ? (
        <>
          <CustomForm
            onSubmit={(session: types.api.Key["Post"]["Body"]) => {
              axios
                .post<types.api.Key["Post"]["Response"]>("/key", session)
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
              name: {
                is: "text",
                placeholder: "API key name or reason",
                required: true,
              },
              game_id: {
                is: "select",
                label: "game",
                options:
                  ownGames?.map((game) => {
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
        <Warn type="warn">You haven't posted any games...</Warn>
      )}
    </>
  );
}

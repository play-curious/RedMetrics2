import axios from "axios";
import React from "react";
import NotificationSystem from "react-notification-system";

import * as types from "rm2-typings";
import * as constants from "../constants";

import Warn from "../nodes/Warn";
import Button from "../nodes/Button";
import CustomForm from "../nodes/CustomForm";

import {
  faTrashAlt,
  faChessKnight,
  faSyncAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function ApiKeys({ user }: { user: types.tables.Account }) {
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

  const notifyClipboard = () => {
    notificationSystem.current?.addNotification({
      message: "Copied to clipboard",
      level: "success",
    });
  };

  if (apiKeys === undefined) fetchApiKeys();
  if (ownGames === undefined)
    axios
      .get<types.api.Game["Get"]["Response"]>(`/game`, {
        baseURL: constants.API_BASE_URL,
        params: {
          publisher_id: user.id,
        },
      })
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
      <h1>Edit your API Keys</h1>
      <h2>API Key list</h2>
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
                      {ownGames?.find((game) => game.id === apiKey.game_id)
                        ?.name ?? ""}
                    </td>
                    <td className="p-1">
                      <div
                        data-clipboard-text={apiKey.key}
                        onClick={notifyClipboard}
                        className="clipboard flex items-center bg-gray-800 font-mono inline-block rounded-full text-gray-300 hover:text-white px-1.5 whitespace-nowrap overflow-hidden"
                      >
                        <span className="flex-grow">{apiKey.key}</span>
                        <i
                          className="pl-2 text-white far fa-copy cursor-pointer"
                          title="Copy to clipboard"
                        />
                      </div>
                    </td>
                    <td className="p-1 flex items-center h-full">
                      <Button
                        callback={function (this: types.tables.ApiKey) {
                          axios
                            .delete(`/key/${this.key}`, {
                              baseURL: constants.API_BASE_URL,
                            })
                            .then(() => {
                              notificationSystem.current?.addNotification({
                                message: "Successful deleted apiKey",
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
                      <Button to={"/game/show/" + apiKey.game_id}>
                        <FontAwesomeIcon icon={faChessKnight} />
                      </Button>
                    </td>
                  </tr>
                );
              }) || "No apiKey"}
            </tbody>
          </table>
        </>
      ) : (
        <Warn type="warn">You don't have any api key...</Warn>
      )}
      <h2>Add API Key</h2>
      {ownGames && ownGames.length > 0 ? (
        <>
          <CustomForm
            className="flex items-center"
            onSubmit={(session: types.api.Key["Post"]["Body"]) => {
              axios
                .post<types.api.Key["Post"]["Response"]>("/key", session)
                .then(() => {
                  notificationSystem.current?.addNotification({
                    message: "Successful generated apiKey",
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
                placeholder: "Api Key Name",
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
          >
            <Button callback={() => setOwnGames(undefined)}>
              <FontAwesomeIcon icon={faSyncAlt} />
            </Button>
          </CustomForm>
        </>
      ) : (
        <Warn type="warn">You don't have posted any game...</Warn>
      )}
    </>
  );
}

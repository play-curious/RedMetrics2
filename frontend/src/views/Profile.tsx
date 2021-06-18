import axios from "axios";
import React from "react";
import Select from "react-select";
import * as Form from "react-hook-form";
import NotificationSystem from "react-notification-system";

import qs from "querystring";
import tims from "tims";

import * as types from "rm2-typings";
import * as constants from "../constants";

import Center from "../nodes/Center";
import Button from "../nodes/Button";
import CustomForm, {CustomOption} from "../nodes/CustomForm";

import {
  faTrashAlt,
  faChessKnight,
  faSyncAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface ApiKeyValues {
  name: string;
  permissions: types.Permission[];
  game_id?: string;
}

export default function Profile({ user }: { user?: types.ApiKeyUser }) {
  const [sessions, setSessions] = React.useState<types.ApiKey[]>();
  const [ownGames, setOwnGames] = React.useState<types.Game[]>();

  const profileForm = Form.useForm<types.User>();
  const apiKeyForm = Form.useForm<ApiKeyValues>();

  const notificationSystem = React.createRef<NotificationSystem.System>();

  if (!user) return <></>;

  profileForm.setValue("email", user.email);
  profileForm.setValue("role", user.role);

  const fetchSessions = () => {
    axios
      .get<types.ApiKey[]>(
        "/sessions?" + qs.stringify({ apikey: user.api_key }),
        { baseURL: constants.API_BASE_URL }
      )
      .then(({ data }) => {
        setSessions(data);
      })
      .catch((error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      });
  };

  const editAccount = (data: types.User) => {
    axios
      .put<types.User>(
        `account/${user.account_id}?` + qs.stringify({ apikey: user.api_key }),
        data,
        {
          baseURL: constants.API_BASE_URL,
        }
      )
      .catch((error: Error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      })
      .finally(() => profileForm.setValue("password", ""));
  };

  const generateApiKey = (session: types.ApiKey) => {
    axios
      .post(
        "/session?" + qs.stringify({ apikey: user.api_key }),
        {
          ...session,
          game_id: session.game_id,
        },
        {
          baseURL: constants.API_BASE_URL,
        }
      )
      .then(() => {
        notificationSystem.current?.addNotification({
          message: "Successful generated apiKey",
          level: "success",
        });
        fetchSessions();
      })
      .catch((error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      });
  };

  const removeApiKey = (apiKey: string) => {
    axios
      .delete(`/session/${apiKey}?${qs.stringify({ apikey: user.api_key })}`, {
        baseURL: constants.API_BASE_URL,
      })
      .then(() => {
        notificationSystem.current?.addNotification({
          message: "Successful deleted apiKey",
          level: "success",
        });
        fetchSessions();
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

  if (sessions === undefined) fetchSessions();
  if (ownGames === undefined)
    axios
      .get<types.Game[]>(`/game`, {
        baseURL: constants.API_BASE_URL,
        params: {
          apikey: user.api_key,
          publisher_id: user.account_id,
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
      <Center height="min-h-full">
        <h1 className="text-xl ">Edit your personal information</h1>
      </Center>
      <div className="xl:flex flex-shrink">
        <div className="p-4 m-4 border-2 rounded flex flex-col">
          <h2 className="text-lg text-center font-bold"> Profile </h2>
          <CustomForm
            className="flex flex-col h-full justify-center"
            onSubmit={editAccount}
            inputs={{
              email: {
                type: "email",
                required: true,
                placeHolder: "Email",
                value: user.email,
              },
              password: {
                type: "password",
                required: true,
                placeHolder: "Password",
              },
              role: {
                required: true,
                choices: [
                  { label: "Admin", value: "admin" },
                  { label: "Dev", value: "dev" },
                  { label: "User", value: "user" },
                ]
              },
            }}
            submitText="Edit account"
          />
        </div>
        <div className="xl:grid-cols-8">
          <div className="p-4 m-4 border-2 rounded">
            <h2 className="text-lg text-center font-bold">API Keys</h2>
            {sessions && (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Permissions</th>
                    <th>Game</th>
                    <th>apiKey</th>
                    <th>Expire in</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => {
                    return (
                      <tr>
                        <td
                          className="p-1 text-red-900 whitespace-nowrap overflow-hidden"
                          title={session.name}
                        >
                          {session.name}
                        </td>
                        <td className="p-1 whitespace-nowrap overflow-y-scroll">
                          <code className="h-1">
                            {session.permissions.map((permission) => {
                              return <div>{permission}</div>;
                            })}
                          </code>
                        </td>
                        <td className="p-1">
                          {ownGames?.find((game) => game.id === session.game_id)
                            ?.name ?? ""}
                        </td>
                        <td className="p-1">
                          <div
                            data-clipboard-text={session.api_key}
                            onClick={notifyClipboard}
                            className="clipboard flex items-center bg-gray-800 font-mono inline-block rounded-full text-gray-300 hover:text-white px-1.5 whitespace-nowrap overflow-hidden"
                          >
                            <span className="flex-grow">{session.api_key}</span>
                            <i
                              className="pl-2 text-white far fa-copy cursor-pointer"
                              title="Copy to clipboard"
                            />
                          </div>
                        </td>
                        <td className="p-1">
                          <code className="whitespace-nowrap overflow-hidden">
                            {session.is_connection_key
                              ? tims.fromNow(
                                  new Date(session.start_at).getTime() +
                                    constants.SESSION_DURATION,
                                  {
                                    format: "hour",
                                  }
                                )
                              : "never"}
                          </code>
                        </td>
                        <td className="p-1 flex items-center h-full">
                          {user?.api_key !== session.api_key && (
                            <Button
                              callback={function (this: string) {
                                removeApiKey(this);
                              }.bind(session.api_key)}
                            >
                              <FontAwesomeIcon icon={faTrashAlt} />
                            </Button>
                          )}
                          {session.game_id && (
                            <Button to={"/game/show/" + session.game_id}>
                              <FontAwesomeIcon icon={faChessKnight} />
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  }) ?? "No apiKey"}
                </tbody>
              </table>
            )}
          </div>
          <div className="p-4 m-4 border-2 rounded">
            <h2 className="text-lg text-center font-bold">Add API Key</h2>
            <CustomForm
              className="flex items-center"
              onSubmit={generateApiKey}
              inputs={{
                name: {
                  placeHolder: "Api Key Name",
                  required: true,
                },
                permissions: {
                  checks: Object.values(types.Permission).map((permission) => {
                    if (!user?.permissions.includes(permission)) {
                      if (
                        permission === "showAccounts" ||
                        permission === "createAccounts" ||
                        permission === "deleteAccounts" ||
                        permission === "editAccounts"
                      ) {
                        if (
                          !user?.permissions.includes(
                            types.Permission.MANAGE_ACCOUNTS
                          )
                        ) {
                          return;
                        }
                      } else if (
                        permission === "showGames" ||
                        permission === "createGames" ||
                        permission === "deleteGames" ||
                        permission === "editGames"
                      ) {
                        if (
                          !user?.permissions.includes(
                            types.Permission.MANAGE_GAMES
                          )
                        ) {
                          return;
                        }
                      }
                    }
  
                    return { label: permission, value: permission }
                  }).filter((option) => !!option) as CustomOption[]
                },
                game_id: {
                  options: ownGames?.map((game) => {
                    return { value: game.id as string, label: game.name };
                  }) ?? []
                }
              }}
              submitText="Add"
            >
              <Button callback={() => setOwnGames(undefined)}>
                <FontAwesomeIcon icon={faSyncAlt} />
              </Button>
            </CustomForm>
          </div>
        </div>
      </div>
    </>
  );
}

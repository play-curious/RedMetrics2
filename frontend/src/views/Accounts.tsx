import React from "react";
import * as Router from "react-router";
import NotificationSystem from "react-notification-system";

import axios from "axios";

import * as types from "rm2-typings";
import * as constants from "../constants";

import Card from "../nodes/Card";
import Wrapper from "../nodes/Wrapper";
import Button from "../nodes/Button";
import CheckUser from "../nodes/CheckUser";

export default function Accounts({ user }: { user?: types.ApiKeyUser }) {
  const notificationSystem = React.createRef<NotificationSystem.System>();
  const [accounts, setAccounts] = React.useState<types.Account[]>();

  const deleteAccount = (id: string) => {
    axios
      .delete(`/account/${id}`, {
        baseURL: constants.API_BASE_URL,
        params: {
          apikey: user?.api_key,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          notificationSystem.current?.addNotification({
            message: "Account successfully deleted",
            level: "success",
          });
          setAccounts(undefined);
        } else {
          notificationSystem.current?.addNotification({
            message: `${response.status} HTTP Error`,
            level: "error",
          });
        }
      })
      .catch((error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      });
  };

  if (accounts === undefined)
    axios
      .get("/accounts", {
        baseURL: constants.API_BASE_URL,
        params: { limit: 100, page: 1, apikey: user?.api_key },
      })
      .then((response) => setAccounts(response.data))
      .catch((error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      });

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      <CheckUser
        user={user}
        permissions={[
          types.Permission.DELETE_ACCOUNTS,
          types.Permission.MANAGE_ACCOUNTS,
        ]}
        condition={() => false}
      />
      <h1> Account management </h1>
      <Button to="/account/create"> Create </Button>
      <Wrapper>
        {accounts?.map((account) => {
          return (
            <Card
              title={account.email}
              url={"/account/show/" + account.id}
              footer={
                <div className="flex">
                  <Button to={"/account/show/" + account.id}> Edit </Button>
                  <Button
                    to="#"
                    callback={() => deleteAccount(account.id as string)}
                    customClassName="bg-red-500"
                  >
                    Delete
                  </Button>
                </div>
              }
            >
              <table>
                <tr>
                  <th>Rôle</th>
                  <td
                    style={{
                      textTransform: "uppercase",
                    }}
                  >
                    {account.role}
                  </td>
                </tr>
                <tr>
                  <th>ID</th>
                  <td>{account.id}</td>
                </tr>
              </table>
            </Card>
          );
        })}
      </Wrapper>
    </>
  );
}

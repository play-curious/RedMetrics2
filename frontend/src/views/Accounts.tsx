import React from "react";
import NotificationSystem from "react-notification-system";

import axios from "axios";

import * as types from "rm2-typings";

import Card from "../nodes/Card";
import Wrapper from "../nodes/Wrapper";
import Button from "../nodes/Button";
import ErrorPage from "./ErrorPage";

export default function Accounts({ user }: { user: types.tables.Account }) {
  const notificationSystem = React.createRef<NotificationSystem.System>();
  const [accounts, setAccounts] = React.useState<types.tables.Account[]>();

  if (!user.is_admin)
    return ErrorPage({
      text: "You must be administrator to access this page.",
    });

  if (accounts === undefined)
    axios
      .get<types.api.Accounts["Get"]["Response"]>("/accounts", {
        params: { limit: 100, page: 1 },
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
      <h1> Account management </h1>
      <Button to="/account/create"> Create </Button>
      <h2> Account list </h2>
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
                    to="/accounts"
                    callback={() => {
                      axios
                        .delete<types.api.AccountById["Delete"]["Response"]>(
                          `/account/${account.id}`
                        )
                        .then(() => {
                          notificationSystem.current?.addNotification({
                            message: "Account successfully deleted",
                            level: "success",
                          });
                          setAccounts(
                            accounts.filter((a) => a.id !== account.id)
                          );
                        })
                        .catch((error) => {
                          notificationSystem.current?.addNotification({
                            message: error.message,
                            level: "error",
                          });
                        });
                    }}
                    customClassName="hover:bg-red-500"
                  >
                    Delete
                  </Button>
                </div>
              }
            >
              <table>
                <tr>
                  <th>Admin</th>
                  <td>{String(account.is_admin)}</td>
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

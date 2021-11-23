import React from "react";
import NotificationSystem from "react-notification-system";

import * as types from "rm2-typings";

import Card from "../nodes/Card";
import Wrapper from "../nodes/Wrapper";
import Button from "../nodes/Button";
import ErrorPage from "./ErrorPage";

const request = types.utils.request;

export default function Accounts({ user }: { user: types.tables.Account }) {
  const notificationSystem = React.createRef<NotificationSystem.System>();
  const [accounts, setAccounts] = React.useState<types.tables.Account[]>();

  if (!user.is_admin)
    return ErrorPage({
      text: "You must be administrator to access this page.",
    });

  if (accounts === undefined)
    request<types.api.Accounts>("Get", "/accounts", undefined, {
      params: { limit: 100, page: 1 },
    })
      .then((data) => setAccounts(data))
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
      <h2> Actions </h2>
      <Wrapper>
        <Button to="/account/create"> Create </Button>
      </Wrapper>
      <h2 id="list"> Account list </h2>
      <Wrapper>
        {accounts?.map((account) => {
          return (
            <Card
              title={account.email}
              url={"/account/show/" + account.id}
              secondary={account.id}
            >
              <div className="flex">
                <Button to={"/account/show/" + account.id}> Edit </Button>
                <Button
                  to="/accounts"
                  callback={() => {
                    request<types.api.AccountById>(
                      "Delete",
                      `/account/${account.id}`,
                      undefined
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
            </Card>
          );
        })}
      </Wrapper>
    </>
  );
}

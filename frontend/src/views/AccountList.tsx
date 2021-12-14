import React from "react";
import NotificationSystem from "react-notification-system";

import * as types from "rm2-typings";

import Card from "../nodes/Card";
import Wrapper from "../nodes/Wrapper";
import Button from "../nodes/Button";
import _Error from "./_Error";
import Paginator from "../nodes/Paginator";
import Warn from "../nodes/Warn";

const request = types.utils.request;

export default function AccountList({ user }: { user: types.tables.Account }) {
  const notificationSystem = React.createRef<NotificationSystem.System>();
  const [accountCount, setAccountCount] = React.useState<number>();

  const accountPerPage = 15;

  if (!user.is_admin)
    return _Error({
      text: "You must be administrator to access this page.",
    });

  if (accountCount === undefined)
    request<types.api.AccountCount>("Get", "/accounts/count", undefined)
      .then(setAccountCount)
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
      {accountCount && accountCount > 0 ? (
        <Paginator
          pageCount={accountCount / accountPerPage}
          fetchPageItems={(index) => {
            return request<types.api.Accounts>("Get", "/accounts", undefined, {
              params: {
                offset: index * accountPerPage,
                limit: accountPerPage,
              },
            }).then((accounts: types.tables.Account[]) =>
              accounts?.map((account) => {
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

                              setAccountCount(undefined);
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
              })
            );
          }}
        />
      ) : (
        <Warn type="warn"> No accounts found </Warn>
      )}
    </>
  );
}

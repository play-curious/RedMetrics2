import React from "react";
import NotificationSystem from "react-notification-system";

import * as types from "rm2-typings";
import * as utils from "../../utils";

import Card from "../../nodes/Card";
import Wrapper from "../../nodes/Wrapper";
import Button from "../../nodes/Button";
import Error from "../system/Error";
import Paginator from "../../nodes/Paginator";
import Warn from "../../nodes/Warn";

const request = types.utils.request;

export default function AccountList({ user }: { user: types.tables.Account }) {
  const notificationSystem = React.createRef<NotificationSystem.System>();

  const accountPerPage = 15;

  if (!user.is_admin)
    return Error({
      text: "You must be administrator to access this page.",
    });

  const [context, setContext] = React.useState<{
    data: types.tables.Account[];
    headers: utils.ResolvedPagingHeaders;
  }>();

  const fetchAccounts = (pageNumber: number) => {
    request<types.api.Accounts>("Get", "/accounts", undefined, {
      params: {
        page: pageNumber,
        perPage: accountPerPage,
      },
    }).then(({ data, headers }) => {
      const resolved = utils.extractPagingHeaders(headers);

      if (resolved)
        setContext({
          data,
          headers: resolved,
        });
    });
  };

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      <h1> Account management </h1>
      <h2> Actions </h2>
      <Wrapper>
        <Button to="/account/create"> Create </Button>
      </Wrapper>
      <h2 id="list"> Account list </h2>
      {context && context.data.length > 0 ? (
        <Paginator
          headers={context.headers}
          pageItems={context.data}
          map={(account) => (
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

                        setContext(undefined);
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
          )}
          onPageChange={fetchAccounts}
        />
      ) : (
        <Warn type="warn"> No accounts found </Warn>
      )}
    </>
  );
}

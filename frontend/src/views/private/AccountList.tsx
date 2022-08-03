import React from "react";
import NotificationSystem from "react-notification-system";

import * as types from "rm2-typings";
import * as utils from "../../utils";

import Wrapper from "../../nodes/Wrapper";
import Button from "../../nodes/Button";
import Error from "../system/Error";
import Paginator from "../../nodes/Paginator";
import AccountCard from "../../nodes/cards/AccountCard";

const request = types.utils.request;

export default function AccountList({
  user,
}: {
  user: types.utils.SnakeToCamelCaseNested<types.tables.Account>;
}) {
  const [context, setContext] = React.useState<{
    data: types.utils.SnakeToCamelCaseNested<types.tables.Account>[];
    headers: utils.ResolvedPagingHeaders;
  }>();

  const notificationSystem = React.createRef<NotificationSystem.System>();

  const accountPerPage = 15;

  const fetchAccounts = (
    pageNumber: number,
    sortBy: `${string} ${"asc" | "desc"}`
  ) => {
    request<types.api.Accounts>("Get", "/accounts", undefined, {
      withCredentials: true,
      params: {
        page: pageNumber,
        perPage: accountPerPage,
        sortBy,
      },
    }).then(utils.handlePagingFetch(setContext));
  };

  if (context === undefined) fetchAccounts(1, "created_timestamp desc");

  if (!user.isAdmin)
    return Error({
      text: "You must be administrator to access this page.",
    });

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      <h1> Account management </h1>
      <h2> Actions </h2>
      <Wrapper>
        <Button to="/account/create"> Create </Button>
        <Button callback={() => fetchAccounts(1, "id desc")}> Refresh </Button>
      </Wrapper>
      <h2 id="list"> Account list ({context?.headers.total ?? 0}) </h2>
      <Paginator
        context={context}
        onPageChange={fetchAccounts}
        map={(account, i) => (
          <AccountCard
            key={i}
            account={account}
            onRemoved={() => setContext(undefined)}
          />
        )}
      />
    </>
  );
}

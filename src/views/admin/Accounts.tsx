import React, { FunctionComponent, useState } from "react";
import { Redirect } from "react-router";
import axios from "axios";

import Card from "../../nodes/Card";

import * as types from "../../types";
import * as utils from "../../utils";
import * as constants from "../../constants";

const Accounts: FunctionComponent<{
  role: types.Role;
  apiKey: string | null;
}> = ({ role, apiKey }) => {
  const [redirect, setRedirect] = useState<null | string>(
    apiKey ? null : "/error"
  );
  const [accounts, setAccounts] = useState<types.Account[]>([]);

  axios
    .get("/accounts?limit=100&page=1&apikey=" + apiKey, {
      baseURL: constants.apiBaseURL,
    })
    .then((response) => setAccounts(response.data));

  return (
    <>
      {utils.roleRank(role) < utils.roleRank("admin") && setRedirect("/home")}
      {redirect && <Redirect to={redirect} />}
      {accounts.map((account) => {
        return (
          <Card
            title={`${account.role} - ${account.id}`}
            description={account.email}
            url={"/account/" + account.id}
            fields={account.games ?? []}
          />
        );
      })}
    </>
  );
};

export default Accounts;

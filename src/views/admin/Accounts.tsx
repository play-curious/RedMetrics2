import React, { FunctionComponent, useState } from "react";
import { Redirect } from "react-router";
import { Link } from "react-router-dom";
import axios from "axios";

import Card from "../../nodes/Card";

import * as types from "../../types";
import * as utils from "../../utils";
import * as constants from "../../constants";
import Menu from "../../nodes/Menu";

const Accounts: FunctionComponent<{
  user: types.SessionUser;
}> = ({ user }) => {
  const [redirect, setRedirect] = useState<null | string>(null);
  const [accounts, setAccounts] = useState<types.Account[]>([]);

  axios
    .get("/accounts?limit=100&page=1&apikey=" + user.api_key, {
      baseURL: constants.apiBaseURL,
    })
    .then((response) => setAccounts(response.data));

  return (
    <>
      <Menu>
        <Link to="/home"> Home </Link>
      </Menu>
      <div className="accounts">
        {user.roleRank < utils.roleRank("admin") && setRedirect("/home")}
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
      </div>
    </>
  );
};

export default Accounts;

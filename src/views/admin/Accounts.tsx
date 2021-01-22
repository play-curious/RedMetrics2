import React from "react";
import Dom from "react-router-dom";
import Router from "react-router";
import axios from "axios";

import * as types from "../../types";
import * as utils from "../../utils";
import * as constants from "../../constants";

import Menu from "../../nodes/Menu";
import Card from "../../nodes/Card";

const Accounts: React.FunctionComponent<{
  user: types.SessionUser;
}> = ({ user }) => {
  const [redirect, setRedirect] = React.useState<null | string>(null);
  const [accounts, setAccounts] = React.useState<types.Account[]>([]);

  axios
    .get("/accounts?limit=100&page=1&apikey=" + user.api_key, {
      baseURL: constants.apiBaseURL,
    })
    .then((response) => setAccounts(response.data));

  return (
    <>
      <Menu>
        <Dom.Link to="/home"> Home </Dom.Link>
      </Menu>
      <div className="accounts">
        {user.roleRank < utils.roleRank("admin") && setRedirect("/home")}
        {redirect && <Router.Redirect to={redirect} />}
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

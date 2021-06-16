import React from "react";
import * as Router from "react-router";
import * as types from "rm2-typings";

export default function CheckUser({
  user,
  permissions,
  condition,
}: {
  user?: types.ApiKeyUser;
  permissions: types.Permission[];
  condition: () => boolean;
}) {
  const [redirect, setRedirect] = React.useState<string | null>(null);

  if (!user) return <></>;

  if (redirect === null)
    if (
      !condition() &&
      (!user ||
        !permissions.some((permission) =>
          user.permissions.includes(permission)
        ))
    )
      setRedirect("/");

  return <>{redirect && <Router.Redirect to={redirect} />}</>;
}

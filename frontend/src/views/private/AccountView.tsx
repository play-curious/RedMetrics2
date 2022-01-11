import React from "react";
import * as Router from "react-router";
import * as Cookies from "react-cookie";
import * as types from "rm2-typings";

import NotificationSystem from "react-notification-system";

import * as utils from "../../utils";
import * as constants from "../../constants";

import CustomForm from "../../nodes/CustomForm";
import Button from "../../nodes/Button";
import Wrapper from "../../nodes/Wrapper";
import UUID from "../../nodes/UUID";

const request = types.utils.request;

export default function AccountView({
  user,
}: {
  user: types.utils.SnakeToCamelCaseNested<types.tables.Account>;
}) {
  const notificationSystem = React.createRef<NotificationSystem.System>();
  const [, , removeCookie] = Cookies.useCookies([constants.COOKIE_NAME]);
  const [account, setAccount] =
    React.useState<types.utils.SnakeToCamelCaseNested<types.tables.Account>>();
  const [redirect, setRedirect] = React.useState<string>();
  const { id } = Router.useParams<{ id: string }>();

  if (!account)
    if (id !== user.id) {
      if (user.isAdmin) {
        request<types.api.AccountById>("Get", `/account/${id}`, undefined)
          .then(({ data }) => setAccount(data ?? user))
          .catch((error) => {
            notificationSystem.current?.addNotification({
              message: error.message,
              level: "error",
            });
            setAccount(user);
          });
      } else {
        notificationSystem.current?.addNotification({
          message: "You must be an administrator to edit another profile",
          level: "error",
        });

        setAccount(user);
      }
    } else {
      setAccount(user);
    }

  utils.checkNotificationParams(notificationSystem).catch();

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      {redirect && <Router.Redirect to={redirect} />}
      <h1> Account {account && user.id !== id && `of ${account.email}`}</h1>
      <Wrapper>
        <UUID _key={id} />
      </Wrapper>
      {user.id === id && (
        <>
          <h2> Actions </h2>
          <Wrapper>
            <Button
              customClassName="hover:bg-red-600"
              callback={() =>
                request<types.api.Logout>("Get", "/logout", undefined)
                  .then(() => {
                    notificationSystem.current?.addNotification({
                      message: "Successful disconnected",
                      level: "success",
                    });
                    removeCookie(constants.COOKIE_NAME);
                    setRedirect("/login");
                    window.location.reload();
                  })
                  .catch((error) => {
                    notificationSystem.current?.addNotification({
                      message: error.message,
                      level: "error",
                    });
                  })
              }
            >
              Logout
            </Button>
          </Wrapper>
        </>
      )}
      <h2> Edit account </h2>
      <CustomForm
        className="flex flex-col"
        submitText="Edit"
        defaultValues={{
          email: account?.email ?? user.email,
          newPassword: "",
          oldPassword: "",
          isAdmin: account?.isAdmin ?? user.isAdmin,
        }}
        inputs={{
          email: {
            is: "email",
            required: true,
            label: "Email",
            placeholder: "Email",
          },
          oldPassword:
            user.id === id
              ? {
                  is: "password",
                  required: true,
                  label: "Current password",
                  placeholder: "Current password",
                }
              : "",
          newPassword: {
            is: "password",
            required: true,
            label: "New password",
            placeholder: "New password",
          },
          isAdmin: {
            is: "checkbox",
            label: "is administrator",
          },
        }}
        onSubmit={(data: types.api.AccountById["Methods"]["Put"]["Body"]) => {
          request<types.api.AccountById>("Put", `/account/${id}`, data)
            .then(() => {
              notificationSystem.current?.addNotification({
                message: "Successfully edited account",
                level: "success",
              });
              if (user.id === id) window.location.reload();
            })
            .catch((error) => {
              notificationSystem.current?.addNotification({
                message: error.message,
                level: "error",
              });
            });
        }}
      />
    </>
  );
}

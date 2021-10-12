import React from "react";
import * as Router from "react-router";
import * as Cookies from "react-cookie";

import axios from "axios";
import NotificationSystem from "react-notification-system";

import * as types from "rm2-typings";
import * as constants from "../constants";

import CustomForm from "../nodes/CustomForm";
import Button from "../nodes/Button";
import Wrapper from "../nodes/Wrapper";
import UUID from "../nodes/UUID";

export default function AccountPage({ user }: { user: types.tables.Account }) {
  const notificationSystem = React.createRef<NotificationSystem.System>();
  const [, , removeCookie] = Cookies.useCookies([constants.COOKIE_NAME]);
  const [account, setAccount] = React.useState<types.tables.Account>();
  const [redirect, setRedirect] = React.useState<string>();
  const { id } = Router.useParams<{ id: string }>();

  if (!account)
    if (id !== user.id) {
      if (user.is_admin) {
        axios
          .get<types.api.AccountById["Get"]["Response"]>("/account/" + id)
          .then((response) => {
            setAccount(response?.data ?? user);
          })
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
                axios
                  .get("/logout")
                  .catch((error) => {
                    notificationSystem.current?.addNotification({
                      message: error.message,
                      level: "error",
                    });
                  })
                  .then(() => {
                    notificationSystem.current?.addNotification({
                      message: "Successful disconnected",
                      level: "success",
                    });
                    removeCookie(constants.COOKIE_NAME);
                    setRedirect("/login");
                    window.location.reload(true);
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
          email: user.email,
          new_password: "",
          old_password: "",
          is_admin: false,
        }}
        inputs={{
          email: {
            is: "email",
            required: true,
            label: "Email",
            placeholder: "Email",
          },
          new_password: {
            is: "password",
            required: true,
            label: "New password",
            placeholder: "New password",
          },
          old_password:
            user.id === id
              ? {
                  is: "password",
                  required: true,
                  label: "Current password",
                  placeholder: "Current password",
                }
              : "",
          is_admin: {
            is: "checkbox",
            label: "is administrator",
          },
        }}
        onSubmit={(data: types.api.AccountById["Put"]["Body"]) => {
          axios
            .put<types.api.AccountById["Put"]["Response"]>(
              "/account/" + id,
              data
            )
            .then(() => {
              notificationSystem.current?.addNotification({
                message: "Successfully edited account",
                level: "success",
              });
              if (user.id === id) window.location.reload(true);
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

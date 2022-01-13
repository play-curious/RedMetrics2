import React from "react";
import { confirmAlert } from "react-confirm-alert";
import NotificationSystem from "react-notification-system";

import * as types from "rm2-typings";

import Button from "../Button";
import Card from "./Card";

const request = types.utils.request;

export default function AccountCard({
  account,
  onRemoved,
}: {
  account: types.utils.SnakeToCamelCaseNested<types.tables.Account>;
  onRemoved: (id: types.tables.Account["id"]) => void;
}) {
  const notificationSystem = React.createRef<NotificationSystem.System>();

  return (
    <Card
      title={account.email}
      url={"/account/show/" + account.id}
      secondary={account.id}
    >
      <NotificationSystem ref={notificationSystem} />
      <div className="flex">
        <Button to={"/account/show/" + account.id}> Edit </Button>
        <Button
          to="/accounts"
          callback={() => {
            confirmAlert({
              title: "Confirm to remove",
              message: "Are you sure you want to delete this account?",
              buttons: [
                {
                  label: "Yes",
                  onClick: () =>
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

                        onRemoved(account.id);
                      })
                      .catch((error) => {
                        notificationSystem.current?.addNotification({
                          message: error.message,
                          level: "error",
                        });
                      }),
                },
                {
                  label: "No",
                  onClick: () => null,
                },
              ],
            });
          }}
          customClassName="hover:bg-red-500"
        >
          Delete
        </Button>
      </div>
    </Card>
  );
}

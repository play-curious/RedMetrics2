import React from "react";
import * as Router from "react-router";

import NotificationSystem from "react-notification-system";

import * as types from "rm2-typings";
import * as utils from "../../utils";

import CustomForm from "../../nodes/CustomForm";

const request = types.utils.request;

export default function GameAdd({ user }: { user: utils.User }) {
  const notificationSystem = React.createRef<NotificationSystem.System>();
  const [redirect, setRedirect] = React.useState<null | string>(null);

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      {redirect && <Router.Redirect to={redirect} />}
      <h1> Add your game </h1>
      <CustomForm
        onSubmit={(game: types.api.Game["Methods"]["Post"]["Body"]) => {
          request<types.api.Game>("Post", "/game", game)
            .then(({ data }) => data)
            .then((data) => {
              setRedirect("/game/show/" + data.id);
            })
            .catch((error) => {
              const notification = notificationSystem.current;
              notification?.addNotification({
                message: error.message,
                level: "error",
              });
            });
        }}
        submitText="Add"
        className="flex flex-col"
        inputs={{
          name: {
            is: "text",
            required: true,
            autoFocus: true,
            minLength: 3,
            maxLength: 256,
            placeholder: "Game name",
            label: "Game name",
          },
          author: {
            is: "text",
            label: "Author",
            minLength: 3,
            maxLength: 256,
            placeholder: "Game author name",
          },
          description: {
            is: "area",
            label: "Game description",
          },
          customData: {
            is: "area",
            label: "Custom data",
            jsonValidation: true,
          },
          publisherId: user.id,
        }}
      />
    </>
  );
}

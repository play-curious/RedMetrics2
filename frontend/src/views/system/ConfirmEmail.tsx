import React from "react";
import NotificationSystem from "react-notification-system";

import * as types from "rm2-typings";

import CustomForm from "../../nodes/CustomForm";
import Button from "../../nodes/Button";

import { useHistory } from "react-router-dom";

const request = types.utils.request;

export default function ConfirmEmail() {
  const notificationSystem = React.createRef<NotificationSystem.System>();
  const history = useHistory();

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      <div className="min-h-full">
        <h1> Email confirmation </h1>
        <h2>Enter the received digit code</h2>
        <p className="p-2 shadow-inner rounded text-gray-500">
          An email containing a digit code has been sent to you. Please enter
          the code received below.
        </p>
        <CustomForm
          onSubmit={(
            data: types.api.CheckEmail_Confirm["Methods"]["Post"]["Body"]
          ) => {
            request<types.api.CheckEmail_Confirm>(
              "Post",
              "/check-email/confirm",
              data
            )
              .then(() => {
                notificationSystem.current?.addNotification({
                  message: "Successfully confirm your email!",
                  level: "success",
                });

                setTimeout(() => {
                  history.push("/home");
                  window.location.reload();
                }, 2000);
              })
              .catch((error) => {
                notificationSystem.current?.addNotification({
                  message: error.message,
                  level: "error",
                });
              });
          }}
          inputs={{
            code: {
              is: "text",
              required: true,
              placeholder: "Confirmation Digit Code",
            },
          }}
          submitText="Confirm my email"
          otherButtons={
            <Button
              callback={() => {
                request<types.api.CheckEmail>("Post", "/check-email", undefined)
                  .then(() => {
                    notificationSystem.current?.addNotification({
                      message: "Successfully sent new digit code",
                      level: "success",
                    });
                  })
                  .catch((error) => {
                    notificationSystem.current?.addNotification({
                      message: error.message,
                      level: "error",
                    });
                  });
              }}
            >
              Send code again
            </Button>
          }
        />
      </div>
    </>
  );
}

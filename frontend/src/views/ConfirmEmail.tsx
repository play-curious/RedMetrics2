import React from "react";
import NotificationSystem from "react-notification-system";

import * as types from "rm2-typings";

import axios from "axios";

import CustomForm from "../nodes/CustomForm";
import Button from "../nodes/Button";

export default function ConfirmEmail() {
  const notificationSystem = React.createRef<NotificationSystem.System>();

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
          onSubmit={(data: types.api.ConfirmEmail["Patch"]["Body"]) => {
            axios
              .patch<types.api.ConfirmEmail["Patch"]["Response"]>(
                "/confirm-email",
                data
              )
              .then(() => {
                notificationSystem.current?.addNotification({
                  message: "Successfully confirm your email!",
                  level: "success",
                });
                window.location.reload(true);
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
                axios
                  .post<types.api.ConfirmEmail["Post"]["Response"]>(
                    "/confirm-email"
                  )
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

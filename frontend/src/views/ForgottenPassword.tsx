import React from "react";
import NotificationSystem from "react-notification-system";

import * as types from "rm2-typings";

import axios from "axios";

import CustomForm from "../nodes/CustomForm";
import Button from "../nodes/Button";

export default function ForgottenPassword() {
  const [sent, setSent] = React.useState<boolean>(false);
  const notificationSystem = React.createRef<NotificationSystem.System>();

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      <div className="min-h-full">
        <h1> Forgotten password </h1>
        <div className="p-5">
          <h2>Please type your email</h2>
          <CustomForm
            onSubmit={(data: types.api.LostPassword["Post"]["Body"]) => {
              axios
                .post<types.api.LostPassword["Post"]["Response"]>(
                  "/lost-password",
                  data
                )
                .then(() => {
                  notificationSystem.current?.addNotification({
                    message: "Successfully sent code to " + data.email,
                    level: "success",
                  });
                  setSent(true);
                })
                .catch((error) => {
                  notificationSystem.current?.addNotification({
                    message: error.message,
                    level: "error",
                  });
                });
            }}
            submitText={sent ? "Send code again" : "Send code"}
            inputs={{
              email: {
                is: "email",
                placeholder: "Your Account Email",
                required: true,
              },
            }}
          >
            <Button to="/login">Back</Button>
          </CustomForm>
        </div>
        <div className="p-5">
          <h2>Enter the received digit code</h2>
          {sent && (
            <>
              <p className="p-2 shadow-inner rounded text-gray-500">
                An email containing a digit code has been sent to you. Please
                enter the code received below.
              </p>
              <CustomForm
                onSubmit={(data: types.api.LostPassword["Patch"]["Body"]) => {
                  axios
                    .patch<types.api.LostPassword["Patch"]["Response"]>(
                      "/lost-password",
                      data
                    )
                    .then(() => {
                      notificationSystem.current?.addNotification({
                        message: "Successfully sent your new password",
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
                inputs={{
                  code: {
                    is: "text",
                    required: true,
                    placeholder: "Confirmation Digit Code",
                  },
                }}
                submitText="Reset Password"
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}

import React from "react";
import NotificationSystem from "react-notification-system";

import * as types from "rm2-typings";

import axios from "axios";

import CustomForm from "../nodes/CustomForm";
import Button from "../nodes/Button";
import Center from "../nodes/Center";
import Warn from "../nodes/Warn";

export default function ForgottenPassword() {
  const [sent, setSent] = React.useState<boolean>(false);
  const notificationSystem = React.createRef<NotificationSystem.System>();

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      <Center>
        <h1> Forgotten password </h1>
        {sent ? (
          <>
            <h2>Enter the received digit code</h2>
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
                  regex: /^\d{6}$/,
                  warns: (
                    <>
                      <Warn type="warn">
                        An email containing a digit code has been sent to you.
                        Please enter the code received below.
                      </Warn>
                      <Warn type="info">
                        The digit code must be a number of 6
                      </Warn>
                    </>
                  ),
                },
              }}
              otherButtons={
                <Button callback={() => setSent(false)}>Send code again</Button>
              }
              submitText="Reset Password"
            />
          </>
        ) : (
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
            submitText="Request a password reset"
            inputs={{
              email: {
                is: "email",
                placeholder: "Your Account Email",
                required: true,
              },
            }}
            otherButtons={
              <Button callback={() => setSent(true)}>
                Already have a code
              </Button>
            }
          >
            <Button to="/login">Back</Button>
          </CustomForm>
        )}
      </Center>
    </>
  );
}

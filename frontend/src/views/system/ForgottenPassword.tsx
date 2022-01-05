import React from "react";
import NotificationSystem from "react-notification-system";

import * as types from "rm2-typings";

import CustomForm from "../../nodes/CustomForm";
import Button from "../../nodes/Button";
import Warn from "../../nodes/Warn";

const request = types.utils.request;

export default function ForgottenPassword() {
  const [sent, setSent] = React.useState<boolean>(false);
  const notificationSystem = React.createRef<NotificationSystem.System>();

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      <h1> Forgotten password </h1>
      {sent ? (
        <>
          <h2>Enter the code you received by email</h2>
          <CustomForm
            onSubmit={(
              data: types.api.ResetPassword_Confirm["Methods"]["Post"]["Body"]
            ) => {
              request<types.api.ResetPassword_Confirm>(
                "Post",
                "/reset-password/confirm",
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
                placeholder: "Confirmation digital code",
                regex: /^\d{6}$/,
                warns: (
                  <>
                    <Warn type="info">
                      An email containing a 6-digit code has been sent to you.
                      Please enter the code received below.
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
          onSubmit={(
            data: types.api.ResetPassword["Methods"]["Post"]["Body"]
          ) => {
            request<types.api.ResetPassword>("Post", "/reset-password", data)
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
          submitText="Reset my password"
          inputs={{
            email: {
              is: "email",
              placeholder: "Your Account Email",
              required: true,
            },
          }}
          otherButtons={
            <>
              <Button to="/login">Back</Button>
              <Button
                callback={() => setSent(true)}
                customClassName="whitespace-no-wrap"
              >
                I already have a code
              </Button>
            </>
          }
        />
      )}
    </>
  );
}

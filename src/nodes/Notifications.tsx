import React, { FunctionComponent } from "react";

export interface INotification {
  text: string;
  type: "error" | "info" | "success" | "warn";
}

export const Notification: FunctionComponent<INotification> = ({
  text,
  type,
}) => {
  return <div className={"notification " + type}>{text}</div>;
};

export const NotificationStack: FunctionComponent<{
  notifications: INotification[];
}> = ({ notifications }) => {
  return (
    <>
      <div className="notifications">
        {notifications
          .map((notification) => {
            return (
              <Notification text={notification.text} type={notification.type} />
            );
          })
          .reverse()}
      </div>
    </>
  );
};

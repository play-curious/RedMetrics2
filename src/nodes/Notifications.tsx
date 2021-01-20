import React, { FunctionComponent } from "react";

import "./Notifications.scss";

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
          .map((notification, i) => {
            return (
              <Notification
                key={i}
                text={notification.text}
                type={notification.type}
              />
            );
          })
          .reverse()}
      </div>
    </>
  );
};

import React, { FunctionComponent, useEffect, useState } from "react";

import "./Notifications.scss";

export interface INotification {
  text: string;
  type: "error" | "info" | "success" | "warn";
}

export const Notification: FunctionComponent<{
  notification: INotification;
  remove: () => void;
}> = ({ notification: { text, type }, remove }) => {
  return (
    <div className={"notification " + type}>
      {text} <i className="fas fa-times pointer" onClick={remove} />
    </div>
  );
};

export const NotificationStack: FunctionComponent<{
  notifications: INotification[];
}> = ({ notifications: n }) => {
  const [notifications, setNotifications] = useState(n);

  return (
    <>
      <div className="notifications">
        {notifications
          .map((notification, i) => {
            return (
              <Notification
                key={i}
                notification={notification}
                remove={() => {
                  const n2 = notifications.slice();
                  n2.splice(n2.indexOf(notification), 1);
                  setNotifications(n2);
                }}
              />
            );
          })
          .reverse()}
      </div>
    </>
  );
};

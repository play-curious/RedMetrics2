import React from "react";
import NotificationSystem from "react-notification-system";
import querystring from "query-string";

export async function checkNotificationParams(
  notificationSystem: React.RefObject<NotificationSystem.System>
) {
  while (!notificationSystem.current)
    await new Promise((r) => setTimeout(r, 500));

  const search = querystring.parse(window.location.search);

  const levels: ("success" | "error" | "warning" | "info")[] = [
    "success",
    "error",
    "warning",
    "info",
  ];

  for (const level of levels)
    if (typeof search[level] === "string")
      notificationSystem.current.addNotification({
        message: search[level] as string,
        level: level,
      });
}

export function autoRefresh(setter: (value: undefined) => unknown) {
  setTimeout(() => {
    setter(undefined);
  }, 1000);
}

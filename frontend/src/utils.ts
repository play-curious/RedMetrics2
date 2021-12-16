import React from "react";
import querystring from "query-string";
import NotificationSystem from "react-notification-system";

import * as types from "rm2-typings";
import * as axios from "axios";

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
  // setTimeout(() => {
  //   setter(undefined);
  // }, 1000);
}

export function extractPagingHeaders(
  headers: axios.AxiosResponseHeaders & Partial<types.api.PagingHeaders>
): ResolvedPagingHeaders | null {
  if (
    headers.Link === undefined ||
    headers["X-Page-Count"] === undefined ||
    headers["X-Page-Number"] === undefined ||
    headers["X-Total-Count"] === undefined ||
    headers["X-Per-Page-Count"] === undefined
  )
    return null;

  return {
    pageCount: Number(headers["X-Page-Count"]),
    pageNumber: Number(headers["X-Page-Number"]),
    perPage: Number(headers["X-Per-Page-Count"]),
    total: Number(headers["X-Total-Count"]),
    links: Object.fromEntries(
      headers.Link.split(", ").map((piece) => {
        const [link, name] = piece.split("; rel=");
        return [name, link];
      })
    ) as any,
  };
}

export interface ResolvedPagingHeaders {
  pageCount: number;
  pageNumber: number;
  perPage: number;
  total: number;
  links: {
    first: string;
    last: string;
    prev: string;
    next: string;
  };
}

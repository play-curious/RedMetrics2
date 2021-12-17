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
): ResolvedPagingHeaders {
  if (
    (headers.link ??
      headers.Link ??
      headers["X-Page-Count".toLowerCase()] ??
      headers["X-Page-Count"] ??
      headers["X-Page-Number".toLowerCase()] ??
      headers["X-Page-Number"] ??
      headers["X-Total-Count".toLowerCase()] ??
      headers["X-Total-Count"] ??
      headers["X-Per-Page-Count".toLowerCase()] ??
      headers["X-Per-Page-Count"]) === undefined
  ) {
    console.log(headers);
    throw new Error("Failed to extract paging headers");
  }

  return {
    pageCount: Number(
      headers["X-Page-Count".toLowerCase()] ?? headers["X-Page-Count"]
    ),
    pageNumber: Number(
      headers["X-Page-Number".toLowerCase()] ?? headers["X-Page-Number"]
    ),
    perPage: Number(
      headers["X-Per-Page-Count".toLowerCase()] ?? headers["X-Per-Page-Count"]
    ),
    total: Number(
      headers["X-Total-Count".toLowerCase()] ?? headers["X-Total-Count"]
    ),
    links: Object.fromEntries(
      (headers.link ?? headers.Link).split(", ").map((piece) => {
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

export function handlePagingFetch(
  setter: (ctx: { data: any[]; headers: ResolvedPagingHeaders }) => unknown
) {
  return ({
    data,
    headers,
  }: {
    data: any[];
    headers: axios.AxiosResponseHeaders;
  }) => {
    setter({
      data,
      headers: extractPagingHeaders(headers),
    });
  };
}

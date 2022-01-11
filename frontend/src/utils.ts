import React from "react";
import querystring from "query-string";
import NotificationSystem from "react-notification-system";

import * as types from "rm2-typings";
import * as axios from "axios";

export type User = types.api.Account["Methods"]["Get"]["Response"];

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

export function extractPagingHeaders(
  headers: axios.AxiosResponseHeaders & Partial<types.api.PagingHeaders>
): ResolvedPagingHeaders {
  const links = headers.link || headers.Link || "";
  const pageCount = Number(
    headers["X-Page-Count"] || headers["X-Page-Count".toLowerCase()] || 1
  );
  const pageNumber = Number(
    headers["X-Page-Number"] || headers["X-Page-Number".toLowerCase()] || 1
  );
  const total = Number(
    headers["X-Total-Count"] || headers["X-Total-Count".toLowerCase()] || 0
  );
  const perPage = Number(
    headers["X-Per-Page-Count"] ||
      headers["X-Per-Page-Count".toLowerCase()] ||
      50
  );

  return {
    pageCount,
    pageNumber,
    perPage,
    total,
    links: links
      ? Object.fromEntries(
          links.split(", ").map((piece) => {
            const [link, name] = piece.split("; rel=");
            return [name, link];
          })
        )
      : {},
  };
}

export interface ResolvedPagingHeaders {
  pageCount: number;
  pageNumber: number;
  perPage: number;
  total: number;
  links: Partial<{
    first: string;
    last: string;
    prev: string;
    next: string;
  }>;
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

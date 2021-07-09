import React from "react";

import {
  faInfoCircle,
  faExclamationCircle,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Warn({
  type,
  children,
}: {
  type?: "warn" | "danger" | "info";
  children: any;
}) {
  return (
    <div
      className={
        "warn p-2 shadow-inner rounded text-gray-500 border-l-4 px-3 py-2 " +
        (type === "warn"
          ? "border-yellow-500"
          : type === "info"
          ? "border-blue-500"
          : "border-red-600")
      }
    >
      <FontAwesomeIcon
        icon={
          type === "warn"
            ? faExclamationCircle
            : type === "info"
            ? faInfoCircle
            : faExclamationTriangle
        }
        className={
          "mr-2 " +
          (type === "warn"
            ? "text-yellow-500"
            : type === "info"
            ? "text-blue-500"
            : "text-red-600")
        }
      />
      {children}
    </div>
  );
}

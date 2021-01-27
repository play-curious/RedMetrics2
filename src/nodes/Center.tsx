import React from "react";

export default function Center({
  children,
  row,
}: {
  children: any;
  row?: boolean;
}) {
  return (
    <div
      className={
        "flex items-center justify-center min-h-screen" +
        (row ? "" : "flex-col")
      }
    >
      {children}
    </div>
  );
}

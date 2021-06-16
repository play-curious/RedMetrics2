import React from "react";

export default function Center({
  children,
  height,
  row,
}: {
  children: any;
  height?: "min-h-0" | "min-h-full" | "min-h-screen";
  row?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-center ${row ? "" : "flex-col "} ${
        height ?? ""
      }`}
    >
      {children}
    </div>
  );
}

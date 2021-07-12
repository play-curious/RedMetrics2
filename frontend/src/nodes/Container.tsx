import React from "react";

export default function Container({
  children,
  hidden,
}: {
  children: any;
  hidden?: true;
}) {
  return (
    <div
      className={
        "container min-h-full mx-auto px-3 m-0 flex-grow " +
        (hidden ? "" : "shadow-lg")
      }
    >
      {children}
    </div>
  );
}

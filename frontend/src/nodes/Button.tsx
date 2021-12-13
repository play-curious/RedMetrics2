import React from "react";
import * as Dom from "react-router-dom";

export default function Button({
  to,
  href,
  submit,
  textOnly,
  children,
  download,
  clipboard,
  callback,
  customClassName,
}: {
  to?: string;
  href?: string;
  callback?: () => unknown;
  submit?: boolean;
  textOnly?: boolean;
  children: any;
  download?: any;
  clipboard?: string;
  customClassName?: string;
}) {
  const classNameSet = new Set(
    (
      (textOnly
        ? "bg-transparent text-grey-800 hover:text-grey-700 hover:underline"
        : "rounded text-white bg-gray-800 hover:bg-gray-700") +
      " inline button flex flex-row font-bold justify-center items-center text-xs px-3 py-2 text-center transition duration-200 ease-in-out mr-2 cursor-pointer"
    ).split(" ")
  );

  if (clipboard) classNameSet.add("clipboard");

  customClassName?.split(" ").forEach((name) => {
    classNameSet.add(name);
  });

  const className = [...classNameSet].join(" ");

  children = <span>{children}</span>;

  if (submit)
    return (
      <button
        type="submit"
        className={className}
        onClick={callback}
        data-clipboard-text={clipboard}
      >
        {children}
      </button>
    );
  return to ? (
    <Dom.Link
      className={className}
      to={to}
      download={download}
      onClick={callback}
      data-clipboard-text={clipboard}
    >
      {children}
    </Dom.Link>
  ) : href ? (
    <a
      href={href}
      className={className}
      download={download}
      onClick={callback}
      data-clipboard-text={clipboard}
    >
      {children}
    </a>
  ) : (
    <div
      className={className}
      onClick={callback}
      data-clipboard-text={clipboard}
    >
      {children}
    </div>
  );
}

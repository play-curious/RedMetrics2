import React from "react";
import * as Dom from "react-router-dom";

export default function Button({
  to,
  href,
  submit,
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
  children: any;
  download?: any;
  clipboard?: string;
  customClassName?: string;
}) {
  const classNameSet = new Set(
    "inline button flex flex-row items-center rounded font-bold text-xs text-white px-3 py-2 bg-gray-800 hover:bg-gray-700 text-center transition duration-200 ease-in-out mr-2 cursor-pointer".split(
      " "
    )
  );

  if (clipboard) classNameSet.add("clipboard");

  customClassName?.split(" ").forEach((name) => {
    classNameSet.add(name);
  });

  const className = [...classNameSet].join(" ");

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

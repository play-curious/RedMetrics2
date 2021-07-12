import React from "react";
import * as Dom from "react-router-dom";

export default function Card({
  title,
  secondary,
  children,
  footer,
  url,
}: {
  title?: string;
  secondary?: string;
  children: any;
  footer?: any;
  url?: string;
}) {
  return (
    <Dom.Link className="border" to={url ?? "#"}>
      <div className="overflow-hidden shadow-md">
        {title && (
          <div className="px-6 py-4 bg-white border-b border-gray-200 font-bold uppercase">
            {title}
          </div>
        )}
        {secondary && (
          <div className="px-6 font-light text-gray-600">{secondary}</div>
        )}
        <div className="p-6 bg-white border-b border-gray-200 text-justify">
          {children}
        </div>
        {footer && (
          <div className="p-6 bg-white border-gray-200 text-right">
            {footer}
          </div>
        )}
      </div>
    </Dom.Link>
  );
}

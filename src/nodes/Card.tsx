import React from "react";
import * as Dom from "react-router-dom";

export default function Card({
  title,
  children,
  footer,
  url,
}: {
  title?: string;
  children: any;
  footer?: string;
  url?: string;
}) {
  return (
    <Dom.Link className="max-w-md mx-auto m-1 sm:px-6 lg:px-8" to={url ?? "#"}>
      <div className="overflow-hidden shadow-md">
        {title && (
          <div className="px-6 py-4 bg-white border-b border-gray-200 font-bold uppercase">
            {title}
          </div>
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

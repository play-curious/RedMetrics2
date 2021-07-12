import React from "react";
import NotificationSystem from "react-notification-system";

export default function UUID({ _key }: { _key: string }) {
  const notificationSystem = React.createRef<NotificationSystem.System>();

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      <div
        data-clipboard-text={_key}
        title="Click to copy to clipboard"
        onClick={() => {
          notificationSystem.current?.addNotification({
            message: "Copied to clipboard",
            level: "success",
          });
        }}
        className="hover:shadow-lg cursor-pointer clipboard flex items-center bg-gray-800 font-mono inline-block rounded-full text-gray-300 hover:text-white px-1.5 whitespace-nowrap overflow-hidden"
      >
        <span className="px-3 flex-grow">{_key}</span>
        <i className="pl-2 text-white far fa-copy" title="Copy to clipboard" />
      </div>
    </>
  );
}

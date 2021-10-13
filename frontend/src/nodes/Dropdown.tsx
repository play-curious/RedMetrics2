import React from "react";
import * as Dom from "react-router-dom";
import * as Router from "react-router";
import * as Cookies from "react-cookie";
import NotificationSystem from "react-notification-system";

import axios from "axios";

import * as types from "rm2-typings";
import * as constants from "../constants";

import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "./Dropdown.scss";

export default function Dropdown({
  user,
  deleteUser,
}: {
  user?: types.tables.Account;
  deleteUser: () => unknown;
}) {
  const [redirect, setRedirect] = React.useState<string>();
  const [, , removeCookie] = Cookies.useCookies([constants.COOKIE_NAME]);
  const notificationSystem = React.createRef<NotificationSystem.System>();

  const logout = () =>
    axios
      .get("/logout")
      .catch((error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      })
      .then(() => {
        notificationSystem.current?.addNotification({
          message: "Successful disconnected",
          level: "success",
        });
        removeCookie(constants.COOKIE_NAME);
        deleteUser();
        setRedirect("/login");
        window.location.reload();
      });

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      {redirect && <Router.Redirect to={redirect} />}
      <button
        className="dropdown bg-gray-800 p-1  rounded-full text-gray-400 hover:text-white focus:text-white focus:outline-none "
        type="button"
        id="user-menu"
        aria-haspopup="true"
        aria-expanded="true"
      >
        <FontAwesomeIcon icon={faBars} />
        <div
          className="dropdown-child hidden origin-top-right absolute right-0 mt-0 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu"
        >
          {user !== undefined ? (
            <>
              <Dom.Link
                to="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                Your Profile
              </Dom.Link>
              <button
                onClick={logout}
                className="block py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-center"
                role="menuitem"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Dom.Link
                to="/login"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                Login
              </Dom.Link>
            </>
          )}
          <Dom.Link
            to="/settings"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            role="menuitem"
          >
            Settings
          </Dom.Link>
        </div>
      </button>
    </>
  );
}

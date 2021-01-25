import React from "react";
import * as Dom from "react-router-dom";

import * as types from "../types";

import SearchBar from "./SearchBar";

const Menu: React.FunctionComponent<{ user?: types.SessionUser }> = ({
  children,
  user,
}) => {
  return (
    <>
      <nav className="menu bg-gray-800">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-16">
            <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
              <div className="flex-shrink-0 flex items-center">
                <Dom.Link
                  to="/"
                  children="Red"
                  className="text-red-600 text-7x1"
                />
                <Dom.Link
                  to="/"
                  children="Metrics"
                  className="text-red-50 text-7x1"
                />
              </div>
              <div className="hidden sm:block sm:ml-6">
                <div className="flex space-x-4">{children}</div>
              </div>
            </div>
            <div className="hidden md:block flex-grow">
              <SearchBar />
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
              <div className="bg-gray-800 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none ">
                <i className="fas fa-bell" />
              </div>
              <div className="ml-3 relative">
                <div>
                  <button
                    className="bg-gray-800 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none "
                    id="user-menu"
                    aria-haspopup="true"
                  >
                    <i className="fas fa-bars" />
                  </button>
                </div>
                <div
                  className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu"
                >
                  <Dom.Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    Settings
                  </Dom.Link>
                  {user && (
                    <>
                      <Dom.Link
                        to={"/profile/" + user.id}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        Your Profile
                      </Dom.Link>
                      <Dom.Link
                        to="#"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        Sign out
                      </Dom.Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden sm:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">{children}</div>
        </div>
      </nav>
    </>
  );
};

export default Menu;

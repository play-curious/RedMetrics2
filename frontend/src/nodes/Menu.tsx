import React from "react";

import { tables as types } from "rm2-typings";

import Container from "./Container";

import Dropdown from "./Dropdown";
import Logo from "./Logo";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Menu({
  children,
  user,
  deleteUser,
}: {
  children: any;
  user?: types.Account;
  deleteUser: () => unknown;
}) {
  return (
    <>
      <nav className="bg-gray-800">
        <Container>
          <div className="relative flex items-center justify-between h-16">
            <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
              <div className="flex-shrink-0 flex items-center">
                <Logo />
              </div>

              <div className="hidden sm:block sm:ml-6">
                <div className="flex space-x-4"> {children} </div>
              </div>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
              <div className="ml-3 relative">
                <Dropdown user={user} deleteUser={deleteUser} />
              </div>
            </div>
          </div>
        </Container>
        <div className="block sm:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">{children}</div>
        </div>
      </nav>
    </>
  );
}

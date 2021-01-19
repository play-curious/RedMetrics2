import React, { FunctionComponent } from "react";

const AppError: FunctionComponent<{
  code: number;
  message: string;
}> = ({ code, message }) => (
  <>
    <h1> Error {code} </h1>
    <p> {message} </p>
  </>
);

export default AppError;

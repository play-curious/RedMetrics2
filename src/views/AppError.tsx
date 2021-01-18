import React from "react";

export default class AppError extends React.Component {
  props: {
    code: number,
    message: string
  } = {
    code: 0,
    message: "Unknown error occurred"
  }

  render() {
    return (
      <div className="error">
        <h1> Error </h1>
      </div>
    )
  }
}
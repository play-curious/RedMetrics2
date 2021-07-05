import React from "react";

export default function Debug(props: any) {
  return (
    <table>
      <tr>
        <th>{props.name}</th>
      </tr>
      {Object.entries(props).map(([key, value]) => {
        return (
          <tr>
            <th>{key}</th>
            <td>{JSON.stringify(value)}</td>
          </tr>
        );
      })}
    </table>
  );
}

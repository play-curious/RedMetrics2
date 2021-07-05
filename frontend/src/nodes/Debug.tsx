import React from "react";

export default function Debug(props: any) {
  return (
    <table>
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

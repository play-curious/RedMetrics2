import React from "react";

import Button from "./Button";

import * as constants from "../constants";

export default function DownloadButton({
  route,
  name,
}: {
  route: string;
  name: string;
}) {
  return (
    <Button href={constants.API_BASE_URL + route} download={name + ".json"}>
      Download data
    </Button>
  );
}

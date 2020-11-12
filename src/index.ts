import path from "path";
import * as utils from "./utils";

utils
  .forFiles(path.join(__dirname, "api"), require, {
    recursive: true,
    filters: {
      filename: /\.js$/i,
    },
  })
  .catch(console.error);

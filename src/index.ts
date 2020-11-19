import path from "path";
import chalk from "chalk";
import * as utils from "./utils";

utils
  .forFiles(
    path.join(__dirname, "api"),
    (filepath) => {
      require(filepath);
      console.log(chalk.blue("loaded"), filepath);
    },
    {
      recursive: true,
      filters: {
        filename: /\.js$/i,
      },
    }
  )
  .catch(console.error);
